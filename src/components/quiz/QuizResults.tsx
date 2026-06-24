import { useMemo, useState } from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import type { QuizAnswerRecord, QuizQuestion, QuizWithQuestions } from '../../types/quiz';
import { isQuestionCorrect } from '../../utils/quizScoring';

export function QuizResults({
  quiz,
  displayQuestions,
  result,
  responses,
}: {
  quiz: QuizWithQuestions;
  displayQuestions: QuizQuestion[];
  result: { score: number; passed: boolean; answers: QuizAnswerRecord[] };
  responses: Record<string, string[]>;
}) {
  const lang = useSettingsStore((s) => s.language);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  const wrongQuestions = useMemo(
    () => displayQuestions.filter((q) => !isQuestionCorrect(q, responses[q.id] ?? [])),
    [displayQuestions, responses]
  );

  const reviewList = reviewMode ? wrongQuestions : displayQuestions;
  const current = reviewList[reviewIndex];

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 overflow-hidden">
      <div
        className={`px-6 py-5 ${
          result.passed
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800'
        }`}
      >
        <div className="flex items-center gap-3">
          {result.passed ? (
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          ) : (
            <XCircle className="w-8 h-8 text-amber-500" />
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {result.passed
                ? lang === 'en'
                  ? 'Passed!'
                  : '¡Aprobado!'
                : lang === 'en'
                ? 'Not passed'
                : 'No aprobado'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {lang === 'en' ? 'Score' : 'Puntaje'}: <strong>{result.score}%</strong> (
              {lang === 'en' ? 'minimum' : 'mínimo'} {quiz.pass_score}%)
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {!reviewMode && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Tu resultado ha sido guardado. Revisa las explicaciones clínicas a continuación.
          </p>
        )}

        {wrongQuestions.length > 0 && !reviewMode && (
          <button
            type="button"
            onClick={() => {
              setReviewMode(true);
              setReviewIndex(0);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-300 text-indigo-700 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Repasar {wrongQuestions.length} pregunta(s) fallida(s)
          </button>
        )}

        {current && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            {reviewMode && (
              <p className="text-xs text-slate-400">
                Repaso {reviewIndex + 1} de {reviewList.length}
              </p>
            )}
            <p className="font-medium">{current.stem}</p>
            {current.image_url && (
              <img
                src={current.image_url}
                alt={current.image_alt ?? ''}
                className="max-h-48 rounded-lg border border-slate-200 dark:border-slate-700"
              />
            )}
            <ul className="space-y-1 text-sm">
              {current.options.map((o) => (
                <li
                  key={o.id}
                  className={
                    o.isCorrect
                      ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                      : (responses[current.id] ?? []).includes(o.id)
                      ? 'text-red-600'
                      : 'text-slate-500'
                  }
                >
                  {o.isCorrect ? '✓ ' : (responses[current.id] ?? []).includes(o.id) ? '✗ ' : '○ '}
                  {o.text}
                </li>
              ))}
            </ul>
            {current.explanation && (
              <p className="text-sm text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 pt-3">
                {current.explanation}
              </p>
            )}
          </div>
        )}

        {reviewMode && reviewList.length > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={reviewIndex === 0}
              onClick={() => setReviewIndex((i) => i - 1)}
              className="px-3 py-2 rounded-lg border text-sm disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={reviewIndex >= reviewList.length - 1}
              onClick={() => setReviewIndex((i) => i + 1)}
              className="px-3 py-2 rounded-lg border text-sm disabled:opacity-40"
            >
              Siguiente
            </button>
            <button
              type="button"
              onClick={() => setReviewMode(false)}
              className="px-3 py-2 rounded-lg text-sm text-slate-500 ml-auto"
            >
              Ver resumen completo
            </button>
          </div>
        )}

        {!reviewMode &&
          displayQuestions.map((q) => {
            const answer = result.answers.find((a) => a.questionId === q.id);
            return (
              <details
                key={q.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm"
              >
                <summary className="cursor-pointer font-medium flex items-center gap-2">
                  {answer?.correct ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  {q.stem}
                </summary>
                {q.explanation && (
                  <p className="mt-2 text-slate-600 dark:text-slate-300 pl-6">{q.explanation}</p>
                )}
              </details>
            );
          })}
      </div>
    </section>
  );
}
