import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  User,
  Users,
  Search,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';
import { getAdminProfiles } from '../../services/editorialService';
import type { AdminProfileRow } from '../../types/admin';
import type { AssignmentPriority } from '../../types/studentPlan';
import type { DiagnosticCategory } from '../../../ejercicios/src/types/ClinicalCase';
import {
  loadAllCaseTemplates,
  assignCaseToStudents,
  type CustomCaseTemplateRecord,
} from '../../services/emgExerciseService';
import { useAuth } from '../../contexts/AuthProvider';

interface AssignClinicalCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssigned?: () => void;
  initialCasePatternId?: string;
  initialStudentId?: string;
  initialStudentName?: string;
  profiles?: AdminProfileRow[];
}

export const AssignClinicalCaseModal: React.FC<AssignClinicalCaseModalProps> = ({
  isOpen,
  onClose,
  onAssigned,
  initialCasePatternId,
  initialStudentId,
  initialStudentName,
  profiles: initialProfiles,
}) => {
  const { user } = useAuth();

  // Alumnos
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [targetScope, setTargetScope] = useState<'single' | 'selected' | 'cohort'>(
    initialStudentId ? 'single' : 'selected'
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    initialStudentId ? new Set([initialStudentId]) : new Set()
  );
  const [studentSearch, setStudentSearch] = useState('');

  // Catálogo de Casos
  const [cases, setCases] = useState<CustomCaseTemplateRecord[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [caseSelectionType, setCaseSelectionType] = useState<'specific' | 'random_category'>(
    'specific'
  );
  const [selectedPatternId, setSelectedPatternId] = useState<string>(
    initialCasePatternId || ''
  );
  const [selectedCategory, setSelectedCategory] = useState<DiagnosticCategory | 'all'>('all');
  const [caseSearch, setCaseSearch] = useState('');
  const [caseUsageFilter, setCaseUsageFilter] = useState<'all' | 'exam_only' | 'practice'>('all');

  // Parámetros de la Asignación
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'exam' | 'study'>('exam');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(30);
  const [minScore, setMinScore] = useState<number>(70);
  const [priority, setPriority] = useState<AssignmentPriority>('normal');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(Date.now() + 7 * 86400000);
    return d.toISOString().slice(0, 16);
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar perfiles y casos al abrir
  useEffect(() => {
    if (!isOpen) return;

    if (initialProfiles && initialProfiles.length > 0) {
      setProfiles(initialProfiles.filter(p => !p.roles || p.roles.includes('student') || p.roles.includes('verified') || p.roles.length === 0));
    } else {
      setLoadingProfiles(true);
      getAdminProfiles(false, 'all')
        .then(res => setProfiles(res.filter(p => !p.roles || p.roles.includes('student') || p.roles.includes('verified') || p.roles.length === 0)))
        .catch(e => console.error(e))
        .finally(() => setLoadingProfiles(false));
    }

    setLoadingCases(true);
    loadAllCaseTemplates()
      .then(res => {
        setCases(res.templates);
        if (!selectedPatternId && res.templates.length > 0) {
          const first = initialCasePatternId
            ? res.templates.find(c => c.patternId === initialCasePatternId) || res.templates[0]
            : res.templates[0];
          setSelectedPatternId(first.patternId);
          setTitle(`Caso Clínico EMG: ${first.patternName}`);
          setDescription(`Resolución del caso clínico interactivo sobre ${first.patternName}.`);
        }
      })
      .catch(e => console.error(e))
      .finally(() => setLoadingCases(false));
  }, [isOpen, initialCasePatternId, initialProfiles]);

  // Actualizar título al cambiar de caso
  useEffect(() => {
    if (caseSelectionType === 'specific' && selectedPatternId) {
      const c = cases.find(item => item.patternId === selectedPatternId);
      if (c) {
        setTitle(`Caso Clínico EMG: ${c.patternName}`);
        setDescription(`Resolución del caso clínico interactivo sobre ${c.patternName}. Interpreta conducciones nerviosas y electromiografía.`);
      }
    } else if (caseSelectionType === 'random_category') {
      setTitle(`Caso Clínico EMG: Categoría ${selectedCategory.toUpperCase()}`);
      setDescription(`Caso clínico aleatorio de la categoría ${selectedCategory}. Demuestra tu razonamiento electrodiagnóstico.`);
    }
  }, [selectedPatternId, caseSelectionType, selectedCategory, cases]);

  if (!isOpen) return null;

  // Filtrado de alumnos
  const filteredStudents = profiles.filter(p => {
    if (!studentSearch.trim()) return true;
    const term = studentSearch.toLowerCase();
    const name = (p.display_name || '').toLowerCase();
    const email = (p.email || '').toLowerCase();
    const sub = (p.subspecialty || '').toLowerCase();
    return name.includes(term) || email.includes(term) || sub.includes(term);
  });

  const toggleStudent = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudentIds(next);
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.size === filteredStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map(p => p.id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let targetIds: string[] = [];
    if (targetScope === 'single') {
      if (!initialStudentId) {
        setErrorMsg('No se especificó alumno destinatario.');
        return;
      }
      targetIds = [initialStudentId];
    } else if (targetScope === 'cohort') {
      targetIds = profiles.map(p => p.id);
    } else {
      targetIds = Array.from(selectedStudentIds);
    }

    if (targetIds.length === 0) {
      setErrorMsg('Debes seleccionar al menos un alumno destinatario.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('El título de la asignación es requerido.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await assignCaseToStudents({
        studentIds: targetIds,
        title,
        description,
        patternId: caseSelectionType === 'specific' ? selectedPatternId : undefined,
        category: caseSelectionType === 'random_category' ? selectedCategory : undefined,
        mode,
        timeLimitMinutes: mode === 'exam' ? timeLimitMinutes : undefined,
        dueDate: new Date(dueDate).toISOString(),
        minScore,
        priority,
        assignedBy: user?.id,
      });

      if (res.success) {
        if (onAssigned) onAssigned();
        onClose();
      } else {
        setErrorMsg(res.error || 'No se pudo crear la asignación');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Asignar Caso Clínico EMG a Alumnos
              </h3>
              <p className="text-xs text-slate-400">
                Envía una práctica o evaluación de electromiografía directamente al portal del alumno
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Selección de Destinatarios */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> 1. Destinatarios
              </span>
              {!initialStudentId && (
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setTargetScope('selected')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                      targetScope === 'selected' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Selección Manual ({selectedStudentIds.size})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetScope('cohort')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                      targetScope === 'cohort' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Toda la Cohorte ({profiles.length})
                  </button>
                </div>
              )}
            </div>

            {targetScope === 'single' ? (
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-white font-medium">
                <User className="w-4 h-4 text-emerald-400" />
                <span>{initialStudentName || 'Alumno seleccionado'}</span>
              </div>
            ) : targetScope === 'cohort' ? (
              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-800/40 text-indigo-300 text-xs flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Se creará una asignación individual para cada uno de los {profiles.length} alumnos registrados en el curso.</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Buscar alumno por nombre, email o especialidad..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAllStudents}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs whitespace-nowrap cursor-pointer"
                  >
                    {selectedStudentIds.size === filteredStudents.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                  </button>
                </div>

                {loadingProfiles ? (
                  <div className="py-4 text-center text-slate-500 text-xs">Cargando alumnos acreditados...</div>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {filteredStudents.map(student => {
                      const isSelected = selectedStudentIds.has(student.id);
                      return (
                        <div
                          key={student.id}
                          onClick={() => toggleStudent(student.id)}
                          className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-950/40 border-indigo-500 text-white'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-indigo-600"
                            />
                            <span className="font-semibold">{student.display_name || 'Sin nombre'}</span>
                            <span className="text-[10px] text-slate-500">({student.email})</span>
                          </div>
                          {student.subspecialty && (
                            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              {student.subspecialty}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Selección de Caso Clínico */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" /> 2. Caso Clínico a Resolver
              </span>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="caseType"
                    checked={caseSelectionType === 'specific'}
                    onChange={() => setCaseSelectionType('specific')}
                  />
                  <span>Caso Específico</span>
                </label>
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="caseType"
                    checked={caseSelectionType === 'random_category'}
                    onChange={() => setCaseSelectionType('random_category')}
                  />
                  <span>Aleatorio por Categoría</span>
                </label>
              </div>
            </div>

            {caseSelectionType === 'specific' ? (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={caseSearch}
                      onChange={(e) => setCaseSearch(e.target.value)}
                      placeholder="Filtrar casos clínicos..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <select
                    value={caseUsageFilter}
                    onChange={(e) => setCaseUsageFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium outline-none"
                  >
                    <option value="all">Todos los Casos</option>
                    <option value="exam_only">🎓 Banco de Examen</option>
                    <option value="practice">📖 Práctica Libre</option>
                  </select>
                </div>

                {loadingCases ? (
                  <div className="py-2 text-center text-slate-500 text-xs">Cargando catálogo de casos...</div>
                ) : (
                  <select
                    value={selectedPatternId}
                    onChange={(e) => setSelectedPatternId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {cases
                      .filter(c => {
                        const matchesText =
                          !caseSearch ||
                          c.patternName.toLowerCase().includes(caseSearch.toLowerCase()) ||
                          c.category.includes(caseSearch.toLowerCase());
                        const matchesUsage =
                          caseUsageFilter === 'all' ||
                          (caseUsageFilter === 'exam_only'
                            ? c.usageMode === 'exam_only' || c.usageMode === 'both'
                            : c.usageMode === 'practice' || c.usageMode === 'both' || !c.usageMode);
                        return matchesText && matchesUsage;
                      })
                      .map(c => {
                        const usagePrefix =
                          c.usageMode === 'exam_only'
                            ? '🎓 [EXAMEN]'
                            : c.usageMode === 'both'
                            ? '🔄 [HÍBRIDO]'
                            : '📖 [PRÁCTICA]';
                        return (
                          <option key={c.patternId} value={c.patternId}>
                            {usagePrefix} [{c.category.toUpperCase()}] {c.patternName} {c.isPitfall ? '⚠️ (Trampa)' : ''}
                          </option>
                        );
                      })}
                  </select>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Categoría Clínica</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="all">Cualquier Categoría</option>
                    <option value="entrapment">Atrapamiento Focal (STC, Cubital, Peroneo)</option>
                    <option value="radiculopathy">Radiculopatías (L5, S1, C5-C7)</option>
                    <option value="axonal">Neuropatías Axonales</option>
                    <option value="demyelinating">Neuropatías Desmielinizantes (GBS, CIDP)</option>
                    <option value="myopathic">Miopatías</option>
                    <option value="motor_neuron_disease">Enfermedad de Motoneurona (ELA, MMN)</option>
                    <option value="neuromuscular_junction">Unión Neuromuscular (MG, LEMS)</option>
                    <option value="pitfall">⚠️ Casos Trampa y Variantes</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 3. Modalidad y Reglas de Evaluación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <span className="font-bold text-slate-300 text-xs uppercase tracking-wider block">
                3. Modalidad de Entrega
              </span>

              <div className="space-y-2">
                <label className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                  mode === 'exam'
                    ? 'bg-purple-950/40 border-purple-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === 'exam'}
                    onChange={() => setMode('exam')}
                  />
                  <div>
                    <strong className="block text-xs text-white">Modo Examen Calificado</strong>
                    <span className="text-[11px] text-slate-400">Sin pistas visibles, tiempo cronometrado y calificación final directa.</span>
                  </div>
                </label>

                <label className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                  mode === 'study'
                    ? 'bg-indigo-950/40 border-indigo-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === 'study'}
                    onChange={() => setMode('study')}
                  />
                  <div>
                    <strong className="block text-xs text-white">Modo Formativo con Pistas</strong>
                    <span className="text-[11px] text-slate-400">El alumno puede consultar pistas progresivas antes de emitir diagnóstico.</span>
                  </div>
                </label>
              </div>

              {mode === 'exam' && (
                <div className="pt-1">
                  <label className="block text-slate-400 text-[11px] mb-1">Tiempo Límite (minutos)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    className="w-28 p-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-center font-mono"
                  />
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <span className="font-bold text-slate-300 text-xs uppercase tracking-wider block">
                4. Plazos y Calificación
              </span>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Fecha y Hora Límite de Entrega</label>
                <input
                  type="datetime-local"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Calificación Mínima (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-center"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Prioridad</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

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
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Enviando Asignación...' : 'Asignar Caso a Alumnos'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
