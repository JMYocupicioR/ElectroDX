import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, CalendarPlus, CheckCircle2, MapPin, UserCheck, Video } from 'lucide-react';
import { useSyllabusCatalog } from '../../hooks/useSyllabusCatalog';
import type { LiveWorkshop } from '../../types/database';
import {
  buildLiveClassTopicCatalog,
  buildLiveClassTopicHref,
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
import { getWorkshopAccessTiming } from '../../utils/liveSessionUtils';

export function downloadWorkshopIcs(workshop: LiveWorkshop, location?: string) {
  const resolvedLocation = location ?? sessionLocation(workshop.description);
  const blob = new Blob([buildSessionIcs(workshop, resolvedLocation)], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'clase-electrodx.ics';
  link.click();
  URL.revokeObjectURL(url);
}

function getTeacherInitials(name: string): string {
  const cleaned = name
    .replace(/^(dr\.?|dra\.?|mtro\.?|mtra\.?|lic\.?|ing\.?|prof\.?)\s+/i, '')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'D';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length > 2 ? 2 : 1][0]}`.toUpperCase();
}

export function LiveSessionMetaBadges({
  workshop,
  isPast: isPastProp,
  className = '',
}: {
  workshop: LiveWorkshop;
  isPast?: boolean;
  className?: string;
}) {
  const location = sessionLocation(workshop.description);
  const inPerson = workshop.session_modality === 'in_person';
  const counts = workshop.counts_for_kardex !== false;
  const isPast = isPastProp ?? getWorkshopAccessTiming(workshop).isPast;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
        {inPerson ? (
          <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
        ) : (
          <Video className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
        )}
        <span>
          {sessionModalityLabel(workshop.session_modality)}
          {inPerson && location ? ` · ${location}` : ''}
        </span>
      </span>

      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
          counts
            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
            : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
        }`}
      >
        {counts && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
        <span>{counts ? 'Cuenta para la asistencia del kárdex' : 'No cuenta para el kárdex'}</span>
      </span>

      {!isPast && (
        <button
          type="button"
          onClick={() => downloadWorkshopIcs(workshop, location)}
          className="inline-flex items-center justify-center gap-1.5 min-h-11 sm:min-h-8 px-3 py-1.5 sm:py-1 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer sm:ml-auto"
        >
          <CalendarPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Agregar a mi calendario</span>
        </button>
      )}
    </div>
  );
}

export function LiveSessionRoster({
  workshop,
  brief,
  hideBadges = false,
}: {
  workshop: LiveWorkshop;
  brief?: SessionBrief | null;
  hideBadges?: boolean;
}) {
  const { modulesForStaff } = useSyllabusCatalog();
  const catalog = useMemo(
    () => buildLiveClassTopicCatalog(modulesForStaff),
    [modulesForStaff],
  );
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

  return (
    <div className="space-y-5">
      {!hideBadges && <LiveSessionMetaBadges workshop={workshop} />}

      {/* ─── DOCENTES DE LA CLASE (Lista compacta sin cards anidadas) ─── */}
      <section className="pt-4 border-t border-slate-200/80 dark:border-slate-800/90">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2.5">
          <UserCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          Docentes de esta clase
        </h2>
        {resolved.teachers.length > 0 ? (
          <ul className="divide-y divide-slate-200/60 dark:divide-slate-800/70">
            {resolved.teachers.map((teacher) => (
              <li
                key={teacher.id}
                className="py-2 first:pt-0 last:pb-0 flex items-center gap-3 min-w-0"
              >
                <span
                  aria-hidden="true"
                  className="w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-400/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0"
                >
                  {getTeacherInitials(teacher.name)}
                </span>
                <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-baseline sm: flex-wrap gap-x-2 gap-y-0.5">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {teacher.name}
                  </span>
                  {teacher.specialty ? (
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="hidden sm:inline text-slate-300 dark:text-slate-600">·</span>
                      <span>{teacher.specialty}</span>
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            El docente de esta sesión aún no está publicado.
          </p>
        )}
      </section>

      {/* ─── TEMAS DE LA SESIÓN (Lista tipográfica con enlace directo al temario) ─── */}
      <section className="pt-4 border-t border-slate-200/80 dark:border-slate-800/90">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            Temas de esta sesión
          </h2>
          {groups.length > 0 && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Clic para abrir en el temario
            </span>
          )}
        </div>
        {groups.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            El temario de esta sesión aún no está publicado.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {groups.map((group) => {
              const parentHref = buildLiveClassTopicHref(catalog, group.entry);
              return (
                <li key={group.entry.topicId}>
                  <Link
                    to={parentHref}
                    className="group inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span>{group.entry.title}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                  </Link>
                  {group.children.length > 0 ? (
                    <ul className="mt-1.5 ml-2 pl-3 border-l border-slate-200 dark:border-slate-800 space-y-1">
                      {group.children.map((child) => {
                        const childHref = buildLiveClassTopicHref(catalog, child);
                        return (
                          <li key={child.topicId}>
                            <Link
                              to={childHref}
                              className="group inline-flex items-center gap-1.5 py-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <span>{child.title}</span>
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity shrink-0" />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ─── RESUMEN / NOTAS DE LA CLASE ─── */}
      {summary ? (
        <section className="pt-4 border-t border-slate-200/80 dark:border-slate-800/90">
          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {summary}
          </p>
        </section>
      ) : null}
    </div>
  );
}
