import type { LiveWorkshop } from '../types/database';
import { readSessionTopicIds, withSessionTopicIds } from '../utils/liveSessionBrief';
import { notifyRecordingLinksChanged } from '../utils/recordingLinksEvents';
import { getWorkshopById, updateWorkshop } from './courseService';
import {
  assignWorkshopToTopics,
  attachWorkshopIdToTopicCommitments,
  detachWorkshopIdFromTopicCommitments,
} from './topicTeachingService';

export interface UnlinkRecordingPlan {
  remainingTopicIds: string[];
  nextPrimaryTopicId: string | null;
}

/** Calcula cómo queda el taller al quitar un tema del vínculo (sin side effects). */
export function planUnlinkRecordedWorkshopFromTopic(
  workshop: Pick<LiveWorkshop, 'topic_id' | 'clinical_case_json'>,
  topicId: string,
): UnlinkRecordingPlan {
  const target = topicId.trim();
  const linked = [
    ...new Set(
      [workshop.topic_id, ...readSessionTopicIds(workshop)]
        .filter((id): id is string => Boolean(id && id.trim()))
        .map((id) => id.trim()),
    ),
  ];
  const remainingTopicIds = linked.filter((id) => id !== target);
  const nextPrimaryTopicId =
    workshop.topic_id === target ? remainingTopicIds[0] ?? null : workshop.topic_id ?? null;

  return { remainingTopicIds, nextPrimaryTopicId };
}

/**
 * Asocia una clase ya grabada a un tema del temario sin duplicar el video en biblioteca.
 */
export async function linkRecordedWorkshopToTopic(params: {
  workshop: LiveWorkshop;
  topicId: string;
  moduleId: string;
  userId: string;
}): Promise<LiveWorkshop> {
  const { workshop, topicId, moduleId, userId } = params;
  if (!workshop?.id) throw new Error('Selecciona una clase grabada.');
  if (!topicId) throw new Error('Falta el tema a vincular.');
  if (!workshop.recording_url?.trim()) {
    throw new Error('Esa clase aún no tiene URL de grabación.');
  }

  const existingIds = readSessionTopicIds(workshop);
  const nextIds = [
    ...new Set(
      [workshop.topic_id, ...existingIds, topicId]
        .filter((id): id is string => Boolean(id && id.trim()))
        .map((id) => id.trim()),
    ),
  ];

  const updated = await updateWorkshop(workshop.id, {
    status: 'completed',
    clinical_case_json: withSessionTopicIds(workshop.clinical_case_json, nextIds),
    ...(workshop.topic_id
      ? {}
      : {
          topic_id: topicId,
          module_id: moduleId || workshop.module_id,
        }),
  });

  await attachWorkshopIdToTopicCommitments(workshop.id, [topicId]);
  if (userId) {
    await assignWorkshopToTopics(workshop.id, [{ topicId, moduleId }], userId);
  }

  notifyRecordingLinksChanged();
  return updated;
}

/**
 * Quita el vínculo de una clase grabada con un tema.
 * Conserva el taller, la URL de grabación, asistencias y docentes asignados al tema.
 */
export async function unlinkRecordedWorkshopFromTopic(params: {
  workshop: LiveWorkshop;
  topicId: string;
}): Promise<LiveWorkshop> {
  const { workshop, topicId } = params;
  if (!workshop?.id) throw new Error('Falta la clase a desvincular.');
  if (!topicId?.trim()) throw new Error('Falta el tema a desvincular.');

  const target = topicId.trim();
  // Releer del servidor por si el cliente tenía un snapshot viejo
  const fresh = (await getWorkshopById(workshop.id)) ?? workshop;
  const { remainingTopicIds, nextPrimaryTopicId } = planUnlinkRecordedWorkshopFromTopic(
    fresh,
    target,
  );

  await updateWorkshop(fresh.id, {
    topic_id: nextPrimaryTopicId,
    clinical_case_json: withSessionTopicIds(fresh.clinical_case_json, remainingTopicIds),
  });

  await detachWorkshopIdFromTopicCommitments(fresh.id, [target]);

  const verified = await getWorkshopById(fresh.id);
  if (!verified) throw new Error('La clase se actualizó pero no se pudo verificar el vínculo.');

  const stillLinked =
    verified.topic_id === target || readSessionTopicIds(verified).includes(target);
  if (stillLinked) {
    throw new Error('El vínculo no se eliminó en el servidor. Intenta de nuevo.');
  }

  notifyRecordingLinksChanged();
  return verified;
}
