import type { QuizQuestionDraft } from '../../types/quiz';
import type { RevisionPayload } from '../../types/database';

export function QuizRevisionDiff({
  current,
  proposed,
}: {
  current: RevisionPayload | null;
  proposed: RevisionPayload;
}) {
  const currentQuestions = current?.questions ?? [];
  const proposedQuestions = proposed.questions ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-2 text-sm">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <p className="font-medium mb-1">Puntaje mínimo</p>
          <p>{current?.passScore ?? 70}% → <strong>{proposed.passScore ?? 70}%</strong></p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <p className="font-medium mb-1">Preguntas</p>
          <p>{currentQuestions.length} → <strong>{proposedQuestions.length}</strong></p>
        </div>
      </div>

      <div className="space-y-3">
        {proposedQuestions.map((q, i) => (
          <QuestionPreview key={q.id ?? i} index={i + 1} question={q} previous={currentQuestions[i]} />
        ))}
        {proposedQuestions.length === 0 && (
          <p className="text-sm text-slate-500 italic">Sin preguntas en la propuesta.</p>
        )}
      </div>
    </div>
  );
}

function QuestionPreview({
  index,
  question,
  previous,
}: {
  index: number;
  question: QuizQuestionDraft;
  previous?: QuizQuestionDraft;
}) {
  const isNew = !previous;
  const changed = previous && JSON.stringify(previous) !== JSON.stringify(question);

  return (
    <div
      className={`p-4 rounded-xl border text-sm ${
        isNew
          ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20'
          : changed
          ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20'
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <p className="text-xs font-bold uppercase text-slate-400 mb-1">
        Pregunta {index} · {question.type}
        {isNew && ' · nueva'}
        {changed && !isNew && ' · modificada'}
      </p>
      <p className="font-medium text-slate-800 dark:text-slate-100 mb-2">{question.stem}</p>
      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt={question.imageAlt ?? ''}
          className="max-h-40 rounded-lg mb-2 border border-slate-200 dark:border-slate-700"
        />
      )}
      <ul className="space-y-1 mb-2">
        {question.options.map((o) => (
          <li key={o.id} className={o.isCorrect ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-600 dark:text-slate-400'}>
            {o.isCorrect ? '✓ ' : '○ '}{o.text}
          </li>
        ))}
      </ul>
      {question.explanation && (
        <p className="text-xs text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
          {question.explanation}
        </p>
      )}
    </div>
  );
}
