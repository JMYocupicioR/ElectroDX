// src/components/simulator/EmbeddedTraceWidget.tsx
// Widget interactivo de trazos electrodiagnósticos incrustable en cualquier lección o tema

import React, { useState, useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Image,
} from 'lucide-react';
import type { TraceCaseDefinition, TraceStudyType, TraceParameters } from './traceEngine/types';
import { CLINICAL_PRESETS } from './traceEngine/defaultPresets';
import { findTraceById } from './traceEngine/customTraceStore';
import { TraceOscilloscope } from './traceEngine/TraceOscilloscope';
import { TraceTelemetry } from './traceEngine/TraceTelemetry';
import { TraceImagesGallery } from './traceEngine/TraceImagesGallery';

export interface EmbeddedTraceWidgetProps {
  presetId?: string;
  caseDefinition?: TraceCaseDefinition;
  // Overrides o parámetros manuales inline
  title?: string;
  nerve?: string;
  studyType?: TraceStudyType;
  latency?: number;
  amplitude?: number;
  velocity?: number;
  duration?: number;
  isPathologicInitial?: boolean;
  allowComparison?: boolean;
  compact?: boolean;
  className?: string;
}

export const EmbeddedTraceWidget: React.FC<EmbeddedTraceWidgetProps> = ({
  presetId,
  caseDefinition,
  title,
  nerve,
  studyType = 'motor',
  latency,
  amplitude,
  velocity,
  duration,
  isPathologicInitial = false,
  allowComparison = true,
  compact = false,
  className = '',
}) => {
  // Resolver caso base a partir de presetId, caseDefinition o fallback
  const resolvedCase: TraceCaseDefinition = useMemo(() => {
    if (caseDefinition) return caseDefinition;
    if (presetId) {
      const found = findTraceById(presetId);
      if (found) return found;
    }

    // Si el usuario especificó parámetros directos sin preset
    if (latency !== undefined || amplitude !== undefined || title) {
      const baseLat = latency ?? 3.4;
      const baseAmp = amplitude ?? 9.2;
      const isPath = baseLat > 4.2 || baseAmp < 4.0;

      return {
        id: 'custom-inline-case',
        title: title || 'Trazado Electrofisiológico Integrado',
        category: 'entrapment',
        studyType: studyType || 'motor',
        nerveOrMuscle: nerve || 'Nervio Periférico',
        technique: 'Registro clínico calibrado con correlación neuroanatómica',
        sensitivity: studyType === 'sensory' ? '10 µV / div' : studyType === 'needle' ? '50 µV / div' : '2 mV / div',
        sweepSpeed: studyType === 'sensory' ? '1 ms / div' : studyType === 'needle' ? '10 ms / div' : '2 ms / div',
        normal: {
          label: 'Referencia Fisiológica',
          latency: 3.4,
          amplitude: 9.2,
          duration: 5.2,
          velocity: 56.8,
          status: 'normal',
          statusText: 'Dentro de límites fisiológicos',
          summary: 'Trazado normal sin bloqueo ni dispersión temporal.',
          normative: {
            latencyNorm: '< 4.0 ms',
            amplitudeNorm: '> 4.5 mV',
            velocityNorm: '> 50 m/s',
          },
        },
        pathologic: {
          label: title || 'Trazado Patológico',
          latency: baseLat,
          amplitude: baseAmp,
          duration: duration ?? 7.5,
          velocity: velocity ?? 38.0,
          status: isPath ? 'abnormal' : 'normal',
          statusText: isPath ? 'Anomalía electrodiagnóstica' : 'Fisiológico',
          summary: isPath
            ? 'Alteración morfológica con prolongación de latencia o reducción de amplitud.'
            : 'Valores en rango normal.',
          normative: {
            latencyNorm: '< 4.0 ms',
            amplitudeNorm: '> 4.5 mV',
            velocityNorm: '> 50 m/s',
          },
        },
      };
    }

    // Default: median-cts
    return CLINICAL_PRESETS[0];
  }, [caseDefinition, presetId, title, nerve, studyType, latency, amplitude, velocity, duration]);

  const [isPathologic, setIsPathologic] = useState(isPathologicInitial);
  const [showProximal, setShowProximal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showImages, setShowImages] = useState(false);

  const activeParams: TraceParameters = isPathologic && resolvedCase.pathologic
    ? resolvedCase.pathologic
    : resolvedCase.normal;

  const hasImages = resolvedCase.images && resolvedCase.images.length > 0;

  const content = (
    <div className={`overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 text-slate-100 shadow-xl transition-all ${className}`}>
      {/* Barra superior del Widget */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800 bg-slate-900/90 px-3.5 py-2.5 sm:px-5 sm:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Simulador Interactivo de Trazo
              </span>
              <span className="text-[10px] text-slate-500 font-mono">· ElectroDx Engine</span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
              {resolvedCase.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de Imágenes Complementarias */}
          {hasImages && (
            <button
              type="button"
              onClick={() => setShowImages(!showImages)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                showImages
                  ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-300'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
              }`}
              title="Ver técnicas de montaje de electrodos y ecografía correlativa"
            >
              <Image className="h-3 w-3" />
              <span>Imágenes ({resolvedCase.images?.length})</span>
            </button>
          )}

          {/* Conmutador Normal vs Patológico */}
          {allowComparison && resolvedCase.pathologic && (
            <div className="inline-flex rounded-xl border border-slate-700/80 bg-slate-900 p-0.5">
              <button
                type="button"
                onClick={() => setIsPathologic(false)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  !isPathologic
                    ? 'bg-emerald-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>Normal</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPathologic(true)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  isPathologic
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="h-3 w-3" />
                <span>Patológico</span>
              </button>
            </div>
          )}

          {/* Botón Pantalla Completa */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Restaurar vista' : 'Ampliar pantalla'}
            className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-400 hover:text-white transition"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Subbarra de Información Anatómica y Técnica */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-900/60 px-3.5 py-1.5 sm:px-5 text-xs text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <span className="font-mono text-cyan-300 font-semibold">{resolvedCase.nerveOrMuscle}</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline truncate text-[11px] text-slate-400">{resolvedCase.technique}</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
          <span>{resolvedCase.sensitivity}</span>
          <span>·</span>
          <span>{resolvedCase.sweepSpeed}</span>
        </div>
      </div>

      {/* Cuerpo principal: Osciloscopio + Telemetría */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Columna Izquierda: Osciloscopio */}
        <div className="p-3 sm:p-5 lg:col-span-7 flex flex-col justify-between">
          <TraceOscilloscope
            traceParams={activeParams}
            studyType={resolvedCase.studyType}
            sensitivity={resolvedCase.sensitivity}
            sweepSpeed={resolvedCase.sweepSpeed}
            isPathologic={isPathologic}
            showProximal={showProximal}
            onToggleProximal={
              resolvedCase.studyType === 'motor' ? () => setShowProximal(!showProximal) : undefined
            }
            height={isFullscreen ? 340 : compact ? 220 : 260}
          />

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Usa los calibradores para medir latencia y amplitud en la onda</span>
            <span className="font-mono text-[10px]">ElectroDx Trace Engine v3</span>
          </div>
        </div>

        {/* Columna Derecha: Telemetría y Diagnóstico */}
        <div className="p-3 sm:p-5 lg:col-span-5 flex flex-col justify-between bg-slate-900/70">
          <TraceTelemetry
            traceParams={activeParams}
            studyType={resolvedCase.studyType}
            isPathologic={isPathologic}
            clinicalPearls={resolvedCase.clinicalPearls}
          />
        </div>
      </div>

      {/* Galería desplegable de imágenes complementarias */}
      {showImages && hasImages && (
        <div className="border-t border-slate-800 p-3 sm:p-4 bg-slate-900/80">
          <TraceImagesGallery
            images={resolvedCase.images}
            canEdit={false}
            isPathologic={isPathologic}
            studyType={resolvedCase.studyType}
          />
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto">
        <div className="w-full max-w-5xl">
          {content}
        </div>
      </div>
    );
  }

  return <div className="my-6 not-prose">{content}</div>;
};
