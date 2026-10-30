// src/components/landing/ClinicalTraceSimulator.tsx
// Visualizador electrofisiológico calibrado con motor biofísico de trazos

import { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Stethoscope, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CLINICAL_PRESETS } from '../simulator/traceEngine/defaultPresets';
import { TraceOscilloscope } from '../simulator/traceEngine/TraceOscilloscope';
import { TraceTelemetry } from '../simulator/traceEngine/TraceTelemetry';

const DEMO_CASES = [
  CLINICAL_PRESETS[0], // median-cts
  CLINICAL_PRESETS[5], // needle-denervation-acute
  CLINICAL_PRESETS[3], // sural-sensory
];

export function ClinicalTraceSimulator() {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [isPathologic, setIsPathologic] = useState(false);
  const [showProximal, setShowProximal] = useState(false);

  const currentCase = DEMO_CASES[activeCaseIndex] ?? DEMO_CASES[0];
  const activeParams = isPathologic && currentCase.pathologic ? currentCase.pathologic : currentCase.normal;

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 text-slate-100 shadow-[0_20px_55px_rgba(2,6,23,0.52)] sm:rounded-[28px]">
      {/* Barra superior de demostración */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-3.5 py-3 sm:px-6 sm:py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
            <div className="min-w-0 leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-300 sm:tracking-[0.14em]">
                Demo clínica interactiva
              </p>
              <p className="hidden text-xs text-slate-400 md:block">
                Visualizador electrofisiológico calibrado
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] font-mono tabular-nums text-slate-300">
            <span className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1">
              {currentCase.sensitivity}
            </span>
            <span className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1">
              {currentCase.sweepSpeed}
            </span>
            <span className="hidden rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-400 lg:inline-flex">
              Filtro {currentCase.filterBandwidth ?? '20 Hz a 2 kHz'}
            </span>
          </div>
        </div>
      </div>

      {/* Selector de Casos */}
      <div className="border-b border-slate-800/80 bg-slate-900/70 px-3.5 pb-2 pt-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-400">
            <Stethoscope className="h-3.5 w-3.5 text-cyan-400" />
            Caso:
          </span>
          {DEMO_CASES.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveCaseIndex(idx);
                setIsPathologic(false);
                setShowProximal(false);
              }}
              aria-pressed={activeCaseIndex === idx}
              className={`max-w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium leading-snug transition focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                activeCaseIndex === idx
                  ? 'bg-cyan-500/90 text-slate-950 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Osciloscopio + Telemetría */}
      <div className="grid min-w-0 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        <div className="relative flex min-w-0 flex-col justify-between p-3.5 sm:p-6 lg:col-span-7">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-mono text-cyan-300 font-semibold">{currentCase.nerveOrMuscle}</p>
              <p className="line-clamp-1 text-xs text-slate-400">{currentCase.technique}</p>
            </div>

            {currentCase.pathologic && (
              <div className="inline-flex shrink-0 self-start rounded-xl border border-slate-700/80 bg-slate-900 p-1 sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsPathologic(false)}
                  aria-pressed={!isPathologic}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    !isPathologic ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setIsPathologic(true)}
                  aria-pressed={isPathologic}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    isPathologic ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Patológico
                </button>
              </div>
            )}
          </div>

          <TraceOscilloscope
            traceParams={activeParams}
            studyType={currentCase.studyType}
            sensitivity={currentCase.sensitivity}
            sweepSpeed={currentCase.sweepSpeed}
            isPathologic={isPathologic}
            showProximal={showProximal}
            onToggleProximal={
              currentCase.studyType === 'motor' ? () => setShowProximal(!showProximal) : undefined
            }
            height={240}
          />

          <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-slate-400">
            <span className="flex min-w-0 items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
              <span className="min-w-0">Trazo calibrado con calibradores arrastrables interactivos</span>
            </span>
            <span className="font-mono text-slate-500">ElectroDx Engine v3</span>
          </div>
        </div>

        {/* Telemetría y llamada a la acción */}
        <div className="flex min-w-0 flex-col justify-between bg-slate-900/95 p-3.5 sm:p-6 lg:col-span-5">
          <TraceTelemetry
            traceParams={activeParams}
            studyType={currentCase.studyType}
            isPathologic={isPathologic}
            clinicalPearls={currentCase.clinicalPearls}
          />

          <div className="mt-4 flex min-w-0 flex-col gap-2 border-t border-slate-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="min-w-0 text-[11px] leading-snug text-slate-400">
              Más de 470 trazos diagnósticos interactivos con registro guiado.
            </span>
            <Link
              to="/simuladores/trazos"
              className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
            >
              <span>Abrir simulador completo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
