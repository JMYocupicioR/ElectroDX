import { useEffect, useState } from 'react';
import { Bookmark, NotebookPen, Layers } from 'lucide-react';
import { createFlashcardsFromLesson, getLessonNote, toggleBookmark, upsertLessonNote } from '../../services/studentToolsService';

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
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [cardsCreated, setCardsCreated] = useState<number | null>(null);

  useEffect(() => {
    getLessonNote(topicId)
      .then((row) => setNote(row?.body ?? ''))
      .catch(() => undefined);
  }, [topicId]);

  return (
    <section className="mt-8 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <NotebookPen className="w-4 h-4" /> Apuntes de la lección
        </h2>
        <button
          type="button"
          className="min-h-[44px] px-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-1"
          onClick={async () => {
            try {
              const on = await toggleBookmark({ topicId, moduleId, url, title });
              setBookmarked(on);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'No se pudo guardar el marcador');
            }
          }}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-400 text-amber-500' : ''}`} />
          Marcador
        </button>
      </div>
      <label className="sr-only" htmlFor={`note-${topicId}`}>
        Apunte
      </label>
      <textarea
        id={`note-${topicId}`}
        className="w-full min-h-[96px] rounded-xl border px-3 py-2 text-sm dark:bg-slate-800"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          className="min-h-[44px] px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold"
          onClick={async () => {
            try {
              await upsertLessonNote({ topicId, moduleId, body: note });
              setSaved('Guardado');
              setError(null);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'No se pudo guardar');
            }
          }}
        >
          Guardar apunte
        </button>
        {saved && <span className="text-xs text-emerald-600">{saved}</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
      {(pearls.length > 0 || keyPoints.length > 0) && (
        <button
          type="button"
          className="mt-3 min-h-[44px] px-4 rounded-xl border text-sm font-semibold inline-flex items-center gap-2"
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
      {cardsCreated != null && (
        <p className="text-xs text-emerald-600 mt-2">
          {cardsCreated === 0 ? 'Ya tenía tarjetas de esta lección.' : `Se crearon ${cardsCreated} tarjetas.`}
        </p>
      )}
    </section>
  );
}
