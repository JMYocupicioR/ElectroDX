// src/components/simulator/traceEngine/TraceOscilloscope.tsx
// Pantalla de osciloscopio calibrada con cuadrícula estándar 10x8 y cursores/calibradores interactivos

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Crosshair, RotateCcw, Check } from 'lucide-react';
import type { TraceParameters, TraceStudyType, CaliperMeasurement } from './types';
import { computeGeometry, generateWaveform } from './signalMath';

interface TraceOscilloscopeProps {
  traceParams: TraceParameters;
  studyType: TraceStudyType;
  sensitivity: string;
  sweepSpeed: string;
  isPathologic?: boolean;
  showProximal?: boolean;
  onToggleProximal?: () => void;
  allowCalipers?: boolean;
  height?: number;
  className?: string;
  onMeasure?: (measurement: CaliperMeasurement) => void;
}

export const TraceOscilloscope: React.FC<TraceOscilloscopeProps> = ({
  traceParams,
  studyType,
  sensitivity,
  sweepSpeed,
  isPathologic = false,
  showProximal = false,
  onToggleProximal,
  allowCalipers = true,
  height = 260,
  className = '',
  onMeasure,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Modo de calibradores manuales
  const [manualCalipers, setManualCalipers] = useState(false);
  const [customOnsetX, setCustomOnsetX] = useState<number | null>(null);
  const [customPeakY, setCustomPeakY] = useState<number | null>(null);

  // Computar geometría de escalas reales
  const geo = useMemo(
    () => computeGeometry(studyType, sweepSpeed, sensitivity, 600, height),
    [studyType, sweepSpeed, sensitivity, height]
  );

  // Generar curva matemática
  const curve = useMemo(
    () => generateWaveform(traceParams, studyType, geo, showProximal),
    [traceParams, studyType, geo, showProximal]
  );

  // Posición activa de calibradores
  const activeOnsetX = manualCalipers && customOnsetX !== null ? customOnsetX : curve.onsetX;
  const activePeakY = manualCalipers && customPeakY !== null ? customPeakY : curve.peakY;

  // Conversión de píxeles a valores clínicos
  const msPerPixel = geo.timeWindowMs / geo.plotWidth;
  const ampScale = (geo.plotHeight * 0.52) / Math.max(0.1, geo.maxAmpDisplay);

  const measuredLatency = Math.max(0, (activeOnsetX - geo.paddingLeft) * msPerPixel);
  const measuredAmplitude = Math.max(0, (geo.baselineY - activePeakY) / ampScale);

  // Evaluación de exactitud si el usuario midió manualmente
  const measurementAccuracy: CaliperMeasurement = useMemo(() => {
    const realLatency = traceParams.latency;
    const realAmplitude = traceParams.amplitude;

    const latErr = realLatency > 0 ? Math.abs(measuredLatency - realLatency) / realLatency : 0;
    const ampErr = realAmplitude > 0 ? Math.abs(measuredAmplitude - realAmplitude) / realAmplitude : 0;

    const latErrPct = Math.round(latErr * 100);
    const ampErrPct = Math.round(ampErr * 100);
    const isAccurate = latErrPct <= 15 && ampErrPct <= 20;

    return {
      measuredLatencyMs: parseFloat(measuredLatency.toFixed(2)),
      measuredAmplitudeValue: parseFloat(measuredAmplitude.toFixed(2)),
      latencyErrorPercent: latErrPct,
      amplitudeErrorPercent: ampErrPct,
      isAccurate,
    };
  }, [measuredLatency, measuredAmplitude, traceParams]);

  // Manejar clic en pantalla para colocar calibradores
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!manualCalipers || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * geo.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * geo.height;

    if (clickX >= geo.paddingLeft && clickX <= geo.width - geo.paddingRight) {
      setCustomOnsetX(clickX);
    }
    if (clickY >= geo.paddingTop && clickY <= geo.baselineY + 15) {
      setCustomPeakY(clickY);
    }

    if (onMeasure) {
      onMeasure(measurementAccuracy);
    }
  };

  const strokeColor = isPathologic ? '#f59e0b' : '#10b981'; // Ámbar patológico vs Verde esmeralda normal
  const glowColor = isPathologic ? 'rgba(245, 158, 11, 0.45)' : 'rgba(16, 185, 129, 0.45)';

  return (
    <div className={`relative flex flex-col rounded-2xl border border-slate-800 bg-slate-950 p-3 sm:p-4 text-slate-100 shadow-2xl ${className}`}>
      {/* Barra de herramientas superior del osciloscopio */}
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] tabular-nums">
          <span className="rounded-md border border-slate-700/80 bg-slate-900/90 px-2 py-0.5 text-cyan-300">
            {sensitivity}
          </span>
          <span className="rounded-md border border-slate-700/80 bg-slate-900/90 px-2 py-0.5 text-cyan-300">
            {sweepSpeed}
          </span>
          {studyType === 'motor' && onToggleProximal && (
            <button
              type="button"
              onClick={onToggleProximal}
              className={`rounded-md border px-2 py-0.5 font-semibold transition ${
                showProximal
                  ? 'border-purple-500 bg-purple-950/70 text-purple-300'
                  : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              + Estímulo Proximal
            </button>
          )}
        </div>

        {/* Interruptor de Calibradores / Cursores */}
        {allowCalipers && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setManualCalipers(!manualCalipers);
                setCustomOnsetX(null);
                setCustomPeakY(null);
              }}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                manualCalipers
                  ? 'border-cyan-400 bg-cyan-950/80 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'border-slate-700/80 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crosshair className="h-3.5 w-3.5" />
              <span>{manualCalipers ? 'Calibradores Activos' : 'Medir con Calibradores'}</span>
            </button>

            {manualCalipers && (
              <button
                type="button"
                onClick={() => {
                  setCustomOnsetX(null);
                  setCustomPeakY(null);
                }}
                title="Reiniciar calibradores a posición calculada"
                className="rounded-lg border border-slate-700 bg-slate-900 p-1 text-slate-400 hover:text-white transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pantalla CRT / Pantalla de trazo SVG */}
      <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-black shadow-inner">
        {/* Cuadrícula de fondo */}
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

        {/* Artefacto de estímulo en motor o sensitivo */}
        {studyType !== 'needle' && (
          <div
            className="absolute z-10 flex items-center gap-1 rounded border border-cyan-800/80 bg-cyan-950/80 px-1.5 py-0.5 text-[9px] font-mono text-cyan-300 shadow-sm"
            style={{ left: `${geo.paddingLeft + 4}px`, top: `${geo.paddingTop + 4}px` }}
          >
            <Zap className="h-2.5 w-2.5" />
            <span>Estímulo 0 ms</span>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${geo.width} ${geo.height}`}
          className={`relative z-10 h-auto w-full select-none ${manualCalipers ? 'cursor-crosshair' : 'cursor-default'}`}
          onClick={handleSvgClick}
        >
          {/* Línea isoeléctrica de base */}
          <line
            x1={geo.paddingLeft}
            y1={geo.baselineY}
            x2={geo.width - geo.paddingRight}
            y2={geo.baselineY}
            stroke="rgba(148, 163, 184, 0.25)"
            strokeDasharray="4,4"
            strokeWidth="1"
          />

          {/* Marcas de tiempo del eje horizontal (ms) */}
          {Array.from({ length: 11 }).map((_, i) => {
            const t = (i / 10) * geo.timeWindowMs;
            const x = geo.paddingLeft + (i / 10) * geo.plotWidth;
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={geo.baselineY - 3}
                  x2={x}
                  y2={geo.baselineY + 3}
                  stroke="rgba(148, 163, 184, 0.4)"
                />
                <text
                  x={x}
                  y={geo.height - 10}
                  fill="#64748b"
                  fontSize="8.5"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {t.toFixed(0)}
                </text>
              </g>
            );
          })}
          <text
            x={geo.width / 2}
            y={geo.height - 1}
            fill="#475569"
            fontSize="8.5"
            fontFamily="monospace"
            textAnchor="middle"
          >
            Tiempo (ms)
          </text>

          {/* Marcas del eje vertical de amplitud */}
          <text
            x={geo.paddingLeft - 6}
            y={geo.paddingTop + 10}
            fill="#64748b"
            fontSize="8"
            fontFamily="monospace"
            textAnchor="end"
          >
            +{geo.maxAmpDisplay / 2} {geo.ampUnits}
          </text>
          <text
            x={geo.paddingLeft - 6}
            y={geo.baselineY + 3}
            fill="#64748b"
            fontSize="8"
            fontFamily="monospace"
            textAnchor="end"
          >
            0
          </text>

          {/* Curva de estímulo proximal superpuesta si está activa */}
          {showProximal && curve.proximalPathData && (
            <path
              d={curve.proximalPathData}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.4"
              strokeDasharray="5,3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Curva Principal (Distal) */}
          <AnimatePresence mode="wait">
            <motion.path
              key={`${traceParams.label}-${studyType}-${isPathologic}`}
              initial={{ pathLength: 0.3, opacity: 0.6 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              d={curve.pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
            />
          </AnimatePresence>

          {/* Calibradores / Cursores */}
          {allowCalipers && (
            <g className="transition-opacity duration-200">
              {/* Cursor de Latencia (Línea Vertical Onset) */}
              <line
                x1={activeOnsetX}
                y1={geo.paddingTop}
                x2={activeOnsetX}
                y2={geo.baselineY + 12}
                stroke="#38bdf8"
                strokeDasharray="3,3"
                strokeWidth="1.4"
                opacity={0.85}
              />
              <circle cx={activeOnsetX} cy={geo.baselineY} r="4" fill="#38bdf8" />
              <text
                x={activeOnsetX + 4}
                y={geo.paddingTop + 14}
                fill="#38bdf8"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                Onset: {measuredLatency.toFixed(1)} ms
              </text>

              {/* Cursor de Amplitud (Línea Horizontal Pico) */}
              {activePeakY < geo.baselineY && (
                <>
                  <line
                    x1={geo.paddingLeft}
                    y1={activePeakY}
                    x2={activeOnsetX + 70}
                    y2={activePeakY}
                    stroke="#f43f5e"
                    strokeDasharray="3,3"
                    strokeWidth="1.4"
                    opacity={0.85}
                  />
                  <circle cx={curve.peakX} cy={activePeakY} r="4" fill="#f43f5e" />
                  <text
                    x={geo.paddingLeft + 6}
                    y={activePeakY - 5}
                    fill="#f43f5e"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    Pico: {measuredAmplitude.toFixed(1)} {geo.ampUnits}
                  </text>
                </>
              )}
            </g>
          )}
        </svg>

        {/* Badge inferior con el nombre del trazado */}
        <div className="absolute bottom-2.5 right-3 rounded border border-slate-700/80 bg-slate-900/90 px-2.5 py-0.5 text-[10px] font-mono text-slate-300 backdrop-blur-xs">
          {traceParams.label}
        </div>
      </div>

      {/* Barra de telemetría de calibradores cuando está en modo manual */}
      {manualCalipers && (
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-900/60 bg-cyan-950/40 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-cyan-400" />
            <span className="text-slate-300">
              Haz clic en la pantalla para posicionar el inicio (*onset*) y el pico.
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-cyan-300">
              Latencia: <strong>{measuredLatency.toFixed(1)} ms</strong>
            </span>
            <span className="text-rose-300">
              Amplitud: <strong>{measuredAmplitude.toFixed(1)} {geo.ampUnits}</strong>
            </span>
            {measurementAccuracy.isAccurate ? (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-900/60 px-1.5 py-0.5 text-emerald-300 text-[10px] font-bold">
                <Check className="h-3 w-3" /> Medición Precisa
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">
                (Error: {measurementAccuracy.latencyErrorPercent}%)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
