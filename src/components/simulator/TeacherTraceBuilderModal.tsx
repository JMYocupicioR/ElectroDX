// src/components/simulator/TeacherTraceBuilderModal.tsx
// Estudio visual docente para crear, calibrar y previsualizar simuladores de trazo EMG/NCV

import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Plus,
  Activity,
  Move,
} from 'lucide-react';
import { getAllTracesMerged, findTraceById } from './traceEngine/customTraceStore';
import type { TraceStudyType, NeedlePattern, TraceCaseDefinition } from './traceEngine/types';
import { TraceOscilloscope } from './traceEngine/TraceOscilloscope';
import { TraceTelemetry } from './traceEngine/TraceTelemetry';
import { WaveformSculptorModal } from './traceEngine/WaveformSculptorModal';

interface TeacherTraceBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTrace?: (markdownSnippet: string) => void;
  topicTitle?: string;
}

export const TeacherTraceBuilderModal: React.FC<TeacherTraceBuilderModalProps> = ({
  isOpen,
  onClose,
  onInsertTrace,
  topicTitle,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('median-cts');
  const [customMode, setCustomMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSculptorOpen, setIsSculptorOpen] = useState(false);
  const [tracesVersion, setTracesVersion] = useState(0);

  // Estados de personalización manual
  const [studyType, setStudyType] = useState<TraceStudyType>('motor');
  const [title, setTitle] = useState('Caso Personalizado de Conducción Motora');
  const [nerveOrMuscle, setNerveOrMuscle] = useState('Nervio Mediano');
  const [latency, setLatency] = useState(5.4);
  const [amplitude, setAmplitude] = useState(4.2);
  const [velocity, setVelocity] = useState(38);
  const [duration, setDuration] = useState(7.2);
  const [conductionBlock, setConductionBlock] = useState(false);
  const [temporalDispersion, setTemporalDispersion] = useState(false);
  const [needlePattern, setNeedlePattern] = useState<NeedlePattern>('fibrillations');
  const [previewPathologic, setPreviewPathologic] = useState(true);

  const allPresets = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    tracesVersion;
    return getAllTracesMerged();
  }, [tracesVersion]);

  // Cargar preset al cambiar selección
  const handleSelectPreset = (id: string) => {
    setSelectedPresetId(id);
    const p = findTraceById(id);
    if (p) {
      setStudyType(p.studyType);
      setTitle(p.title);
      setNerveOrMuscle(p.nerveOrMuscle);
      if (p.pathologic) {
        setLatency(p.pathologic.latency);
        setAmplitude(p.pathologic.amplitude);
        setVelocity(p.pathologic.velocity ?? 50);
        setDuration(p.pathologic.duration);
        setConductionBlock(!!p.pathologic.conductionBlock);
        setTemporalDispersion(!!p.pathologic.temporalDispersion);
        if (p.pathologic.needlePattern) setNeedlePattern(p.pathologic.needlePattern);
      }
    }
  };

  // Objeto caso simulado para previsualización
  const previewCase: TraceCaseDefinition = useMemo(() => {
    if (!customMode) {
      const p = findTraceById(selectedPresetId);
      if (p) return p;
    }

    const isPath = latency > 4.2 || amplitude < 4.0 || conductionBlock || temporalDispersion;

    return {
      id: 'custom-teacher-trace',
      title,
      category: 'entrapment',
      studyType,
      nerveOrMuscle,
      technique: 'Registro calibrado para docencia clínica',
      sensitivity: studyType === 'sensory' ? '10 µV / div' : studyType === 'needle' ? '50 µV / div' : '2 mV / div',
      sweepSpeed: studyType === 'sensory' ? '1 ms / div' : studyType === 'needle' ? '10 ms / div' : '2 ms / div',
      normal: {
        label: 'Trazado Normal de Referencia',
        latency: 3.4,
        amplitude: 9.0,
        duration: 5.2,
        velocity: 56.0,
        status: 'normal',
        statusText: 'Dentro de límites fisiológicos',
        summary: 'Morfología conservada sin dispersión ni retraso de conducción.',
        normative: {
          latencyNorm: studyType === 'motor' ? '< 4.0 ms' : '< 3.5 ms',
          amplitudeNorm: studyType === 'motor' ? '> 4.5 mV' : '> 10 µV',
          velocityNorm: '> 50 m/s',
        },
      },
      pathologic: {
        label: title,
        latency,
        amplitude,
        duration,
        velocity,
        conductionBlock,
        temporalDispersion,
        needlePattern: studyType === 'needle' ? needlePattern : undefined,
        status: isPath ? 'abnormal' : 'normal',
        statusText: isPath ? 'Patrón Electrodiagnóstico Alterado' : 'Fisiológico',
        summary: `Parámetros ajustados por el docente para correlación clínica. ${
          conductionBlock ? 'Bloqueo de conducción evidente. ' : ''
        }${temporalDispersion ? 'Dispersión temporal patológica. ' : ''}`,
        normative: {
          latencyNorm: studyType === 'motor' ? '< 4.0 ms' : '< 3.5 ms',
          amplitudeNorm: studyType === 'motor' ? '> 4.5 mV' : '> 10 µV',
          velocityNorm: '> 50 m/s',
        },
      },
    };
  }, [
    customMode,
    selectedPresetId,
    title,
    studyType,
    nerveOrMuscle,
    latency,
    amplitude,
    duration,
    velocity,
    conductionBlock,
    temporalDispersion,
    needlePattern,
  ]);

  // Generar snippet Markdown
  const markdownSnippet = useMemo(() => {
    if (!customMode) {
      return `\n\n:::emg-trace{preset="${selectedPresetId}" mode="comparison"}:::\n\n`;
    }
    return `\n\n:::emg-trace{type="${studyType}" nerve="${nerveOrMuscle}" title="${title}" latency=${latency} amplitude=${amplitude} velocity=${velocity} duration=${duration} pathologic=true}:::\n\n`;
  }, [
    customMode,
    selectedPresetId,
    studyType,
    nerveOrMuscle,
    title,
    latency,
    amplitude,
    velocity,
    duration,
  ]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(markdownSnippet.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleInsert = () => {
    if (onInsertTrace) {
      onInsertTrace(markdownSnippet);
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentParams = previewPathologic && previewCase.pathologic ? previewCase.pathologic : previewCase.normal;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-5xl rounded-2xl border border-slate-700 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* Cabecera del Modal */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Estudio Docente: Simulador de Trazos EMG
                </h3>
                <p className="text-xs text-slate-400">
                  {topicTitle ? `Incrustar en: ${topicTitle}` : 'Configura y previsualiza trazos para los temas'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Contenido dividido en 2 columnas: Configuración y Previsualización */}
          <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            {/* Columna Izquierda: Configuración del Docente */}
            <div className="p-4 sm:p-5 lg:col-span-5 space-y-4">
              {/* Selector de Modo: Preset vs Personalizado */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Modo de Creación
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSculptorOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-300 hover:text-purple-200 transition"
                  >
                    <Move className="h-3 w-3" />
                    <span>Esculpir con Nodos Bézier</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setCustomMode(false)}
                    className={`py-1.5 rounded-lg transition ${
                      !customMode ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Plantillas y Casos Guardados
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomMode(true)}
                    className={`py-1.5 rounded-lg transition ${
                      customMode ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Ajuste por Deslizadores
                  </button>
                </div>
              </div>

              {!customMode ? (
                /* Menú de Presets Clínicos */
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Selecciona un Trazo o Plantilla
                    </label>
                    <select
                      value={selectedPresetId}
                      onChange={(e) => handleSelectPreset(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                    >
                      {allPresets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.isCustomUserCreated ? '⭐ [Docente] ' : ''}{p.title} ({p.studyType === 'motor' ? 'Motor' : p.studyType === 'sensory' ? 'Sensitivo' : 'Aguja'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-1.5 text-slate-300">
                    <div className="font-semibold text-cyan-300">{previewCase.nerveOrMuscle}</div>
                    <div className="text-[11px] text-slate-400">{previewCase.technique}</div>
                    <div className="text-[11px] text-slate-400">
                      Sensibilidad: {previewCase.sensitivity} · Barrido: {previewCase.sweepSpeed}
                    </div>
                    {previewCase.images && previewCase.images.length > 0 && (
                      <div className="text-[11px] text-emerald-400 font-medium pt-1">
                        ✓ Incluye {previewCase.images.length} imágenes complementarias (ecografía / técnica)
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Controles Manuales con Sliders */
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Modalidad</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['motor', 'sensory', 'needle'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setStudyType(t)}
                          className={`rounded-lg py-1 px-2 text-center text-xs font-semibold capitalize border transition ${
                            studyType === t
                              ? 'border-cyan-400 bg-cyan-950/80 text-cyan-300'
                              : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          {t === 'motor' ? 'Motor CMAP' : t === 'sensory' ? 'SNAP Sensitivo' : 'Aguja EMG'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Título del Trazado</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                      placeholder="Ej. Síndrome del Túnel Carpiano Severo"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Nervio o Músculo</label>
                    <input
                      type="text"
                      value={nerveOrMuscle}
                      onChange={(e) => setNerveOrMuscle(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                      placeholder="Ej. Nervio Mediano (C8-T1)"
                    />
                  </div>

                  {studyType !== 'needle' ? (
                    <>
                      {/* Latencia Distal Slider */}
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Latencia Distal</span>
                          <span className="font-mono text-cyan-300 font-bold">{latency.toFixed(1)} ms</span>
                        </div>
                        <input
                          type="range"
                          min="1.5"
                          max="12.0"
                          step="0.1"
                          value={latency}
                          onChange={(e) => setLatency(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400"
                        />
                      </div>

                      {/* Amplitud Pico Slider */}
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Amplitud Pico</span>
                          <span className="font-mono text-cyan-300 font-bold">
                            {amplitude.toFixed(1)} {studyType === 'sensory' ? 'µV' : 'mV'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={studyType === 'sensory' ? 1 : 0.2}
                          max={studyType === 'sensory' ? 45 : 18}
                          step={studyType === 'sensory' ? 1 : 0.2}
                          value={amplitude}
                          onChange={(e) => setAmplitude(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400"
                        />
                      </div>

                      {/* Velocidad de Conducción Slider */}
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Velocidad de Conducción (VCN)</span>
                          <span className="font-mono text-cyan-300 font-bold">{velocity} m/s</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="75"
                          step="1"
                          value={velocity}
                          onChange={(e) => setVelocity(parseInt(e.target.value, 10))}
                          className="w-full accent-cyan-400"
                        />
                      </div>

                      {/* Duración Slider */}
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>Duración del Potencial</span>
                          <span className="font-mono text-cyan-300 font-bold">{duration.toFixed(1)} ms</span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="20.0"
                          step="0.2"
                          value={duration}
                          onChange={(e) => setDuration(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400"
                        />
                      </div>

                      {/* Checkboxes de Hallazgos Desmielinizantes */}
                      {studyType === 'motor' && (
                        <div className="space-y-1.5 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={conductionBlock}
                              onChange={(e) => setConductionBlock(e.target.checked)}
                              className="rounded border-slate-700 bg-slate-900 text-cyan-500 accent-cyan-500"
                            />
                            <span className="text-slate-300">Bloqueo de Conducción Proximal (&gt; 50% caída)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={temporalDispersion}
                              onChange={(e) => setTemporalDispersion(e.target.checked)}
                              className="rounded border-slate-700 bg-slate-900 text-cyan-500 accent-cyan-500"
                            />
                            <span className="text-slate-300">Dispersión Temporal (&gt; 30% duración)</span>
                          </label>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Selector de Patrón de Aguja */
                    <div>
                      <label className="text-slate-300 block mb-1">Patrón de Actividad Espontánea / PUM</label>
                      <select
                        value={needlePattern}
                        onChange={(e) => setNeedlePattern(e.target.value as NeedlePattern)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                      >
                        <option value="fibrillations">Fibrilaciones (Denervación activa)</option>
                        <option value="positive_waves">Ondas Agudas Positivas (PSW)</option>
                        <option value="myotonia">Descargas Miotónicas ("Dive Bomber")</option>
                        <option value="fasciculations">Fasciculaciones (Enfermedad de Motoneurona)</option>
                        <option value="neurogenic_mup">PUM Neurogenico (Polifásico, gran amplitud)</option>
                        <option value="myopathic_mup">PUM Miopático (Pequeña amplitud, breve)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Columna Derecha: Previsualización en Vivo del Osciloscopio */}
            <div className="p-4 sm:p-5 lg:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-300">Previsualización en Pantalla CRT</span>
                  </div>
                  <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setPreviewPathologic(false)}
                      className={`px-2.5 py-0.5 rounded-md transition ${
                        !previewPathologic ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewPathologic(true)}
                      className={`px-2.5 py-0.5 rounded-md transition ${
                        previewPathologic ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Patológico
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-3">
                  <TraceOscilloscope
                    traceParams={currentParams}
                    studyType={previewCase.studyType}
                    sensitivity={previewCase.sensitivity}
                    sweepSpeed={previewCase.sweepSpeed}
                    isPathologic={previewPathologic}
                    height={230}
                  />
                </div>

                <div className="mt-3">
                  <TraceTelemetry
                    traceParams={currentParams}
                    studyType={previewCase.studyType}
                    isPathologic={previewPathologic}
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? '¡Directiva Copiada!' : 'Copiar Directiva Markdown'}</span>
                </button>

                {onInsertTrace && (
                  <button
                    type="button"
                    onClick={handleInsert}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-teal-400 shadow-md transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Incrustar en el Contenido del Tema</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Escultor de Morfología para esculpir nodos */}
      <WaveformSculptorModal
        isOpen={isSculptorOpen}
        onClose={() => setIsSculptorOpen(false)}
        initialCase={previewCase}
        onTraceSaved={(savedCase) => {
          setTracesVersion((v) => v + 1);
          setCustomMode(false);
          setSelectedPresetId(savedCase.id);
          setIsSculptorOpen(false);
        }}
      />
    </>
  );
};
