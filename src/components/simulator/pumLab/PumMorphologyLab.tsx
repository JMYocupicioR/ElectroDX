import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Check, Crosshair, Snowflake, Timer, Undo2, Volume2 } from 'lucide-react';
import {
  buildChallengeTraces,
  buildTrace,
  getCaseDefinition,
  getPumOverridesVersion,
  subscribePumOverrides,
} from './cases';
import { ensurePumCaseOverridesLoaded } from '../../../services/pumLabCaseService';
import { gradeMeasurement } from './gradeMeasurement';
import { clampIndex, indexToMs, measureMuap, msToIndex, snapToLocalExtremum } from './measureMuap';
import { traceAudioEngine } from '../traceEngine/TraceAudioEngine';
import {
  PUM_PEAK_SNAP_MS,
  PUM_RISE_TIME_LIMIT_US,
  PUM_WINDOW_MS,
  type MetricAnalysisResult,
  type PumCursorId,
  type PumTrace,
  type StudentMeasurement,
} from './types';

const WIDTH = 720;
const HEIGHT = 300;
const PAD_L = 48;
const PAD_R = 18;
const PAD_T = 18;
const PAD_B = 30;
const PLOT_W = WIDTH - PAD_L - PAD_R;
const PLOT_H = HEIGHT - PAD_T - PAD_B;
const BASELINE_Y = PAD_T + PLOT_H / 2;
const CHALLENGE_SECONDS = 20;
const CURSOR_ORDER: PumCursorId[] = ['start', 'end', 'neg', 'pos'];
const CURSOR_LABEL: Record<PumCursorId, string> = {
  start: 'Inicio',
  end: 'Fin',
  neg: 'Pico neg (−)',
  pos: 'Pico pos (+)',
};
const CURSOR_COLOR: Record<PumCursorId, string> = {
  start: '#22d3ee',
  end: '#a78bfa',
  neg: '#34d399',
  pos: '#f59e0b',
};

function initialMeasurement(): StudentMeasurement {
  return {
    startIndex: msToIndex(20),
    endIndex: msToIndex(70),
    negativePeakIndex: msToIndex(48),
    positivePeakIndex: msToIndex(40),
    discardedDistant: false,
  };
}

function uvToY(uv: number, uvPerDiv: number): number {
  const pxPerDiv = PLOT_H / 8;
  return BASELINE_Y + (uv / uvPerDiv) * pxPerDiv;
}

function xToIndex(x: number, length: number): number {
  const t = ((x - PAD_L) / PLOT_W) * PUM_WINDOW_MS;
  return clampIndex(msToIndex(t), length);
}

function indexToX(index: number, length: number): number {
  const t = indexToMs(clampIndex(index, length));
  return PAD_L + (t / PUM_WINDOW_MS) * PLOT_W;
}

function downsamplePath(signal: number[], uvPerDiv: number, offset: number): string {
  const n = signal.length;
  const step = Math.max(1, Math.floor(n / 900));
  const parts: string[] = [];
  for (let i = 0; i < n; i += step) {
    const src = (i + offset) % n;
    const x = PAD_L + (i / (n - 1)) * PLOT_W;
    const y = uvToY(signal[src], uvPerDiv);
    parts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return parts.join(' ');
}

function patternLabel(type: PumTrace['docentBand']['patternType']): string {
  if (type === 'chronic_neurogenic') return 'Neurogénico crónico';
  if (type === 'myopathic') return 'Miopático';
  if (type === 'polyphasic') return 'Polifásico';
  return 'Normal';
}

export interface PumMorphologyLabProps {
  caseId?: string;
  mode?: 'guided' | 'challenge';
  compact?: boolean;
  className?: string;
}

export function PumMorphologyLab({
  caseId = 'biceps-normal',
  mode: initialMode = 'guided',
  compact = false,
  className = '',
}: PumMorphologyLabProps) {
  const [mode, setMode] = useState<'guided' | 'challenge'>(initialMode);
  const [frozen, setFrozen] = useState(initialMode !== 'challenge');
  const [activeCursor, setActiveCursor] = useState<PumCursorId>('start');
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(CHALLENGE_SECONDS);
  const [scores, setScores] = useState<number[]>([]);
  const [result, setResult] = useState<MetricAnalysisResult | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<PumCursorId | null>(null);
  const offsetRef = useRef(0);
  const [offset, setOffset] = useState(0);

  // Ajustes docentes guardados en /admin/simulador-pum; al llegar, se regeneran los trazos.
  const overridesVersion = useSyncExternalStore(subscribePumOverrides, getPumOverridesVersion, getPumOverridesVersion);
  useEffect(() => {
    void ensurePumCaseOverridesLoaded();
  }, []);

  const challengeTraces = useMemo(() => buildChallengeTraces(11), [overridesVersion]);
  const guidedTrace = useMemo(() => {
    const id = getCaseDefinition(caseId) ? caseId : 'biceps-normal';
    return buildTrace(id, 3);
  }, [caseId, overridesVersion]);

  const trace: PumTrace = mode === 'challenge' ? challengeTraces[challengeIndex] : guidedTrace;
  const signal = trace.noisy;
  const n = signal.length;
  const measurementRef = useRef<StudentMeasurement>(initialMeasurement());
  const traceRef = useRef<PumTrace>(trace);
  const [measurement, setMeasurement] = useState<StudentMeasurement>(() => initialMeasurement());
  measurementRef.current = measurement;
  traceRef.current = trace;

  useEffect(() => {
    setMeasurement(initialMeasurement());
    setResult(null);
    setFrozen(mode !== 'challenge');
    setSecondsLeft(CHALLENGE_SECONDS);
  }, [trace.caseId, challengeIndex, mode, overridesVersion]);

  useEffect(() => {
    if (frozen) {
      offsetRef.current = 0;
      setOffset(0);
      return;
    }
    let raf = 0;
    const tick = () => {
      offsetRef.current = (offsetRef.current + Math.floor(n / 80)) % n;
      setOffset(offsetRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [frozen, n]);

  useEffect(() => {
    if (mode !== 'challenge' || result) return;
    if (secondsLeft <= 0) {
      const current = traceRef.current;
      const graded = gradeMeasurement(
        current.noisy,
        current.groundTruth,
        { ...measurementRef.current, discardedDistant: false },
        current.samplingRate,
      );
      setFrozen(true);
      setResult(graded);
      setScores((prev) => {
        const copy = [...prev];
        copy[challengeIndex] = graded.score;
        return copy;
      });
      return;
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [mode, secondsLeft, result, challengeIndex]);

  const liveMetrics = useMemo(() => measureMuap(signal, measurement, trace.samplingRate), [signal, measurement, trace.samplingRate]);

  const path = useMemo(
    () => downsamplePath(signal, trace.uvPerDiv, frozen ? 0 : offset),
    [signal, trace.uvPerDiv, frozen, offset],
  );

  const applyIndex = (cursor: PumCursorId, index: number) => {
    setMeasurement((prev) => {
      let next = { ...prev };
      if (cursor === 'start') next.startIndex = clampIndex(index, n);
      if (cursor === 'end') next.endIndex = clampIndex(index, n);
      if (cursor === 'neg') next.negativePeakIndex = snapToLocalExtremum(signal, index, 'min', PUM_PEAK_SNAP_MS, trace.samplingRate);
      if (cursor === 'pos') next.positivePeakIndex = snapToLocalExtremum(signal, index, 'max', PUM_PEAK_SNAP_MS, trace.samplingRate);
      return next;
    });
    setResult(null);
  };

  const pointerToIndex = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * WIDTH;
    return xToIndex(x, n);
  };

  const confirm = (discarded: boolean) => {
    const graded = gradeMeasurement(
      signal,
      trace.groundTruth,
      { ...measurement, discardedDistant: discarded },
      trace.samplingRate,
    );
    setResult(graded);
    setFrozen(true);
    if (mode === 'challenge') {
      setScores((prev) => {
        const copy = [...prev];
        copy[challengeIndex] = graded.score;
        return copy;
      });
    }
  };

  const nextChallenge = () => {
    if (challengeIndex >= challengeTraces.length - 1) return;
    setChallengeIndex((i) => i + 1);
  };

  const playShot = () => {
    const start = Math.min(measurement.startIndex, measurement.endIndex);
    const end = Math.max(measurement.startIndex, measurement.endIndex);
    traceAudioEngine.playMuapWindow(signal, trace.samplingRate, start, end);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setFrozen((v) => !v);
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const dir = e.shiftKey ? -1 : 1;
        const i = CURSOR_ORDER.indexOf(activeCursor);
        setActiveCursor(CURSOR_ORDER[(i + dir + CURSOR_ORDER.length) % CURSOR_ORDER.length]);
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const step = (e.shiftKey ? 10 : 1) * (e.key === 'ArrowLeft' ? -1 : 1);
        const current =
          activeCursor === 'start'
            ? measurement.startIndex
            : activeCursor === 'end'
              ? measurement.endIndex
              : activeCursor === 'neg'
                ? measurement.negativePeakIndex
                : measurement.positivePeakIndex;
        applyIndex(activeCursor, current + step);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeCursor, measurement]);

  const cursorX = {
    start: indexToX(measurement.startIndex, n),
    end: indexToX(measurement.endIndex, n),
    neg: indexToX(measurement.negativePeakIndex, n),
    pos: indexToX(measurement.positivePeakIndex, n),
  };

  const challengeDone = mode === 'challenge' && scores.length >= challengeTraces.length && scores.every((s) => typeof s === 'number');
  const meanScore =
    scores.filter((s) => typeof s === 'number').length > 0
      ? scores.reduce((a, b) => a + (b ?? 0), 0) / scores.filter((s) => typeof s === 'number').length
      : null;

  const truthX = result
    ? {
        start: indexToX(trace.groundTruth.startIndex, n),
        end: indexToX(trace.groundTruth.endIndex, n),
        neg: indexToX(trace.groundTruth.negativePeakIndex, n),
        pos: indexToX(trace.groundTruth.positivePeakIndex, n),
      }
    : null;

  return (
    <section
      className={`rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl ${compact ? 'p-3' : 'p-4 sm:p-5'} ${className}`}
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-400">Laboratorio de morfología del PUM</p>
          <h2 className="text-base sm:text-lg font-semibold text-white">{trace.muscleName}</h2>
          <p className="mt-0.5 font-mono text-[11px] text-slate-400">
            {trace.uvPerDiv} µV/div · {trace.msPerDiv} ms/div · negativo arriba · 20 kHz
          </p>
        </div>
        {!compact && (
          <div className="flex rounded-lg border border-slate-700 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('guided');
                setChallengeIndex(0);
                setScores([]);
              }}
              className={`rounded-md px-2.5 py-1 font-semibold ${mode === 'guided' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'}`}
            >
              Práctica
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('challenge');
                setChallengeIndex(0);
                setScores([]);
                setFrozen(false);
              }}
              className={`rounded-md px-2.5 py-1 font-semibold ${mode === 'challenge' ? 'bg-slate-800 text-amber-300' : 'text-slate-400'}`}
            >
              Desafío
            </button>
          </div>
        )}
      </header>

      {mode === 'challenge' && (
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-mono text-amber-200">
          <Timer className="h-3.5 w-3.5" />
          <span>
            Potencial {challengeIndex + 1} / {challengeTraces.length}
          </span>
          <span className="rounded bg-slate-900 px-1.5 py-0.5">{frozen ? `${secondsLeft}s` : 'Congela para medir'}</span>
          {meanScore !== null && <span>Media: {meanScore.toFixed(0)}%</span>}
        </div>
      )}

      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-black">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full cursor-crosshair select-none touch-none"
          role="img"
          aria-label="Osciloscopio de PUM. Negativo hacia arriba."
          onPointerDown={(e) => {
            const svg = svgRef.current;
            if (!svg) return;
            const rect = svg.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
            const idx = xToIndex(x, n);
            const nearest = CURSOR_ORDER.map((id) => ({ id, d: Math.abs(cursorX[id] - x) })).sort((a, b) => a.d - b.d)[0];
            const chosen = nearest.d < 36 ? nearest.id : activeCursor;
            setActiveCursor(chosen);
            dragRef.current = chosen;
            applyIndex(chosen, idx);
            svg.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!dragRef.current) return;
            applyIndex(dragRef.current, pointerToIndex(e.clientX));
          }}
          onPointerUp={() => {
            dragRef.current = null;
          }}
        >
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={PAD_L + (PLOT_W / 10) * i}
              x2={PAD_L + (PLOT_W / 10) * i}
              y1={PAD_T}
              y2={PAD_T + PLOT_H}
              stroke="#1e293b"
              strokeWidth={i === 5 ? 1.2 : 0.6}
            />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={`h${i}`}
              y1={PAD_T + (PLOT_H / 8) * i}
              y2={PAD_T + (PLOT_H / 8) * i}
              x1={PAD_L}
              x2={PAD_L + PLOT_W}
              stroke="#1e293b"
              strokeWidth={i === 4 ? 1.2 : 0.6}
            />
          ))}
          <line x1={PAD_L} x2={PAD_L + PLOT_W} y1={BASELINE_Y} y2={BASELINE_Y} stroke="#334155" strokeDasharray="4 6" />
          <path d={path} fill="none" stroke="#34d399" strokeWidth={1.6} />

          {frozen &&
            CURSOR_ORDER.map((id) => (
              <g key={id}>
                <line
                  x1={cursorX[id]}
                  x2={cursorX[id]}
                  y1={PAD_T}
                  y2={PAD_T + PLOT_H}
                  stroke={CURSOR_COLOR[id]}
                  strokeWidth={activeCursor === id ? 2 : 1}
                  strokeDasharray="3 3"
                />
                <circle
                  cx={cursorX[id]}
                  cy={uvToY(
                    signal[
                      id === 'start'
                        ? measurement.startIndex
                        : id === 'end'
                          ? measurement.endIndex
                          : id === 'neg'
                            ? measurement.negativePeakIndex
                            : measurement.positivePeakIndex
                    ],
                    trace.uvPerDiv,
                  )}
                  r={activeCursor === id ? 5 : 3.5}
                  fill={CURSOR_COLOR[id]}
                />
              </g>
            ))}

          {truthX && (
            <>
              <line x1={truthX.start} x2={truthX.start} y1={PAD_T} y2={PAD_T + PLOT_H} stroke="#94a3b8" strokeDasharray="2 4" />
              <line x1={truthX.end} x2={truthX.end} y1={PAD_T} y2={PAD_T + PLOT_H} stroke="#94a3b8" strokeDasharray="2 4" />
            </>
          )}

          <text x={PAD_L} y={HEIGHT - 8} fill="#64748b" fontSize="10" fontFamily="ui-monospace, monospace">
            0 ms
          </text>
          <text x={PAD_L + PLOT_W - 36} y={HEIGHT - 8} fill="#64748b" fontSize="10" fontFamily="ui-monospace, monospace">
            100 ms
          </text>
          <text x={8} y={BASELINE_Y - 6} fill="#64748b" fontSize="9" fontFamily="ui-monospace, monospace">
            −
          </text>
          <text x={8} y={BASELINE_Y + 14} fill="#64748b" fontSize="9" fontFamily="ui-monospace, monospace">
            +
          </text>
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {CURSOR_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveCursor(id)}
            className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${
              activeCursor === id ? 'border-cyan-400 bg-cyan-950 text-cyan-200' : 'border-slate-700 bg-slate-900 text-slate-400'
            }`}
          >
            {CURSOR_LABEL[id]}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFrozen((v) => !v)}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200"
        >
          <Snowflake className="h-3.5 w-3.5" />
          {frozen ? 'Descongelar' : 'Congelar'}
        </button>
        <button
          type="button"
          onClick={playShot}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200"
        >
          <Volume2 className="h-3.5 w-3.5" />
          Disparo
        </button>
        <button
          type="button"
          onClick={() => confirm(false)}
          disabled={!frozen}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-emerald-700 bg-emerald-950 px-3 py-2 text-xs font-semibold text-emerald-200 disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" />
          Confirmar medición
        </button>
        <button
          type="button"
          onClick={() => confirm(true)}
          disabled={!frozen}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-amber-700 bg-amber-950 px-3 py-2 text-xs font-semibold text-amber-200 disabled:opacity-40"
        >
          <Crosshair className="h-3.5 w-3.5" />
          Descartar: aguja lejos
        </button>
        <button
          type="button"
          onClick={() => {
            setMeasurement(initialMeasurement());
            setResult(null);
          }}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-400"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Reiniciar cursores
        </button>
      </div>

      <p className="mt-2 text-[11px] text-slate-500">
        Espacio congela el barrido. Tab cambia de cursor. Flechas mueven una muestra; Mayús, diez. Los picos se pegan al extremo local (0.3 ms).
        Los giros de esta ficha usan umbral de 25 µV sobre el PUM aislado, no el análisis de interferencia de Willison.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 font-mono text-xs">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Ficha del alumno</p>
          <dl className="space-y-1 text-slate-200">
            <div className="flex justify-between gap-2">
              <dt>Duración</dt>
              <dd>{liveMetrics.durationMs.toFixed(1)} ms</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Amplitud P-P</dt>
              <dd>{liveMetrics.amplitudeUv.toFixed(0)} µV</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Rise time</dt>
              <dd className={liveMetrics.riseTimeUs > PUM_RISE_TIME_LIMIT_US ? 'text-amber-300' : 'text-emerald-300'}>
                {liveMetrics.riseTimeUs.toFixed(0)} µs {liveMetrics.riseTimeUs > PUM_RISE_TIME_LIMIT_US ? '(distante)' : '(válido)'}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Fases / giros</dt>
              <dd>
                {liveMetrics.phases} / {liveMetrics.turns}
                {liveMetrics.phases >= 5 ? ' · polifásico' : ''}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Área rectificada</dt>
              <dd>{liveMetrics.rectifiedArea.toFixed(0)} µV·ms</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 font-mono text-xs">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Banda docente</p>
          {result ? (
            <dl className="space-y-1 text-slate-200">
              <div className="flex justify-between gap-2">
                <dt>Duración</dt>
                <dd>
                  {trace.docentBand.durationRange[0].toFixed(1)}–{trace.docentBand.durationRange[1].toFixed(1)} ms
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Amplitud</dt>
                <dd>
                  {trace.docentBand.amplitudeRange[0]}–{trace.docentBand.amplitudeRange[1]} µV
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Patrón</dt>
                <dd>{patternLabel(trace.docentBand.patternType)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Referencia</dt>
                <dd>
                  {trace.groundTruth.durationMs.toFixed(1)} ms · {trace.groundTruth.amplitudeUv.toFixed(0)} µV · {trace.groundTruth.phases} fases
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-slate-500">Confirma la medición para ver la ficha docente. La nota califica cursores, no estas cifras.</p>
          )}
        </div>
      </div>

      {result && (
        <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm">
          <p className="font-semibold text-white">
            Nota: {result.score.toFixed(0)} / 100
            <span className="ml-2 text-xs font-normal text-slate-400">
              inicio {result.cursorScores.start.toFixed(0)} · fin {result.cursorScores.end.toFixed(0)} · neg {result.cursorScores.neg} · pos{' '}
              {result.cursorScores.pos}
            </span>
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-300">
            <li>{result.feedback.startCursor}</li>
            <li>{result.feedback.endCursor}</li>
            <li>{result.feedback.peaks}</li>
            {result.feedback.riseTimeWarning && <li className="text-amber-300">{result.feedback.riseTimeWarning}</li>}
            {result.feedback.discarded && <li>{result.feedback.discarded}</li>}
          </ul>
          {mode === 'challenge' && !challengeDone && (
            <button
              type="button"
              onClick={nextChallenge}
              className="mt-3 min-h-11 rounded-lg border border-cyan-700 bg-cyan-950 px-3 py-2 text-xs font-semibold text-cyan-200"
            >
              Siguiente potencial
            </button>
          )}
          {challengeDone && (
            <p className="mt-3 text-sm text-cyan-200">Desafío cerrado. Media de {meanScore?.toFixed(0)}% en {challengeTraces.length} potenciales.</p>
          )}
        </div>
      )}
    </section>
  );
}
