import { Link } from 'react-router-dom';
import { AlertCircle, ExternalLink, Pencil } from 'lucide-react';
import { buildQuizCatalogPath } from '../../../utils/quizCatalogNavigation';
import { getTopicPublicUrl } from '../../../utils/adminUtils';
import type { TopicMissingQuiz } from '../../../utils/topicsMissingQuiz';

export function TopicsMissingQuizQueue({
  topics,
  total,
  onAddQuiz,
}: {
  topics: TopicMissingQuiz[];
  total: number;
  onAddQuiz: (topic: TopicMissingQuiz) => void;
}) {
  if (topics.length === 0) return null;

  const catalogPath = buildQuizCatalogPath({ estado: 'no_quiz', tab: 'topics' });

  return (
    <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
      <div className="px-4 py-3 border-b border-amber-100 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20">
        <p className="text-xs font-bold text-slate-900 dark:text-white">
          Siguientes {topics.length} sin cuestionario
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Orden del temario, desde el tema 1.
          {total > topics.length ? ` ${total} temas siguen sin cuestionario.` : ''}
        </p>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {topics.map((topic) => {
          const lessonUrl = getTopicPublicUrl(topic.moduleId, topic.topicId);
          return (
            <li
              key={`${topic.moduleId}:${topic.curriculumIndex}`}
              className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="min-w-9 h-9 px-1 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-[11px] shrink-0">
                  {topic.curriculumIndex}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {topic.title}
                    </p>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Sin cuestionario
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    Tema {topic.curriculumIndex}
                    {' · '}
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      Módulo {topic.moduleNumber}: {topic.moduleTitle}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                {lessonUrl && (
                  <Link
                    to={lessonUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 transition text-[11px]"
                  >
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                    <span>Ver tema</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => onAddQuiz(topic)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Agregar cuestionario</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {total > topics.length && (
        <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 text-center">
          <Link
            to={catalogPath}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Ver los {total} temas sin cuestionario
          </Link>
        </div>
      )}
    </div>
  );
}
