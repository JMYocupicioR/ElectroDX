// src/components/simulator/traceEngine/WaveformSculptorModal.tsx
// Editor interactivo de morfología de trazo con nodos de control Bézier arrastrables y guardado

import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Move,
  Activity,
} from 'lucide-react';
import type {
  TraceCaseDefinition,
  WaveformControlPoint,
  TraceStudyType,
} from './types';
import { computeGeometry, calculateMetricsFromControlPoints } from './signalMath';
import { saveCustomTrace } from './customTraceStore';

interface WaveformSculptorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTraceSaved?: (newCase: TraceCaseDefinition) => void;
  initialCase?: TraceCaseDefinition;
}

const DEFAULT_POINTS: WaveformControlPoint[] = [
  { id: 'pt-onset', timeMs: 3.4, voltage: 0, type: 'onset', label: 'Onset (Inicio)' },
  { id: 'pt-peak', timeMs: 5.0, voltage: 9.2, type: 'peak', label: 'Pico Negativo' },
  { id: 'pt-trough', timeMs: 7.2, voltage: -3.8, type: 'trough', label: 'Rebote Positivo' },
  { id: 'pt-return', timeMs: 9.0, voltage: 0, type: 'return', label: 'Retorno Línea Base' },
];

export const WaveformSculptorModal: React.FC<WaveformSculptorModalProps> = ({
  isOpen,
  onClose,
  onTraceSaved,
  initialCase,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Metadatos del caso
  const [caseTitle, setCaseTitle] = useState(
    initialCase?.title ? `${initialCase.title} (Personalizado)` : 'Nuevo Trazo Morfológico Personalizado'
  );
  const [nerveOrMuscle, setNerveOrMuscle] = useState(
    initialCase?.nerveOrMuscle || 'Nervio Mediano Motor'
  );
  const [studyType, setStudyType] = useState<TraceStudyType>(initialCase?.studyType || 'motor');
  const [technique, setTechnique] = useState(
    initialCase?.technique || 'Registro con morfología esculpida por el docente'
  );
  const [summary, setSummary] = useState(
    'Trazado con morfología y puntos de referencia calibrados manualmente.'
  );

  // Puntos de control de la curva
  const [controlPoints, setControlPoints] = useState<WaveformControlPoint[]>(() => {
    if (initialCase?.pathologic?.customWaveform?.points) {
      return initialCase.pathologic.customWaveform.points;
    }
    return DEFAULT_POINTS;
  });

  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Dimensiones del osciloscopio
  const geo = useMemo(() => computeGeometry(studyType, '2 ms / div', '2 mV / div', 600, 280), [studyType]);
  const ampScale = (geo.plotHeight * 0.52) / Math.max(0.1, geo.maxAmpDisplay);
  const msPerPixel = geo.timeWindowMs / geo.plotWidth;

  // Métricas calculadas en tiempo real de los puntos
  const metrics = useMemo(
    () => calculateMetricsFromControlPoints(controlPoints),
    [controlPoints]
  );

  // Mapear punto a píxeles
  const pointToPixel = (pt: WaveformControlPoint) => {
    const x = geo.paddingLeft + (pt.timeMs / geo.timeWindowMs) * geo.plotWidth;
    const y = geo.baselineY - pt.voltage * ampScale;
    return { x, y };
  };

  // Convertir píxeles a tiempo y voltaje
  const pixelToValues = (x: number, y: number) => {
    const clampedX = Math.max(geo.paddingLeft, Math.min(geo.width - geo.paddingRight, x));
    const clampedY = Math.max(geo.paddingTop, Math.min(geo.height - geo.paddingBottom, y));

    const timeMs = parseFloat(((clampedX - geo.paddingLeft) * msPerPixel).toFixed(1));
    const voltage = parseFloat(((geo.baselineY - clampedY) / ampScale).toFixed(1));

    return { timeMs, voltage };
  };

  // Interpolar trazado SVG continuo
  const splinePath = useMemo(() => {
    if (controlPoints.length < 2) return '';
    const sorted = [...controlPoints].sort((a, b) => a.timeMs - b.timeMs);
    const numSamples = 200;
    const sampled: [number, number][] = [];

    for (let i = 0; i <= numSamples; i++) {
      const t = (i / numSamples) * geo.timeWindowMs;
      const x = geo.paddingLeft + (t / geo.timeWindowMs) * geo.plotWidth;
      let y = geo.baselineY;

      // Artefacto de estímulo
      if (t >= 0.25 && t <= 0.75) {
        const stimPhase = (t - 0.25) / 0.5;
        y += Math.sin(stimPhase * Math.PI * 2) * 14;
      }

      if (t >= sorted[0].timeMs && t <= sorted[sorted.length - 1].timeMs) {
        let segIdx = 0;
        while (segIdx < sorted.length - 1 && sorted[segIdx + 1].timeMs < t) {
          segIdx++;
        }
        const p1 = sorted[segIdx];
        const p2 = sorted[segIdx + 1] ?? p1;
        const span = Math.max(0.001, p2.timeMs - p1.timeMs);
        const u = (t - p1.timeMs) / span;
        const smoothU = u * u * (3 - 2 * u);
        const v = p1.voltage + (p2.voltage - p1.voltage) * smoothU;
        y = geo.baselineY - v * ampScale;
      }

      y += (Math.sin(i * 1.5) + Math.cos(i * 2.8)) * 0.35;
      sampled.push([x, y]);
    }

    return sampled.reduce(
      (acc, [x, y], idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`,
      ''
    );
  }, [controlPoints, geo, ampScale]);

  // Manejadores de arrastre de puntos
  const handleSvgPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * geo.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * geo.height;

    // Buscar si hizo clic cerca de un punto existente (dentro de 16 px)
    const targetPt = controlPoints.find((pt) => {
      const pos = pointToPixel(pt);
      const dist = Math.hypot(pos.x - clickX, pos.y - clickY);
      return dist <= 16;
    });

    if (targetPt) {
      setActivePointId(targetPt.id);
      setIsDragging(true);
      (e.target as Element).setPointerCapture(e.pointerId);
    }
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || !activePointId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * geo.width;
    const currentY = ((e.clientY - rect.top) / rect.height) * geo.height;

    const { timeMs, voltage } = pixelToValues(currentX, currentY);

    setControlPoints((prev) =>
      prev.map((pt) => (pt.id === activePointId ? { ...pt, timeMs, voltage } : pt))
    );
  };

  const handleSvgPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(false);
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Añadir un nuevo punto intermedio (Muesca / Notch)
  const handleAddNotch = () => {
    const sorted = [...controlPoints].sort((a, b) => a.timeMs - b.timeMs);
    const midTime = sorted.length >= 2 ? (sorted[0].timeMs + sorted[1].timeMs) / 2 : 4.0;
    const newPt: WaveformControlPoint = {
      id: `pt-${Date.now()}`,
      timeMs: parseFloat(midTime.toFixed(1)),
      voltage: 4.5,
      type: 'notch',
      label: 'Muesca / Desincronización',
    };
    setControlPoints([...controlPoints, newPt]);
    setActivePointId(newPt.id);
  };

  // Eliminar punto seleccionado
  const handleDeleteActivePoint = (id: string) => {
    if (controlPoints.length <= 2) return; // Mínimo 2 puntos
    setControlPoints((prev) => prev.filter((p) => p.id !== id));
    if (activePointId === id) setActivePointId(null);
  };

  // Guardar caso personalizado
  const handleSaveCustomCase = () => {
    const newId = `custom-trace-${Date.now()}`;
    const newCaseDef: TraceCaseDefinition = {
      id: newId,
      title: caseTitle.trim() || 'Trazo Personalizado',
      category: 'entrapment',
      studyType,
      nerveOrMuscle: nerveOrMuscle.trim() || 'Nervio Clínico',
      technique: technique.trim() || 'Calibrado con puntos Bézier por el docente',
      sensitivity: geo.ampUnits === 'µV' ? '50 µV / div' : '2 mV / div',
      sweepSpeed: '2 ms / div',
      isCustomUserCreated: true,
      createdAt: new Date().toISOString(),
      normal: {
        label: 'Referencia Normal',
        latency: 3.4,
        amplitude: 9.0,
        duration: 5.2,
        velocity: 56.0,
        status: 'normal',
        statusText: 'Fisiológico',
        summary: 'Trazado normal de referencia.',
        normative: {
          latencyNorm: '< 4.0 ms',
          amplitudeNorm: '> 4.5 mV',
          velocityNorm: '> 50 m/s',
        },
      },
      pathologic: {
        label: caseTitle.trim() || 'Trazo Esculpido',
        latency: metrics.latency,
        amplitude: metrics.amplitude,
        duration: metrics.duration,
        velocity: 38.0,
        customWaveform: {
          points: controlPoints,
          calculatedLatencyMs: metrics.latency,
          calculatedAmplitude: metrics.amplitude,
          calculatedDurationMs: metrics.duration,
        },
        status: 'abnormal',
        statusText: 'Morfología Patológica Personalizada',
        summary: summary.trim() || 'Morfología modelada interactivamente por el especialista.',
        normative: {
          latencyNorm: '< 4.0 ms',
          amplitudeNorm: '> 4.5 mV',
          velocityNorm: '> 50 m/s',
        },
      },
    };

    saveCustomTrace(newCaseDef);
    setIsSaved(true);
    if (onTraceSaved) {
      onTraceSaved(newCaseDef);
    }
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-700 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Cabecera del Editor */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 text-slate-950 font-bold shadow-xs">
              <Activity className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Editor Visual de Morfología de Onda (Waveform Sculptor)
              </h3>
              <p className="text-xs text-slate-400">
                Arrastra los puntos en la pantalla para esculpir la curva y definir tus puntos de referencia
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo del Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Panel Izquierdo: Pantalla de Edición */}
          <div className="p-4 sm:p-5 lg:col-span-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-mono text-cyan-400 flex items-center gap-1.5">
                  <Move className="h-3.5 w-3.5" />
                  Haz clic y arrastra cualquier punto para moldear la onda en tiempo real
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddNotch}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-semibold hover:bg-cyan-900/80 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Añadir Muesca / Punto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setControlPoints(DEFAULT_POINTS)}
                    className="p-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:text-white transition"
                    title="Reiniciar a forma estándar"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Pantalla SVG con Nodos Arrastrables */}
              <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-inner select-none">
                <div
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #334155 1px, transparent 1px),
                      linear-gradient(to bottom, #334155 1px, transparent 1px)
                    `,
                    backgroundSize: `${geo.plotWidth / 10}px ${geo.plotHeight / 8}px`,
                    backgroundPosition: `${geo.paddingLeft}px ${geo.paddingTop}px`,
                  }}
                />

                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${geo.width} ${geo.height}`}
                  className="w-full h-auto cursor-crosshair touch-none"
                  onPointerDown={handleSvgPointerDown}
                  onPointerMove={handleSvgPointerMove}
                  onPointerUp={handleSvgPointerUp}
                >
                  {/* Línea isoeléctrica */}
                  <line
                    x1={geo.paddingLeft}
                    y1={geo.baselineY}
                    x2={geo.width - geo.paddingRight}
                    y2={geo.baselineY}
                    stroke="rgba(148, 163, 184, 0.3)"
                    strokeDasharray="4,4"
                  />

                  {/* Curva interpolada resultante */}
                  <path
                    d={splinePath}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))' }}
                  />

                  {/* Nodos de Control Arrastrables */}
                  {controlPoints.map((pt) => {
                    const { x, y } = pointToPixel(pt);
                    const isActive = activePointId === pt.id;
                    const color =
                      pt.type === 'onset'
                        ? '#38bdf8'
                        : pt.type === 'peak'
                        ? '#f43f5e'
                        : pt.type === 'notch'
                        ? '#fbbf24'
                        : '#a855f7';

                    return (
                      <g key={pt.id} className="cursor-grab active:cursor-grabbing">
                        {/* Halo brillante */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isActive ? 12 : 8}
                          fill={color}
                          opacity={isActive ? 0.35 : 0.2}
                        />
                        {/* Centro del nodo */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isActive ? 6 : 4.5}
                          fill={color}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        {/* Etiqueta de tiempo y voltaje */}
                        <text
                          x={x}
                          y={y - 10}
                          fill={color}
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {pt.timeMs}ms / {pt.voltage > 0 ? `+${pt.voltage}` : pt.voltage}mV
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Barra de Telemetría Dinámica Derivada */}
              <div className="mt-3 grid grid-cols-3 gap-2 font-mono tabular-nums text-xs">
                <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900">
                  <span className="text-[10px] uppercase text-slate-400 block">Latencia Onset</span>
                  <span className="text-base font-bold text-cyan-300">{metrics.latency} ms</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900">
                  <span className="text-[10px] uppercase text-slate-400 block">Amplitud Pico</span>
                  <span className="text-base font-bold text-rose-400">{metrics.amplitude} mV</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900">
                  <span className="text-[10px] uppercase text-slate-400 block">Duración Total</span>
                  <span className="text-base font-bold text-amber-300">{metrics.duration} ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Derecho: Configuración y Guardado */}
          <div className="p-4 sm:p-5 lg:col-span-4 bg-slate-900/60 flex flex-col justify-between space-y-4">
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Modalidad de Estudio</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['motor', 'sensory', 'needle'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setStudyType(t)}
                      className={`py-1 text-center rounded-lg border text-xs font-semibold capitalize transition ${
                        studyType === t
                          ? 'border-cyan-400 bg-cyan-950/70 text-cyan-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t === 'motor' ? 'Motor' : t === 'sensory' ? 'Sensitivo' : 'Aguja'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nombre del Trazo / Patología *</label>
                <input
                  type="text"
                  required
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nervio o Músculo *</label>
                <input
                  type="text"
                  required
                  value={nerveOrMuscle}
                  onChange={(e) => setNerveOrMuscle(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Técnica Electrodiagnóstica</label>
                <input
                  type="text"
                  value={technique}
                  onChange={(e) => setTechnique(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Resumen / Interpretación Clínica</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-white"
                />
              </div>

              {/* Lista de Puntos Activos */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Puntos de Referencia ({controlPoints.length})
                </label>
                <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar font-mono text-[11px]">
                  {controlPoints.map((pt) => (
                    <div
                      key={pt.id}
                      onClick={() => setActivePointId(pt.id)}
                      className={`flex items-center justify-between p-1.5 rounded-lg border cursor-pointer transition ${
                        activePointId === pt.id
                          ? 'border-cyan-400 bg-cyan-950/60 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="capitalize">{pt.type}: {pt.timeMs}ms / {pt.voltage}mV</span>
                      {controlPoints.length > 2 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteActivePoint(pt.id);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Botón de Guardado */}
            <div className="pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveCustomCase}
                disabled={isSaved}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs shadow-md transition ${
                  isSaved
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 hover:from-cyan-400 hover:to-teal-400'
                }`}
              >
                {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                <span>{isSaved ? '¡Morfología Guardada con Éxito!' : 'Guardar y Publicar en Trazos'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
