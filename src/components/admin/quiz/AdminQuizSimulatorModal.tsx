import { useState } from 'react';
import { X, CheckCircle, AlertCircle, RotateCcw, Brain, Eye, Sparkles } from 'lucide-react';
import type { QuizQuestionDraft } from '../../../types/quiz';
import { isQuestionCorrect } from '../../../utils/quizScoring';

interface AdminQuizSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizTitle: string;
  passScore: number;
  questions: QuizQuestionDraft[];
}

export function AdminQuizSimulatorModal({
  isOpen,
  onClose,
  quizTitle,
  passScore,
  questions,
}: AdminQuizSimulatorModalProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleOptionToggle = (qIndex: number, optionId: string, isMultiple: boolean) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => {
      const current = prev[qIndex] ?? [];
      if (isMultiple) {
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [qIndex]: next };
      }
      return { ...prev, [qIndex]: [optionId] };
    });
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  // Cálculo de resultados
  const evaluatedQuestions = questions.map((q, idx) => {
    const userSelected = selectedAnswers[idx] ?? [];
    const correct = isQuestionCorrect(
      {
        type: q.type,
        options: q.options.map((o) => ({
          ...o,
          id: o.id || `opt_${idx}_${o.text}`,
        })),
      },
      userSelected
    );
    return {
      question: q,
      userSelected,
      isCorrect: correct,
    };
  });

  const correctCount = evaluatedQuestions.filter((item) => item.isCorrect).length;
  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const passed = score >= passScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                  Vista Previa de Alumno
                </span>
                <span className="text-xs text-slate-400">
                  {questions.length} reactivo(s) · Aprobación {passScore}%
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base truncate max-w-md">
                {quizTitle || 'Evaluación del Tema'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSubmitted && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reintentar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Quiz Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status banner when submitted */}
          {isSubmitted && (
            <div
              className={`p-5 rounded-2xl border ${
                passed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                      passed ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}
                  >
                    {passed ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-base font-bold">
                      {passed ? '¡Evaluación Aprobada!' : 'Evaluación No Acreditada'}
                    </h4>
                    <p className="text-xs opacity-90">
                      Obtuviste {correctCount} de {questions.length} respuestas correctas ({score}%).
                      Requisito mínimo: {passScore}%.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black">{score}%</span>
                </div>
              </div>
            </div>
          )}

          {questions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No hay preguntas redactadas para simular.</p>
            </div>
          ) : (
            questions.map((q, qIndex) => {
              const userSelected = selectedAnswers[qIndex] ?? [];
              const evalInfo = isSubmitted ? evaluatedQuestions[qIndex] : null;

              return (
                <div
                  key={q.id || qIndex}
                  className={`p-5 rounded-2xl border transition-all ${
                    evalInfo
                      ? evalInfo.isCorrect
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
                        : 'border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {qIndex + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {q.type === 'multiple'
                          ? 'Opción múltiple'
                          : q.type === 'true_false'
                          ? 'Verdadero / Falso'
                          : q.type === 'image_choice'
                          ? 'Imagen clínica'
                          : 'Opción única'}
                      </span>
                    </div>

                    {isSubmitted && evalInfo && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                          evalInfo.isCorrect
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300'
                        }`}
                      >
                        {evalInfo.isCorrect ? 'Correcta' : 'Incorrecta'}
                      </span>
                    )}
                  </div>

                  {/* Question Stem */}
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed mb-4 whitespace-pre-line">
                    {q.stem || '(Pregunta sin enunciado)'}
                  </p>

                  {/* Optional Clinical Image */}
                  {q.imageUrl && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-w-md bg-slate-950">
                      <img
                        src={q.imageUrl}
                        alt={q.imageAlt || 'Imagen clínica del caso'}
                        className="w-full max-h-64 object-contain mx-auto"
                        loading="lazy"
                      />
                      {q.imageAlt && (
                        <p className="text-[11px] text-slate-400 px-3 py-1.5 bg-slate-900/90 text-center">
                          {q.imageAlt}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-2 mb-3">
                    {q.options.map((opt, optIndex) => {
                      const optId = opt.id || `opt_${qIndex}_${optIndex}`;
                      const isSelected = userSelected.includes(optId);
                      const isCorrect = opt.isCorrect;

                      let optionStyle = 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60';
                      if (isSubmitted) {
                        if (isCorrect) {
                          optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-medium';
                        } else if (isSelected && !isCorrect) {
                          optionStyle = 'border-red-500 bg-red-500/10 text-red-950 dark:text-red-200';
                        }
                      } else if (isSelected) {
                        optionStyle = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-medium';
                      }

                      return (
                        <div
                          key={optId}
                          onClick={() => handleOptionToggle(qIndex, optId, q.type === 'multiple')}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition ${optionStyle}`}
                        >
                          <input
                            type={q.type === 'multiple' ? 'checkbox' : 'radio'}
                            name={`sim-q-${qIndex}`}
                            checked={isSelected}
                            disabled={isSubmitted}
                            onChange={() => {}}
                            className="rounded text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                          />
                          <span className="flex-1 leading-snug">
                            {opt.text || `(Opción ${optIndex + 1} vacía)`}
                          </span>
                          {isSubmitted && isCorrect && (
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                              ✓ Correcta
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation & Clinical Pearl when submitted */}
                  {isSubmitted && q.explanation && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Retroalimentación Clínica y Justificación</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <p className="text-xs text-slate-500">
            {isSubmitted
              ? 'Revisa las justificaciones clínicas para asegurar la calidad de la evaluación.'
              : `${Object.keys(selectedAnswers).length} de ${questions.length} respondida(s).`}
          </p>

          <div className="flex items-center gap-2">
            {!isSubmitted ? (
              <button
                type="button"
                disabled={questions.length === 0}
                onClick={() => setIsSubmitted(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
              >
                Calificar y Ver Resultados
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-semibold transition"
              >
                Cerrar Simulador
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
