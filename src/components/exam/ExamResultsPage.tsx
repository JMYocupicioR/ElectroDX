import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle, XCircle, TrendingUp, Target, Zap, BookOpen,
  RotateCcw, Home, ChevronDown, ChevronUp, Lightbulb, Award, AlertTriangle
} from 'lucide-react';
import type { ExamConfig, ExamQuestion } from '../../types/exam';
import { loadExamResults } from '../../services/examService';

type LocationState = {
  sessionId: string | null;
  questions: ExamQuestion[];
  config: ExamConfig;
  answers?: Record<string, number>; // Fallback si no se guardó en DB
  durationSeconds?: number;
};

export default function ExamResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
      const { sessionId, questions, answers, durationSeconds } = state!;

      let sessionAnswers: Record<string, number> = answers ?? {};
      let duration = durationSeconds ?? 0;

      // Intentar cargar desde Supabase si hay sessionId
      if (sessionId) {
        const data = await loadExamResults(sessionId, questions);
        if (data) {
          data.answers.forEach(a => { sessionAnswers[a.question_id] = a.selected_option_index; });
          duration = data.session.duration_seconds;
        }
      }

      // Calcular estadísticas
      let correct = 0;
      const detailedAnswers = questions.map(q => {
        const selectedIndex = sessionAnswers[q.id] ?? -1;
        const isCorrect = selectedIndex >= 0 && (q.options[selectedIndex]?.is_correct ?? false);
        if (isCorrect) correct++;
        return { question: q, selectedIndex, isCorrect };
      });

      const scorePercentage = Math.round((correct / questions.length) * 100);

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            t.accuracy >= 70 ? 'bg-emerald-500' : t.accuracy >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${t.accuracy}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${
                        t.accuracy >= 70 ? 'text-emerald-400' : t.accuracy >= 50 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {t.accuracy}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{t.correct}/{t.total}</span>
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
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {f === 'all' ? 'Todas' : f === 'wrong' ? 'Incorrectas' : f === 'correct' ? 'Correctas' : '⚡ Críticas falladas'}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
            {filteredAnswers.map(({ question: q, selectedIndex, isCorrect }, i) => {
              const isExpanded = expandedQuestion === q.id;
              const correct = correctIndex(q);

              return (
                <div key={q.id} className="p-4">
                  {/* Cabecera colapsable */}
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                    className="w-full flex items-start gap-3 text-left"
                  >
                    <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                      isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {isCorrect
                        ? <CheckCircle className="w-3.5 h-3.5" />
                        : <XCircle className="w-3.5 h-3.5" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-500">{q.topic_name}</span>
                        {q.is_critical && <span className="text-[10px] text-amber-400">⚡ Crítica</span>}
                      </div>
                      <p className="text-sm text-slate-200 line-clamp-2">{q.stem}</p>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                      : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                    }
                  </button>

                  {/* Detalle expandido */}
                  {isExpanded && (
                    <div className="mt-4 ml-9 space-y-3">
                      {/* Opciones */}
                      <div className="space-y-1.5">
                        {q.options.map((opt, idx) => (
                          <div key={idx} className={`flex items-start gap-2 px-3 py-2.5 rounded-xl text-sm border ${
                            idx === correct ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                            : idx === selectedIndex && !isCorrect ? 'bg-red-500/5 border-red-500/20 text-red-300'
                            : 'border-transparent text-slate-500'
                          }`}>
                            <span className="shrink-0 mt-0.5">
                              {idx === correct ? '✓' : idx === selectedIndex && !isCorrect ? '✗' : '·'}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Explicación */}
                      {!isCorrect && q.options[selectedIndex] && (
                        <p className="text-sm text-slate-400 italic">{q.options[selectedIndex].feedback}</p>
                      )}
                      {q.options[correct] && (
                        <p className="text-sm text-emerald-300/80">{q.options[correct].feedback}</p>
                      )}

                      {/* Perla */}
                      {q.pearl && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Perla Clínica</span>
                            <p className="text-sm text-amber-200/70 mt-0.5">{q.pearl}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Acciones finales ─────────────────────────────────────────── */}
        <div className="flex gap-3 justify-center pb-8">
          <button
            onClick={() => navigate('/examenes')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-all"
          >
            <Home className="w-4 h-4" />
            Inicio
          </button>
          <button
            onClick={() => navigate('/examenes/configurar')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Nuevo examen
          </button>
        </div>
      </div>
    </div>
  );
}
