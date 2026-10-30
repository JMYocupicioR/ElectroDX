import { useState, useEffect } from 'react';
import {
  PUM_CASE_DEFINITIONS,
  getCaseDefinition,
  getFactoryCaseDefinition,
  type PumCaseOverride,
} from './cases';
import { CASE_MARKERS } from './synthesizeMuap';
import { savePumCaseOverride, resetPumCaseOverride } from '../../../services/pumLabCaseService';
import { PumMorphologyLab } from './PumMorphologyLab';
import type { PumPatternType } from './types';
import {
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Copy,
  Check,
  Eye,
  Info,
} from 'lucide-react';

const PATTERN_OPTIONS: { id: PumPatternType; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'chronic_neurogenic', label: 'Neurogénico crónico' },
  { id: 'myopathic', label: 'Miopático' },
  { id: 'polyphasic', label: 'Polifásico' },
];

export function PumCaseEditorModal({
  isOpen,
  onClose,
  initialCaseId = 'biceps-normal',
}: {
  isOpen: boolean;
  onClose: () => void;
  initialCaseId?: string;
}) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(initialCaseId);
  const [muscleName, setMuscleName] = useState('');
  const [patternType, setPatternType] = useState<PumPatternType>('normal');
  const [durationMin, setDurationMin] = useState<number>(8);
  const [durationMax, setDurationMax] = useState<number>(13);
  const [ampMin, setAmpMin] = useState<number>(400);
  const [ampMax, setAmpMax] = useState<number>(2000);
  const [maxTurns, setMaxTurns] = useState<number>(2);
  const [noiseSigma, setNoiseSigma] = useState<number>(2.4);

  // Marcadores de referencia
  const [startMs, setStartMs] = useState<number>(32);
  const [endMs, setEndMs] = useState<number>(42);
  const [posMs, setPosMs] = useState<number>(32.6);
  const [negMs, setNegMs] = useState<number>(32.9);

  // Escala osciloscopio
  const [uvPerDiv, setUvPerDiv] = useState<number>(200);
  const [msPerDiv, setMsPerDiv] = useState<number>(10);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);

  // Sincronizar campos cuando se cambia de caso
  useEffect(() => {
    if (!isOpen) return;
    const currentDef = getCaseDefinition(selectedCaseId);
    if (!currentDef) return;

    setMuscleName(currentDef.muscleName);
    setPatternType(currentDef.docentBand.patternType);
    setDurationMin(currentDef.docentBand.durationRange[0]);
    setDurationMax(currentDef.docentBand.durationRange[1]);
    setAmpMin(currentDef.docentBand.amplitudeRange[0]);
    setAmpMax(currentDef.docentBand.amplitudeRange[1]);
    setMaxTurns(currentDef.docentBand.maxTurns);
    setNoiseSigma(currentDef.noiseSigma ?? (selectedCaseId === 'biceps-distant' ? 4.0 : 2.4));

    const markers = currentDef.markers ?? CASE_MARKERS[selectedCaseId] ?? {
      startMs: 32,
      endMs: 42,
      posMs: 32.6,
      negMs: 32.9,
    };
    setStartMs(markers.startMs);
    setEndMs(markers.endMs);
    setPosMs(markers.posMs);
    setNegMs(markers.negMs);

    setUvPerDiv(currentDef.uvPerDiv);
    setMsPerDiv(currentDef.msPerDiv);
    setSaveSuccess(null);
    setSaveError(null);
  }, [selectedCaseId, isOpen]);

  if (!isOpen) return null;

  const directiveSnippet = `:::pum-lab{case="${selectedCaseId}" mode="guided"}:::`;

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(directiveSnippet);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch {
      // Ignorar fallback
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    const override: PumCaseOverride = {
      muscleName: muscleName.trim(),
      uvPerDiv: Number(uvPerDiv),
      msPerDiv: Number(msPerDiv),
      noiseSigma: Number(noiseSigma),
      docentBand: {
        patternType,
        durationRange: [Number(durationMin), Number(durationMax)],
        amplitudeRange: [Number(ampMin), Number(ampMax)],
        maxTurns: Number(maxTurns),
      },
      markers: {
        startMs: Number(startMs),
        endMs: Number(endMs),
        posMs: Number(posMs),
        negMs: Number(negMs),
      },
    };

    try {
      const storageUsed = await savePumCaseOverride(selectedCaseId, override);
      setSaveSuccess(
        storageUsed === 'supabase'
          ? '¡Ajustes guardados en la nube para todos los alumnos!'
          : 'Ajustes guardados localmente (disponibles en este navegador).'
      );
      setPreviewVersion((v) => v + 1);
    } catch (e: any) {
      setSaveError(e?.message || 'Error al guardar los ajustes.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToFactory = async () => {
    if (!confirm(`¿Restaurar "${selectedCaseId}" a los valores de fábrica?`)) return;
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);
    try {
      await resetPumCaseOverride(selectedCaseId);
      const factory = getFactoryCaseDefinition(selectedCaseId);
      if (factory) {
        setMuscleName(factory.muscleName);
        setPatternType(factory.docentBand.patternType);
        setDurationMin(factory.docentBand.durationRange[0]);
        setDurationMax(factory.docentBand.durationRange[1]);
        setAmpMin(factory.docentBand.amplitudeRange[0]);
        setAmpMax(factory.docentBand.amplitudeRange[1]);
        setMaxTurns(factory.docentBand.maxTurns);
        setNoiseSigma(selectedCaseId === 'biceps-distant' ? 4.0 : 2.4);

        const m = CASE_MARKERS[selectedCaseId];
        if (m) {
          setStartMs(m.startMs);
          setEndMs(m.endMs);
          setPosMs(m.posMs);
          setNegMs(m.negMs);
        }
        setUvPerDiv(factory.uvPerDiv);
        setMsPerDiv(factory.msPerDiv);
      }
      setSaveSuccess('Caso restaurado a los valores estándar de fábrica.');
      setPreviewVersion((v) => v + 1);
    } catch (e: any) {
      setSaveError(e?.message || 'Error al restaurar el caso.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Encabezado */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-sm">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Configurar y Calibrar Caso del Laboratorio PUM</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Modo Docente
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajusta las bandas normativas, ruido y marcadores patrón con los que se califica al alumno.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo con 2 columnas (Ajustes y Vista previa) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Formulario de Calibración */}
          <div className="lg:col-span-5 space-y-4">
            {/* Selector de caso */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Caso a Modificar:
              </label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PUM_CASE_DEFINITIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} ({c.muscleName})
                  </option>
                ))}
              </select>
            </div>

            {/* Nombre del músculo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Músculo clínico:
              </label>
              <input
                type="text"
                value={muscleName}
                onChange={(e) => setMuscleName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Clasificación diagnóstica docente */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Patrón diagnóstico oficial:
              </label>
              <select
                value={patternType}
                onChange={(e) => setPatternType(e.target.value as PumPatternType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PATTERN_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rangos normativos Banda Docente */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                Banda Normativa Docente (Valores de Aceptación)
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500">Duración Min (ms):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={durationMin}
                    onChange={(e) => setDurationMin(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Duración Max (ms):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={durationMax}
                    onChange={(e) => setDurationMax(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500">Amplitud Min (µV):</label>
                  <input
                    type="number"
                    step="50"
                    value={ampMin}
                    onChange={(e) => setAmpMin(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Amplitud Max (µV):</label>
                  <input
                    type="number"
                    step="50"
                    value={ampMax}
                    onChange={(e) => setAmpMax(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500">Giros Máximos:</label>
                  <input
                    type="number"
                    value={maxTurns}
                    onChange={(e) => setMaxTurns(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Ruido Base (σ en µV):</label>
                  <input
                    type="number"
                    step="0.2"
                    value={noiseSigma}
                    onChange={(e) => setNoiseSigma(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Marcadores de Referencia Ground Truth */}
            <div className="p-3 rounded-2xl border border-indigo-200/70 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
              <span className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                Marcadores Patrón del Potencial (ms)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500">Inicio (ms):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={startMs}
                    onChange={(e) => setStartMs(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Fin (ms):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={endMs}
                    onChange={(e) => setEndMs(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Pico Pos (+) (ms):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={posMs}
                    onChange={(e) => setPosMs(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Pico Neg (-) (ms):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={negMs}
                    onChange={(e) => setNegMs(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Directiva para copiar en Temas */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-2">
              <div className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 select-all truncate">
                {directiveSnippet}
              </div>
              <button
                type="button"
                onClick={handleCopySnippet}
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition cursor-pointer"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Columna Derecha: Vista Previa Interactiva en Tiempo Real */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-cyan-500" />
                Vista Previa del Laboratorio para el Alumno
              </span>
              <span className="text-[10px] text-slate-400">
                Responde en tiempo real a tus calibraciones
              </span>
            </div>

            <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-2 sm:p-3 overflow-hidden shadow-inner">
              <PumMorphologyLab
                key={`${selectedCaseId}-${previewVersion}`}
                caseId={selectedCaseId}
                mode="guided"
                compact
              />
            </div>
          </div>
        </div>

        {/* Notificaciones y Barra de Acciones */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/80">
          <div className="text-xs">
            {saveSuccess && (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {saveSuccess}
              </span>
            )}
            {saveError && (
              <span className="text-rose-600 dark:text-rose-400 font-bold inline-flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {saveError}
              </span>
            )}
            {!saveSuccess && !saveError && (
              <span className="text-slate-400 text-[11px] inline-flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Los cambios se aplican automáticamente en los módulos donde esté incrustado el caso.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              disabled={saving}
              onClick={handleResetToFactory}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Fábrica</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Guardando…' : 'Guardar Calibración'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
