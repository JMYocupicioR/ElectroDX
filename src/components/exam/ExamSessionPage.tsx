import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { Loader2, Clock, Send, LayoutGrid, X, Brain, ChevronLeft } from 'lucide-react';
import type { ExamConfig, ExamAttemptRecord } from '../../types/exam';
import {
  loadExamQuestions,
  buildExamQuestions,
  submitExam,
  loadExamAttempt,
} from '../../services/examService';
import { useExamRunner } from '../../hooks/useExamRunner';
import { ExamQuestionCard } from './ExamQuestionCard';
import { ExamPaletteNav } from './ExamPaletteNav';

type LocationState = {
  config?: ExamConfig;
  resumeAttemptId?: string;
};

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ExamSessionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as LocationState | null;

  const [questions, setQuestions] = useState<ReturnType<typeof buildExamQuestions>>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ExamConfig | null>(null);
  const [resumeAttempt, setResumeAttempt] = useState<ExamAttemptRecord | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Cargar preguntas al montar
  useEffect(() => {
    async function init() {
      setLoading(true);

      // Caso: reanudar examen existente
      if (state?.resumeAttemptId) {
        const attempt = await loadExamAttempt(state.resumeAttemptId);
        if (attempt && attempt.status === 'IN_PROGRESS') {
          setResumeAttempt(attempt);
          const { questions: allQs } = await loadExamQuestions(attempt.config);
          // Restaurar orden de preguntas usando question_ids
          const idsOrder = attempt.question_ids;
          const qMap = new Map(allQs.map(q => [q.id, q]));
          const ordered = idsOrder.map(id => qMap.get(id)).filter(Boolean) as typeof allQs;
          setQuestions(ordered);
          setConfig(attempt.config);
          setLoading(false);
          return;
        }
      }

      // Caso: nuevo examen
      if (!state?.config) {
        navigate('/examenes', { replace: true });
        return;
      }
      const cfg = state.config;
      setConfig(cfg);

      const { questions: allQs } = await loadExamQuestions({
        topicNames: cfg.topicNames,
        moduleId: cfg.moduleId,
      });

      const selected = buildExamQuestions(allQs, cfg);
      setQuestions(selected);
      setLoading(false);
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Estado inicial para reanudación
  const initialState = resumeAttempt ? {
    currentQuestionIndex: resumeAttempt.current_question_index,
    answers: resumeAttempt.answers ?? {},
    flagged: resumeAttempt.flagged ?? {},
    timeRemainingSeconds: resumeAttempt.time_remaining_seconds ?? null,
  } : undefined;

  const handleSubmit = useCallback(async (
    answers: Record<string, number>,
    durationSeconds: number,
    attemptId: string | null
  ) => {
    if (!user || !config) return;
    setSubmitting(true);

    const sessionId = await submitExam({
      userId: user.id,
      config,
      questions,
      answers,
      durationSeconds,
      attemptId,
    });

    setSubmitting(false);
    if (sessionId) {
      navigate('/examenes/resultados', {
        state: { sessionId, questions, config },
        replace: true,
      });
    } else {
      // Fallback: guardar resultados localmente y navegar de todos modos
      navigate('/examenes/resultados', {
        state: { sessionId: null, questions, config, answers, durationSeconds },
        replace: true,
      });
    }
  }, [user, config, questions, navigate]);

  const runner = useExamRunner({
    questions,
    config: config ?? { mode: 'FULL_SIMULATION', feedbackMode: 'immediate' },
    resumeAttemptId: resumeAttempt?.id ?? null,
    initialState,
    onSubmit: handleSubmit,
  });

  const { currentIndex, currentQuestion, answers, flagged, timeLeft, isSubmitting } = runner;

  const unansweredCount = questions.length - Object.keys(answers).length;
  const isImmediateFeedback = config?.feedbackMode === 'immediate';

  // Timer color
  const timerColor = timeLeft !== null
    ? timeLeft < 60 ? 'text-red-400' : timeLeft < 300 ? 'text-amber-400' : 'text-cyan-400'
    : 'text-slate-400';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
          <p className="text-slate-300 text-sm">Preparando el examen…</p>
        </div>
      </div>
    );
  }

  if (submitting || isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center shadow-xl shadow-cyan-500/30 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-white font-semibold">Procesando resultados…</p>
          <p className="text-slate-400 text-sm">Guardando tu examen en Supabase</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Barra superior */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => navigate('/examenes')}
          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-xs text-slate-500 hidden sm:block">
            {config?.feedbackMode === 'immediate' ? '🎓 Modo Tutor' : '📋 Modo Examen'} ·
          </span>
          <span className="text-sm font-medium text-slate-300 truncate">
            Pregunta {currentIndex + 1} de {questions.length}
          </span>
        </div>

        {/* Temporizador */}
        {timeLeft !== null && (
          <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${timerColor} bg-white/5 px-3 py-1.5 rounded-lg border border-white/10`}>
            <Clock className="w-3.5 h-3.5" />
            {formatTime(timeLeft)}
          </div>
        )}

        <button
          onClick={() => setShowPalette(!showPalette)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="hidden sm:block">Ir a pregunta</span>
        </button>

        <button
          onClick={() => setShowConfirmSubmit(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          Enviar
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="fixed top-14 left-0 right-0 z-20 h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Layout principal */}
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-6">
            {/* Contenido principal */}
            <div className="flex-1 min-w-0">
              {currentQuestion && (
                <ExamQuestionCard
                  question={currentQuestion}
                  selectedOptionIndex={answers[currentQuestion.id]}
                  isFlagged={!!flagged[currentQuestion.id]}
                  feedbackMode={config?.feedbackMode ?? 'immediate'}
                  showFeedback={isImmediateFeedback && answers[currentQuestion.id] !== undefined}
                  questionNumber={currentIndex + 1}
                  total={questions.length}
                  onSelectOption={idx => runner.selectAnswer(currentQuestion.id, idx)}
                  onToggleFlag={() => runner.toggleFlag(currentQuestion.id)}
                  onNext={runner.goNext}
                  onPrev={runner.goPrev}
                  isFirst={currentIndex === 0}
                  isLast={currentIndex === questions.length - 1}
                />
              )}

              {/* Botón de envío final en última pregunta */}
              {currentIndex === questions.length - 1 && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold shadow-xl shadow-cyan-500/20 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    Finalizar examen
                  </button>
                </div>
              )}
            </div>

            {/* Paleta lateral (desktop) */}
            <div className="hidden lg:block w-52 shrink-0">
              <div className="sticky top-24">
                <ExamPaletteNav
                  questions={questions}
                  currentIndex={currentIndex}
                  answers={answers}
                  flagged={flagged}
                  onGoTo={runner.goToQuestion}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Paleta flotante (mobile) */}
      {showPalette && (
        <div className="fixed inset-0 z-40 flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-white">Ir a pregunta</span>
              <button onClick={() => setShowPalette(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ExamPaletteNav
              questions={questions}
              currentIndex={currentIndex}
              answers={answers}
              flagged={flagged}
              onGoTo={i => { runner.goToQuestion(i); setShowPalette(false); }}
            />
          </div>
        </div>
      )}

      {/* Modal de confirmación de envío */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">¿Finalizar el examen?</h3>
            {unansweredCount > 0 ? (
              <p className="text-amber-400 text-sm mb-6">
                Tienes {unansweredCount} pregunta{unansweredCount !== 1 ? 's' : ''} sin responder.
              </p>
            ) : (
              <p className="text-slate-400 text-sm mb-6">Has respondido todas las preguntas.</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-all"
              >
                Continuar
              </button>
              <button
                onClick={() => { setShowConfirmSubmit(false); runner.submitExam(); }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-400 transition-all"
              >
                Enviar examen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
