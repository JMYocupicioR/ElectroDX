import { CheckCircle2, Loader2, Search, Video } from 'lucide-react';
import type { LibraryVideoPick } from '../../utils/libraryVideoCatalog';

function formatDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function LibraryVideoPicker({
  videos,
  loading,
  error,
  query,
  onQueryChange,
  selectedId,
  onSelect,
  unavailableKeys,
}: {
  videos: LibraryVideoPick[];
  loading: boolean;
  error: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  selectedId: string | null;
  onSelect: (video: LibraryVideoPick) => void;
  unavailableKeys: Set<string>;
}) {
  return (
    <div className="space-y-3">
      <label className="relative block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar por título, tema o módulo..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
        />
      </label>

      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando biblioteca...
          </div>
        ) : error ? (
          <p className="text-sm text-rose-600 dark:text-rose-400 text-center py-8">{error}</p>
        ) : videos.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            {query.trim()
              ? 'Ningún video de la biblioteca coincide con esa búsqueda.'
              : 'La biblioteca todavía no tiene videos para reutilizar.'}
          </p>
        ) : (
          videos.map((video) => {
            const selected = selectedId === video.id;
            const alreadyHere = unavailableKeys.has(video.dedupKey);
            const dateLabel = formatDate(video.date);
            return (
              <button
                key={video.id}
                type="button"
                disabled={alreadyHere}
                onClick={() => onSelect(video)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${
                  alreadyHere
                    ? 'border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed'
                    : selected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <Video
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      selected ? 'text-blue-600 dark:text-blue-300' : 'text-slate-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{video.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {video.sourceLabel}
                      {video.kind === 'workshop' ? '' : video.topicTitle ? ` · ${video.topicTitle}` : ''}
                      {video.moduleTitle ? ` · ${video.moduleTitle}` : ''}
                      {dateLabel ? ` · ${dateLabel}` : ''}
                      {video.durationMinutes ? ` · ${video.durationMinutes} min` : ''}
                    </p>
                    {alreadyHere && (
                      <p className="text-[11px] font-semibold text-slate-500 mt-1">Ya está en este tema</p>
                    )}
                  </div>
                  {selected && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-300 flex-shrink-0" />}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
