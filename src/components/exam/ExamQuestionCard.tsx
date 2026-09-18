import type { ExamAnswerReveal, ExamQuestion } from '../../types/exam';
import { Flag, CheckCircle, XCircle, Lightbulb, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';

interface ExamQuestionCardProps {
  question: ExamQuestion;
  selectedOptionIndex: number | undefined;
  isFlagged: boolean;
  feedbackMode: 'immediate' | 'end';
  showFeedback: boolean; // true en modo tutor o después de enviar
  questionNumber: number;
  total: number;
  onSelectOption: (index: number) => void;
  onToggleFlag: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  isFirst: boolean;
  isLast: boolean;
  /** Calificación del servidor (modo tutor). Sin esto no se muestran claves. */
  reveal?: ExamAnswerReveal | null;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

export function ExamQuestionCard({
  question,
  selectedOptionIndex,
  isFlagged,
  feedbackMode,
  showFeedback,
  questionNumber,
  total,
  onSelectOption,
  onToggleFlag,
  onNext,
  onPrev,
  isFirst,
  isLast,
  reveal = null,
}: ExamQuestionCardProps) {
  const isAnswered = selectedOptionIndex !== undefined;
  const showResult = Boolean(showFeedback && isAnswered && (reveal || question.options.some(o => o.is_correct)));
  const correctIndex = reveal?.correctIndex ?? question.options.findIndex(o => o.is_correct);
  const isCorrect = reveal
    ? reveal.isCorrect
    : isAnswered && question.options[selectedOptionIndex]?.is_correct;
  const selectedFeedback = reveal?.selectedFeedback || question.options[selectedOptionIndex ?? -1]?.feedback;
  const correctFeedback = reveal?.correctFeedback
    || (correctIndex !== null && correctIndex >= 0 ? question.options[correctIndex]?.feedback : '');
  const pearl = reveal?.pearl || question.pearl;

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      if (selectedOptionIndex === index) {
        return 'border-cyan-400/60 bg-cyan-400/10 text-white shadow-lg shadow-cyan-500/10';
      }
      return 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]';
    }
    // Mostrar feedback
    if (index === correctIndex) {
      return 'border-emerald-400/60 bg-emerald-400/10 text-emerald-300';
    }
    if (index === selectedOptionIndex && !isCorrect) {
      return 'border-red-400/60 bg-red-400/10 text-red-300';
    }
    return 'border-white/5 bg-transparent text-slate-600';
  };

  const difficultyLabel = { 1: 'Básico', 2: 'Intermedio', 3: 'Avanzado' }[question.difficulty] ?? 'Intermedio';
  const difficultyColor = { 1: 'text-emerald-400', 2: 'text-amber-400', 3: 'text-red-400' }[question.difficulty] ?? 'text-amber-400';

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      {/* Meta-info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400">
            {question.topic_name}
          </span>
          <span className={`text-xs font-medium ${difficultyColor}`}>{difficultyLabel}</span>
          {question.is_critical && (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
              ⚡ Crítica
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{questionNumber} / {total}</span>
          <button
            onClick={onToggleFlag}
            className={`p-1.5 rounded-lg transition-all ${isFlagged ? 'text-amber-400 bg-amber-400/10' : 'text-slate-600 hover:text-slate-400'}`}
            title="Marcar para revisión"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stem / Viñeta clínica */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
        <p className="text-white leading-relaxed text-base">{question.stem}</p>

        {/* Hallazgos electrodiagnósticos */}
        {question.findings && question.findings.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-indigo-950/60 border border-indigo-700/30">
            <div className="flex items-center gap-1.5 mb-2 text-indigo-300 text-xs font-semibold uppercase tracking-wide">
              <BookOpen className="w-3 h-3" />
              Hallazgos
            </div>
            <div className="grid grid-cols-2 gap-2">
              {question.findings.map((f, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-xs text-slate-500">{f.label}</span>
                  <span className="text-sm font-mono text-indigo-200">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Imagen clínica */}
        {question.image_url && (
          <img
            src={question.image_url}
            alt={question.image_alt ?? 'Imagen clínica'}
            className="mt-4 rounded-xl w-full max-h-64 object-contain bg-black/20"
          />
        )}
      </div>

      {/* Opciones */}
      <div className="space-y-2">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => {
              if (!showResult || feedbackMode === 'end') onSelectOption(i);
            }}
            disabled={showResult && feedbackMode === 'immediate'}
            className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${getOptionStyle(i)}`}
          >
            <span className={`shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold mt-0.5 ${
              showResult && i === correctIndex ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400'
              : showResult && i === selectedOptionIndex && !isCorrect ? 'border-red-400 bg-red-400/20 text-red-400'
              : selectedOptionIndex === i && !showResult ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
              : 'border-white/10 text-slate-500'
            }`}>
              {showResult && i === correctIndex ? <CheckCircle className="w-3.5 h-3.5" />
               : showResult && i === selectedOptionIndex && !isCorrect ? <XCircle className="w-3.5 h-3.5" />
               : OPTION_LABELS[i]}
            </span>
            <span className="text-sm leading-relaxed">{opt.text}</span>
          </button>
        ))}
      </div>

      {/* Feedback inmediato (Modo Tutor) */}
      {showResult && (
        <div className={`p-4 rounded-2xl border ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm font-semibold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
              {isCorrect ? '¡Correcto!' : 'Incorrecto'}
            </span>
          </div>
          {!isCorrect && selectedFeedback && (
            <p className="text-sm text-slate-400 mb-2 pb-2 border-b border-white/5">
              {selectedFeedback}
            </p>
          )}
          {correctFeedback && (
            <p className="text-sm text-slate-300">
              <strong>Respuesta correcta:</strong> {correctFeedback}
            </p>
          )}
          {/* Perla clínica */}
          {pearl && (
            <div className="mt-3 pt-3 border-t border-white/5 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Perla Clínica</span>
                <p className="text-sm text-amber-200/80 mt-0.5">{pearl}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navegación */}
      <div className="flex gap-3">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 text-sm font-medium hover:border-white/20 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>
        <button
          onClick={onNext}
          disabled={isLast}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
