import React, { useState, useMemo } from 'react';
import { Activity, MoveHorizontal, Zap } from 'lucide-react';
import type { NCSExerciseResult } from '../../types/ClinicalCase';

interface NcsTraceOscilloscopeProps {
  ncsResult: NCSExerciseResult;
  allResults?: NCSExerciseResult[];
  onSelectNerve?: (nerveName: string) => void;
}

export const NcsTraceOscilloscope: React.FC<NcsTraceOscilloscopeProps> = ({
  ncsResult,
  allResults,
  onSelectNerve,
}) => {
  const isMotor = ncsResult.type === 'motor';
  const [showProximalOverlay, setShowProximalOverlay] = useState(false);
  const [cursorOnsetX, setCursorOnsetX] = useState<number | null>(null);
  const [cursorPeakY, setCursorPeakY] = useState<number | null>(null);
  const [isManualCalipers, setIsManualCalipers] = useState(false);

  // Dimensiones del osciloscopio
  const width = 600;
  const height = 280;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const baselineY = paddingTop + plotHeight * 0.65;

  // Escalas del osciloscopio
  // Motor: 10 divisiones de 2ms = 20ms total; Sensitivo: 10 divisiones de 1ms = 10ms total
  const timeWindowMs = isMotor ? 20 : 10;
  const msPerPixel = timeWindowMs / plotWidth;

  // Amplitud máx en pantalla
  const maxAmpDisplay = isMotor ? Math.max(15, ncsResult.amplitude * 1.5) : Math.max(50, ncsResult.amplitude * 1.5);
  const ampUnits = isMotor ? 'mV' : 'μV';

  // Generar puntos de la curva CMAP/SNAP
  const { pathData, proximalPathData, onsetX, peakY, peakX } = useMemo(() => {
    const latency = ncsResult.latency;
    const amplitude = ncsResult.amplitude;
    const duration = isMotor ? 6.5 : 2.0; // ms

    const points: [number, number][] = [];
    const numSamples = 180;

    // Calcular X del inicio de la respuesta (latencia onset)
    const calcOnsetX = paddingLeft + (latency / timeWindowMs) * plotWidth;

    // Calcular escala de píxeles por mV/μV
    const ampScale = (plotHeight * 0.55) / maxAmpDisplay;
    const peakOffset = amplitude * ampScale;
    const calcPeakY = baselineY - peakOffset;
    const calcPeakX = calcOnsetX + ((duration * 0.35) / timeWindowMs) * plotWidth;

    for (let i = 0; i <= numSamples; i++) {
      const t = (i / numSamples) * timeWindowMs;
      const x = paddingLeft + (t / timeWindowMs) * plotWidth;

      let y = baselineY;

      // Artefacto de estímulo en t = 0.5 ms
      if (t >= 0.3 && t <= 0.8) {
        const stimPhase = (t - 0.3) / 0.5;
        y += Math.sin(stimPhase * Math.PI * 2) * 12;
      }

      // Potencial de acción compuesto (CMAP o SNAP)
      if (t >= latency && t <= latency + duration) {
        const relT = (t - latency) / duration;
        // Fase negativa principal inicial (hacia arriba en neurofisiología)
        if (relT < 0.65) {
          const negPhase = Math.sin((relT / 0.65) * Math.PI);
          y -= negPhase * peakOffset;
        } else {
          // Fase positiva tardía (hacia abajo)
          const posPhase = Math.sin(((relT - 0.65) / 0.35) * Math.PI);
          y += posPhase * (peakOffset * 0.45);
        }
      }

      // Pequeño ruido estocástico de línea de base
      const noise = (Math.sin(i * 1.7) + Math.cos(i * 3.1)) * 0.4;
      y += noise;

      points.push([x, y]);
    }

    const d = points.reduce((acc, [x, y], idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`, '');

    // Curva proximal simulada si existe bloqueo o estudio proximal
    let proxD = '';
    if (showProximalOverlay) {
      const proxLatency = latency + 3.8; // mayor latencia al estimular proximal
      const hasBlock = (ncsResult as any).conductionBlock;
      const proxAmp = hasBlock ? amplitude * 0.45 : amplitude * 0.92;
      const proxDur = hasBlock ? duration * 1.4 : duration * 1.05;
      const proxPeakOffset = proxAmp * ampScale;

      const proxPoints: [number, number][] = [];
      for (let i = 0; i <= numSamples; i++) {
        const t = (i / numSamples) * timeWindowMs;
        const x = paddingLeft + (t / timeWindowMs) * plotWidth;
        let y = baselineY;
        if (t >= proxLatency && t <= proxLatency + proxDur) {
          const relT = (t - proxLatency) / proxDur;
          if (relT < 0.65) {
            y -= Math.sin((relT / 0.65) * Math.PI) * proxPeakOffset;
          } else {
            y += Math.sin(((relT - 0.65) / 0.35) * Math.PI) * (proxPeakOffset * 0.45);
          }
        }
        proxPoints.push([x, y]);
      }
      proxD = proxPoints.reduce((acc, [x, y], idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`, '');
    }

    return {
      pathData: d,
      proximalPathData: proxD,
      onsetX: calcOnsetX,
      peakY: calcPeakY,
      peakX: calcPeakX,
    };
  }, [ncsResult, timeWindowMs, maxAmpDisplay, isMotor, baselineY, plotWidth, plotHeight, showProximalOverlay]);

  // Posición activa de cursores (manual o automática)
  const activeCursorX = isManualCalipers && cursorOnsetX !== null ? cursorOnsetX : onsetX;
  const activeCursorY = isManualCalipers && cursorPeakY !== null ? cursorPeakY : peakY;

  // Valores leídos por los cursores
  const measuredLatency = Math.max(0, (activeCursorX - paddingLeft) * msPerPixel);
  const measuredAmplitude = Math.max(0, ((baselineY - activeCursorY) / (plotHeight * 0.55)) * maxAmpDisplay);

  return (
    <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-2xl text-slate-100 font-mono">
      {/* Header del osciloscopio */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Activity className="w-4 h-4" />
          </span>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>{ncsResult.nerve} ({ncsResult.side === 'left' ? 'Izq' : 'Der'})</span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${
                isMotor ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'
              }`}>
                {isMotor ? 'Motor CMAP' : 'Sensitivo SNAP'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Estímulo: Distal {showProximalOverlay ? '+ Proximal' : ''} · Sensibilidad: {isMotor ? '2 mV/div' : '10 μV/div'} · Barrido: {isMotor ? '2 ms/div' : '1 ms/div'}
            </div>
          </div>
        </div>

        {/* Selector de nervios si están disponibles */}
        {allResults && allResults.length > 1 && onSelectNerve && (
          <div className="flex items-center gap-1.5">
            <label className="text-slate-400 text-[11px]">Nervio:</label>
            <select
              value={ncsResult.nerve}
              onChange={(e) => onSelectNerve(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              {allResults.map((r, i) => (
                <option key={i} value={r.nerve}>
                  {r.nerve} ({r.type === 'motor' ? 'M' : 'S'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pantalla CRT/Osciloscopio */}
      <div className="relative mt-3 rounded-xl overflow-hidden bg-gradient-to-b from-black via-slate-950 to-black border-2 border-slate-800 shadow-inner">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onClick={(e) => {
            if (!isManualCalipers) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = ((e.clientX - rect.left) / rect.width) * width;
            const clickY = ((e.clientY - rect.top) / rect.height) * height;
            if (clickX >= paddingLeft && clickX <= width - paddingRight) {
              setCursorOnsetX(clickX);
            }
            if (clickY >= paddingTop && clickY <= baselineY) {
              setCursorPeakY(clickY);
            }
          }}
        >
          {/* Rejilla de división electrofisiológica (10x8 divs) */}
          <defs>
            <pattern id="emgGrid" width={plotWidth / 10} height={plotHeight / 8} patternUnits="userSpaceOnUse">
              <path
                d={`M ${plotWidth / 10} 0 L 0 0 0 ${plotHeight / 8}`}
                fill="none"
                stroke="rgba(16, 185, 129, 0.12)"
                strokeWidth="0.75"
              />
            </pattern>
          </defs>

          <rect x={paddingLeft} y={paddingTop} width={plotWidth} height={plotHeight} fill="url(#emgGrid)" />

          {/* Eje de línea de base isoelectrica */}
          <line
            x1={paddingLeft}
            y1={baselineY}
            x2={width - paddingRight}
            y2={baselineY}
            stroke="rgba(16, 185, 129, 0.35)"
            strokeDasharray="4,4"
            strokeWidth="1"
          />

          {/* Etiquetas del eje temporal (ms) */}
          {Array.from({ length: 11 }).map((_, i) => {
            const t = (i / 10) * timeWindowMs;
            const x = paddingLeft + (i / 10) * plotWidth;
            return (
              <g key={i}>
                <line x1={x} y1={baselineY - 4} x2={x} y2={baselineY + 4} stroke="rgba(16, 185, 129, 0.4)" />
                <text x={x} y={height - 12} fill="#64748b" fontSize="9" textAnchor="middle">
                  {t.toFixed(0)}
                </text>
              </g>
            );
          })}
          <text x={width / 2} y={height - 2} fill="#475569" fontSize="9" textAnchor="middle">
            Tiempo (ms)
          </text>

          {/* Trazado Distal principal (Verde Neón) */}
          <path
            d={pathData}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="drop-shadow(0 0 4px rgba(16, 185, 129, 0.7))"
          />

          {/* Trazado Proximal overlay (Ámbar / Naranja) */}
          {showProximalOverlay && proximalPathData && (
            <path
              d={proximalPathData}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="5,2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="drop-shadow(0 0 3px rgba(245, 158, 11, 0.6))"
            />
          )}

          {/* Caliper 1: Cursor vertical de latencia onset */}
          <g>
            <line
              x1={activeCursorX}
              y1={paddingTop}
              x2={activeCursorX}
              y2={paddingTop + plotHeight}
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="3,3"
            />
            {/* Tirador del cursor */}
            <circle cx={activeCursorX} cy={baselineY} r="5" fill="#06b6d4" />
            <text x={activeCursorX} y={paddingTop - 6} fill="#06b6d4" fontSize="10" fontWeight="bold" textAnchor="middle">
              T1: {measuredLatency.toFixed(2)} ms
            </text>
          </g>

          {/* Caliper 2: Cursor horizontal de amplitud pico */}
          <g>
            <line
              x1={paddingLeft}
              y1={activeCursorY}
              x2={width - paddingRight}
              y2={activeCursorY}
              stroke="#ec4899"
              strokeWidth="1.5"
              strokeDasharray="3,3"
            />
            <circle cx={peakX} cy={activeCursorY} r="5" fill="#ec4899" />
            <text x={width - paddingRight - 4} y={activeCursorY - 5} fill="#ec4899" fontSize="10" fontWeight="bold" textAnchor="end">
              Amp: {measuredAmplitude.toFixed(1)} {ampUnits}
            </text>
          </g>
        </svg>

        {/* Indicador LED y modo de medición */}
        <div className="absolute top-2.5 right-3 flex items-center gap-2 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-semibold">Trazado En Vivo</span>
        </div>
      </div>

      {/* Barra de Controles y Calipers */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Latencia Medida:</span>
            <strong className="text-cyan-400 font-mono text-sm">{measuredLatency.toFixed(2)} ms</strong>
            <span className="text-[10px] text-slate-500">
              (Ref: {ncsResult.normalRanges.latency.min}-{ncsResult.normalRanges.latency.max} ms)
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Amplitud Medida:</span>
            <strong className="text-pink-400 font-mono text-sm">{measuredAmplitude.toFixed(1)} {ampUnits}</strong>
            <span className="text-[10px] text-slate-500">
              (Ref: {ncsResult.normalRanges.amplitude.min}-{ncsResult.normalRanges.amplitude.max} {ampUnits})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isMotor && (
            <button
              type="button"
              onClick={() => setShowProximalOverlay(!showProximalOverlay)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                showProximalOverlay
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{showProximalOverlay ? 'Ocultar Proximal' : 'Comparar Proximal'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsManualCalipers(!isManualCalipers);
              if (isManualCalipers) {
                setCursorOnsetX(null);
                setCursorPeakY(null);
              }
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              isManualCalipers
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <MoveHorizontal className="w-3.5 h-3.5" />
            <span>{isManualCalipers ? 'Calipers Manuales (Activo)' : 'Mover Cursores'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
