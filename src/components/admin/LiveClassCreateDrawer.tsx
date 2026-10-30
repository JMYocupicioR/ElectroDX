import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  Check,
  Clock,
  Copy,
  Loader2,
  MapPin,
  MessageCircle,
  Save,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Video,
  X,
} from 'lucide-react';
import { allModules } from '../../content/modules';
import { useAuth } from '../../contexts/AuthProvider';
import { createWorkshop, deleteWorkshop, updateWorkshop } from '../../services/courseService';
import { getAdminProfiles, getCourseTeachers } from '../../services/editorialService';
import {
  assignTopicsToTeacher,
  assignWorkshopToTopics,
  listTopicTeachingCommitments,
  removeTeacherFromTopics,
} from '../../services/topicTeachingService';
import type { SessionModality } from '../../types/academicGradebook';
import type { AdminProfileRow } from '../../types/admin';
import type { LiveWorkshop, TopicTeachingCommitment } from '../../types/database';
import {
  LiveClassTopicQuickPicker,
  buildLiveClassTopicCatalog,
  descendantTopicIds,
  sessionTopicIdsForLiveClass,
  topicIdsIncludedBySelection,
} from './LiveClassTopicQuickPicker';
import type { TeacherOption } from './TopicConfigDrawer';
import {
  getAutoOpenClassWizardPref,
  setAutoOpenClassWizardPref,
} from '../../utils/classWizardPreferences';
import {
  composeClassDescription,
  splitDateTimeLocalInput,
  splitIsoToLocalDateTime,
  splitStoredDescription,
} from './liveClassFormUtils';
import { withSessionTopicIds } from '../../utils/liveSessionBrief';

export interface LiveClassCreateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | boolean | Promise<void | boolean>;
  initialWorkshop?: LiveWorkshop | null;
  initialScheduledAt?: string;
  initialModuleId?: string;
  initialTopicId?: string | null;
  initialSelectedTopicIds?: string[];
  initialMode?: 'wizard' | 'advanced';
}

function tryShowNativePicker(input: HTMLInputElement | null) {
  if (!input) return;
  input.focus();
  try {
    input.showPicker();
  } catch {
    // showPicker no disponible o rechazado por el navegador
  }
}

function getInitials(name: string): string {
  const clean = name.replace(/^(Dr\.|Dra\.|Mtro\.|Mtra\.|Lic\.)\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'DR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
}

async function loadTeachers(
  userId: string | undefined,
  commitments: TopicTeachingCommitment[],
): Promise<TeacherOption[]> {
  const [courseTeachers, profilesList] = await Promise.all([
    getCourseTeachers().catch(() => []),
    getAdminProfiles(false, 'all').catch(() => [] as AdminProfileRow[]),
  ]);
  const map = new Map<string, TeacherOption>();
  map.set(userId || 'preset_juan_marcos', {
    id: userId || 'preset_juan_marcos',
    name: 'Dr. Juan Marcos Yocupicio Robles',
    specialty: 'Neurofisiología Clínica y Rehabilitación',
    roleLabel: 'Director / Titular',
  });

  for (const profile of courseTeachers) {
    if (!profile.display_name) continue;
    map.set(profile.id, {
      id: profile.id,
      name: profile.display_name,
      specialty: profile.specialty || profile.credentials || 'Especialista Docente',
      roleLabel: profile.show_in_editorial_committee ? 'Comité Académico' : 'Colaborador Docente',
      avatarUrl: profile.avatar_url,
    });
  }

  for (const profile of profilesList) {
    if (!profile.display_name) continue;
    const roles = profile.roles ?? [];
    const isFaculty =
      roles.includes('admin') ||
      roles.includes('editor') ||
      roles.includes('contributor') ||
      profile.show_in_editorial_committee;
    if (!isFaculty || map.has(profile.id)) continue;
    map.set(profile.id, {
      id: profile.id,
      name: profile.display_name,
      specialty: profile.specialty || profile.credentials || 'Médico Docente',
      roleLabel: roles.includes('admin')
        ? 'Administrador Docente'
        : roles.includes('editor')
          ? 'Profesor Editor'
          : 'Profesor Adjunto',
      avatarUrl: profile.avatar_url,
    });
  }

  for (const commitment of commitments) {
    if (
      commitment.teacher_id &&
      commitment.teacher_name &&
      commitment.status !== 'withdrawn' &&
      !map.has(commitment.teacher_id)
    ) {
      map.set(commitment.teacher_id, {
        id: commitment.teacher_id,
        name: commitment.teacher_name,
        specialty: 'Profesor Asignado',
        roleLabel: 'Docente',
      });
    }
  }

  return Array.from(map.values());
}

export function LiveClassCreateDrawer({
  isOpen,
  onClose,
  onSuccess,
  initialWorkshop,
  initialScheduledAt,
  initialModuleId,
  initialTopicId,
  initialSelectedTopicIds,
}: LiveClassCreateDrawerProps) {
  const { user } = useAuth();
  const classDateInputRef = useRef<HTMLInputElement>(null);
  const titleDirty = useRef(false);

  const catalog = useMemo(() => buildLiveClassTopicCatalog(allModules), []);

  const [loading, setLoading] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [commitments, setCommitments] = useState<TopicTeachingCommitment[]>([]);

  const [title, setTitle] = useState('');
  const [moduleId, setModuleId] = useState(allModules[0]?.id || '');
  const [primaryTopicId, setPrimaryTopicId] = useState('');
  const [additionalIds, setAdditionalIds] = useState<string[]>([]);
  const [primaryQuery, setPrimaryQuery] = useState('');
  const [primarySearchFocused, setPrimarySearchFocused] = useState(false);

  const [classDate, setClassDate] = useState('');
  const [classTime, setClassTime] = useState('19:00');
  const [classDuration, setClassDuration] = useState(90);
  const [classStreamUrl, setClassStreamUrl] = useState('');
  const [classRecordingUrl, setClassRecordingUrl] = useState('');
  const [classModality, setClassModality] = useState<SessionModality>('online');
  const [classLocation, setClassLocation] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [countsForKardex, setCountsForKardex] = useState(true);

  const [teacherSearch, setTeacherSearch] = useState('');
  const [customTeacherMode, setCustomTeacherMode] = useState(false);
  const [customTeacherName, setCustomTeacherName] = useState('');
  const [customTeacherSpecialty, setCustomTeacherSpecialty] = useState('Profesor Adjunto Invitado');
  const [includeSubtopics, setIncludeSubtopics] = useState(true);
  const [autoOpenOnLogin, setAutoOpenOnLogin] = useState(false);

  const primaryEntry = catalog.find((entry) => entry.topicId === primaryTopicId) ?? null;
  const primaryModule = allModules.find((mod) => mod.id === (primaryEntry?.moduleId || moduleId)) ?? null;
  const childCount = primaryTopicId ? descendantTopicIds(catalog, primaryTopicId).length : 0;

  const moduleSuggestions = useMemo(
    () => catalog.filter((entry) => entry.moduleId === moduleId),
    [catalog, moduleId],
  );

  const topicCommitments = useMemo(() => {
    if (!primaryTopicId) return [];
    const seen = new Set<string>();
    return commitments.filter((commitment) => {
      if (commitment.topic_id !== primaryTopicId || commitment.status === 'withdrawn') return false;
      if (seen.has(commitment.teacher_id)) return false;
      seen.add(commitment.teacher_id);
      return true;
    });
  }, [commitments, primaryTopicId]);

  const filteredTeachers = teachers.filter((teacher) => {
    const query = teacherSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      teacher.name.toLowerCase().includes(query) ||
      teacher.specialty.toLowerCase().includes(query) ||
      teacher.roleLabel.toLowerCase().includes(query)
    );
  });

  const selectedTopicKey = (initialSelectedTopicIds ?? []).join('|');

  const primaryResults = useMemo(() => {
    const query = primaryQuery.trim().toLowerCase();
    const pool = query
      ? catalog.filter((entry) =>
          [entry.title, entry.moduleTitle, entry.parentTitle ?? ''].join(' ').toLowerCase().includes(query),
        )
      : moduleSuggestions;
    return pool.slice(0, 8);
  }, [catalog, moduleSuggestions, primaryQuery]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && busyAction === null) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, busyAction]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    titleDirty.current = false;
    setFeedback(null);
    setTeacherSearch('');
    setCustomTeacherMode(false);
    setCustomTeacherName('');
    setPrimaryQuery('');
    setAutoOpenOnLogin(getAutoOpenClassWizardPref());
    setLoading(true);

    listTopicTeachingCommitments()
      .catch(() => [] as TopicTeachingCommitment[])
      .then(async (rows) => {
        if (cancelled) return;
        const options = await loadTeachers(user?.id, rows);
        if (cancelled) return;
        setCommitments(rows);
        setTeachers(options);

        const seeded = uniqueIds([
          ...(initialSelectedTopicIds ?? []),
          ...(initialTopicId ? [initialTopicId] : []),
          ...(initialWorkshop?.topic_id ? [initialWorkshop.topic_id] : []),
          ...rows
            .filter(
              (row) =>
                initialWorkshop?.id &&
                row.workshop_id === initialWorkshop.id &&
                row.status !== 'withdrawn',
            )
            .map((row) => row.topic_id),
        ]);
        const nextPrimary = initialWorkshop?.topic_id || initialTopicId || seeded[0] || '';
        const nextAdditional = seeded.filter((id) => id !== nextPrimary);
        const primary = catalog.find((entry) => entry.topicId === nextPrimary);
        setPrimaryTopicId(nextPrimary);
        setAdditionalIds(nextAdditional);
        setIncludeSubtopics(descendantTopicIds(catalog, nextPrimary).length > 0);
        setModuleId(
          initialModuleId || initialWorkshop?.module_id || primary?.moduleId || allModules[0]?.id || '',
        );

        const stored = splitStoredDescription(initialWorkshop?.description);
        const nextTitle =
          initialWorkshop?.title || (primary ? `Clase: ${primary.title}` : '');
        setTitle(nextTitle);
        setClassDescription(stored.description);
        setClassLocation(stored.location);
        setClassModality(initialWorkshop?.session_modality === 'in_person' ? 'in_person' : 'online');
        setClassRecordingUrl(initialWorkshop?.recording_url || '');
        setClassStreamUrl(initialWorkshop?.stream_url || '');
        setClassDuration(initialWorkshop?.duration_minutes || 90);
        setCountsForKardex(initialWorkshop?.counts_for_kardex !== false);

        if (initialWorkshop?.scheduled_at) {
          const parts = splitIsoToLocalDateTime(initialWorkshop.scheduled_at);
          setClassDate(parts.date);
          setClassTime(parts.time);
        } else if (initialScheduledAt) {
          const parts = splitDateTimeLocalInput(initialScheduledAt);
          setClassDate(parts.date);
          setClassTime(parts.time);
        } else {
          setClassDate('');
          setClassTime('19:00');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    user?.id,
    initialWorkshop,
    initialScheduledAt,
    initialModuleId,
    initialTopicId,
    selectedTopicKey,
    catalog,
  ]);

  if (!isOpen) return null;

  const showToast = (type: 'ok' | 'err', text: string) => {
    setFeedback({ type, text });
  };

  const sessionTopicPairs = () => {
    const ids = sessionTopicIdsForLiveClass(catalog, primaryTopicId, additionalIds);
    return ids
      .map((id) => catalog.find((entry) => entry.topicId === id))
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      .map((entry) => ({ topicId: entry.topicId, moduleId: entry.moduleId }));
  };

  const choosePrimary = (topicId: string) => {
    const entry = catalog.find((item) => item.topicId === topicId);
    if (!entry) return;
    const included = topicIdsIncludedBySelection(catalog, topicId);
    const [nextPrimary, ...rest] = included;
    setPrimaryTopicId(nextPrimary);
    setAdditionalIds((prev) => uniqueIds([...prev.filter((id) => id !== nextPrimary), ...rest]));
    setModuleId(entry.moduleId);
    setIncludeSubtopics(rest.length > 0 || descendantTopicIds(catalog, nextPrimary).length > 0);
    if (!titleDirty.current) setTitle(`Clase: ${entry.title}`);
    setPrimaryQuery('');
    setPrimarySearchFocused(false);
  };

  const assignTeacher = async (teacherId: string, teacherName: string) => {
    if (!primaryTopicId) {
      showToast('err', 'Elige primero el tema principal de la clase.');
      return;
    }
    setBusyAction(`assign-${teacherId}`);
    setFeedback(null);
    try {
      const topicIds = uniqueIds([
        primaryTopicId,
        ...(includeSubtopics ? descendantTopicIds(catalog, primaryTopicId) : []),
        ...additionalIds,
      ]);
      const byModule = new Map<string, string[]>();
      for (const id of topicIds) {
        const entry = catalog.find((item) => item.topicId === id);
        if (!entry) continue;
        const list = byModule.get(entry.moduleId) ?? [];
        list.push(id);
        byModule.set(entry.moduleId, list);
      }
      for (const [modId, ids] of byModule) {
        await assignTopicsToTeacher({
          topicIds: ids,
          moduleId: modId,
          teacherId,
          teacherName,
          workshopId: initialWorkshop?.id ?? null,
        });
      }
      const updated = await listTopicTeachingCommitments();
      setCommitments(updated);
      if (!teachers.some((teacher) => teacher.id === teacherId)) {
        setTeachers((prev) => [
          ...prev,
          {
            id: teacherId,
            name: teacherName,
            specialty: customTeacherSpecialty || 'Profesor Adjunto',
            roleLabel: 'Docente',
          },
        ]);
      }
      setCustomTeacherMode(false);
      setCustomTeacherName('');
      showToast('ok', `Tema asignado a ${teacherName}`);
    } catch (err) {
      showToast('err', err instanceof Error ? err.message : 'No se pudo asignar el profesor');
    } finally {
      setBusyAction(null);
    }
  };

  const removeTeacher = async (teacherId: string, teacherName: string) => {
    if (!primaryTopicId) return;
    setBusyAction(`remove-${teacherId}`);
    setFeedback(null);
    try {
      const topicIds = uniqueIds([
        primaryTopicId,
        ...(includeSubtopics ? descendantTopicIds(catalog, primaryTopicId) : []),
      ]);
      const commitmentIds = commitments
        .filter(
          (row) =>
            row.teacher_id === teacherId &&
            topicIds.includes(row.topic_id) &&
            row.status !== 'withdrawn',
        )
        .map((row) => row.id);
      await removeTeacherFromTopics({ teacherId, topicIds, commitmentIds });
      setCommitments(await listTopicTeachingCommitments());
      showToast('ok', `Se retiró a ${teacherName} de este tema`);
    } catch (err) {
      showToast('err', err instanceof Error ? err.message : 'No se pudo retirar al profesor');
    } finally {
      setBusyAction(null);
    }
  };

  const invitationText = (teacherName?: string) => {
    const recipient = teacherName || topicCommitments[0]?.teacher_name || 'Profesor(a)';
    const when = classDate
      ? `${classDate} · ${classTime || '19:00'} hrs (${classDuration} min)`
      : 'Por definir en calendario';
    const lines = [
      '🩺 *Clase en vivo · ElectroDx NeuroSAFE*',
      `Hola *${recipient}*,`,
      '',
      `📌 *Sesión:* ${title || primaryEntry?.title || 'Clase en vivo'}`,
      `📘 *Módulo:* ${primaryModule?.title || 'Por definir'}`,
      `📅 *Fecha:* ${when}`,
    ];
    if (classModality === 'in_person') {
      lines.push(`🏥 *Sede:* ${classLocation.trim() || 'Por confirmar'}`);
    } else if (classStreamUrl.trim()) {
      lines.push(`🎥 *Enlace:* ${classStreamUrl.trim()}`);
    }
    return lines.join('\n');
  };

  const copyInvitation = async (teacherName?: string) => {
    try {
      await navigator.clipboard.writeText(invitationText(teacherName));
      showToast('ok', 'Ficha de la clase copiada.');
    } catch {
      showToast('err', 'No se pudo copiar al portapapeles.');
    }
  };

  const sendWhatsApp = (teacherName?: string) => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(invitationText(teacherName))}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const saveClass = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!title.trim()) {
      showToast('err', 'Escribe el título de la clase.');
      return;
    }
    if (!primaryTopicId) {
      showToast('err', 'Elige el tema principal de la clase.');
      return;
    }
    if (!classDate) {
      showToast('err', 'Selecciona la fecha de la sesión.');
      window.setTimeout(() => tryShowNativePicker(classDateInputRef.current), 80);
      return;
    }
    if (additionalIds.length > 0 && topicCommitments.length === 0) {
      showToast('err', 'Asigna un docente antes de vincular otros temas a la misma clase.');
      return;
    }
    if (!user?.id) {
      showToast('err', 'Debes iniciar sesión para programar la clase.');
      return;
    }

    setBusyAction('schedule');
    setFeedback(null);
    try {
      const topics = sessionTopicPairs();
      const primary = topics[0];
      const description = composeClassDescription(classDescription, classLocation, classModality) || null;
      const scheduledAt = new Date(`${classDate}T${classTime || '19:00'}:00`).toISOString();
      const shared = {
        title: title.trim(),
        module_id: primary?.moduleId || moduleId,
        topic_id: primary?.topicId || primaryTopicId,
        description,
        scheduled_at: scheduledAt,
        duration_minutes: classDuration || 90,
        stream_url: classStreamUrl.trim() || null,
        recording_url: classRecordingUrl.trim() || null,
        session_modality: classModality,
        session_type: classModality === 'in_person' ? 'hands_on_presencial' : 'masterclass',
        counts_for_kardex: countsForKardex,
        clinical_case_json: withSessionTopicIds(
          initialWorkshop?.clinical_case_json,
          topics.map((topic) => topic.topicId),
        ),
      };

      let workshopId = initialWorkshop?.id;
      if (workshopId) {
        await updateWorkshop(workshopId, {
          ...shared,
          ...(initialWorkshop?.status === 'draft' ? { status: 'scheduled' as const } : {}),
        });
      } else {
        const created = await createWorkshop({
          ...shared,
          max_capacity: 100,
          clinical_case_revision_id: null,
          status: 'scheduled',
          created_by: user.id,
        });
        workshopId = created.id;
      }

      for (const teacher of topicCommitments) {
        const byModule = new Map<string, string[]>();
        for (const topic of topics) {
          const list = byModule.get(topic.moduleId) ?? [];
          list.push(topic.topicId);
          byModule.set(topic.moduleId, list);
        }
        for (const [modId, ids] of byModule) {
          await assignTopicsToTeacher({
            topicIds: ids,
            moduleId: modId,
            teacherId: teacher.teacher_id,
            teacherName: teacher.teacher_name || 'Profesor',
            workshopId,
          });
        }
      }
      if (user.id) {
        await assignWorkshopToTopics(workshopId, topics, user.id);
      }

      const result = await onSuccess?.();
      if (result === false) return;
      onClose();
    } catch (err) {
      showToast('err', err instanceof Error ? err.message : 'No se pudo guardar la clase.');
    } finally {
      setBusyAction(null);
    }
  };

  const deleteClass = async () => {
    if (!initialWorkshop?.id) return;
    if (!window.confirm('¿Eliminar esta clase? Se quitará del calendario y de la lista de talleres.')) return;
    setBusyAction('delete');
    setFeedback(null);
    try {
      await deleteWorkshop(initialWorkshop.id);
      const result = await onSuccess?.();
      if (result === false) return;
      onClose();
    } catch (err) {
      showToast('err', err instanceof Error ? err.message : 'No se pudo eliminar la clase.');
      setBusyAction(null);
    }
  };

  const assignedTeacherIds = new Set(topicCommitments.map((row) => row.teacher_id));
  const heading = primaryEntry?.title || (initialWorkshop ? 'Editar clase en vivo' : 'Nueva clase en vivo');
  const coveredCount = additionalIds.length;

  return (
    <div
      className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fadeIn"
      onClick={(event) => {
        if (event.target === event.currentTarget && busyAction === null) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-class-drawer-title"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 shrink-0 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap min-w-0">
              <span className="text-base">{primaryModule?.emoji || '📘'}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[220px]">
                {primaryModule?.title || 'Elige un módulo'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300">
                Clase en vivo
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {initialWorkshop?.id && (
                <button
                  type="button"
                  onClick={() => void deleteClass()}
                  disabled={busyAction !== null}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Cerrar panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <h2
            id="live-class-drawer-title"
            className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug"
          >
            {heading}
          </h2>

          <div className="flex items-center justify-between gap-3 pt-2.5 mt-0.5 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[11px] leading-snug text-slate-600 dark:text-slate-300 min-w-0">
              <span className="font-bold text-slate-800 dark:text-slate-100">Clase en vivo.</span>{' '}
              {!primaryEntry
                ? 'Elige el tema, el docente y la fecha.'
                : coveredCount === 0
                  ? 'Solo este tema.'
                  : `Este tema y ${coveredCount} más.`}
            </p>
            <button
              type="submit"
              form="live-class-create-form"
              disabled={busyAction !== null || loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50 shrink-0"
            >
              {busyAction === 'schedule' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Guardar clase en vivo</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`shrink-0 mx-4 sm:mx-5 mt-3 p-3 rounded-xl text-xs font-bold flex items-center justify-between gap-2 ${
              feedback.type === 'ok'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <span>{feedback.type === 'ok' ? `✓ ${feedback.text}` : feedback.text}</span>
            <button type="button" onClick={() => setFeedback(null)} aria-label="Cerrar aviso" className="cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {loading ? (
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Cargando docentes y temario…
            </p>
          ) : (
            <>
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-3.5">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Profesor(es) asignado(s) al tema
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Asigna directamente a un profesor adjunto (colaborador docente) o titular.
                  </p>
                </div>

                {!primaryTopicId ? (
                  <p className="text-xs text-slate-500">
                    Elige el tema principal abajo para asignar docentes con un clic.
                  </p>
                ) : topicCommitments.length > 0 ? (
                  <div className="space-y-2">
                    {topicCommitments.map((commitment) => {
                      const name = commitment.teacher_name || 'Profesor Asignado';
                      const info = teachers.find((teacher) => teacher.id === commitment.teacher_id);
                      return (
                        <div
                          key={commitment.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-900/60"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                              {getInitials(name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{name}</p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {info?.specialty || 'Docente asignado a este tema'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => void copyInvitation(name)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span className="hidden sm:inline">Copiar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => sendWhatsApp(name)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 cursor-pointer"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                            <button
                              type="button"
                              disabled={busyAction !== null}
                              onClick={() => void removeTeacher(commitment.teacher_id, name)}
                              className="px-2 py-1 rounded-lg text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-50 cursor-pointer"
                            >
                              {busyAction === `remove-${commitment.teacher_id}` ? 'Quitando…' : 'Quitar'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Este tema aún no tiene profesor asignado
                    </p>
                  </div>
                )}

                {childCount > 0 && (
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 text-xs font-semibold text-indigo-900 dark:text-indigo-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSubtopics}
                      onChange={(event) => setIncludeSubtopics(event.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      Aplicar también a sus <strong>{childCount} subtemas</strong>
                    </span>
                  </label>
                )}

                {primaryTopicId && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        Seleccionar profesor (1 clic para asignar):
                      </span>
                      <button
                        type="button"
                        onClick={() => setCustomTeacherMode((value) => !value)}
                        className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                      >
                        {customTeacherMode ? 'Elegir de la lista' : '+ Profesor invitado externo'}
                      </button>
                    </div>
                    {customTeacherMode ? (
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          const cleanName = customTeacherName.trim();
                          if (!cleanName) return;
                          const guestId = `guest_${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
                          void assignTeacher(guestId, cleanName);
                        }}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2.5"
                      >
                        <input
                          type="text"
                          required
                          placeholder="Ej. Dra. Laura Méndez · Neurofisiología"
                          value={customTeacherName}
                          onChange={(event) => setCustomTeacherName(event.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                        />
                        <input
                          type="text"
                          value={customTeacherSpecialty}
                          onChange={(event) => setCustomTeacherSpecialty(event.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={busyAction !== null}
                            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            Asignar al tema
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        {teachers.length > 4 && (
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="search"
                              placeholder="Buscar profesor por nombre o especialidad..."
                              value={teacherSearch}
                              onChange={(event) => setTeacherSearch(event.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                            />
                          </div>
                        )}
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                          {filteredTeachers.map((teacher) => {
                            const isAssigned = assignedTeacherIds.has(teacher.id);
                            return (
                              <button
                                key={teacher.id}
                                type="button"
                                disabled={busyAction !== null || isAssigned}
                                onClick={() => void assignTeacher(teacher.id, teacher.name)}
                                className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl border text-left transition cursor-pointer ${
                                  isAssigned
                                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                                    {getInitials(teacher.name)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                      {teacher.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 truncate">
                                      {teacher.roleLabel} · {teacher.specialty}
                                    </p>
                                  </div>
                                </div>
                                {isAssigned ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <Check className="w-3 h-3" /> Asignado
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                                    {busyAction === `assign-${teacher.id}` ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <UserPlus className="w-3 h-3" />
                                    )}
                                    Asignar
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <form
                id="live-class-create-form"
                onSubmit={(event) => void saveClass(event)}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-3.5"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                    Calendario de la clase
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Programa qué día y a qué hora se impartirá, con el mismo temario de la clase en vivo.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Título de la sesión
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(event) => {
                      titleDirty.current = true;
                      setTitle(event.target.value);
                    }}
                    placeholder="Ej. Taller 1: Fundamentos de Neuroconducción"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Módulo académico
                  </label>
                  <select
                    value={moduleId}
                    onChange={(event) => setModuleId(event.target.value)}
                    className="live-session-select w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 text-xs font-bold"
                  >
                    {allModules.map((mod) => (
                      <option key={mod.id} value={mod.id}>
                        {mod.title}
                      </option>
                    ))}
                  </select>
                </div>

                {!primaryTopicId ? (
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tema principal
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="search"
                        value={primaryQuery}
                        onChange={(event) => setPrimaryQuery(event.target.value)}
                        onFocus={() => setPrimarySearchFocused(true)}
                        onBlur={() => window.setTimeout(() => setPrimarySearchFocused(false), 150)}
                        placeholder="Buscar el tema de esta clase…"
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                    {primarySearchFocused && (
                      <ul
                        className="mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        onMouseDown={(event) => event.preventDefault()}
                      >
                        {primaryResults.length === 0 ? (
                          <li className="px-3 py-2 text-[11px] text-slate-500">Sin coincidencias.</li>
                        ) : (
                          primaryResults.map((entry) => (
                            <li key={entry.topicId}>
                              <button
                                type="button"
                                onClick={() => choosePrimary(entry.topicId)}
                                className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                              >
                                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">
                                  {entry.title}
                                </span>
                                <span className="block text-[10px] text-slate-500 truncate">
                                  {entry.parentTitle ? `${entry.parentTitle} · ` : ''}
                                  {entry.moduleTitle}
                                </span>
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-500">
                      Tema principal: <strong className="text-slate-800 dark:text-slate-100">{primaryEntry?.title}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPrimaryTopicId('');
                        setPrimaryQuery('');
                      }}
                      className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer shrink-0"
                    >
                      Cambiar tema
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label
                      htmlFor="live-class-session-date"
                      className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 cursor-pointer"
                      onClick={(event) => {
                        event.preventDefault();
                        tryShowNativePicker(classDateInputRef.current);
                      }}
                    >
                      Fecha de la sesión
                    </label>
                    <input
                      ref={classDateInputRef}
                      id="live-class-session-date"
                      type="date"
                      required
                      value={classDate}
                      onChange={(event) => setClassDate(event.target.value)}
                      onClick={() => tryShowNativePicker(classDateInputRef.current)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hora (CDMX)
                    </label>
                    <input
                      type="time"
                      value={classTime}
                      onChange={(event) => setClassTime(event.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Duración
                    </label>
                    <select
                      value={classDuration}
                      onChange={(event) => setClassDuration(Number(event.target.value))}
                      className="live-session-select w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 text-xs font-bold"
                    >
                      <option value={45}>45 min</option>
                      <option value={60}>60 min (1 hr)</option>
                      <option value={90}>90 min (1.5 hrs)</option>
                      <option value={120}>120 min (2 hrs)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Modalidad
                  </label>
                  <select
                    value={classModality}
                    onChange={(event) => setClassModality(event.target.value as SessionModality)}
                    className="live-session-select w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 text-xs font-bold"
                  >
                    <option value="online">En línea (Zoom / Streaming)</option>
                    <option value="in_person">Presencial (Aula / Laboratorio EMG)</option>
                  </select>
                </div>

                {classModality === 'in_person' && (
                  <div>
                    <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      Sede o aula
                    </label>
                    <input
                      type="text"
                      value={classLocation}
                      onChange={(event) => setClassLocation(event.target.value)}
                      placeholder="Aula de electrodiagnóstico"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <Video className="w-3 h-3 text-blue-500" />
                    Enlace de Zoom / Google Meet (opcional)
                  </label>
                  <input
                    type="url"
                    value={classStreamUrl}
                    onChange={(event) => setClassStreamUrl(event.target.value)}
                    placeholder="https://zoom.us/j/..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Enlace de clase grabada (YouTube / Drive / Vimeo)
                  </label>
                  <input
                    type="url"
                    value={classRecordingUrl}
                    onChange={(event) => setClassRecordingUrl(event.target.value)}
                    placeholder="https://drive.google.com/... o https://youtube.com/..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={countsForKardex}
                    onChange={(event) => setCountsForKardex(event.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Computa para el 20% de asistencia en Kardex
                </label>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Descripción del caso o temario del taller
                  </label>
                  <textarea
                    rows={2}
                    value={classDescription}
                    onChange={(event) => setClassDescription(event.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                {primaryTopicId && (
                  <div className="pt-1 border-t border-slate-200/80 dark:border-slate-700/80">
                    <LiveClassTopicQuickPicker
                      catalog={catalog}
                      primaryTopicId={primaryTopicId}
                      primaryTopicTitle={primaryEntry?.title || 'Tema principal'}
                      selectedAdditionalIds={additionalIds}
                      onSelectedAdditionalIdsChange={setAdditionalIds}
                      suggestedEntries={moduleSuggestions}
                      disabled={busyAction !== null}
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {initialWorkshop ? 'Sesión existente' : 'Nueva sesión'}
                  </span>
                  <button
                    type="submit"
                    disabled={busyAction !== null}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {busyAction === 'schedule' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Calendar className="w-3.5 h-3.5" />
                    )}
                    <span>{initialWorkshop ? 'Actualizar clase' : 'Guardar fecha de clase'}</span>
                  </button>
                </div>
              </form>

              <label className="flex items-center gap-2 px-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoOpenOnLogin}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setAutoOpenOnLogin(checked);
                    setAutoOpenClassWizardPref(checked);
                  }}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                Abrir este panel al iniciar sesión
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
