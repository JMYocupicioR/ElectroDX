import { useState } from 'react';
import { Bookmark, Layers } from 'lucide-react';
import { createFlashcardsFromLesson, toggleBookmark } from '../../services/studentToolsService';

export function TopicStudyTools({
  moduleId,
  topicId,
  url,
  title,
  pearls = [],
  keyPoints = [],
}: {
  moduleId: string;
  topicId: string;
  url: string;
  title: string;
  pearls?: string[];
  keyPoints?: string[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [cardsCreated, setCardsCreated] = useState<number | null>(null);

  return (
    <section className="mt-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold">Estudio</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="min-h-[44px] px-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-1"
            onClick={async () => {
              try {
                const on = await toggleBookmark({ topicId, moduleId, url, title });
                setBookmarked(on);
                setError(null);
              } catch (e) {
                setError(e instanceof Error ? e.message : 'No se pudo guardar el marcador');
              }
            }}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-400 text-amber-500' : ''}`} />
            Marcador
          </button>
          {(pearls.length > 0 || keyPoints.length > 0) && (
            <button
              type="button"
              className="min-h-[44px] px-4 rounded-xl border text-sm font-semibold inline-flex items-center gap-2"
              onClick={async () => {
                try {
                  const created = await createFlashcardsFromLesson({ topicId, pearls, keyPoints });
                  setCardsCreated(created);
                  setError(null);
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'No se pudieron crear las tarjetas');
                }
              }}
            >
              <Layers className="w-4 h-4" />
              Crear tarjetas de este tema
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      {cardsCreated != null && (
        <p className="text-xs text-emerald-600 mt-2">
          {cardsCreated === 0 ? 'Ya tenía tarjetas de esta lección.' : `Se crearon ${cardsCreated} tarjetas.`}
        </p>
      )}
    </section>
  );
}
