import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, ExternalLink, Play, UserCheck } from 'lucide-react';
import type { LiveWorkshop } from '../../types/database';
import { getModuleById } from '../../content/modules';
import { useSyllabusCatalog } from '../../hooks/useSyllabusCatalog';
import type { Module, Topic } from '../../types/content';
import {
  briefForWorkshop,
  sessionSummaryText,
  type SessionBrief,
} from '../../utils/liveSessionBrief';
import { getVideoThumbnailUrl, parseVideoUrl } from '../../utils/mediaValidation';
import { getWorkshopDurationInfo } from '../../utils/workshopDurationUtils';
import { canonicalTopicId } from '../../utils/topicIdAliases';

function findTopicTitle(topics: Topic[], topicId: string): string | null {
  for (const topic of topics) {
    if (topic.id === topicId) return topic.title;
    if (topic.children?.length) {
      const nested = findTopicTitle(topic.children, topicId);
      if (nested) return nested;
    }
  }
  return null;
}

function topicTitleById(topicId: string, modules: Module[]): string | null {
  const canonical = canonicalTopicId(topicId);
  for (const mod of modules) {
    const title = findTopicTitle(mod.topics, topicId) ?? findTopicTitle(mod.topics, canonical);
    if (title) return title;
  }
  return null;
}

function recordingSourceLabel(url: string | null): string | null {
  const parsed = url ? parseVideoUrl(url) : null;
  if (!parsed) return null;
  if (parsed.kind === 'youtube') return 'YouTube';
  if (parsed.kind === 'drive') return 'Google Drive';
  if (parsed.kind === 'vimeo') return 'Vimeo';
  return 'Video';
}

function topicLabel(
  workshop: LiveWorkshop,
  modules: Module[],
  brief?: SessionBrief | null
): string | null {
  const topics = briefForWorkshop(workshop, brief).topics;
  if (topics.length === 0) return null;
  if (topics.length > 1) return `${topics.length} temas`;
  return topicTitleById(topics[0].topicId, modules);
}

interface RecordedWorkshopCardProps {
  workshop: LiveWorkshop;
  brief?: SessionBrief | null;
}

export function RecordedWorkshopCard({ workshop, brief }: RecordedWorkshopCardProps) {
  const { modulesWithOverrides } = useSyllabusCatalog();
  const [thumbFailed, setThumbFailed] = useState(false);
  const when = new Date(workshop.scheduled_at);
  const duration = getWorkshopDurationInfo(workshop);
  const thumbnailUrl = getVideoThumbnailUrl(workshop.recording_url);
  const showThumb = Boolean(thumbnailUrl) && !thumbFailed;
  const moduleInfo =
    modulesWithOverrides.find((m) => m.id === workshop.module_id) ??
    getModuleById(workshop.module_id);
  const summary = sessionSummaryText(workshop.description);
  const resolved = briefForWorkshop(workshop, brief);
  const teachers = resolved.teachers;
  const teacherNames = teachers
    .map((teacher) => teacher.name)
    .filter(Boolean)
    .slice(0, 2)
    .join(', ');
  const extraTeachers = Math.max(0, teachers.length - 2);
  const specialty = teachers.length === 1 ? teachers[0].specialty : null;
  const topic = topicLabel(workshop, modulesWithOverrides, brief);
  const source = recordingSourceLabel(workshop.recording_url);
  const dateLabel = when.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeLabel = when.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <Link
        to={`/taller/${workshop.id}`}
        className="flex min-h-0 flex-1 flex-col rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
      >
        <div className="relative aspect-video bg-slate-900">
          {showThumb ? (
            <img
              src={thumbnailUrl!}
              alt=""
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setThumbFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-900">
              <Play className="h-8 w-8 fill-white text-white" aria-hidden="true" />
            </div>
          )}

          {showThumb ? (
            <span className="pointer-events-none absolute bottom-2.5 left-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 text-white">
              <Play className="ml-0.5 h-3.5 w-3.5 fill-current" aria-hidden="true" />
            </span>
          ) : null}

          <span
            className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-md bg-slate-950/85 px-2 py-1 text-xs font-semibold tabular-nums text-white"
            title={duration.isReal ? 'Duración real del video' : 'Duración estimada de la sesión'}
          >
            <Clock className="h-3 w-3" aria-hidden="true" />
            {duration.display}
            {duration.isReal ? '' : ' est.'}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            {moduleInfo ? (
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Módulo {moduleInfo.number}
              </span>
            ) : null}
            <span>
              {dateLabel} · {timeLabel}
            </span>
            {source ? <span>{source}</span> : null}
          </p>

          {moduleInfo ? (
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{moduleInfo.title}</p>
          ) : null}

          <h3 className="text-base font-bold leading-snug text-slate-900 dark:text-white">
            {workshop.title}
          </h3>

          {topic ? (
            <p className="flex items-start gap-1.5 text-sm text-slate-700 dark:text-slate-200">
              <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
              <span>{topic}</span>
            </p>
          ) : null}

          {teacherNames ? (
            <p className="flex items-start gap-1.5 text-sm text-slate-700 dark:text-slate-200">
              <UserCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
              <span>
                <span className="font-semibold">{teacherNames}</span>
                {extraTeachers > 0 ? ` +${extraTeachers}` : ''}
                {specialty ? <span className="font-normal text-slate-500"> · {specialty}</span> : null}
              </span>
            </p>
          ) : null}

          {summary ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {summary}
            </p>
          ) : null}

          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
            Ver clase
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </Link>

      {workshop.recording_url ? (
        <div className="border-t border-slate-100 px-4 py-2 dark:border-slate-800">
          <a
            href={workshop.recording_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 dark:text-slate-300 dark:hover:text-white"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Abrir video original
          </a>
        </div>
      ) : null}
    </article>
  );
}
