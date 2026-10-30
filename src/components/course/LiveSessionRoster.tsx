import { useMemo } from 'react';
import { BookOpen, CalendarPlus, MapPin, UserCheck, Video } from 'lucide-react';
import { allModules } from '../../content/modules';
import type { LiveWorkshop } from '../../types/database';
import {
  buildLiveClassTopicCatalog,
  groupSelectedLiveClassTopics,
  sessionTopicIdsForLiveClass,
  topicIdsIncludedBySelection,
} from '../admin/LiveClassTopicQuickPicker';
import {
  briefForWorkshop,
  buildSessionIcs,
  sessionLocation,
  sessionModalityLabel,
  sessionSummaryText,
  readSessionTopicIds,
  type SessionBrief,
} from '../../utils/liveSessionBrief';

function downloadIcs(workshop: LiveWorkshop, location: string) {
  const blob = new Blob([buildSessionIcs(workshop, location)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'clase-electrodx.ics';
  link.click();
  URL.revokeObjectURL(url);
}

export function LiveSessionRoster({
  workshop,
  brief,
}: {
  workshop: LiveWorkshop;
  brief?: SessionBrief | null;
}) {
  const catalog = useMemo(() => buildLiveClassTopicCatalog(allModules), []);
  const resolved = briefForWorkshop(workshop, brief);
  const hasExplicitTopics = readSessionTopicIds(workshop).length > 0;
  const topicIds = useMemo(() => {
    const saved = resolved.topics.map((topic) => topic.topicId);
    if (hasExplicitTopics) {
      return sessionTopicIdsForLiveClass(catalog, workshop.topic_id, saved);
    }
    return [...new Set(saved.flatMap((id) => topicIdsIncludedBySelection(catalog, id)))];
  }, [catalog, resolved.topics, hasExplicitTopics, workshop.topic_id]);
  const groups = useMemo(
    () => groupSelectedLiveClassTopics(catalog, topicIds),
    [catalog, topicIds],
  );
  const summary = sessionSummaryText(workshop.description);
  const location = sessionLocation(workshop.description);
  const inPerson = workshop.session_modality === 'in_person';
  const counts = workshop.counts_for_kardex !== false;

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
          {inPerson ? <MapPin className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
          {sessionModalityLabel(workshop.session_modality)}
          {inPerson && location ? ` · ${location}` : ''}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
          {counts ? 'Cuenta para la asistencia del kárdex' : 'No cuenta para el kárdex'}
        </span>
        <button
          type="button"
          onClick={() => downloadIcs(workshop, location)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          Agregar a mi calendario
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40 p-4 space-y-2">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5" />
          Docentes de esta clase
        </h2>
        {resolved.teachers.length > 0 ? (
          <ul className="space-y-2">
            {resolved.teachers.map((teacher) => (
              <li
                key={teacher.id}
                className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-600"
              >
                <p className="text-sm font-bold text-slate-950 dark:text-white">{teacher.name}</p>
                {teacher.specialty ? (
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-0.5">
                    {teacher.specialty}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            El docente de esta sesión aún no está publicado.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40 p-4 space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Temas de esta sesión
        </h2>
        {groups.length === 0 ? (
          <p className="text-sm text-slate-500">El temario de esta sesión aún no está publicado.</p>
        ) : (
          <ul className="space-y-2">
            {groups.map((group) => (
              <li key={group.entry.topicId}>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{group.entry.title}</p>
                {group.children.length > 0 ? (
                  <ul className="mt-1 ml-4 space-y-0.5">
                    {group.children.map((child) => (
                      <li key={child.topicId} className="text-sm text-slate-600 dark:text-slate-300">
                        {child.title}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {summary ? (
        <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">{summary}</p>
      ) : null}
    </div>
  );
}
