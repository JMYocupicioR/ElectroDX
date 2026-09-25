import React, { useState } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  Activity,
  Zap,
  User,
  BookOpen,
  Sparkles,
  AlertTriangle,
  Layers,
  GraduationCap,
  ShieldAlert,
} from 'lucide-react';
import type { CaseTemplate, NCSTemplate, EMGTemplate, CaseUsageMode } from '../../../ejercicios/src/data/CaseTemplates';
import type { DiagnosticCategory, Difficulty, SeverityGrade } from '../../../ejercicios/src/types/ClinicalCase';
import { saveCaseTemplate, type CustomCaseTemplateRecord } from '../../services/emgExerciseService';
import { useAuth } from '../../contexts/AuthProvider';

interface EmgCaseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialTemplate?: CustomCaseTemplateRecord | null;
}

type TabKey = 'identity' | 'ncs' | 'emg' | 'special' | 'pedagogy';

const CATEGORIES: { id: DiagnosticCategory; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'axonal', label: 'Axonal' },
  { id: 'demyelinating', label: 'Desmielinizante' },
  { id: 'myopathic', label: 'Miopática' },
  { id: 'entrapment', label: 'Atrapamiento Focal' },
  { id: 'radiculopathy', label: 'Radiculopatía' },
  { id: 'plexopathy', label: 'Plexopatía' },
  { id: 'motor_neuron_disease', label: 'Enf. Motoneurona' },
  { id: 'neuromuscular_junction', label: 'Unión Neuromuscular' },
  { id: 'pitfall', label: '⚠️ Caso Trampa / Variante' },
];

export const EmgCaseEditorModal: React.FC<EmgCaseEditorModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialTemplate,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('identity');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [patternId, setPatternId] = useState(initialTemplate?.patternId || '');
  const [patternName, setPatternName] = useState(initialTemplate?.patternName || '');
  const [category, setCategory] = useState<DiagnosticCategory>(initialTemplate?.category || 'entrapment');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialTemplate?.difficulty || 'medium');
  const [usageMode, setUsageMode] = useState<CaseUsageMode>(initialTemplate?.usageMode || 'practice');
  const [severityGrade, setSeverityGrade] = useState<SeverityGrade>(initialTemplate?.severityGrade || 'moderate');
  const [severityExplanation, setSeverityExplanation] = useState(initialTemplate?.severityExplanation || '');
  const [isPitfall, setIsPitfall] = useState(!!initialTemplate?.isPitfall);
  const [pitfallExplanation, setPitfallExplanation] = useState(initialTemplate?.pitfallExplanation || '');

  // Patient
  const [ageMin, setAgeMin] = useState(initialTemplate?.patient.ageRange[0] || 35);
  const [ageMax, setAgeMax] = useState(initialTemplate?.patient.ageRange[1] || 60);
  const [sexBias, setSexBias] = useState<'male' | 'female' | 'both'>(
    initialTemplate?.patient.sexBias || 'both'
  );
  const [occupations, setOccupations] = useState(initialTemplate?.patient.occupations.join(', ') || 'Oficinista, Operario');
  const [complaintsText, setComplaintsText] = useState(
    initialTemplate?.patient.complaints.join('\n') || ''
  );
  const [historiesText, setHistoriesText] = useState(
    initialTemplate?.patient.histories.join('\n') || ''
  );
  const [physicalExamsText, setPhysicalExamsText] = useState(
    initialTemplate?.patient.physicalExams.join('\n') || ''
  );
  const [technicalNotesText, setTechnicalNotesText] = useState(
    initialTemplate?.technicalNotes?.join('\n') || ''
  );

  // NCS List
  const [ncsList, setNcsList] = useState<NCSTemplate[]>(
    initialTemplate?.ncs || [
      {
        nerve: 'Mediano',
        type: 'motor',
        latency: [4.8, 6.2],
        amplitude: [3.5, 7.0],
        velocity: [42, 48],
        normalRanges: { latency: [2.5, 4.2], amplitude: [4, 12], velocity: [49, 65] },
      },
    ]
  );

  // EMG List
  const [emgList, setEmgList] = useState<EMGTemplate[]>(
    initialTemplate?.emg || [
      {
        muscle: 'Abductor Pollicis Brevis',
        nerve: 'Mediano',
        root: 'C8-T1',
        insertionalActivity: ['increased'],
        fibrillations: ['2+'],
        positiveWaves: ['2+'],
        fasciculations: ['absent'],
        duration: [14, 18],
        amplitude: [3500, 6000],
        polyphasia: [25, 40],
        recruitment: ['reduced'],
      },
    ]
  );

  // Special Studies
  const [hasRns, setHasRns] = useState(!!initialTemplate?.rns && initialTemplate.rns.length > 0);
  const [rnsNerve, setRnsNerve] = useState(initialTemplate?.rns?.[0]?.nerve || 'Accesorio espinal');
  const [rnsMuscle, setRnsMuscle] = useState(initialTemplate?.rns?.[0]?.muscle || 'Trapecio');
  const [rnsDecrementMin, setRnsDecrementMin] = useState(initialTemplate?.rns?.[0]?.decrementPercent[0] || -15);
  const [rnsDecrementMax, setRnsDecrementMax] = useState(initialTemplate?.rns?.[0]?.decrementPercent[1] || -30);
  const [skinTemp, setSkinTemp] = useState(initialTemplate?.skinTemperature?.[0] || 33.5);

  // Pedagogy & Diagnosis
  const [explanation, setExplanation] = useState(initialTemplate?.explanation || '');
  const [recommendations, setRecommendations] = useState(
    initialTemplate?.recommendations.join('\n') || 'Control EMG en 3 meses.\nCorrelación clínica.'
  );
  const [hints, setHints] = useState(
    initialTemplate?.hints?.join('\n') || 'Pista 1: Analiza la simetría de amplitudes.\nPista 2: Observa la actividad espontánea.'
  );
  const [differentials, setDifferentials] = useState<{ id: string; name: string; whyNot: string }[]>(
    initialTemplate?.differentials || [
      { id: 'acute_axonal_neuropathy', name: 'Neuropatía Axonal', whyNot: 'La distribución no es longitud-dependiente simétrica.' },
    ]
  );

  if (!isOpen) return null;

  const handleAddNcs = () => {
    setNcsList([
      ...ncsList,
      {
        nerve: 'Cubital',
        type: 'motor',
        latency: [2.2, 3.2],
        amplitude: [6, 12],
        velocity: [52, 62],
        normalRanges: { latency: [2.0, 3.5], amplitude: [6, 14], velocity: [49, 65] },
      },
    ]);
  };

  const handleRemoveNcs = (idx: number) => {
    setNcsList(ncsList.filter((_, i) => i !== idx));
  };

  const handleAddEmg = () => {
    setEmgList([
      ...emgList,
      {
        muscle: 'First Dorsal Interosseous',
        nerve: 'Cubital',
        root: 'C8-T1',
        insertionalActivity: ['normal'],
        fibrillations: ['absent'],
        positiveWaves: ['absent'],
        fasciculations: ['absent'],
        duration: [8, 13],
        amplitude: [300, 3000],
        polyphasia: [5, 15],
        recruitment: ['normal'],
      },
    ]);
  };

  const handleRemoveEmg = (idx: number) => {
    setEmgList(emgList.filter((_, i) => i !== idx));
  };

  const handleAddDifferential = () => {
    setDifferentials([
      ...differentials,
      { id: 'differential_' + Date.now(), name: 'Nuevo Diagnóstico Alternativo', whyNot: 'Razón de descarte...' },
    ]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validaciones
    if (!patternName.trim()) {
      setErrorMsg('El nombre clínico del caso es obligatorio.');
      return;
    }
    if (ncsList.length === 0) {
      setErrorMsg('Debes incluir al menos un nervio en el estudio de neuroconducción.');
      return;
    }
    if (emgList.length === 0) {
      setErrorMsg('Debes incluir al menos un músculo en la electromiografía.');
      return;
    }
    if (!explanation.trim()) {
      setErrorMsg('La explicación clínica es obligatoria para la retroalimentación del alumno.');
      return;
    }

    const calculatedPatternId = patternId.trim()
      ? patternId.trim().toLowerCase().replace(/\s+/g, '_')
      : patternName.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]/g, '_');

    const templateToSave: CaseTemplate & { difficulty: Difficulty; usageMode: CaseUsageMode; hints?: string[] } = {
      patternId: calculatedPatternId,
      patternName,
      category,
      difficulty,
      usageMode,
      severityGrade,
      severityExplanation: severityExplanation.trim() || undefined,
      isPitfall,
      pitfallExplanation: isPitfall ? pitfallExplanation : undefined,
      patient: {
        ageRange: [Number(ageMin), Number(ageMax)],
        sexBias: sexBias === 'both' ? undefined : sexBias,
        occupations: occupations.split(',').map(s => s.trim()).filter(Boolean),
        complaints: complaintsText.split('\n').map(s => s.trim()).filter(Boolean).length
          ? complaintsText.split('\n').map(s => s.trim()).filter(Boolean)
          : ['Síntomas neurológicos periféricos.'],
        histories: historiesText.split('\n').map(s => s.trim()).filter(Boolean).length
          ? historiesText.split('\n').map(s => s.trim()).filter(Boolean)
          : ['Paciente sin antecedentes de relevancia previa.'],
        physicalExams: physicalExamsText.split('\n').map(s => s.trim()).filter(Boolean).length
          ? physicalExamsText.split('\n').map(s => s.trim()).filter(Boolean)
          : ['Examen neurológico con fuerza conservada.'],
      },
      ncs: ncsList,
      emg: emgList,
      lateResponses: initialTemplate?.lateResponses,
      technicalNotes: technicalNotesText.split('\n').map(s => s.trim()).filter(Boolean),
      rns: hasRns
        ? [
            {
              nerve: rnsNerve,
              muscle: rnsMuscle,
              frequency: '3Hz',
              baselineCMAP: [3.0, 6.5],
              decrementPercent: [Number(rnsDecrementMin), Number(rnsDecrementMax)],
            },
          ]
        : undefined,
      skinTemperature: [skinTemp, skinTemp + 0.5],
      explanation,
      differentials,
      recommendations: recommendations.split('\n').map((s: string) => s.trim()).filter(Boolean),
      hints: hints.split('\n').map((s: string) => s.trim()).filter(Boolean),
    };

    setSaving(true);
    try {
      const res = await saveCaseTemplate(templateToSave, user?.id);
      if (res.success) {
        onSaved();
        onClose();
      } else {
        setErrorMsg(res.error || 'Error al guardar caso clínico');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialTemplate ? `Editar Caso: ${initialTemplate.patternName}` : 'Crear Nuevo Caso Clínico EMG'}
              </h3>
              <p className="text-xs text-slate-400">
                Define los parámetros electrofisiológicos que el motor simulará para los alumnos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'identity' as TabKey, label: '1. Identidad & Paciente', icon: <User className="w-4 h-4" /> },
            { id: 'ncs' as TabKey, label: '2. Conducción (NCS)', icon: <Activity className="w-4 h-4" /> },
            { id: 'emg' as TabKey, label: '3. Electromiografía (EMG)', icon: <Zap className="w-4 h-4" /> },
            { id: 'special' as TabKey, label: '4. Pruebas Especiales', icon: <Layers className="w-4 h-4" /> },
            { id: 'pedagogy' as TabKey, label: '5. Diagnóstico & Pistas', icon: <Sparkles className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400 font-bold bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: IDENTIDAD & PACIENTE */}
          {activeTab === 'identity' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Nombre Clínico del Caso *</label>
                  <input
                    type="text"
                    required
                    value={patternName}
                    onChange={(e) => setPatternName(e.target.value)}
                    placeholder="Ej. Síndrome del Túnel del Carpo Severo con Denervación"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">ID Único de Patrón (slug)</label>
                  <input
                    type="text"
                    value={patternId}
                    onChange={(e) => setPatternId(e.target.value)}
                    placeholder="Autogenerado si está vacío"
                    className="w-full p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Categoría Clínica *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DiagnosticCategory)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Dificultad Sugerida</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="easy">Fácil (Hallazgos muy claros)</option>
                    <option value="medium">Medio (Casos habituales)</option>
                    <option value="hard">Difícil (Sutiles o borderline)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Severidad</label>
                  <select
                    value={severityGrade}
                    onChange={(e) => setSeverityGrade(e.target.value as SeverityGrade)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="mild">Leve</option>
                    <option value="moderate">Moderado</option>
                    <option value="severe">Severo</option>
                    <option value="very_severe">Muy Severo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Criterio de Severidad / Justificación</label>
                <input
                  type="text"
                  value={severityExplanation}
                  onChange={(e) => setSeverityExplanation(e.target.value)}
                  placeholder="Ej. Amplitud CMAP < 1.0 mV o presencia de potenciales de denervación profusos"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              {/* Modalidad de Uso / Destino Pedagógico */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Destino del Ejercicio (Práctica vs Examen) *
                  </label>
                  <span className="text-xs text-slate-400">Protección contra filtraciones a alumnos</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Opción 1: Práctica Libre */}
                  <button
                    type="button"
                    onClick={() => setUsageMode('practice')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      usageMode === 'practice'
                        ? 'bg-emerald-500/15 border-emerald-500/80 text-emerald-200 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold flex items-center gap-1.5 text-emerald-400">
                        📖 Práctica Libre
                      </span>
                      {usageMode === 'practice' && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase">
                          Activo
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400">
                      Visible en el simulador abierto. Los alumnos pueden practicar libremente con este caso.
                    </p>
                  </button>

                  {/* Opción 2: Solo Examen */}
                  <button
                    type="button"
                    onClick={() => setUsageMode('exam_only')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      usageMode === 'exam_only'
                        ? 'bg-purple-500/15 border-purple-500/80 text-purple-200 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/10'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold flex items-center gap-1.5 text-purple-400">
                        🎓 Banco de Examen
                      </span>
                      {usageMode === 'exam_only' && (
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold uppercase">
                          Protegido
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400">
                      <strong className="text-purple-300">Oculto en el simulador.</strong> Exclusivo para evaluaciones o tareas oficiales asignadas.
                    </p>
                  </button>

                  {/* Opción 3: Híbrido */}
                  <button
                    type="button"
                    onClick={() => setUsageMode('both')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      usageMode === 'both'
                        ? 'bg-cyan-500/15 border-cyan-500/80 text-cyan-200 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold flex items-center gap-1.5 text-cyan-400">
                        🔄 Práctica y Examen
                      </span>
                      {usageMode === 'both' && (
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold uppercase">
                          Híbrido
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400">
                      Disponible tanto para autoestudio como para exámenes y tareas docentes.
                    </p>
                  </button>
                </div>

                {usageMode === 'exam_only' && (
                  <div className="flex items-center gap-2 text-xs text-purple-300/90 bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/40">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-purple-400" />
                    <span>
                      <strong>Seguridad académica:</strong> Este caso no se listará ni saldrá al azar cuando el alumno estudie por su cuenta en el simulador.
                    </span>
                  </div>
                )}
              </div>

              {/* Paciente */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" /> Generador del Paciente
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Rango de Edad (Años)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={ageMin}
                        onChange={(e) => setAgeMin(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-center"
                      />
                      <span className="text-slate-500">a</span>
                      <input
                        type="number"
                        value={ageMax}
                        onChange={(e) => setAgeMax(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Sesgo de Sexo</label>
                    <select
                      value={sexBias}
                      onChange={(e) => setSexBias(e.target.value as any)}
                      className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    >
                      <option value="both">50% / 50% Indistinto</option>
                      <option value="female">Predominio Femenino (ej. STC)</option>
                      <option value="male">Predominio Masculino (ej. ELA/Trauma)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Ocupaciones Típicas (separadas por coma)</label>
                    <input
                      type="text"
                      value={occupations}
                      onChange={(e) => setOccupations(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Motivos de consulta (uno por línea)</label>
                  <textarea
                    rows={3}
                    value={complaintsText}
                    onChange={(e) => setComplaintsText(e.target.value)}
                    placeholder="Parestesias nocturnas en mano derecha de 6 meses de evolución"
                    className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Historias clínicas (una por línea)</label>
                    <textarea
                      rows={3}
                      value={historiesText}
                      onChange={(e) => setHistoriesText(e.target.value)}
                      placeholder="Paciente femenino de 48 años con hormigueo en dedos 1 a 3..."
                      className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Exploraciones físicas (una por línea)</label>
                    <textarea
                      rows={3}
                      value={physicalExamsText}
                      onChange={(e) => setPhysicalExamsText(e.target.value)}
                      placeholder="Fuerza 4/5 en abducción del pulgar. Tinel y Phalen positivos..."
                      className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NCS */}
          {activeTab === 'ncs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">
                  Nervios Estudiados ({ncsList.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddNcs}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Nervio</span>
                </button>
              </div>

              <div className="space-y-3">
                {ncsList.map((ncs, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={ncs.nerve}
                          onChange={(e) => {
                            const updated = [...ncsList];
                            updated[idx].nerve = e.target.value;
                            setNcsList(updated);
                          }}
                          className="font-bold text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-xs"
                        />
                        <select
                          value={ncs.type}
                          onChange={(e) => {
                            const updated = [...ncsList];
                            updated[idx].type = e.target.value as any;
                            setNcsList(updated);
                          }}
                          className="bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1 rounded-lg text-xs"
                        >
                          <option value="motor">Motor</option>
                          <option value="sensory">Sensitivo</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveNcs(idx)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">
                          Latencia Rango (ms) [Generada]
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={ncs.latency[0]}
                            onChange={(e) => {
                              const updated = [...ncsList];
                              updated[idx].latency[0] = Number(e.target.value);
                              setNcsList(updated);
                            }}
                            className="w-full p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-center"
                          />
                          <span>-</span>
                          <input
                            type="number"
                            step="0.1"
                            value={ncs.latency[1]}
                            onChange={(e) => {
                              const updated = [...ncsList];
                              updated[idx].latency[1] = Number(e.target.value);
                              setNcsList(updated);
                            }}
                            className="w-full p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-center"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">
                          Amplitud Rango ({ncs.type === 'motor' ? 'mV' : 'μV'})
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={ncs.amplitude[0]}
                            onChange={(e) => {
                              const updated = [...ncsList];
                              updated[idx].amplitude[0] = Number(e.target.value);
                              setNcsList(updated);
                            }}
                            className="w-full p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-center"
                          />
                          <span>-</span>
                          <input
                            type="number"
                            step="0.1"
                            value={ncs.amplitude[1]}
                            onChange={(e) => {
                              const updated = [...ncsList];
                              updated[idx].amplitude[1] = Number(e.target.value);
                              setNcsList(updated);
                            }}
                            className="w-full p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-center"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">
                          Velocidad Rango (m/s)
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.5"
                            value={ncs.velocity[0]}
                            onChange={(e) => {
                              const updated = [...ncsList];
                              updated[idx].velocity[0] = Number(e.target.value);
                              setNcsList(updated);
                            }}
                            className="w-full p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-center"
                          />
                          <span>-</span>
                          <input
                            type="number"
                            step="0.5"
                            value={ncs.velocity[1]}
                            onChange={(e) => {
                              const updated = [...ncsList];
                              updated[idx].velocity[1] = Number(e.target.value);
                              setNcsList(updated);
                            }}
                            className="w-full p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs pt-1">
                      <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!ncs.conductionBlock}
                          onChange={(e) => {
                            const updated = [...ncsList];
                            updated[idx].conductionBlock = e.target.checked;
                            setNcsList(updated);
                          }}
                          className="rounded text-red-600"
                        />
                        <span>Bloqueo de Conducción</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!ncs.temporalDispersion}
                          onChange={(e) => {
                            const updated = [...ncsList];
                            updated[idx].temporalDispersion = e.target.checked;
                            setNcsList(updated);
                          }}
                          className="rounded text-yellow-600"
                        />
                        <span>Dispersión Temporal</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: EMG */}
          {activeTab === 'emg' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">
                  Músculos Explorados ({emgList.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddEmg}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Músculo</span>
                </button>
              </div>

              <div className="space-y-3">
                {emgList.map((emg, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={emg.muscle}
                          onChange={(e) => {
                            const updated = [...emgList];
                            updated[idx].muscle = e.target.value;
                            setEmgList(updated);
                          }}
                          className="font-bold text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Nervio"
                          value={emg.nerve}
                          onChange={(e) => {
                            const updated = [...emgList];
                            updated[idx].nerve = e.target.value;
                            setEmgList(updated);
                          }}
                          className="text-slate-300 bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg text-xs w-28"
                        />
                        <input
                          type="text"
                          placeholder="Raíz"
                          value={emg.root}
                          onChange={(e) => {
                            const updated = [...emgList];
                            updated[idx].root = e.target.value;
                            setEmgList(updated);
                          }}
                          className="text-slate-300 bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg text-xs w-20"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveEmg(idx)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Fibrilaciones</label>
                        <select
                          value={emg.fibrillations[0] || 'absent'}
                          onChange={(e) => {
                            const updated = [...emgList];
                            updated[idx].fibrillations = [e.target.value];
                            setEmgList(updated);
                          }}
                          className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                        >
                          <option value="absent">Ausente (Normal)</option>
                          <option value="1+">1+ (Leve)</option>
                          <option value="2+">2+ (Moderado)</option>
                          <option value="3+">3+ (Severo)</option>
                          <option value="4+">4+ (Muy Severo)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Ondas Agudas (PSW)</label>
                        <select
                          value={emg.positiveWaves[0] || 'absent'}
                          onChange={(e) => {
                            const updated = [...emgList];
                            updated[idx].positiveWaves = [e.target.value];
                            setEmgList(updated);
                          }}
                          className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                        >
                          <option value="absent">Ausente (Normal)</option>
                          <option value="1+">1+</option>
                          <option value="2+">2+</option>
                          <option value="3+">3+</option>
                          <option value="4+">4+</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Reclutamiento</label>
                        <select
                          value={emg.recruitment[0] || 'normal'}
                          onChange={(e) => {
                            const updated = [...emgList];
                            updated[idx].recruitment = [e.target.value];
                            setEmgList(updated);
                          }}
                          className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                        >
                          <option value="normal">Normal</option>
                          <option value="reduced">Reducido (Neurogénico)</option>
                          <option value="early">Precoz (Miopático)</option>
                          <option value="discrete">Discreto / Severo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">PUM Duración (ms)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={emg.duration[0]}
                            onChange={(e) => {
                              const updated = [...emgList];
                              updated[idx].duration[0] = Number(e.target.value);
                              setEmgList(updated);
                            }}
                            className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-center"
                          />
                          <span>-</span>
                          <input
                            type="number"
                            value={emg.duration[1]}
                            onChange={(e) => {
                              const updated = [...emgList];
                              updated[idx].duration[1] = Number(e.target.value);
                              setEmgList(updated);
                            }}
                            className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PRUEBAS ESPECIALES */}
          {activeTab === 'special' && (
            <div className="space-y-4">
              {/* ENR / RNS */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasRns}
                    onChange={(e) => setHasRns(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span className="font-bold text-white text-sm">
                    Incluir Estimulación Nerviosa Repetitiva (ENR / RNS)
                  </span>
                </label>

                {hasRns && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Nervio</label>
                      <input
                        type="text"
                        value={rnsNerve}
                        onChange={(e) => setRnsNerve(e.target.value)}
                        className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Músculo</label>
                      <input
                        type="text"
                        value={rnsMuscle}
                        onChange={(e) => setRnsMuscle(e.target.value)}
                        className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Rango de Decremento (%)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={rnsDecrementMin}
                          onChange={(e) => setRnsDecrementMin(Number(e.target.value))}
                          className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-center"
                        />
                        <span>a</span>
                        <input
                          type="number"
                          value={rnsDecrementMax}
                          onChange={(e) => setRnsDecrementMax(Number(e.target.value))}
                          className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Caso Trampa / Temperatura */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPitfall}
                    onChange={(e) => setIsPitfall(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Marcar como Caso Trampa / Variante Anatómica
                  </span>
                </label>

                {isPitfall && (
                  <div>
                    <label className="block text-slate-400 mb-1">
                      Explicación de la Trampa (Se mostrará tras resolver el caso)
                    </label>
                    <textarea
                      rows={3}
                      value={pitfallExplanation}
                      onChange={(e) => setPitfallExplanation(e.target.value)}
                      placeholder="⚠️ Cuidado con la anastomosis de Martin-Gruber..."
                      className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-400 mb-1">Temperatura Cutánea de Referencia (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={skinTemp}
                    onChange={(e) => setSkinTemp(Number(e.target.value))}
                    className="w-32 p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                  <span className="text-slate-500 text-[11px] ml-2">Valores &lt;32°C simularán hipotermia</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DIAGNÓSTICO & DIDÁCTICA */}
          {activeTab === 'pedagogy' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Explicación Fisiopatológica Completa *
                </label>
                <textarea
                  rows={4}
                  required
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explica detalladamente por qué los hallazgos electrodiagnósticos confirman este diagnóstico..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              {/* Diagnósticos Diferenciales */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">
                    Diagnósticos Diferenciales Didácticos ({differentials.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddDifferential}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    + Agregar Alternativa
                  </button>
                </div>

                <div className="space-y-2">
                  {differentials.map((diff, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={diff.name}
                          onChange={(e) => {
                            const updated = [...differentials];
                            updated[i].name = e.target.value;
                            setDifferentials(updated);
                          }}
                          placeholder="Nombre del diagnóstico diferencial"
                          className="font-bold text-amber-300 bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg text-xs w-full"
                        />
                        <button
                          type="button"
                          onClick={() => setDifferentials(differentials.filter((_, idx) => idx !== i))}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={diff.whyNot}
                        onChange={(e) => {
                          const updated = [...differentials];
                          updated[i].whyNot = e.target.value;
                          setDifferentials(updated);
                        }}
                        placeholder="¿Por qué este caso NO es este diagnóstico?"
                        className="text-slate-300 bg-slate-800/80 border border-slate-700 px-2 py-1 rounded-lg text-xs w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pistas y Recomendaciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Pistas Progresivas (1 por línea)
                  </label>
                  <textarea
                    rows={3}
                    value={hints}
                    onChange={(e) => setHints(e.target.value)}
                    placeholder="Pista 1: Revisa el nervio mediano vs cubital..."
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Recomendaciones Terapéuticas (1 por línea)
                  </label>
                  <textarea
                    rows={3}
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    placeholder="Ferulización nocturna de muñeca..."
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Notas técnicas (una por línea)
                </label>
                <textarea
                  rows={2}
                  value={technicalNotesText}
                  onChange={(e) => setTechnicalNotesText(e.target.value)}
                  placeholder="Temperatura cutánea 32 °C. Distancia palmar no estandarizada."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Caso Clínico'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
