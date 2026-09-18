import type { ExamAnswerReveal, ExamQuestion } from '../../types/exam';
import { CheckCircle, XCircle } from 'lucide-react';

interface ExamPaletteNavProps {
  questions: ExamQuestion[];
  currentIndex: number;
  answers: Record<string, number>;
  flagged: Record<string, boolean>;
  showResult?: boolean; // true al revisar resultados
  reveals?: Record<string, ExamAnswerReveal>;
  onGoTo: (index: number) => void;
}

export function ExamPaletteNav({
  questions,
  currentIndex,
  answers,
  flagged,
  showResult = false,
  reveals = {},
  onGoTo,
}: ExamPaletteNavProps) {
  const answered = Object.keys(answers).length;
  const total = questions.length;

  const getButtonStyle = (q: ExamQuestion, index: number) => {
    const isAnswered = answers[q.id] !== undefined;
    const isFlagged = flagged[q.id];
    const isCurrent = index === currentIndex;
    const selectedIdx = answers[q.id];
    const reveal = reveals[q.id];
    const isCorrect = showResult && isAnswered && (reveal ? reveal.isCorrect : q.options[selectedIdx]?.is_correct);
    const isWrong = showResult && isAnswered && (reveal ? !reveal.isCorrect : !q.options[selectedIdx]?.is_correct);

    if (isWrong) return 'bg-red-500/10 border-red-500/40 text-red-400';
    if (isCorrect) return 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400';
    if (isCurrent) return 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-sm shadow-cyan-500/20';
    if (isFlagged && isAnswered) return 'bg-amber-500/10 border-amber-500/40 text-amber-400';
    if (isFlagged) return 'bg-amber-500/5 border-amber-500/30 text-amber-500';
    if (isAnswered) return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300';
    return 'bg-white/[0.03] border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300';
  };

  return (
    <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-4">
      {/* Resumen */}
      <div className="mb-3 pb-3 border-b border-white/10">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Respondidas</span>
          <span className="font-semibold text-white">{answered} / {total}</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full">
          <div
            className="h-1.5 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all"
            style={{ width: total > 0 ? `${(answered / total) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Leyenda */}
      <div className="mb-3 grid grid-cols-2 gap-1 text-[10px] text-slate-500">
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-indigo-500/30 inline-block" /> Respondida</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-cyan-500/30 inline-block" /> Actual</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500/30 inline-block" /> Marcada</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-white/10 inline-block" /> Sin responder</div>
      </div>

      {/* Cuadrícula de preguntas */}
      <div className="grid grid-cols-5 gap-1.5">
        {questions.map((q, index) => {
          const isFlagged = flagged[q.id];
          const isAnswered = answers[q.id] !== undefined;
          const selectedIdx = answers[q.id];
          const reveal = reveals[q.id];
          const isCorrect = showResult && isAnswered && (reveal ? reveal.isCorrect : q.options[selectedIdx]?.is_correct);
          const isWrong = showResult && isAnswered && (reveal ? !reveal.isCorrect : !q.options[selectedIdx]?.is_correct);

          return (
            <button
              key={q.id}
              onClick={() => onGoTo(index)}
              title={`Pregunta ${index + 1}: ${q.topic_name}`}
              className={`relative w-full aspect-square flex items-center justify-center text-xs font-bold rounded-lg border transition-all ${getButtonStyle(q, index)}`}
            >
              {showResult && isCorrect && <CheckCircle className="w-4 h-4" />}
              {showResult && isWrong && <XCircle className="w-4 h-4" />}
              {!showResult && (index + 1)}
              {isFlagged && !showResult && (
                <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
              {q.is_critical && !showResult && (
                <span className="absolute bottom-0 left-0 w-1.5 h-1.5 rounded-full bg-amber-500/60" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
