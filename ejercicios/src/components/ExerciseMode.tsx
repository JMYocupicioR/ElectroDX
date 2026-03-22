// ExerciseMode.tsx — Componente principal del modo ejercicio interactivo
// v2: Timer visible, navegación libre, pistas, modo estudio, filtro categoría
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Brain, Activity, Zap, CheckCircle, XCircle, ChevronRight, ChevronLeft,
  Trophy, Target, Clock, Lightbulb, BookOpen, User, Stethoscope,
  Award, TrendingUp, AlertTriangle, Eye, Filter, HelpCircle } from 'lucide-react';
import { ClinicalCaseEngine } from '../services/ClinicalCaseEngine';
import { useExerciseStore } from '../store/exerciseStore';
import type { ClinicalCase, Difficulty, DiagnosisOption, EvaluationResult, ExerciseAttempt } from '../types/ClinicalCase';
import { CASE_TEMPLATES } from '../data/CaseTemplates';

type ExerciseStep = 'config' | 'case' | 'ncs' | 'emg' | 'diagnosis' | 'feedback';

const STEPS: ExerciseStep[] = ['config', 'case', 'ncs', 'emg', 'diagnosis', 'feedback'];

// Categories for filter
const CATEGORY_LABELS: Record<string, string> = {
  all: 'Todos',
  normal: 'Normal',
  axonal: 'Axonal',
  demyelinating: 'Desmielinizante',
  myopathic: 'Miopática',
  entrapment: 'Atrapamiento',
  radiculopathy: 'Radiculopatía',
  motor_neuron_disease: 'Enf. Motoneurona',
};

// Hints per pattern
const PATTERN_HINTS: Record<string, string[]> = {
  normal: [
    'Revisa si todas las velocidades de conducción están dentro de rangos normales.',
    'Observa la actividad espontánea en EMG — ¿hay fibrilaciones u ondas positivas?',
    'En un estudio normal, tanto NCS como EMG deben estar dentro de parámetros fisiológicos.',
  ],
  acute_axonal_neuropathy: [
    'Busca amplitudes CMAP/SNAP reducidas con velocidades relativamente preservadas.',
    'La presencia de fibrilaciones y ondas positivas indica denervación ACTIVA.',
    'Las velocidades ligeramente reducidas son secundarias a pérdida de fibras rápidas, no desmielinización primaria.',
  ],
  chronic_axonal_neuropathy: [
    'Busca PUM de larga duración y alta amplitud (reinervación colateral).',
    'La actividad espontánea debería ser escasa o ausente — la denervación ya cesó.',
    'El patrón es longitud-dependiente: peor distalmente.',
  ],
  demyelinating_neuropathy: [
    'Las velocidades de conducción deberían estar marcadamente reducidas (<70% del límite inferior).',
    'Las latencias distales estarán prolongadas, pero las amplitudes relativamente preservadas.',
    'La EMG puede ser relativamente normal — la desmielinización no causa denervación directa.',
  ],
  myopathy: [
    'Busca PUM de CORTA duración y BAJA amplitud en músculos proximales.',
    'El reclutamiento debería ser PRECOZ (muchas unidades con poco esfuerzo).',
    'Las conducciones nerviosas deberían ser normales — el problema es muscular.',
  ],
  carpal_tunnel_syndrome_moderate: [
    'Compara las latencias del mediano vs. cubital — ¿hay diferencia significativa?',
    'La latencia sensitiva del mediano debería estar más prolongada que la motora.',
    'Los nervios que NO son mediano deberían estar normales — la lesión es focal.',
  ],
  c5_c6_radiculopathy: [
    'Busca denervación en músculos del miotoma C5-C6 (bíceps, deltoides, braquiorradial).',
    'Los paraespinales cervicales afectados confirman el nivel radicular (vs. plexopatía).',
    'Las conducciones sensitivas deberían ser normales — la lesión es PROXIMAL al ganglio dorsal.',
  ],
  als: [
    'Busca denervación en múltiples regiones corporales (cervical, torácica, lumbar).',
    'Las conducciones SENSITIVAS deben estar normales — MND no afecta neuronas sensitivas.',
    'Las fasciculaciones difusas + PUM gigantes + fibrilaciones = enfermedad de motoneurona.',
  ],
};

// Format seconds as mm:ss
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const ExerciseMode: React.FC = () => {
  const store = useExerciseStore();
  const [currentStep, setCurrentStep] = useState<ExerciseStep>('config');
  const [clinicalCase, setClinicalCase] = useState<ClinicalCase | null>(null);
  const [options, setOptions] = useState<DiagnosisOption[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<Difficulty>(store.preferredDifficulty);
  const [isAnimating, setIsAnimating] = useState(false);

  // ───── New UI/UX state ──────
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showReviewPanel, setShowReviewPanel] = useState(false);

  // ───── Keyboard navigation ──────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (currentStep === 'config' || currentStep === 'feedback') return;
      if (e.key === 'ArrowRight' && canGoNext) goNext();
      if (e.key === 'ArrowLeft' && canGoPrev) goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // ───── Timer logic ──────
  useEffect(() => {
    if (currentStep !== 'config' && currentStep !== 'feedback' && startTime > 0) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentStep, startTime]);

  // Stop timer on feedback
  useEffect(() => {
    if (currentStep === 'feedback' && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [currentStep]);

  // Available categories for filter
  const availableCategories = ['all', ...Array.from(new Set(CASE_TEMPLATES.map(t => t.category)))];

  const generateNewCase = useCallback(() => {
    const filteredPatternId = categoryFilter !== 'all'
      ? CASE_TEMPLATES.filter(t => t.category === categoryFilter)
          .map(t => t.patternId)[Math.floor(Math.random() * CASE_TEMPLATES.filter(t => t.category === categoryFilter).length)]
      : undefined;

    const newCase = filteredPatternId
      ? ClinicalCaseEngine.generateCaseFromTemplate(
          CASE_TEMPLATES.find(t => t.patternId === filteredPatternId)!,
          difficulty
        )
      : ClinicalCaseEngine.generateRandomCase(difficulty);

    const opts = ClinicalCaseEngine.getOptionsForCase(newCase.correctDiagnosis.patternId, difficulty);
    setClinicalCase(newCase);
    setOptions(opts);
    setSelectedAnswer(null);
    setEvaluation(null);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setHintsUsed(0);
    setShowHint(false);
    setCurrentStep('case');
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  }, [difficulty, categoryFilter]);

  const handleSubmitDiagnosis = () => {
    if (!selectedAnswer || !clinicalCase) return;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const result = ClinicalCaseEngine.evaluateAnswer(selectedAnswer, clinicalCase, timeSpent);

    // Penalize hints in score
    if (hintsUsed > 0) {
      result.score = Math.max(0, result.score - hintsUsed * 5);
    }

    setEvaluation(result);

    const attempt: ExerciseAttempt = {
      id: `att_${Date.now()}`,
      caseId: clinicalCase.id,
      patternId: clinicalCase.correctDiagnosis.patternId,
      patternName: clinicalCase.correctDiagnosis.patternName,
      difficulty,
      selectedAnswer,
      isCorrect: result.isCorrect,
      score: result.score,
      timeSpent,
      timestamp: new Date().toISOString(),
    };
    store.recordAttempt(attempt);
    setCurrentStep('feedback');
  };

  const stepIndex = STEPS.indexOf(currentStep);

  // ─── Free navigation: allow clicking any visited step ───
  const handleStepClick = (step: ExerciseStep) => {
    if (step === 'config') return;
    if (step === 'feedback' && !evaluation) return;
    if (!clinicalCase) return;
    // Can navigate freely between case, ncs, emg, diagnosis
    const targetIdx = STEPS.indexOf(step);
    // Don't allow jumping to diagnosis from config or feedback
    if (currentStep === 'config' || currentStep === 'feedback') return;
    // Allow any step that's not past diagnosis (unless feedback is done)
    if (targetIdx >= 1 && targetIdx <= 4) {
      setCurrentStep(step);
    }
    if (step === 'feedback' && evaluation) {
      setCurrentStep('feedback');
    }
  };

  const canGoNext = currentStep !== 'config' && currentStep !== 'feedback'
    && currentStep !== 'diagnosis';
  const canGoPrev = stepIndex > 1 && currentStep !== 'feedback';

  const goNext = () => {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1]);
  };
  const goPrev = () => {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 1) setCurrentStep(STEPS[idx - 1]);
  };

  // ─── Hints ──────
  const currentHints = clinicalCase
    ? PATTERN_HINTS[clinicalCase.correctDiagnosis.patternId] || []
    : [];
  const maxHints = currentHints.length;

  const requestHint = () => {
    if (hintsUsed < maxHints) {
      setHintsUsed(prev => prev + 1);
      setShowHint(true);
    }
  };

  // ─── Status Cell Color ──────
  const cellColor = (status: string) => {
    if (status === 'abnormal') return 'bg-red-900/30 text-red-300 border-red-700/50';
    if (status === 'borderline') return 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50';
    return 'bg-green-900/20 text-green-300 border-green-700/30';
  };

  const valColor = (val: number, min: number, max: number, lowIsAbnormal = true) => {
    if (lowIsAbnormal) {
      if (val < min) return 'text-red-400 font-bold';
      if (val > max) return 'text-red-400 font-bold';
    } else {
      if (val > max) return 'text-red-400 font-bold';
      if (val < min) return 'text-red-400 font-bold';
    }
    return 'text-green-400';
  };

  // ─── RENDER: Config ─────────
  const renderConfig = () => (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <div className="space-y-2">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">
          Modo Ejercicio EMG
        </h1>
        <p className="text-gray-400">Practica diagnosticando casos clínicos de electromiografía</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700">
          <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{store.totalExercises}</div>
          <div className="text-xs text-gray-400">Ejercicios</div>
        </div>
        <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700">
          <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {store.totalExercises > 0 ? Math.round(store.correctAnswers / store.totalExercises * 100) : 0}%
          </div>
          <div className="text-xs text-gray-400">Precisión</div>
        </div>
        <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700">
          <Zap className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{store.currentStreak}</div>
          <div className="text-xs text-gray-400">Racha</div>
        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Dificultad</h3>
        <div className="flex gap-3 justify-center">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
            <button key={d} onClick={() => { setDifficulty(d); store.setDifficulty(d); }}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                difficulty === d
                  ? d === 'easy' ? 'bg-green-600 text-white ring-2 ring-green-400'
                    : d === 'medium' ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                    : 'bg-red-600 text-white ring-2 ring-red-400'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}>
              {d === 'easy' ? '🟢 Fácil' : d === 'medium' ? '🟡 Medio' : '🔴 Difícil'}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          {difficulty === 'easy' ? '3 opciones, valores claramente anormales'
            : difficulty === 'medium' ? '5 opciones, valores borderline incluidos'
            : '7 opciones, hallazgos sutiles y distractores'}
        </p>
      </div>

      {/* Category Filter */}
      <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
          <Filter className="w-5 h-5 text-purple-400" /> Filtrar por Categoría
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {availableCategories.map(cat => {
            const count = cat === 'all'
              ? CASE_TEMPLATES.length
              : CASE_TEMPLATES.filter(t => t.category === cat).length;
            return (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}>
                {CATEGORY_LABELS[cat] || cat}
                <span className="ml-1.5 text-xs opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Study Mode Toggle */}
      <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700">
        <label className="flex items-center justify-center gap-3 cursor-pointer">
          <span className="text-gray-400 text-sm">Modo Evaluación</span>
          <button
            onClick={() => setIsStudyMode(!isStudyMode)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              isStudyMode ? 'bg-purple-600' : 'bg-gray-600'
            }`}
          >
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
              isStudyMode ? 'translate-x-7' : 'translate-x-0.5'
            }`} />
          </button>
          <span className={`text-sm font-medium ${isStudyMode ? 'text-purple-300' : 'text-gray-500'}`}>
            {isStudyMode ? '📖 Modo Estudio' : '✍️ Modo Examen'}
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-2">
          {isStudyMode
            ? 'Verás el diagnóstico correcto sin evaluación — ideal para aprender'
            : 'Selecciona tu respuesta y obtén calificación'}
        </p>
      </div>

      <button onClick={generateNewCase}
        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20">
        <Zap className="w-5 h-5 inline mr-2" />Generar Caso Clínico
      </button>
    </div>
  );

  // ─── RENDER: Case Presentation ──
  const renderCase = () => {
    if (!clinicalCase) return null;
    const p = clinicalCase.patient;
    return (
      <div className={`space-y-6 transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-600/20 p-3 rounded-xl"><User className="w-6 h-6 text-blue-400" /></div>
          <div>
            <h2 className="text-xl font-bold text-white">Caso Clínico</h2>
            <p className="text-sm text-gray-400">Revisa la información del paciente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Paciente</div>
            <div className="text-white font-semibold">
              {p.sex === 'male' ? '♂' : '♀'} {p.age} años — {p.occupation}
            </div>
          </div>
          <div className="md:col-span-2 bg-gray-800/60 rounded-xl p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Motivo de Consulta</div>
            <div className="text-white">{p.chiefComplaint}</div>
          </div>
        </div>

        <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-700">
          <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <Stethoscope className="w-4 h-4" /> Historia Clínica
          </div>
          <div className="text-gray-200 leading-relaxed">{p.clinicalHistory}</div>
        </div>

        <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-700">
          <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Exploración Física
          </div>
          <div className="text-gray-200 leading-relaxed">{p.physicalExam}</div>
        </div>

        {/* Study Mode: Show Correct Answer Banner */}
        {isStudyMode && (
          <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-700/50 flex items-center gap-3">
            <Eye className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <div>
              <div className="text-purple-300 font-semibold text-sm">Modo Estudio — Respuesta:</div>
              <div className="text-white font-bold">{clinicalCase.correctDiagnosis.patternName}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── RENDER: NCS ──────
  const renderNCS = () => {
    if (!clinicalCase) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-600/20 p-3 rounded-xl"><Activity className="w-6 h-6 text-purple-400" /></div>
          <div>
            <h2 className="text-xl font-bold text-white">Neuroconducción (NCS)</h2>
            <p className="text-sm text-gray-400">Analiza los valores — ¿cuáles son anormales?</p>
          </div>
        </div>
        {/* Mobile: Cards */}
        <div className="md:hidden space-y-3">
          {clinicalCase.ncsResults.map((r, i) => (
            <div key={i} className={`rounded-xl p-4 border ${r.status === 'abnormal' ? 'bg-red-950/20 border-red-800/40' : r.status === 'borderline' ? 'bg-yellow-950/20 border-yellow-800/40' : 'bg-gray-800/50 border-gray-700/50'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{r.nerve}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${r.type === 'motor' ? 'bg-blue-900/50 text-blue-300' : 'bg-pink-900/50 text-pink-300'}`}>
                    {r.type === 'motor' ? 'M' : 'S'}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${cellColor(r.status)}`}>
                  {r.status === 'normal' ? '✓ Normal' : r.status === 'borderline' ? '⚠ Border' : '✗ Anormal'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-900/40 rounded-lg p-2">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Latencia</div>
                  <div className={`text-sm font-mono font-bold ${valColor(r.latency, r.normalRanges.latency.min, r.normalRanges.latency.max, false)}`}>{r.latency} ms</div>
                  <div className="text-[10px] text-gray-600">{r.normalRanges.latency.min}-{r.normalRanges.latency.max}</div>
                </div>
                <div className="bg-gray-900/40 rounded-lg p-2">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Amplitud</div>
                  <div className={`text-sm font-mono font-bold ${valColor(r.amplitude, r.normalRanges.amplitude.min, r.normalRanges.amplitude.max)}`}>{r.amplitude} {r.type === 'motor' ? 'mV' : 'μV'}</div>
                  <div className="text-[10px] text-gray-600">{r.normalRanges.amplitude.min}-{r.normalRanges.amplitude.max}</div>
                </div>
                <div className="bg-gray-900/40 rounded-lg p-2">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Velocidad</div>
                  <div className={`text-sm font-mono font-bold ${valColor(r.velocity, r.normalRanges.velocity.min, r.normalRanges.velocity.max)}`}>{r.velocity} m/s</div>
                  <div className="text-[10px] text-gray-600">{r.normalRanges.velocity.min}-{r.normalRanges.velocity.max}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-700">
              <th className="text-left p-3 text-gray-400">Nervio</th><th className="text-center p-3 text-gray-400">Tipo</th><th className="text-center p-3 text-gray-400">Lado</th>
              <th className="text-center p-3 text-gray-400">Lat (ms)</th><th className="text-center p-3 text-gray-400">Amplitud</th><th className="text-center p-3 text-gray-400">Vel (m/s)</th><th className="text-center p-3 text-gray-400">Estado</th>
            </tr></thead>
            <tbody>
              {clinicalCase.ncsResults.map((r, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="p-3 text-white font-medium">{r.nerve}</td>
                  <td className="p-3 text-center"><span className={`px-2 py-1 rounded text-xs ${r.type === 'motor' ? 'bg-blue-900/40 text-blue-300' : 'bg-pink-900/40 text-pink-300'}`}>{r.type === 'motor' ? 'Motor' : 'Sensitivo'}</span></td>
                  <td className="p-3 text-center text-gray-300">{r.side === 'left' ? 'Izq' : r.side === 'bilateral' ? 'Bil' : 'Der'}</td>
                  <td className={`p-3 text-center ${valColor(r.latency, r.normalRanges.latency.min, r.normalRanges.latency.max, false)}`}>{r.latency}<div className="text-xs text-gray-500">({r.normalRanges.latency.min}-{r.normalRanges.latency.max})</div></td>
                  <td className={`p-3 text-center ${valColor(r.amplitude, r.normalRanges.amplitude.min, r.normalRanges.amplitude.max)}`}>{r.amplitude} {r.type === 'motor' ? 'mV' : 'μV'}<div className="text-xs text-gray-500">({r.normalRanges.amplitude.min}-{r.normalRanges.amplitude.max})</div></td>
                  <td className={`p-3 text-center ${valColor(r.velocity, r.normalRanges.velocity.min, r.normalRanges.velocity.max)}`}>{r.velocity}<div className="text-xs text-gray-500">({r.normalRanges.velocity.min}-{r.normalRanges.velocity.max})</div></td>
                  <td className="p-3 text-center"><span className={`px-2 py-1 rounded text-xs ${cellColor(r.status)}`}>{r.status === 'normal' ? '✓ Normal' : r.status === 'borderline' ? '⚠ Borderline' : '✗ Anormal'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ─── RENDER: EMG ──────
  const renderEMG = () => {
    if (!clinicalCase) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-600/20 p-3 rounded-xl"><Zap className="w-6 h-6 text-green-400" /></div>
          <div>
            <h2 className="text-xl font-bold text-white">Electromiografía (EMG)</h2>
            <p className="text-sm text-gray-400">Interpreta los hallazgos de cada músculo</p>
          </div>
        </div>
        {/* Mobile: Cards */}
        <div className="md:hidden space-y-3">
          {clinicalCase.emgResults.map((e, i) => {
            const fibAbn = e.spontaneousActivity.fibrillations !== 'absent';
            const pwAbn = e.spontaneousActivity.positiveWaves !== 'absent';
            const fascAbn = e.spontaneousActivity.fasciculations !== 'absent';
            const durAbn = e.motorUnitPotentials.duration > 15 || e.motorUnitPotentials.duration < 6;
            const ampAbn = e.motorUnitPotentials.amplitude > 5000 || e.motorUnitPotentials.amplitude < 200;
            const recAbn = e.recruitmentPattern !== 'normal';
            const hasAbnormal = fibAbn || pwAbn || fascAbn || durAbn || ampAbn || recAbn;
            return (
              <div key={i} className={`rounded-xl p-4 border ${hasAbnormal ? 'bg-red-950/15 border-red-800/40' : 'bg-gray-800/50 border-gray-700/50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-white font-semibold text-sm">{e.muscle}</span>
                    <span className="text-gray-500 text-xs ml-2">{e.nerve} · {e.root}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${recAbn ? 'bg-red-900/40 text-red-300' : 'bg-green-900/40 text-green-300'}`}>
                    {e.recruitmentPattern === 'normal' ? 'Nl' : e.recruitmentPattern === 'reduced' ? '↓Reduc' : '↑Precoz'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Spontaneous */}
                  <div className="bg-gray-900/40 rounded-lg p-2">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Espontánea</div>
                    <div className="space-y-0.5">
                      <div className={fibAbn ? 'text-red-400 font-bold' : 'text-green-400'}>Fibs: {e.spontaneousActivity.fibrillations === 'absent' ? '−' : e.spontaneousActivity.fibrillations}</div>
                      <div className={pwAbn ? 'text-red-400 font-bold' : 'text-green-400'}>OAP: {e.spontaneousActivity.positiveWaves === 'absent' ? '−' : e.spontaneousActivity.positiveWaves}</div>
                      <div className={fascAbn ? 'text-red-400 font-bold' : 'text-green-400'}>Fasc: {e.spontaneousActivity.fasciculations === 'absent' ? '−' : e.spontaneousActivity.fasciculations}</div>
                    </div>
                  </div>
                  {/* MUPs */}
                  <div className="bg-gray-900/40 rounded-lg p-2">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">PUM</div>
                    <div className="space-y-0.5">
                      <div className={durAbn ? 'text-red-400 font-bold' : 'text-green-400'}>Dur: {e.motorUnitPotentials.duration} ms</div>
                      <div className={ampAbn ? 'text-red-400 font-bold' : 'text-green-400'}>Amp: {e.motorUnitPotentials.amplitude} μV</div>
                      <div className={e.motorUnitPotentials.polyphasia > 25 ? 'text-yellow-400' : 'text-gray-300'}>Polif: {e.motorUnitPotentials.polyphasia}%</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Desktop: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-700">
              <th className="text-left p-2 text-gray-400">Músculo</th><th className="text-center p-2 text-gray-400">Raíz</th>
              <th className="text-center p-2 text-gray-400">Ins</th><th className="text-center p-2 text-gray-400">Fibs</th>
              <th className="text-center p-2 text-gray-400">OAP</th><th className="text-center p-2 text-gray-400">Fasc</th>
              <th className="text-center p-2 text-gray-400">Dur</th><th className="text-center p-2 text-gray-400">Amp</th>
              <th className="text-center p-2 text-gray-400">Polif</th><th className="text-center p-2 text-gray-400">Reclut</th>
            </tr></thead>
            <tbody>
              {clinicalCase.emgResults.map((e, i) => {
                const fibAbn = e.spontaneousActivity.fibrillations !== 'absent';
                const pwAbn = e.spontaneousActivity.positiveWaves !== 'absent';
                const fascAbn = e.spontaneousActivity.fasciculations !== 'absent';
                const durAbn = e.motorUnitPotentials.duration > 15 || e.motorUnitPotentials.duration < 6;
                const ampAbn = e.motorUnitPotentials.amplitude > 5000 || e.motorUnitPotentials.amplitude < 200;
                const recAbn = e.recruitmentPattern !== 'normal';
                return (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/40">
                    <td className="p-2"><div className="text-white font-medium text-xs">{e.muscle}</div><div className="text-gray-500 text-xs">{e.nerve}</div></td>
                    <td className="p-2 text-center text-gray-300 text-xs">{e.root}</td>
                    <td className={`p-2 text-center text-xs ${e.insertionalActivity !== 'normal' ? 'text-yellow-400' : 'text-gray-300'}`}>{e.insertionalActivity === 'normal' ? 'Nl' : e.insertionalActivity === 'increased' ? '↑' : '↓'}</td>
                    <td className={`p-2 text-center text-xs ${fibAbn ? 'text-red-400 font-bold' : 'text-green-400'}`}>{e.spontaneousActivity.fibrillations === 'absent' ? '-' : e.spontaneousActivity.fibrillations}</td>
                    <td className={`p-2 text-center text-xs ${pwAbn ? 'text-red-400 font-bold' : 'text-green-400'}`}>{e.spontaneousActivity.positiveWaves === 'absent' ? '-' : e.spontaneousActivity.positiveWaves}</td>
                    <td className={`p-2 text-center text-xs ${fascAbn ? 'text-red-400 font-bold' : 'text-green-400'}`}>{e.spontaneousActivity.fasciculations === 'absent' ? '-' : e.spontaneousActivity.fasciculations}</td>
                    <td className={`p-2 text-center text-xs ${durAbn ? 'text-red-400 font-bold' : 'text-green-400'}`}>{e.motorUnitPotentials.duration}</td>
                    <td className={`p-2 text-center text-xs ${ampAbn ? 'text-red-400 font-bold' : 'text-green-400'}`}>{e.motorUnitPotentials.amplitude}</td>
                    <td className={`p-2 text-center text-xs ${e.motorUnitPotentials.polyphasia > 25 ? 'text-yellow-400' : 'text-gray-300'}`}>{e.motorUnitPotentials.polyphasia}%</td>
                    <td className={`p-2 text-center text-xs ${recAbn ? 'text-red-400 font-bold' : 'text-green-400'}`}>{e.recruitmentPattern === 'normal' ? 'Nl' : e.recruitmentPattern === 'reduced' ? '↓' : e.recruitmentPattern === 'early' ? '↑Precoz' : e.recruitmentPattern}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ─── RENDER: Diagnosis Selector ──
  const renderDiagnosis = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-amber-600/20 p-3 rounded-xl"><Brain className="w-6 h-6 text-amber-400" /></div>
        <div>
          <h2 className="text-xl font-bold text-white">
            {isStudyMode ? '📖 Modo Estudio — Diagnóstico' : '¿Cuál es tu diagnóstico?'}
          </h2>
          <p className="text-sm text-gray-400">
            {isStudyMode
              ? 'Revisa la respuesta correcta y la explicación'
              : 'Selecciona el patrón que mejor explica los hallazgos'}
          </p>
        </div>
      </div>

      {/* Study mode: reveal answer directly */}
      {isStudyMode && clinicalCase && (
        <div className="bg-purple-900/30 rounded-xl p-5 border border-purple-700/50 space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-semibold">Respuesta Correcta:</span>
          </div>
          <div className="text-white text-xl font-bold">{clinicalCase.correctDiagnosis.patternName}</div>
          <p className="text-gray-300 text-sm leading-relaxed">{clinicalCase.correctDiagnosis.explanation}</p>
          <div className="pt-2 border-t border-purple-700/30">
            <div className="text-sm text-purple-300 font-medium mb-2">Hallazgos Clave:</div>
            <ul className="space-y-1">
              {clinicalCase.correctDiagnosis.keyFindings.map((f, i) => (
                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span><strong>{f.parameter}</strong>: {f.significance}</span>
                </li>
              ))}
            </ul>
          </div>
          <button onClick={generateNewCase}
            className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold">
            Siguiente Caso <ChevronRight className="w-4 h-4 inline ml-2" />
          </button>
        </div>
      )}

      {/* Normal exam mode */}
      {!isStudyMode && (
        <>
          <div className="grid gap-3">
            {options.map(opt => (
              <button key={opt.patternId} onClick={() => setSelectedAnswer(opt.patternId)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selectedAnswer === opt.patternId
                    ? 'bg-amber-600/20 border-amber-500 ring-2 ring-amber-400/50'
                    : 'bg-gray-800/40 border-gray-700 hover:border-gray-500 hover:bg-gray-800/60'
                }`}>
                <div className="font-semibold text-white">{opt.patternName}</div>
                <div className="text-sm text-gray-400 mt-1">{opt.description}</div>
              </button>
            ))}
          </div>

          <button onClick={handleSubmitDiagnosis} disabled={!selectedAnswer}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg">
            Confirmar Diagnóstico
          </button>
        </>
      )}
    </div>
  );

  // ─── RENDER: Feedback ──────
  const renderFeedback = () => {
    if (!evaluation || !clinicalCase) return null;
    return (
      <div className="space-y-6">
        {/* Result Banner */}
        <div className={`rounded-2xl p-6 text-center ${evaluation.isCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
          <div className="flex justify-center mb-3">
            {evaluation.isCorrect
              ? <CheckCircle className="w-16 h-16 text-green-400" />
              : <XCircle className="w-16 h-16 text-red-400" />}
          </div>
          <h2 className={`text-2xl font-bold ${evaluation.isCorrect ? 'text-green-300' : 'text-red-300'}`}>
            {evaluation.isCorrect ? '¡Correcto!' : 'Incorrecto'}
          </h2>
          <div className="text-white text-lg mt-1">
            Diagnóstico correcto: <strong>{evaluation.correctPatternName}</strong>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
            <div><Award className="w-4 h-4 inline text-amber-400" /> Puntos: {evaluation.score}</div>
            <div><Clock className="w-4 h-4 inline text-blue-400" /> Tiempo: {formatTime(evaluation.timeSpent ?? 0)}</div>
            <div><TrendingUp className="w-4 h-4 inline text-green-400" /> Racha: {store.currentStreak}</div>
            {hintsUsed > 0 && (
              <div><HelpCircle className="w-4 h-4 inline text-purple-400" /> Pistas: {hintsUsed} (-{hintsUsed * 5}pts)</div>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-700">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" /> Explicación
          </h3>
          <p className="text-gray-200 leading-relaxed">{evaluation.explanation}</p>
        </div>

        {/* Key Findings */}
        {evaluation.keyFindingsHighlighted.length > 0 && (
          <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-700">
            <h3 className="font-semibold text-white mb-3">🔑 Hallazgos Clave</h3>
            <div className="space-y-2">
              {evaluation.keyFindingsHighlighted.map((f, i) => (
                <div key={i} className="flex items-start gap-3 bg-gray-900/40 rounded-lg p-3">
                  <span className={`px-2 py-0.5 rounded text-xs mt-0.5 ${
                    f.importance === 'critical' ? 'bg-red-900/50 text-red-300'
                    : f.importance === 'major' ? 'bg-amber-900/50 text-amber-300'
                    : 'bg-blue-900/50 text-blue-300'}`}>
                    {f.importance === 'critical' ? 'Crítico' : f.importance === 'major' ? 'Mayor' : 'Soporte'}
                  </span>
                  <div>
                    <div className="text-white text-sm"><strong>{f.parameter}</strong> — {f.location}: <code className="text-amber-300">{f.value}</code> (normal: {f.normalValue})</div>
                    <div className="text-gray-400 text-xs mt-1">{f.significance}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why Not Others */}
        {evaluation.differentialExplanations.length > 0 && (
          <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-700">
            <h3 className="font-semibold text-white mb-3">
              <AlertTriangle className="w-4 h-4 inline text-amber-400 mr-2" />
              ¿Por qué no otros diagnósticos?
            </h3>
            <div className="space-y-3">
              {evaluation.differentialExplanations.map((d, i) => (
                <div key={i} className="bg-gray-900/40 rounded-lg p-3">
                  <div className="text-amber-300 font-medium text-sm">{d.patternName}</div>
                  <div className="text-gray-300 text-sm mt-1">{d.whyNot}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Case Button */}
        <div className="flex gap-4">
          <button onClick={() => setCurrentStep('config')}
            className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-medium">
            <ArrowLeft className="w-4 h-4 inline mr-2" />Menú
          </button>
          <button onClick={generateNewCase}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold">
            Siguiente Caso <ChevronRight className="w-4 h-4 inline ml-2" />
          </button>
        </div>
      </div>
    );
  };

  // ─── MAIN RENDER ────────────
  const renderStep = () => {
    switch (currentStep) {
      case 'config': return renderConfig();
      case 'case': return renderCase();
      case 'ncs': return renderNCS();
      case 'emg': return renderEMG();
      case 'diagnosis': return renderDiagnosis();
      case 'feedback': return renderFeedback();
    }
  };

  const STEP_ICONS: Record<ExerciseStep, React.ReactNode> = {
    config: <Target className="w-3.5 h-3.5" />,
    case: <User className="w-3.5 h-3.5" />,
    ncs: <Activity className="w-3.5 h-3.5" />,
    emg: <Zap className="w-3.5 h-3.5" />,
    diagnosis: <Brain className="w-3.5 h-3.5" />,
    feedback: <Award className="w-3.5 h-3.5" />,
  };

  const STEP_SHORT: Record<ExerciseStep, string> = {
    config: 'Config', case: 'Caso', ncs: 'NCS', emg: 'EMG', diagnosis: 'Dx', feedback: 'Eval',
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Top bar with timer + clickable progress */}
      {currentStep !== 'config' && (
        <div className="bg-gray-800/95 backdrop-blur-lg border-b border-gray-700/60 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={() => setCurrentStep('config')}
                className="text-gray-400 hover:text-white transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-gray-700/50">
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Step tabs — labels always visible */}
              <div className="flex-1 flex gap-0.5 sm:gap-1 items-center justify-center">
                {STEPS.filter(s => s !== 'config').map(s => {
                  const sIdx = STEPS.indexOf(s);
                  const isActive = s === currentStep;
                  const isVisited = sIdx < stepIndex || (s === 'feedback' && evaluation);
                  const isClickable = (sIdx >= 1 && sIdx <= 4 && clinicalCase && currentStep !== 'feedback')
                    || (s === 'feedback' && evaluation);
                  return (
                    <button
                      key={s}
                      onClick={() => isClickable && handleStepClick(s)}
                      className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                        : isVisited ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/40'
                        : 'text-gray-600'
                      } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <span className="hidden sm:inline">{STEP_ICONS[s]}</span>
                      <span>{STEP_SHORT[s]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Timer */}
              {currentStep !== 'feedback' && (
                <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-mono whitespace-nowrap ${
                  elapsedSeconds > 300 ? 'bg-red-900/40 text-red-300'
                  : elapsedSeconds > 180 ? 'bg-amber-900/40 text-amber-300'
                  : 'bg-gray-700/50 text-gray-400'
                }`}>
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {formatTime(elapsedSeconds)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick-review panel on diagnosis step */}
      {showReviewPanel && currentStep === 'diagnosis' && clinicalCase && (
        <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-gray-800/98 backdrop-blur-xl border-l border-gray-700 z-50 overflow-y-auto shadow-2xl">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm">📋 Resumen de Datos</h3>
              <button onClick={() => setShowReviewPanel(false)} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
            </div>
            <div className="space-y-3 text-xs">
              <div><div className="text-gray-500 uppercase tracking-wider text-[10px] mb-1">NCS</div>
                {clinicalCase.ncsResults.map((r, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-gray-700/30">
                    <span className="text-gray-300">{r.nerve} ({r.type === 'motor' ? 'M' : 'S'})</span>
                    <span className={cellColor(r.status)}>{r.status === 'normal' ? '✓' : r.status === 'borderline' ? '⚠' : '✗'}</span>
                  </div>
                ))}
              </div>
              <div><div className="text-gray-500 uppercase tracking-wider text-[10px] mb-1">EMG</div>
                {clinicalCase.emgResults.map((e, i) => {
                  const hasAbn = e.spontaneousActivity.fibrillations !== 'absent' || e.spontaneousActivity.positiveWaves !== 'absent' || e.recruitmentPattern !== 'normal';
                  return (
                    <div key={i} className="flex justify-between py-1 border-b border-gray-700/30">
                      <span className="text-gray-300">{e.muscle}</span>
                      <span className={hasAbn ? 'text-red-400' : 'text-green-400'}>{hasAbn ? '✗' : '✓'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-28">{renderStep()}</div>

      {/* Bottom Nav with Hints */}
      {currentStep !== 'config' && currentStep !== 'feedback' && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-lg border-t border-gray-700/60 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between py-3 px-3 sm:px-4">
            <button onClick={goPrev} disabled={!canGoPrev}
              className="px-3 sm:px-5 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white transition-colors text-sm min-h-[44px]">
              <ChevronLeft className="w-4 h-4 inline mr-0.5 sm:mr-1" /><span className="hidden sm:inline">Anterior</span>
            </button>

            {/* Hint button — only on case/ncs/emg/diagnosis steps, not in study mode */}
            {!isStudyMode && maxHints > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={requestHint} disabled={hintsUsed >= maxHints}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-900/40 border border-purple-700/50 text-purple-300 hover:bg-purple-900/60 disabled:opacity-30 transition-colors text-sm">
                  <HelpCircle className="w-4 h-4" />
                  Pista ({hintsUsed}/{maxHints})
                </button>
              </div>
            )}

            {/* Review panel toggle on diagnosis */}
            {currentStep === 'diagnosis' && (
              <button onClick={() => setShowReviewPanel(!showReviewPanel)}
                className={`px-3 py-2.5 rounded-lg text-sm min-h-[44px] transition-colors ${showReviewPanel ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                📋
              </button>
            )}

            {canGoNext ? (
              <button onClick={goNext}
                className="px-3 sm:px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors text-sm min-h-[44px]">
                <span className="hidden sm:inline">Siguiente</span><ChevronRight className="w-4 h-4 inline ml-0.5" />
              </button>
            ) : currentStep === 'diagnosis' && !isStudyMode ? (
              <button onClick={handleSubmitDiagnosis} disabled={!selectedAnswer}
                className="px-4 sm:px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold disabled:opacity-30 transition-all text-sm min-h-[44px]">
                Confirmar
              </button>
            ) : <div />}
          </div>

          {/* Hint display */}
          {showHint && hintsUsed > 0 && (
            <div className="max-w-5xl mx-auto mt-3">
              <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-700/40 space-y-2">
                {currentHints.slice(0, hintsUsed).map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Lightbulb className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-purple-200">{h}</span>
                  </div>
                ))}
                <button onClick={() => setShowHint(false)}
                  className="text-xs text-purple-400 hover:text-purple-300 mt-1">
                  Ocultar pistas
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciseMode;
