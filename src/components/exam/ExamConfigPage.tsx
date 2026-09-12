import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import {
  Brain, Clock, BookOpen, Zap, CheckSquare, Square, ChevronRight,
  AlertTriangle, Loader2, Sparkles, Target, FlaskConical, RotateCcw
} from 'lucide-react';
import type { ExamConfig, ExamMode, FeedbackMode } from '../../types/exam';
import { loadAvailableTopics, getPendingExamAttempt } from '../../services/examService';
import { ExamRecoveryModal } from './ExamRecoveryModal';
import type { ExamAttemptRecord } from '../../types/exam';

interface TopicInfo {
  topic_name: string;
  module_id: string;
  count: number;
  critical_count: number;
}

export default function ExamConfigPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('immediate');
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [pendingAttempt, setPendingAttempt] = useState<ExamAttemptRecord | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);

  // Cargar temas disponibles y verificar intentos pendientes
  useEffect(() => {
    async function init() {
      setLoadingTopics(true);
      const [topicsData, pending] = await Promise.all([
        loadAvailableTopics(),
        user ? getPendingExamAttempt(user.id) : Promise.resolve(null),
      ]);
      setTopics(topicsData);
      setSelectedTopics(new Set(topicsData.map(t => t.topic_name)));
      if (pending) {
        setPendingAttempt(pending);
        setShowRecovery(true);
      }
      setLoadingTopics(false);
    }
    init();
  }, [user]);

  const totalSelected = topics
    .filter(t => selectedTopics.has(t.topic_name))
    .reduce((sum, t) => sum + (criticalOnly ? t.critical_count : t.count), 0);

  const actualCount = questionCount === 0 ? totalSelected : Math.min(questionCount, totalSelected);

  const toggleTopic = (name: string) => {
    const next = new Set(selectedTopics);
    next.has(name) ? next.delete(name) : next.add(name);
    setSelectedTopics(next);
  };

  const toggleAll = () => {
    if (selectedTopics.size === topics.length) {
      setSelectedTopics(new Set());
    } else {
      setSelectedTopics(new Set(topics.map(t => t.topic_name)));
    }
  };

  const handleStart = () => {
    if (selectedTopics.size === 0) return;

    const config: ExamConfig = {
      mode: (criticalOnly ? 'CRITICAL_ONLY' : selectedTopics.size === topics.length ? 'FULL_SIMULATION' : 'TOPIC_SPECIFIC') as ExamMode,
      topicNames: Array.from(selectedTopics),
      questionCount: questionCount === 0 ? null : questionCount,
      timeLimitSeconds: timeLimitEnabled ? timeLimitMinutes * 60 : null,
      feedbackMode,
      criticalOnly,
    };

    navigate('/examenes/sesion', { state: { config } });
  };

  if (loadingTopics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
          <p className="text-slate-300 text-sm">Cargando banco de preguntas…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Recovery Modal */}
      {showRecovery && pendingAttempt && (
        <ExamRecoveryModal
          attempt={pendingAttempt}
          onResume={() => {
            setShowRecovery(false);
            navigate('/examenes/sesion', { state: { resumeAttemptId: pendingAttempt.id } });
          }}
          onStartNew={() => {
            setShowRecovery(false);
            setPendingAttempt(null);
          }}
          onCancel={() => setShowRecovery(false)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
            <Brain className="w-4 h-4" />
            Simulador de Examen COMEFYR
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Configura tu Examen</h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            {totalSelected} pregunta{totalSelected !== 1 ? 's' : ''} disponible{totalSelected !== 1 ? 's' : ''} · Selecciona los temas que quieres evaluar
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna de Temas */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <h2 className="font-semibold text-sm">Temas del Banco EMG</h2>
                </div>
                <button
                  onClick={toggleAll}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  {selectedTopics.size === topics.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
              </div>
              <div className="p-3 space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
                {topics.map(topic => {
                  const isSelected = selectedTopics.has(topic.topic_name);
                  const count = criticalOnly ? topic.critical_count : topic.count;
                  return (
                    <button
                      key={topic.topic_name}
                      onClick={() => toggleTopic(topic.topic_name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all group ${
                        isSelected
                          ? 'bg-cyan-500/10 border border-cyan-500/30'
                          : 'bg-white/[0.03] border border-transparent hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0" />
                        )}
                        <span className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                          {topic.topic_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {topic.critical_count > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            ⚡ {topic.critical_count}
                          </span>
                        )}
                        <span className="text-xs text-slate-500">{count}p</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Columna de Configuración */}
          <div className="space-y-4">
            {/* Modo de Estudio */}
            <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="font-semibold text-sm">Modo de Estudio</h3>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setFeedbackMode('immediate')}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    feedbackMode === 'immediate'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm shadow-emerald-500/10'
                      : 'bg-white/[0.03] border-transparent text-slate-400 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FlaskConical className={`w-4 h-4 ${feedbackMode === 'immediate' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className={`text-sm font-semibold ${feedbackMode === 'immediate' ? 'text-white' : 'text-slate-300'}`}>
                      Modo Tutor
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 ml-6">Feedback y perla clínica inmediata en cada respuesta</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackMode('end')}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    feedbackMode === 'end'
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-white shadow-sm shadow-cyan-500/10'
                      : 'bg-white/[0.03] border-transparent text-slate-400 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Target className={`w-4 h-4 ${feedbackMode === 'end' ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className={`text-sm font-semibold ${feedbackMode === 'end' ? 'text-white' : 'text-slate-300'}`}>
                      Modo Examen
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 ml-6">Simulación formal con revisión completa al finalizar</p>
                </button>
              </div>
            </div>

            {/* Cantidad de preguntas */}
            <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-sm">Número de Preguntas</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[10, 20, 50, 0].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQuestionCount(n)}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      questionCount === n
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-white shadow-sm shadow-indigo-500/20'
                        : 'bg-white/[0.03] border-transparent text-slate-400 hover:border-white/10'
                    }`}
                  >
                    {n === 0 ? 'Todas' : n}
                  </button>
                ))}
              </div>
            </div>

            {/* Temporizador */}
            <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h3 className="font-semibold text-sm">Límite de Tiempo</h3>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={timeLimitEnabled}
                  onClick={() => setTimeLimitEnabled(!timeLimitEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    timeLimitEnabled ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      timeLimitEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              {timeLimitEnabled && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-2 border-t border-white/5">
                  {[15, 30, 45, 60, 90].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTimeLimitMinutes(m)}
                      className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                        timeLimitMinutes === m
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold'
                          : 'bg-white/[0.03] border-transparent text-slate-400 hover:border-white/10'
                      }`}
                    >
                      {m} min
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Solo preguntas críticas */}
            <div
              onClick={() => setCriticalOnly(!criticalOnly)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
                criticalOnly
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-sm shadow-amber-500/10'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${criticalOnly ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-400'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className={`text-sm font-semibold ${criticalOnly ? 'text-amber-300' : 'text-slate-200'}`}>
                    Solo preguntas críticas
                  </div>
                  <div className="text-xs text-slate-400">Alta rentabilidad del examen de Consejo</div>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={criticalOnly}
                onClick={(e) => {
                  e.stopPropagation();
                  setCriticalOnly(!criticalOnly);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  criticalOnly ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    criticalOnly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Botón de inicio (Desktop) */}
            <button
              type="button"
              onClick={handleStart}
              disabled={selectedTopics.size === 0 || actualCount === 0}
              className="w-full hidden sm:flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-indigo-600 to-cyan-500 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Brain className="w-4 h-4" />
              <span>Iniciar examen · {actualCount} preguntas</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de inicio flotante fija en móvil */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-xs text-slate-400 block truncate">
                {selectedTopics.size} tema{selectedTopics.size !== 1 ? 's' : ''} · {actualCount} reactivo{actualCount !== 1 ? 's' : ''}
              </span>
              <span className="text-xs font-bold text-cyan-400">
                {feedbackMode === 'immediate' ? 'Modo Tutor' : 'Modo Examen'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleStart}
              disabled={selectedTopics.size === 0 || actualCount === 0}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 transition-all active:scale-95 disabled:opacity-40"
            >
              <Brain className="w-4 h-4" />
              <span>Iniciar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
