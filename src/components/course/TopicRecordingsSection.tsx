import { useState } from 'react';
import { Calendar, Clock, ExternalLink, Link2Off, Loader2, Play, Video, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TopicRecordingEntry } from '../../utils/recordedWorkshopTopics';
import { getVideoEmbedSrc, parseVideoUrl } from '../../utils/mediaValidation';
import { TrackedLiveClassPlayer } from './TrackedLiveClassPlayer';

interface TopicRecordingsSectionProps {
  entries: TopicRecordingEntry[];
  userId?: string;
  /** Solo staff: permite quitar el vínculo tema ↔ taller. */
  canUnlink?: boolean;
  unlinkingKey?: string | null;
  onUnlink?: (entry: TopicRecordingEntry) => void | Promise<void>;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function TopicRecordingsSection({
  entries,
  userId,
  canUnlink = false,
  unlinkingKey = null,
  onUnlink,
}: TopicRecordingsSectionProps) {
  const [activeWorkshopId, setActiveWorkshopId] = useState<string | null>(null);

  if (entries.length === 0) return null;

  return (
    <section className="mt-6 rounded-2xl border border-violet-200/70 dark:border-violet-800/50 bg-gradient-to-br from-violet-50/70 to-indigo-50/30 dark:from-violet-950/20 dark:to-indigo-950/10 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm">
            <Video className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {entries.length === 1 ? 'Clase grabada vinculada' : 'Clases grabadas vinculadas'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Se reproduce aquí desde el taller original, sin duplicarse en la biblioteca.
            </p>
          </div>
        </div>
        <span className="rounded-full border border-violet-200/70 dark:border-violet-800/60 bg-white/70 dark:bg-slate-900/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">
          {entries.length} {entries.length === 1 ? 'grabación' : 'grabaciones'}
        </span>
      </div>

      <div className="space-y-2.5">
        {entries.map((entry) => {
          const { workshop, topicTitle } = entry;
          const entryKey = `${entry.topicId}:${workshop.id}`;
          const isActive = activeWorkshopId === workshop.id;
          const isUnlinking = unlinkingKey === entryKey;
          const recordingUrl = workshop.recording_url ?? '';
          const parsed = recordingUrl ? parseVideoUrl(recordingUrl) : null;

          return (
            <div
              key={entryKey}
              className="rounded-xl border border-violet-200/60 dark:border-violet-800/40 bg-white/80 dark:bg-slate-900/60 overflow-hidden"
            >
              <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                    <Play className="h-4 w-4 fill-current" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white" title={workshop.title}>
                      {workshop.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(workshop.scheduled_at)}
                      </span>
                      {workshop.duration_minutes ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {workshop.duration_minutes} min
                        </span>
                      ) : null}
                      <span className="truncate">Tema: {topicTitle}</span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {canUnlink && onUnlink ? (
                    <button
                      type="button"
                      onClick={() => void onUnlink(entry)}
                      disabled={isUnlinking}
                      title="Quitar esta grabación de este tema (no elimina la clase)"
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-800/60 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      {isUnlinking ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Link2Off className="h-3.5 w-3.5" />
                      )}
                      {isUnlinking ? 'Quitando…' : 'Desvincular'}
                    </button>
                  ) : null}
                  <Link
                    to={`/taller/${workshop.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:border-violet-300 hover:text-violet-700 dark:hover:text-violet-300"
                  >
                    Ficha del taller
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActiveWorkshopId(isActive ? null : workshop.id)}
                    disabled={!recordingUrl}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-violet-700 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {isActive ? <X className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                    {isActive ? 'Cerrar' : 'Ver aquí'}
                  </button>
                </div>
              </div>

              {isActive && recordingUrl ? (
                <div className="border-t border-violet-200/60 dark:border-violet-800/40 p-3">
                  {userId ? (
                    <TrackedLiveClassPlayer workshop={workshop} userId={userId} compact />
                  ) : parsed ? (
                    <div className="relative w-full overflow-hidden rounded-xl bg-black" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={getVideoEmbedSrc(parsed)}
                        className="absolute inset-0 h-full w-full"
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={workshop.title}
                      />
                    </div>
                  ) : (
                    <a
                      href={recordingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300 hover:underline"
                    >
                      Abrir grabación
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TopicRecordingsSection;
