import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle, XCircle, TrendingUp, Target, Zap, BookOpen,
  RotateCcw, Home, ChevronDown, ChevronUp, Lightbulb, Award, AlertTriangle
} from 'lucide-react';
import type { ExamConfig, ExamQuestion } from '../../types/exam';
import { loadExamResults } from '../../services/examService';
import { useAuth } from '../../contexts/AuthProvider';

type LocationState = {
  sessionId: string | null;
  questions: ExamQuestion[];
  config: ExamConfig;
  answers?: Record<string, number>; // Fallback si no se guardó en DB
  durationSeconds?: number;
  assignmentId?: string;
};

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

export default function ExamResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as LocationState | null;

  const [results, setResults] = useState<{
    totalQuestions: number;
    correctAnswers: number;
    scorePercentage: number;
    passed: boolean;
    durationSeconds: number;
    answers: Array<{ question: ExamQuestion; selectedIndex: number; isCorrect: boolean }>;
    topicBreakdown: Array<{ topic: string; correct: number; total: number; accuracy: number; criticalFailures: number }>;
  } | null>(null);

  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct' | 'critical'>('all');

  useEffect(() => {
    if (!state) { navigate('/examenes', { replace: true }); return; }

    async function computeResults() {
      const { sessionId, questions, answers, durationSeconds, assignmentId } = state!;

      let sessionAnswers: Record<string, number> = { ...(answers ?? {}) };
      let duration = durationSeconds ?? 0;

      // Fallback si answers vino vacío: buscar en caché local de la asignación
      if (assignmentId && Object.keys(sessionAnswers).length === 0) {
        try {
          const cached = localStorage.getItem(`neurosafe_asg_answers_${assignmentId}`);
          if (cached) {
            sessionAnswers = JSON.parse(cached);
          }
        } catch {}
      }

      // Intentar cargar desde Supabase si hay sessionId para enriquecer
      if (sessionId) {
        const data = await loadExamResults(sessionId, questions);
        if (data && data.answers && data.answers.length > 0) {
          data.answers.forEach(a => {
            if (a.selected_option_index !== undefined) {
              sessionAnswers[a.question_id] = a.selected_option_index;
            }
          });
          if (data.session?.duration_seconds) {
            duration = data.session.duration_seconds;
          }
        }
      }

      // Calcular estadísticas
      let correct = 0;
      const detailedAnswers = questions.map(q => {
        const selectedIndex = sessionAnswers[q.id] !== undefined ? sessionAnswers[q.id] : -1;
        const isCorrect = selectedIndex >= 0 && (q.options[selectedIndex]?.is_correct ?? false);
        if (isCorrect) correct++;
        return { question: q, selectedIndex, isCorrect };
      });

      const scorePercentage = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

      // La calificación de la evaluación asignada se asienta al enviar el examen
      // (ExamSessionPage). Repetirla aquí duplicaba la nota y las notas del
      // profesor, y con StrictMode se escribía hasta tres veces.

      // Breakdown por tema
      const topicMap = new Map<string, { correct: number; total: number; criticalFailures: number }>();
      detailedAnswers.forEach(({ question: q, isCorrect }) => {
        const existing = topicMap.get(q.topic_name) ?? { correct: 0, total: 0, criticalFailures: 0 };
        existing.total++;
        if (isCorrect) existing.correct++;
        if (!isCorrect && q.is_critical) existing.criticalFailures++;
        topicMap.set(q.topic_name, existing);
      });

      const topicBreakdown = Array.from(topicMap.entries())
        .map(([topic, stats]) => ({
          topic,
          ...stats,
          accuracy: Math.round((stats.correct / stats.total) * 100),
        }))
        .sort((a, b) => a.accuracy - b.accuracy); // Peores primero

      setResults({
        totalQuestions: questions.length,
        correctAnswers: correct,
        scorePercentage,
        passed: scorePercentage >= 70,
        durationSeconds: duration,
        answers: detailedAnswers,
        topicBreakdown,
      });
    }

    computeResults();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Cargando resultados…</p>
        </div>
      </div>
    );
  }

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}min ${sec}s`;
  };

  const filteredAnswers = results.answers.filter(({ question, isCorrect }) => {
    if (filter === 'wrong') return !isCorrect;
    if (filter === 'correct') return isCorrect;
    if (filter === 'critical') return question.is_critical && !isCorrect;
    return true;
  });

  const correctIndex = (q: ExamQuestion) => q.options.findIndex(o => o.is_correct);
  const worstTopics = results.topicBreakdown.filter(t => t.accuracy < 70);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 pt-20 space-y-8">

        {/* ─── Resultado Global ─────────────────────────────────────────── */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold mb-6 border ${
            results.passed
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {results.passed ? (
              <><Award className="w-4 h-4" /> Examen Aprobado</>
            ) : (
              <><AlertTriangle className="w-4 h-4" /> Necesitas Repasar</>
            )}
          </div>

          {/* Marcador circular */}
          <div className="relative w-36 h-36 mx-auto mb-6">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={results.passed ? '#10b981' : '#ef4444'}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - results.scorePercentage / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{results.scorePercentage}%</span>
            </div>
          </div>

          <p className="text-slate-400 text-sm">
            {results.correctAnswers} de {results.totalQuestions} preguntas correctas · {formatDuration(results.durationSeconds)}
          </p>
        </div>

        {/* ─── Stats Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Correctas', value: results.correctAnswers, icon: CheckCircle, textCol: 'text-emerald-400' },
            { label: 'Incorrectas', value: results.totalQuestions - results.correctAnswers, icon: XCircle, textCol: 'text-red-400' },
            { label: 'Puntaje', value: `${results.scorePercentage}%`, icon: Target, textCol: 'text-cyan-400' },
            {
              label: 'Críticas falladas',
              value: results.answers.filter(a => !a.isCorrect && a.question.is_critical).length,
              icon: Zap,
              textCol: 'text-amber-400',
            },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 rounded-2xl border border-white/10 p-4 text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.textCol}`} />
              <div className={`text-2xl font-black ${stat.textCol}`}>{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ─── Análisis por Tema ────────────────────────────────────────── */}
        {results.topicBreakdown.length > 0 && (
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h2 className="font-semibold text-sm">Análisis por Tema</h2>
              {worstTopics.length > 0 && (
                <span className="ml-auto text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {worstTopics.length} tema{worstTopics.length !== 1 ? 's' : ''} por reforzar
                </span>
              )}
            </div>
            <div className="divide-y divide-white/5">
              {results.topicBreakdown.map(t => (
                <div key={t.topic} className="px-5 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-200 truncate">{t.topic}</span>
                      {t.criticalFailures > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                          ⚡ {t.criticalFailures} crít.
                        </span>
                      )}
                      <span className={`text-xs font-bold shrink-0 ${
                        t.accuracy >= 70 ? 'text-emerald-400' : t.accuracy >= 50 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {t.accuracy}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Revisión de Respuestas ───────────────────────────────────── */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h2 className="font-semibold text-sm">Revisión de Preguntas</h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'wrong', 'correct', 'critical'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    filter === f
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 font-bold'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {f === 'all' ? 'Todas' : f === 'wrong' ? 'Incorrectas' : f === 'correct' ? 'Correctas' : '⚡ Críticas falladas'}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-white/5 max-h-[650px] overflow-y-auto scrollbar-thin">
            {filteredAnswers.map(({ question: q, selectedIndex, isCorrect }) => {
              const isExpanded = expandedQuestion === q.id;
              const correct = correctIndex(q);

              return (
                <div key={q.id} className="p-4 sm:p-5">
                  {/* Cabecera colapsable */}
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                    className="w-full flex items-start gap-3 text-left group cursor-pointer"
                  >
                    <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
                      isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {isCorrect
                        ? <CheckCircle className="w-4 h-4" />
                        : <XCircle className="w-4 h-4" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs text-slate-400 font-medium">{q.topic_name}</span>
                        {q.is_critical && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            ⚡ Crítica
                          </span>
                        )}
                        {!isCorrect && selectedIndex === -1 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                            Sin responder
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-100 font-medium line-clamp-2 group-hover:text-cyan-300 transition-colors">
                        {q.stem}
                      </p>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                      : <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0 mt-1" />
                    }
                  </button>

                  {/* Detalle expandido */}
                  {isExpanded && (
                    <div className="mt-4 ml-0 sm:ml-10 space-y-4 pt-3 border-t border-white/5">
                      {/* Alerta de reactivo sin responder */}
                      {selectedIndex === -1 && (
                        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                          <span>
                            <strong>Reactivo no contestado:</strong> No marcaste ninguna opción antes del envío o el tiempo reglamentario concluyó.
                          </span>
                        </div>
                      )}

                      {/* Opciones con etiquetado claro (Tu selección vs Correcta) */}
                      <div className="space-y-2">
                        {q.options.map((opt, idx) => {
                          const isThisCorrect = idx === correct;
                          const isThisSelected = idx === selectedIndex;
                          const label = OPTION_LABELS[idx] || String(idx + 1);

                          return (
                            <div
                              key={idx}
                              className={`flex items-start gap-3 p-3.5 rounded-2xl text-xs sm:text-sm border transition-all ${
                                isThisSelected && isThisCorrect
                                  ? 'bg-emerald-500/20 border-emerald-500/70 text-emerald-100 ring-2 ring-emerald-400/40'
                                  : isThisCorrect
                                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200'
                                  : isThisSelected && !isCorrect
                                  ? 'bg-red-500/20 border-red-500/70 text-red-100 ring-2 ring-red-400/40'
                                  : 'border-white/5 bg-white/[0.02] text-slate-400'
                              }`}
                            >
                              {/* Letra o icono */}
                              <span
                                className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                                  isThisCorrect
                                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/60'
                                    : isThisSelected && !isCorrect
                                    ? 'bg-red-500/30 text-red-300 border border-red-500/60'
                                    : 'bg-white/5 text-slate-400 border border-white/10'
                                }`}
                              >
                                {isThisCorrect ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                                ) : isThisSelected && !isCorrect ? (
                                  <XCircle className="w-3.5 h-3.5 text-red-300" />
                                ) : (
                                  label
                                )}
                              </span>

                              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="leading-relaxed font-normal">{opt.text}</span>
                                <div className="shrink-0 flex items-center gap-1.5">
                                  {isThisSelected && !isThisCorrect && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs">
                                      Tu Selección (Incorrecta)
                                    </span>
                                  )}
                                  {isThisSelected && isThisCorrect && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                                      ¡Tu Selección (Correcta)!
                                    </span>
                                  )}
                                  {isThisCorrect && !isThisSelected && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                      Respuesta Correcta
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explicaciones detalladas estructuradas */}
                      <div className="space-y-2.5 pt-1">
                        {/* Explicación de por qué falló su respuesta */}
                        {!isCorrect && selectedIndex >= 0 && q.options[selectedIndex] && (
                          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wide">
                              <XCircle className="w-4 h-4 shrink-0" />
                              <span>
                                ¿Por qué tu respuesta ({OPTION_LABELS[selectedIndex]}) es incorrecta?
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-red-200/90 pl-6 leading-relaxed">
                              {q.options[selectedIndex].feedback ||
                                'Esta opción no corresponde al criterio electrofisiológico ni a la respuesta clínica adecuada para este caso.'}
                            </p>
                          </div>
                        )}

                        {/* Fundamento de la respuesta correcta */}
                        {q.options[correct] && (
                          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                              <CheckCircle className="w-4 h-4 shrink-0" />
                              <span>
                                Fundamento de la respuesta correcta ({OPTION_LABELS[correct]}):
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-emerald-200/90 pl-6 leading-relaxed">
                              {q.options[correct].feedback ||
                                'Respuesta fundamentada según los estándares de neuroconducción y electromiografía COMEFYR.'}
                            </p>
                          </div>
                        )}

                        {/* Perla Clínica */}
                        {q.pearl && (
                          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                                Perla Clínica COMEFYR
                              </span>
                              <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">{q.pearl}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Acciones finales ─────────────────────────────────────────── */}
        {state?.assignmentId && (
          <div className="mb-4 max-w-xl mx-auto p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center text-xs text-indigo-300">
            Esta evaluación fue asignada formalmente. Tu resultado ha sido asentado en tu expediente académico.
            Para consultar el límite de intentos o solicitar un reintento, dirígete a tu panel de actividades asignadas.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pb-8">
          {state?.assignmentId ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Award className="w-4 h-4" />
                Volver a Mi Expediente y Tareas
              </button>
              <button
                onClick={() => navigate('/examenes')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Centro de Evaluaciones
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/examenes')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Inicio
              </button>
              <button
                onClick={() => navigate('/examenes/configurar')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Nuevo examen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
