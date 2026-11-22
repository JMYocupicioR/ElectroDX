import { sb } from '../lib/supabase';
import {
  isMissingRelationError,
  isTableMissingInSupabase,
  markTableAsMissingInSupabase,
} from './tableAvailability';
import type { TopicTeachingCommitment, WorkshopInstructor } from '../types/database';

export const TOPIC_TEACHING_COHORT_ID = '2026-general';

const COMMITMENTS_TABLE = 'topic_teaching_commitments';
const INSTRUCTORS_TABLE = 'workshop_instructors';
const KEY_LOCAL_COMMITMENTS = 'neurosafe_topic_teaching_commitments_v1';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(val: string | null | undefined): boolean {
  return typeof val === 'string' && UUID_RE.test(val.trim());
}

function rpcError(error: { message?: string } | null, fallback: string): Error {
  return new Error(error?.message || fallback);
}

function readLocalCommitments(): TopicTeachingCommitment[] {
  try {
    const raw = localStorage.getItem(KEY_LOCAL_COMMITMENTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TopicTeachingCommitment[]) : [];
  } catch {
    return [];
  }
}

function writeLocalCommitments(rows: TopicTeachingCommitment[]): void {
  try {
    localStorage.setItem(KEY_LOCAL_COMMITMENTS, JSON.stringify(rows));
  } catch {
    // Ignore storage quota errors
  }
}

export function mergeRemoteAndLocalCommitments(
  remote: TopicTeachingCommitment[],
  local: TopicTeachingCommitment[],
  cohortId: string
): TopicTeachingCommitment[] {
  const byKey = new Map<string, TopicTeachingCommitment>();

  for (const row of remote) {
    if (row.cohort_id !== cohortId) continue;
    const key = `${row.cohort_id}:${row.topic_id}:${row.teacher_id}`;
    byKey.set(key, row);
  }

  for (const loc of local) {
    if (loc.cohort_id !== cohortId) continue;
    const key = `${loc.cohort_id}:${loc.topic_id}:${loc.teacher_id}`;
    const rem = byKey.get(key);
    if (!rem) {
      // Conservar en local solo docentes invitados (no UUID) o filas creadas sin sincronizar (local_*).
      // Si ya existía en servidor (UUID real) y el servidor ya no lo devuelve activo, no resucitarlo.
      if (loc.status !== 'withdrawn' && (!isUuid(loc.teacher_id) || loc.id.startsWith('local_'))) {
        byKey.set(key, loc);
      }
    } else {
      if (loc.status === 'withdrawn' && loc.id.startsWith('local_')) {
        byKey.delete(key);
      } else if (loc.status !== 'withdrawn') {
        byKey.set(key, {
          ...rem,
          teacher_name: rem.teacher_name || loc.teacher_name || 'Profesor',
          milestone_id: loc.milestone_id ?? rem.milestone_id ?? null,
          // El servidor manda en workshop_id: no dejar que un local viejo
          // vuelva a vincular una clase ya desasociada (loc ?? rem resucitaba el id).
          workshop_id: rem.workshop_id ?? null,
        });
      }
    }
  }

  return Array.from(byKey.values()).filter((r) => r.status !== 'withdrawn');
}

async function teacherNamesById(ids: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter((id) => isUuid(id)))];
  if (!unique.length) return new Map();
  const { data, error } = await sb.from('profiles').select('id, display_name').in('id', unique);
  if (error || !data) return new Map();
  return new Map(
    (data as { id: string; display_name: string | null }[]).map((row) => [
      row.id,
      row.display_name?.trim() || 'Profesor',
    ])
  );
}

function withTeacherName<T extends { teacher_id: string; teacher_name?: string | null }>(
  rows: T[],
  names: Map<string, string>
): T[] {
  return rows.map((row) => ({
    ...row,
    teacher_name: names.get(row.teacher_id) ?? row.teacher_name ?? null,
  }));
}

export async function listTopicTeachingCommitments(
  cohortId: string = TOPIC_TEACHING_COHORT_ID
): Promise<TopicTeachingCommitment[]> {
  const local = readLocalCommitments();
  if (isTableMissingInSupabase(COMMITMENTS_TABLE)) {
    return local.filter((r) => r.cohort_id === cohortId && r.status !== 'withdrawn');
  }
  try {
    const { data, error, status } = await sb
      .from(COMMITMENTS_TABLE)
      .select('*')
      .eq('cohort_id', cohortId)
      .neq('status', 'withdrawn')
      .order('proposed_at', { ascending: false });
    if (isMissingRelationError(error, status)) {
      markTableAsMissingInSupabase(COMMITMENTS_TABLE);
      return local.filter((r) => r.cohort_id === cohortId && r.status !== 'withdrawn');
    }
    if (error) throw rpcError(error, 'No se pudieron leer los temas adoptados.');
    const rows = (data ?? []) as TopicTeachingCommitment[];
    const names = await teacherNamesById(rows.map((row) => row.teacher_id));
    const enrichedRemote = withTeacherName(rows, names);
    return mergeRemoteAndLocalCommitments(enrichedRemote, local, cohortId);
  } catch (error) {
    if (isMissingRelationError(error as { message?: string })) {
      markTableAsMissingInSupabase(COMMITMENTS_TABLE);
      return local.filter((r) => r.cohort_id === cohortId && r.status !== 'withdrawn');
    }
    return local.filter((r) => r.cohort_id === cohortId && r.status !== 'withdrawn');
  }
}

export async function proposeTopicCommitments(
  topicIds: string[],
  moduleId: string,
  cohortId: string = TOPIC_TEACHING_COHORT_ID
): Promise<TopicTeachingCommitment[]> {
  const { data, error } = await sb.rpc('propose_topic_commitments', {
    p_topic_ids: topicIds,
    p_module_id: moduleId,
    p_cohort_id: cohortId,
  });
  if (error) throw rpcError(error, 'No se pudo adoptar el tema.');
  return (Array.isArray(data) ? data : data ? [data] : []) as TopicTeachingCommitment[];
}

export async function confirmTopicCommitment(input: {
  commitmentId: string;
  milestoneId: string;
  scheduledAt?: string | null;
  durationMinutes?: number;
  title?: string | null;
}): Promise<TopicTeachingCommitment> {
  const { data, error } = await sb.rpc('confirm_topic_commitment', {
    p_commitment_id: input.commitmentId,
    p_milestone_id: input.milestoneId,
    p_scheduled_at: input.scheduledAt ?? null,
    p_duration_minutes: input.durationMinutes ?? 90,
    p_title: input.title ?? null,
  });
  if (error) throw rpcError(error, 'No se pudo confirmar el tema.');
  if (!data) throw new Error('No se pudo confirmar el tema.');
  return data as TopicTeachingCommitment;
}

export async function autoConfirmAllPendingCommitments(): Promise<number> {
  try {
    const { data, error } = await sb.rpc('auto_confirm_all_pending_commitments');
    if (!error && typeof data === 'number') return data;
  } catch {
    // Si la función RPC aún no está en la base de datos, continuar con fallback
  }

  try {
    const { data } = await sb
      .from(COMMITMENTS_TABLE)
      .select('id')
      .eq('status', 'proposed');
    if (!data || !data.length) return 0;

    for (const item of data) {
      try {
        await sb.rpc('confirm_topic_commitment', {
          p_commitment_id: item.id,
          p_milestone_id: 'corte-1',
          p_scheduled_at: null,
          p_duration_minutes: 90,
          p_title: null,
        });
      } catch {
        // Ignorar errores individuales en el fallback
      }
    }
    return data.length;
  } catch {
    return 0;
  }
}

async function removeWorkshopInstructorIfUnused(
  workshopId: string,
  teacherId: string,
  force: boolean,
  cohortId: string = TOPIC_TEACHING_COHORT_ID
): Promise<void> {
  if (!workshopId || !isUuid(workshopId) || !isUuid(teacherId) || isTableMissingInSupabase(INSTRUCTORS_TABLE)) {
    return;
  }
  try {
    if (!force && !isTableMissingInSupabase(COMMITMENTS_TABLE)) {
      const { data: remaining, error: checkErr } = await sb
        .from(COMMITMENTS_TABLE)
        .select('id')
        .eq('cohort_id', cohortId)
        .eq('workshop_id', workshopId)
        .eq('teacher_id', teacherId)
        .neq('status', 'withdrawn')
        .limit(1);
      if (!checkErr && remaining && remaining.length > 0) {
        return;
      }
    }
    const { error, status } = await sb
      .from(INSTRUCTORS_TABLE)
      .delete()
      .eq('workshop_id', workshopId)
      .eq('teacher_id', teacherId);
    if (isMissingRelationError(error, status)) {
      markTableAsMissingInSupabase(INSTRUCTORS_TABLE);
    }
  } catch (err) {
    console.warn('[topicTeachingService] removeWorkshopInstructorIfUnused error:', err);
  }
}

export async function withdrawTopicCommitment(commitmentId: string): Promise<TopicTeachingCommitment> {
  // Actualizar estado local si existe
  const local = readLocalCommitments();
  const localIdx = local.findIndex((c) => c.id === commitmentId);
  const localPrevWorkshopId = localIdx >= 0 ? local[localIdx].workshop_id : null;
  if (localIdx >= 0) {
    local[localIdx] = { ...local[localIdx], status: 'withdrawn', workshop_id: null };
    writeLocalCommitments(local);
  }

  let remotePrevWorkshopId: string | null = null;
  if (isUuid(commitmentId) && !isTableMissingInSupabase(COMMITMENTS_TABLE)) {
    try {
      const { data: before } = await sb
        .from(COMMITMENTS_TABLE)
        .select('workshop_id')
        .eq('id', commitmentId)
        .maybeSingle();
      remotePrevWorkshopId = (before as { workshop_id?: string | null } | null)?.workshop_id ?? null;
    } catch {
      // Continuar con RPC
    }
  }

  const { data, error } = await sb.rpc('withdraw_topic_commitment', {
    p_commitment_id: commitmentId,
  });
  if (error) {
    if (localIdx >= 0) return local[localIdx];
    throw rpcError(error, 'No se pudo retirar el tema.');
  }
  if (!data) {
    if (localIdx >= 0) return local[localIdx];
    throw new Error('No se pudo retirar el tema.');
  }

  const withdrawn = data as TopicTeachingCommitment;
  const workshopToClean = remotePrevWorkshopId || withdrawn.workshop_id || localPrevWorkshopId;

  if (withdrawn.workshop_id && !isTableMissingInSupabase(COMMITMENTS_TABLE)) {
    try {
      await sb
        .from(COMMITMENTS_TABLE)
        .update({ workshop_id: null })
        .eq('id', withdrawn.id);
    } catch {
      // Ignorar si ya fue limpiado por la migración
    }
  }

  if (workshopToClean && isUuid(withdrawn.teacher_id)) {
    await removeWorkshopInstructorIfUnused(
      workshopToClean,
      withdrawn.teacher_id,
      false,
      withdrawn.cohort_id || TOPIC_TEACHING_COHORT_ID
    );
  }

  // Purgar de caché local ya que quedó sincronizado en servidor
  writeLocalCommitments(readLocalCommitments().filter((c) => c.id !== commitmentId));

  return { ...withdrawn, workshop_id: null };
}

/**
 * Asigna directamente uno o varios temas (p. ej. un tema y sus subtemas) a un profesor adjunto / colaborador docente.
 * Funciona tanto con cuentas registradas en Supabase como con docentes invitados, con persistencia híbrida inmediata.
 */
export async function assignTopicsToTeacher(input: {
  topicIds: string[];
  moduleId: string;
  teacherId: string;
  teacherName: string;
  milestoneId?: string | null;
  workshopId?: string | null;
  cohortId?: string;
}): Promise<TopicTeachingCommitment[]> {
  const cohortId = input.cohortId || TOPIC_TEACHING_COHORT_ID;
  const nowIso = new Date().toISOString();
  const cleanIds = [...new Set(input.topicIds.map((id) => id.trim()).filter(Boolean))];
  if (!cleanIds.length) return [];

  let remoteRows: TopicTeachingCommitment[] = [];

  // 1. Intentar RPC administrativo si teacherId es un UUID válido
  if (isUuid(input.teacherId) && !isTableMissingInSupabase(COMMITMENTS_TABLE)) {
    try {
      const { data: rpcData, error: rpcErr } = await sb.rpc('admin_assign_topic_teacher', {
        p_topic_ids: cleanIds,
        p_module_id: input.moduleId,
        p_teacher_id: input.teacherId,
        p_milestone_id: input.milestoneId ?? null,
        p_cohort_id: cohortId,
      });

      if (!rpcErr && rpcData) {
        remoteRows = (Array.isArray(rpcData) ? rpcData : [rpcData]) as TopicTeachingCommitment[];
        if (input.workshopId) {
          await sb
            .from(COMMITMENTS_TABLE)
            .update({ workshop_id: input.workshopId })
            .eq('cohort_id', cohortId)
            .eq('teacher_id', input.teacherId)
            .in('topic_id', cleanIds);
        }
      } else {
        // Fallback: upsert directo en la tabla topic_teaching_commitments
        const upsertPayload = cleanIds.map((topicId) => ({
          cohort_id: cohortId,
          module_id: input.moduleId,
          topic_id: topicId,
          teacher_id: input.teacherId,
          status: 'confirmed' as const,
          milestone_id: input.milestoneId ?? null,
          workshop_id: input.workshopId ?? null,
          proposed_at: nowIso,
          confirmed_at: nowIso,
        }));
        const { data: upData, error: upErr } = await sb
          .from(COMMITMENTS_TABLE)
          .upsert(upsertPayload, { onConflict: 'cohort_id,topic_id,teacher_id' })
          .select('*');
        if (!upErr && upData) {
          remoteRows = upData as TopicTeachingCommitment[];
        }
      }

      if (input.workshopId && isUuid(input.workshopId) && !isTableMissingInSupabase(INSTRUCTORS_TABLE)) {
        try {
          const { error: instErr, status: instStatus } = await sb
            .from(INSTRUCTORS_TABLE)
            .upsert(
              { workshop_id: input.workshopId, teacher_id: input.teacherId },
              { onConflict: 'workshop_id,teacher_id' }
            );
          if (isMissingRelationError(instErr, instStatus)) {
            markTableAsMissingInSupabase(INSTRUCTORS_TABLE);
          }
        } catch {
          // Ignorar error de red en tabla auxiliar
        }
      }
    } catch {
      // Continuar con persistencia local resiliente
    }
  }

  // 2. Sincronizar en caché local autoritativa para respuesta instantánea y soporte offline/invitados
  const local = readLocalCommitments();
  const byKey = new Map<string, TopicTeachingCommitment>();
  for (const item of local) {
    byKey.set(`${item.cohort_id}:${item.topic_id}:${item.teacher_id}`, item);
  }

  const createdOrUpdated: TopicTeachingCommitment[] = cleanIds.map((topicId) => {
    const rem = remoteRows.find((r) => r.topic_id === topicId);
    const key = `${cohortId}:${topicId}:${input.teacherId}`;
    const existing = byKey.get(key);
    const row: TopicTeachingCommitment = {
      id: rem?.id || existing?.id || `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      cohort_id: cohortId,
      module_id: input.moduleId,
      topic_id: topicId,
      teacher_id: input.teacherId,
      teacher_name: input.teacherName.trim() || 'Profesor',
      status: 'confirmed',
      milestone_id: input.milestoneId !== undefined ? input.milestoneId : (rem?.milestone_id ?? existing?.milestone_id ?? null),
      workshop_id: input.workshopId !== undefined ? input.workshopId : (rem?.workshop_id ?? existing?.workshop_id ?? null),
      proposed_at: rem?.proposed_at || existing?.proposed_at || nowIso,
      confirmed_by: rem?.confirmed_by || null,
      confirmed_at: rem?.confirmed_at || nowIso,
    };
    byKey.set(key, row);
    return row;
  });

  writeLocalCommitments(Array.from(byKey.values()));
  return createdOrUpdated;
}

/**
 * Desasigna / retira a un profesor de uno o varios temas y limpia su vínculo en la clase asociada.
 */
export async function removeTeacherFromTopics(input: {
  topicIds: string[];
  teacherId: string;
  commitmentIds?: string[];
  workshopId?: string | null;
  cohortId?: string;
}): Promise<void> {
  const cohortId = input.cohortId || TOPIC_TEACHING_COHORT_ID;
  const cleanTopicIds = [...new Set(input.topicIds.map((id) => id.trim()).filter(Boolean))];
  const topicSet = new Set(cleanTopicIds);
  const inputCommitmentIds = [...new Set((input.commitmentIds ?? []).filter(Boolean))];
  const inputCommitmentIdSet = new Set(inputCommitmentIds);
  const affectedWorkshopIds = new Set<string>();

  if (input.workshopId && isUuid(input.workshopId)) {
    affectedWorkshopIds.add(input.workshopId);
  }

  // 1. Marcar como withdrawn en caché local inmediatamente y recopilar talleres afectados
  const local = readLocalCommitments();
  for (const c of local) {
    const matchesTarget =
      (c.cohort_id === cohortId && c.teacher_id === input.teacherId && topicSet.has(c.topic_id)) ||
      inputCommitmentIdSet.has(c.id);
    if (matchesTarget && c.workshop_id && isUuid(c.workshop_id)) {
      affectedWorkshopIds.add(c.workshop_id);
    }
  }

  const updatedLocal = local.map((c) => {
    if (
      (c.cohort_id === cohortId && c.teacher_id === input.teacherId && topicSet.has(c.topic_id)) ||
      inputCommitmentIdSet.has(c.id)
    ) {
      return { ...c, status: 'withdrawn' as const, workshop_id: null };
    }
    if (
      input.workshopId &&
      c.cohort_id === cohortId &&
      c.teacher_id === input.teacherId &&
      c.workshop_id === input.workshopId
    ) {
      return { ...c, workshop_id: null };
    }
    return c;
  });
  writeLocalCommitments(updatedLocal);

  // 2. Retirar en Supabase (cubre todos los topicIds + subtemas y cualquier commitmentId extra)
  let remoteSynced = false;
  if (!isTableMissingInSupabase(COMMITMENTS_TABLE)) {
    const matchedByTopicIds = new Set<string>();
    const remoteCommitmentIds = new Set<string>(
      inputCommitmentIds.filter((cid) => !cid.startsWith('local_') && isUuid(cid))
    );

    if (isUuid(input.teacherId) && cleanTopicIds.length > 0) {
      try {
        const { data: existingRows, error: fetchErr, status: fetchStatus } = await sb
          .from(COMMITMENTS_TABLE)
          .select('id, workshop_id')
          .eq('cohort_id', cohortId)
          .eq('teacher_id', input.teacherId)
          .in('topic_id', cleanTopicIds)
          .neq('status', 'withdrawn');

        if (isMissingRelationError(fetchErr, fetchStatus)) {
          markTableAsMissingInSupabase(COMMITMENTS_TABLE);
        } else if (!fetchErr && existingRows) {
          for (const row of existingRows as { id: string; workshop_id: string | null }[]) {
            matchedByTopicIds.add(row.id);
            remoteCommitmentIds.add(row.id);
            if (row.workshop_id && isUuid(row.workshop_id)) {
              affectedWorkshopIds.add(row.workshop_id);
            }
          }
        }
      } catch {
        // Continuar con actualización directa / fallback RPC
      }
    }

    if (!isTableMissingInSupabase(COMMITMENTS_TABLE)) {
      let directUpdateFailed = false;

      if (isUuid(input.teacherId) && cleanTopicIds.length > 0) {
        try {
          const { error, status } = await sb
            .from(COMMITMENTS_TABLE)
            .update({ status: 'withdrawn', workshop_id: null })
            .eq('cohort_id', cohortId)
            .eq('teacher_id', input.teacherId)
            .in('topic_id', cleanTopicIds);
          if (isMissingRelationError(error, status)) {
            markTableAsMissingInSupabase(COMMITMENTS_TABLE);
          } else if (error) {
            directUpdateFailed = true;
          } else {
            remoteSynced = true;
          }
        } catch {
          directUpdateFailed = true;
        }
      }

      const fallbackIds = directUpdateFailed
        ? [...remoteCommitmentIds]
        : [...remoteCommitmentIds].filter((cid) => !matchedByTopicIds.has(cid));

      for (const cid of fallbackIds) {
        try {
          const { error: rpcErr } = await sb.rpc('withdraw_topic_commitment', {
            p_commitment_id: cid,
          });
          if (rpcErr) {
            const { error: updErr } = await sb
              .from(COMMITMENTS_TABLE)
              .update({ status: 'withdrawn', workshop_id: null })
              .eq('id', cid);
            if (!updErr) remoteSynced = true;
          } else {
            remoteSynced = true;
            await sb
              .from(COMMITMENTS_TABLE)
              .update({ workshop_id: null })
              .eq('id', cid);
          }
        } catch {
          // Ignorar error de red individual
        }
      }

      // Si se retiró desde una clase específica, desvincular cualquier otro tema que aún apuntara a ese taller
      if (input.workshopId && isUuid(input.workshopId) && isUuid(input.teacherId)) {
        try {
          await sb
            .from(COMMITMENTS_TABLE)
            .update({ workshop_id: null })
            .eq('cohort_id', cohortId)
            .eq('teacher_id', input.teacherId)
            .eq('workshop_id', input.workshopId);
        } catch {
          // Ignorar error de red
        }
      }
    }
  }

  // 3. Limpiar workshop_instructors para que deje de aparecer en la ficha de la clase
  if (isUuid(input.teacherId) && affectedWorkshopIds.size > 0) {
    for (const wId of affectedWorkshopIds) {
      const forceDelete = Boolean(input.workshopId && wId === input.workshopId);
      await removeWorkshopInstructorIfUnused(wId, input.teacherId, forceDelete, cohortId);
    }
  }

  // Si sincronizó en Supabase, purgar las filas retiradas de localStorage para evitar tombstones obsoletos
  if (remoteSynced && isUuid(input.teacherId)) {
    const cleanedLocal = readLocalCommitments().filter(
      (c) =>
        !(
          (c.cohort_id === cohortId && c.teacher_id === input.teacherId && topicSet.has(c.topic_id)) ||
          inputCommitmentIdSet.has(c.id)
        )
    );
    writeLocalCommitments(cleanedLocal);
  }
}

/**
 * Sincroniza `workshop_instructors` con la lista exacta de docentes asignados a una clase.
 * Agrega docentes faltantes y elimina a cualquiera que haya sido retirado de la sesión.
 */
export async function syncWorkshopInstructors(
  workshopId: string,
  teacherIds: string[]
): Promise<void> {
  if (!workshopId || !isUuid(workshopId) || isTableMissingInSupabase(INSTRUCTORS_TABLE)) return;
  const desired = [...new Set(teacherIds.filter((id) => isUuid(id)))];

  try {
    const { data: existingRows, error: selectErr, status: selectStatus } = await sb
      .from(INSTRUCTORS_TABLE)
      .select('teacher_id')
      .eq('workshop_id', workshopId);

    if (isMissingRelationError(selectErr, selectStatus)) {
      markTableAsMissingInSupabase(INSTRUCTORS_TABLE);
      return;
    }

    const existingIds = new Set(
      ((existingRows ?? []) as Pick<WorkshopInstructor, 'teacher_id'>[]).map((row) => row.teacher_id)
    );
    const desiredSet = new Set(desired);

    const toInsert = desired.filter((id) => !existingIds.has(id));
    const toDelete = [...existingIds].filter((id) => !desiredSet.has(id));

    if (toInsert.length > 0) {
      const { error: upsertErr, status: upsertStatus } = await sb
        .from(INSTRUCTORS_TABLE)
        .upsert(
          toInsert.map((teacher_id) => ({ workshop_id: workshopId, teacher_id })),
          { onConflict: 'workshop_id,teacher_id' }
        );
      if (isMissingRelationError(upsertErr, upsertStatus)) {
        markTableAsMissingInSupabase(INSTRUCTORS_TABLE);
        return;
      }
    }

    if (toDelete.length > 0) {
      await sb
        .from(INSTRUCTORS_TABLE)
        .delete()
        .eq('workshop_id', workshopId)
        .in('teacher_id', toDelete);
    } else if (selectErr && desired.length === 0) {
      await sb.from(INSTRUCTORS_TABLE).delete().eq('workshop_id', workshopId);
    }
  } catch (err) {
    console.warn('[topicTeachingService] syncWorkshopInstructors error:', err);
  }
}

export async function listWorkshopInstructorNames(workshopId: string): Promise<string[]> {
  if (!workshopId || isTableMissingInSupabase(INSTRUCTORS_TABLE)) return [];
  try {
    const { data, error, status } = await sb
      .from(INSTRUCTORS_TABLE)
      .select('teacher_id')
      .eq('workshop_id', workshopId);
    if (isMissingRelationError(error, status)) {
      markTableAsMissingInSupabase(INSTRUCTORS_TABLE);
      return [];
    }
    if (error) return [];
    const rows = (data ?? []) as Pick<WorkshopInstructor, 'teacher_id'>[];
    const names = await teacherNamesById(rows.map((row) => row.teacher_id));
    return rows
      .map((row) => names.get(row.teacher_id) || 'Profesor')
      .filter((name, index, list) => list.indexOf(name) === index);
  } catch {
    return [];
  }
}

export async function assignWorkshopToTopics(
  workshopId: string,
  topics: { topicId: string; moduleId: string }[],
  teacherId: string,
  cohortId: string = TOPIC_TEACHING_COHORT_ID
): Promise<void> {
  if (!workshopId || !topics.length) return;
  try {
    for (const item of topics) {
      try {
        await proposeTopicCommitments([item.topicId], item.moduleId, cohortId);
      } catch {
        // Ignorar si ya estaba propuesto o adoptado
      }
    }

    const topicIds = topics.map((t) => t.topicId);
    await sb
      .from(COMMITMENTS_TABLE)
      .update({ workshop_id: workshopId, status: 'confirmed' })
      .eq('cohort_id', cohortId)
      .eq('teacher_id', teacherId)
      .in('topic_id', topicIds);

    // Sincronizar también en local
    const local = readLocalCommitments();
    const nextLocal = local.map((c) =>
      c.cohort_id === cohortId && c.teacher_id === teacherId && topicIds.includes(c.topic_id)
        ? { ...c, workshop_id: workshopId, status: 'confirmed' as const }
        : c
    );
    writeLocalCommitments(nextLocal);

    if (isUuid(teacherId)) {
      try {
        await sb
          .from(INSTRUCTORS_TABLE)
          .upsert(
            { workshop_id: workshopId, teacher_id: teacherId },
            { onConflict: 'workshop_id,teacher_id' }
          );
      } catch {
        // Ignorar si la tabla no existe o ya está asociado
      }
    }
  } catch (err) {
    console.warn('[topicTeachingService] assignWorkshopToTopics error:', err);
  }
}

/**
 * Vincula un taller ya grabado a un tema sin crear otro recurso.
 * Actualiza commitments de cualquier docente del tema (no solo el admin actual).
 */
export async function attachWorkshopIdToTopicCommitments(
  workshopId: string,
  topicIds: string[],
  cohortId: string = TOPIC_TEACHING_COHORT_ID
): Promise<void> {
  if (!workshopId || !topicIds.length) return;
  const unique = [...new Set(topicIds.filter(Boolean))];
  if (!unique.length) return;

  try {
    if (!isTableMissingInSupabase(COMMITMENTS_TABLE)) {
      const { error, status } = await sb
        .from(COMMITMENTS_TABLE)
        .update({ workshop_id: workshopId })
        .eq('cohort_id', cohortId)
        .neq('status', 'withdrawn')
        .in('topic_id', unique);
      if (isMissingRelationError(error, status)) {
        markTableAsMissingInSupabase(COMMITMENTS_TABLE);
      }
    }
  } catch (err) {
    console.warn('[topicTeachingService] attachWorkshopIdToTopicCommitments remote error:', err);
  }

  const local = readLocalCommitments();
  writeLocalCommitments(
    local.map((c) =>
      c.cohort_id === cohortId && c.status !== 'withdrawn' && unique.includes(c.topic_id)
        ? { ...c, workshop_id: workshopId }
        : c
    )
  );
}

/**
 * Quita el vínculo taller↔tema en commitments sin retirar al docente del tema.
 */
export async function detachWorkshopIdFromTopicCommitments(
  workshopId: string,
  topicIds: string[],
  cohortId: string = TOPIC_TEACHING_COHORT_ID
): Promise<void> {
  if (!workshopId || !topicIds.length) return;
  const unique = [...new Set(topicIds.filter(Boolean))];
  if (!unique.length) return;

  const local = readLocalCommitments();
  writeLocalCommitments(
    local.map((c) =>
      c.cohort_id === cohortId &&
      c.status !== 'withdrawn' &&
      c.workshop_id === workshopId &&
      unique.includes(c.topic_id)
        ? { ...c, workshop_id: null }
        : c
    )
  );

  if (isTableMissingInSupabase(COMMITMENTS_TABLE)) return;

  const { error, status } = await sb
    .from(COMMITMENTS_TABLE)
    .update({ workshop_id: null })
    .eq('cohort_id', cohortId)
    .eq('workshop_id', workshopId)
    .neq('status', 'withdrawn')
    .in('topic_id', unique);

  if (isMissingRelationError(error, status)) {
    markTableAsMissingInSupabase(COMMITMENTS_TABLE);
    return;
  }
  if (error) {
    throw rpcError(error, 'No se pudo desvincular la clase del tema en los compromisos docentes.');
  }
}
