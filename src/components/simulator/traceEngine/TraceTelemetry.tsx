// src/components/simulator/traceEngine/TraceTelemetry.tsx
// Panel de telemetría electrodiagnóstica, semáforo normativo y reproducción de audio

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  VolumeX,
  Lightbulb,
} from 'lucide-react';
import type { TraceParameters, TraceStudyType } from './types';
import { traceAudioEngine } from './TraceAudioEngine';

interface TraceTelemetryProps {
  traceParams: TraceParameters;
  studyType: TraceStudyType;
  isPathologic?: boolean;
  clinicalPearls?: string[];
  className?: string;
}

export const TraceTelemetry: React.FC<TraceTelemetryProps> = ({
  traceParams,
  studyType,
  isPathologic = false,
  clinicalPearls,
  className = '',
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Detener audio al desmontar o cambiar de caso
  useEffect(() => {
    return () => {
      traceAudioEngine.stop();
      setIsPlayingAudio(false);
    };
  }, [traceParams]);

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      traceAudioEngine.stop();
      setIsPlayingAudio(false);
    } else {
      const pattern = traceParams.needlePattern || 'normal_silence';
      traceAudioEngine.playPattern(pattern);
      setIsPlayingAudio(true);
    }
  };

  const isNeedle = studyType === 'needle';
  const units = isNeedle ? 'µV' : studyType === 'sensory' ? 'µV' : 'mV';

  return (
    <div className={`flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/95 p-3.5 sm:p-5 text-slate-100 shadow-xl ${className}`}>
      <div>
        {/* Cabecera de Telemetría y Badge de Estado */}
        <div className="mb-3.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
            Telemetría Clínica
          </span>

          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
              isPathologic
                ? 'border-amber-800/80 bg-amber-950/70 text-amber-300'
                : 'border-emerald-800/80 bg-emerald-950/70 text-emerald-300'
            }`}
          >
            {isPathologic ? 'Patológico' : 'Fisiológico'}
          </span>
        </div>

        {/* Rejilla de Parámetros Cuantitativos */}
        <div className="mb-4 grid grid-cols-2 gap-2 font-mono tabular-nums sm:gap-2.5">
          {/* Latencia */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5">
            <div className="text-[10px] uppercase tracking-tight text-slate-400">
              {isNeedle ? 'Actividad' : 'Latencia Distal'}
            </div>
            <div
              className={`mt-0.5 text-base sm:text-lg font-bold leading-tight ${
                isPathologic ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {isNeedle
                ? traceParams.latency === 0
                  ? 'Espontánea'
                  : `${traceParams.latency} ms`
                : `${traceParams.latency} ms`}
            </div>
            <div className="mt-0.5 text-[9px] text-slate-500">
              Norma: {traceParams.normative.latencyNorm}
            </div>
          </div>

          {/* Amplitud */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5">
            <div className="text-[10px] uppercase tracking-tight text-slate-400">
              Amplitud Pico
            </div>
            <div
              className={`mt-0.5 text-base sm:text-lg font-bold leading-tight ${
                isPathologic ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {traceParams.amplitude} {units}
            </div>
            <div className="mt-0.5 text-[9px] text-slate-500">
              Norma: {traceParams.normative.amplitudeNorm}
            </div>
          </div>

          {/* Velocidad de Conducción o Duración */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5">
            <div className="text-[10px] uppercase tracking-tight text-slate-400">
              {isNeedle ? 'Polifasia' : 'Velocidad (VCN)'}
            </div>
            <div
              className={`mt-0.5 text-base sm:text-lg font-bold leading-tight ${
                isPathologic ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {isNeedle
                ? `${traceParams.polyphasia ?? 5}%`
                : traceParams.velocity
                ? `${traceParams.velocity} m/s`
                : '—'}
            </div>
            <div className="mt-0.5 text-[9px] text-slate-500">
              Norma: {traceParams.normative.velocityNorm ?? '< 15%'}
            </div>
          </div>

          {/* Duración */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5">
            <div className="text-[10px] uppercase tracking-tight text-slate-400">
              Duración
            </div>
            <div
              className={`mt-0.5 text-base sm:text-lg font-bold leading-tight ${
                isPathologic ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {traceParams.duration > 0 ? `${traceParams.duration} ms` : 'Silencio'}
            </div>
            <div className="mt-0.5 text-[9px] text-slate-500">
              {traceParams.temporalDispersion ? 'Dispersión: patológica' : 'Dispersión: normal'}
            </div>
          </div>
        </div>

        {/* Tarjeta de Resumen Clínico */}
        <div className="rounded-xl border border-slate-800/90 bg-slate-950/80 p-3">
          <div className="mb-1 flex items-start gap-1.5 text-xs font-semibold leading-snug text-slate-200">
            {isPathologic ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            )}
            <span>{traceParams.statusText}</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">{traceParams.summary}</p>
        </div>

        {/* Reproductor de Audio para EMG de Aguja */}
        {isNeedle && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-cyan-900/60 bg-cyan-950/40 p-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400">
                {isPlayingAudio ? (
                  <Volume2 className="h-4 w-4 animate-pulse text-cyan-300" />
                ) : (
                  <VolumeX className="h-4 w-4 text-slate-400" />
                )}
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-200">Auscultación Neurofisiológica</p>
                <p className="text-[10px] text-slate-400">
                  {isPlayingAudio ? 'Reproduciendo sonido del altavoz EMG...' : 'Escucha el patrón auditivo característico'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleAudio}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                isPlayingAudio
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
              }`}
            >
              {isPlayingAudio ? 'Detener' : 'Escuchar'}
            </button>
          </div>
        )}

        {/* Perlas Clínicas si existen */}
        {clinicalPearls && clinicalPearls.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {clinicalPearls.map((pearl, i) => (
              <div
                key={i}
                className="flex items-start gap-1.5 rounded-lg border border-amber-900/40 bg-amber-950/20 p-2 text-[11px] text-amber-200/90 leading-relaxed"
              >
                <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                <span>{pearl}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
