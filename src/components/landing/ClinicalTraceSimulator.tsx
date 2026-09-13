import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle2, Sliders, Zap, Stethoscope, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TraceData {
  id: string;
  title: string;
  nerve: string;
  technique: string;
  normal: {
    label: string;
    latency: string;
    amplitude: string;
    velocity: string;
    duration: string;
    path: string; // SVG path definition
    markers: { onset: number; peak: { x: number; y: number } };
    summary: string;
    status: 'normal';
    statusText: 'Dentro de límites fisiológicos';
  };
  pathologic: {
    label: string;
    latency: string;
    amplitude: string;
    velocity: string;
    duration: string;
    path: string;
    markers: { onset: number; peak: { x: number; y: number } };
    summary: string;
    status: 'abnormal';
    statusText: 'Criterios de desmielinización focal / axónica';
  };
  sensitivity: string;
  sweepSpeed: string;
}

const CLINICAL_CASES: TraceData[] = [
  {
    id: 'median-motor',
    title: 'Nervio Mediano Motor',
    nerve: 'N. Mediano (C8-T1)',
    technique: 'Registro en Abductor Pollicis Brevis (APB) · Estimulación en Muñeca (8 cm)',
    sensitivity: '2 mV / div',
    sweepSpeed: '2 ms / div',
    normal: {
      label: 'Trazado Normal',
      latency: '3.4 ms',
      amplitude: '9.2 mV',
      velocity: '56.8 m/s',
      duration: '5.2 ms',
      // Clean CMAP: stimulus at x=30, onset at x=100 (3.4ms), sharp negative peak at (150, 45), positive rebound at (210, 165), return to baseline (280, 120)
      path: 'M 10 120 L 28 120 L 30 100 L 32 140 L 34 120 L 98 120 Q 115 118 130 90 Q 150 42 165 42 Q 185 45 205 155 Q 220 172 245 160 Q 270 140 295 120 L 580 120',
      markers: { onset: 98, peak: { x: 165, y: 42 } },
      summary: 'Latencia distal conservada (<4.0 ms) y CMAP de configuración monofásica aguda sin bloqueo ni dispersión temporal.',
      status: 'normal',
      statusText: 'Dentro de límites fisiológicos',
    },
    pathologic: {
      label: 'Síndrome del Túnel Carpiano Severo',
      latency: '5.9 ms',
      amplitude: '3.8 mV',
      velocity: '38.4 m/s',
      duration: '8.4 ms',
      // Dispersed, prolonged CMAP: stimulus at x=30, delayed onset at x=175 (5.9ms), blunt peak at (240, 80), dispersed multiphasic rebound (330, 145), baseline (410, 120)
      path: 'M 10 120 L 28 120 L 30 100 L 32 140 L 34 120 L 175 120 Q 195 118 215 98 Q 235 80 250 82 Q 275 85 295 110 Q 315 130 330 145 Q 355 155 380 138 Q 405 125 430 120 L 580 120',
      markers: { onset: 175, peak: { x: 250, y: 82 } },
      summary: 'Prolongación severa de la latencia distal motora (>4.5 ms) con dispersión temporal y caída de amplitud por desmielinización focal en ligamento anular.',
      status: 'abnormal',
      statusText: 'Atrapamiento focal (Criterios AANEM / COMEFYR)',
    },
  },
  {
    id: 'needle-emg',
    title: 'EMG de Aguja (Músculo APB)',
    nerve: 'Músculo Abductor Pollicis Brevis',
    technique: 'Electrodo concéntrico · Registro en Reposo e Inserción',
    sensitivity: '50 µV / div',
    sweepSpeed: '10 ms / div',
    normal: {
      label: 'Reposo Normal',
      latency: '—',
      amplitude: '0 µV (Silencio)',
      velocity: '—',
      duration: 'Silencio basal',
      // Baseline electrical silence with only minor noise
      path: 'M 10 120 Q 50 121 100 120 Q 160 119 220 120 Q 280 121 350 120 Q 420 119 490 120 L 580 120',
      markers: { onset: 0, peak: { x: 0, y: 0 } },
      summary: 'Silencio eléctrico completo tras el cese de la actividad de inserción. Membrana muscular estable sin descargas espontáneas.',
      status: 'normal',
      statusText: 'Actividad de reposo fisiológica (0 descargas)',
    },
    pathologic: {
      label: 'Denervación Aguda (Fibrilaciones +3 / PSW)',
      latency: 'Espontánea',
      amplitude: '85 µV',
      velocity: '12-25 Hz',
      duration: '1.8 ms',
      // Spontaneous rhythmic fibrillations (sharp dip-rise-dip) and positive sharp waves (PSW: rapid positive dive then slow negative decay)
      path: 'M 10 120 L 60 120 Q 65 145 68 152 Q 72 152 75 90 Q 78 82 82 120 L 170 120 Q 174 165 178 172 Q 185 140 210 125 Q 235 120 270 120 Q 275 142 278 150 Q 282 150 285 88 Q 288 80 292 120 L 380 120 Q 385 168 390 174 Q 400 138 425 125 Q 450 120 480 120 Q 484 144 487 150 Q 490 150 493 88 Q 496 82 500 120 L 580 120',
      markers: { onset: 60, peak: { x: 75, y: 82 } },
      summary: 'Descargas espontáneas profusas de fibrilaciones rítmicas y ondas agudas positivas (PSW). Denervación activa con hiperexcitabilidad de fibra muscular desnuda.',
      status: 'abnormal',
      statusText: 'Signos de denervación activa aguda (Grado 3+)',
    },
  },
  {
    id: 'sural-sensory',
    title: 'Nervio Sural Sensitivo',
    nerve: 'N. Sural (S1-S2)',
    technique: 'Registro Antidrómico en Maléolo Externo · Estimulación en Pantorrilla (14 cm)',
    sensitivity: '10 µV / div',
    sweepSpeed: '1 ms / div',
    normal: {
      label: 'SNAP Sensitivo Normal',
      latency: '3.1 ms',
      amplitude: '19.4 µV',
      velocity: '49.2 m/s',
      duration: '1.4 ms',
      // Biphasic/Triphasic sharp sensory nerve action potential
      path: 'M 10 120 L 28 120 L 30 110 L 32 130 L 34 120 L 140 120 Q 155 120 162 135 Q 168 145 176 80 Q 184 62 192 148 Q 198 158 206 120 L 580 120',
      markers: { onset: 140, peak: { x: 184, y: 62 } },
      summary: 'Potencial sensitivo bifásico bien estructurado con amplitud superior a 10 µV y velocidad de conducción conservada.',
      status: 'normal',
      statusText: 'Integridad axonal sensitiva distal normal',
    },
    pathologic: {
      label: 'Polineuropatía Axonal Sensitiva',
      latency: '3.3 ms',
      amplitude: '2.2 µV (Colapso)',
      velocity: '44.8 m/s',
      duration: '2.1 ms',
      // Severely attenuated SNAP
      path: 'M 10 120 L 28 120 L 30 110 L 32 130 L 34 120 L 148 120 Q 160 120 168 126 Q 175 130 182 108 Q 188 104 195 128 Q 200 132 208 120 L 580 120',
      markers: { onset: 148, peak: { x: 188, y: 104 } },
      summary: 'Marcada reducción de amplitud (<4.0 µV) con velocidad de conducción relativamente preservada, indicativo de pérdida de fibras axonales de gran calibre.',
      status: 'abnormal',
      statusText: 'Patrón axónico degenerativo (Axonopatía sensitiva)',
    },
  },
];

export function ClinicalTraceSimulator() {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [isPathologic, setIsPathologic] = useState(false);

  const currentCase = CLINICAL_CASES[activeCaseIndex];
  const activeTrace = isPathologic ? currentCase.pathologic : currentCase.normal;

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-slate-900/95 dark:bg-slate-950 text-slate-100 border border-slate-700/60 shadow-2xl shadow-slate-950/40 overflow-hidden backdrop-blur-xl">
      {/* Oscilloscope Header / Clinical Toolbar */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
              Micro-Demo Interactiva
            </span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-xs text-slate-300 font-medium hidden md:inline">
            Visualizador Electrofisiológico en Tiempo Real
          </span>
        </div>

        {/* Technical Calibration Pill */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700">
            {currentCase.sensitivity}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700">
            {currentCase.sweepSpeed}
          </span>
          <span className="hidden lg:inline-flex px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60">
            Filtro: 20 Hz - 2 kHz
          </span>
        </div>
      </div>

      {/* Case Selector Tabs */}
      <div className="px-4 sm:px-6 pt-3 pb-2 flex items-center gap-2 border-b border-slate-800/80 overflow-x-auto scrollbar-none bg-slate-900/50">
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap mr-1 flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
          Caso:
        </span>
        {CLINICAL_CASES.map((c, idx) => (
          <button
            key={c.id}
            onClick={() => {
              setActiveCaseIndex(idx);
              setIsPathologic(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeCaseIndex === idx
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>{c.title}</span>
          </button>
        ))}
      </div>

      {/* Main Interactive Screen */}
      <div className="grid lg:grid-cols-12 gap-0">
        {/* Waveform Trace Viewport (7 Cols) */}
        <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          {/* Technique description & Toggle button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-xs font-mono text-cyan-400">{currentCase.nerve}</div>
              <div className="text-xs text-slate-400 line-clamp-1">{currentCase.technique}</div>
            </div>

            {/* ONE-CLICK TOGGLE: Normal vs Pathologic */}
            <div className="inline-flex p-1 rounded-xl bg-slate-800/90 border border-slate-700/80 self-start sm:self-auto shrink-0">
              <button
                onClick={() => setIsPathologic(false)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  !isPathologic
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Normal
              </button>
              <button
                onClick={() => setIsPathologic(true)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isPathologic
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Patológico
              </button>
            </div>
          </div>

          {/* Oscilloscope Grid Canvas */}
          <div className="relative w-full h-56 sm:h-64 rounded-2xl bg-slate-950 border border-slate-800/90 overflow-hidden shadow-inner flex items-center justify-center">
            {/* Grid Lines (Medical Oscilloscope calibrated divisions) */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #38bdf8 1px, transparent 1px),
                  linear-gradient(to bottom, #38bdf8 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px',
              }}
            />

            {/* Midline horizontal reference */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-700/60 border-t border-dashed border-slate-600/50" />

            {/* Stimulus indicator */}
            {currentCase.id !== 'needle-emg' && (
              <div className="absolute top-3 left-7 flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                <Zap className="w-2.5 h-2.5" /> Estímulo 0 ms
              </div>
            )}

            {/* SVG Waveform Trace */}
            <svg
              viewBox="0 0 600 240"
              className="w-full h-full relative z-10 filter drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]"
              preserveAspectRatio="none"
            >
              <AnimatePresence mode="wait">
                <motion.path
                  key={`${currentCase.id}-${isPathologic ? 'path' : 'norm'}`}
                  initial={{ pathLength: 0, opacity: 0.2 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  d={activeTrace.path}
                  fill="none"
                  stroke={isPathologic ? '#f59e0b' : '#38bdf8'}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </AnimatePresence>

              {/* Peak Marker Tag */}
              {activeTrace.markers.peak.x > 0 && (
                <g className="transition-all duration-300">
                  <circle
                    cx={activeTrace.markers.peak.x}
                    cy={activeTrace.markers.peak.y}
                    r="4.5"
                    fill={isPathologic ? '#f59e0b' : '#38bdf8'}
                  />
                  <line
                    x1={activeTrace.markers.peak.x}
                    y1={activeTrace.markers.peak.y}
                    x2={activeTrace.markers.peak.x}
                    y2="120"
                    stroke={isPathologic ? '#f59e0b' : '#38bdf8'}
                    strokeDasharray="2,2"
                    strokeWidth="1.2"
                    opacity="0.6"
                  />
                </g>
              )}
            </svg>

            {/* Status Watermark */}
            <div className="absolute bottom-2.5 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700/60 text-slate-300">
              {activeTrace.label}
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              Trazo bioeléctrico calibrado para correlación clínica
            </span>
            <span className="font-mono text-slate-500">ElectoDX Engine v2</span>
          </div>
        </div>

        {/* Telemetry & Quantitative Analysis (5 Cols) */}
        <div className="lg:col-span-5 p-4 sm:p-6 flex flex-col justify-between bg-slate-900/90">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Telemetría Clínica
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  isPathologic
                    ? 'bg-amber-950/70 text-amber-300 border-amber-800/80'
                    : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80'
                }`}
              >
                {isPathologic ? 'Patológico' : 'Fisiológico'}
              </span>
            </div>

            {/* Numeric Parameters Grid in Monospace Font */}
            <div className="grid grid-cols-2 gap-2.5 mb-5 font-mono">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase tracking-tight">Latencia Distal</div>
                <div
                  className={`text-lg sm:text-xl font-bold mt-0.5 ${
                    isPathologic ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {activeTrace.latency}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">Norma: &lt; 4.0 ms</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase tracking-tight">Amplitud Pico</div>
                <div
                  className={`text-lg sm:text-xl font-bold mt-0.5 ${
                    isPathologic ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {activeTrace.amplitude}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">Norma: &gt; 4.5 mV</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase tracking-tight">Velocidad (VCN)</div>
                <div
                  className={`text-lg sm:text-xl font-bold mt-0.5 ${
                    isPathologic ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {activeTrace.velocity}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">Norma: &gt; 50 m/s</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase tracking-tight">Duración CMAP</div>
                <div
                  className={`text-lg sm:text-xl font-bold mt-0.5 ${
                    isPathologic ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {activeTrace.duration}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">Dispersión: normal</div>
              </div>
            </div>

            {/* Diagnostic Conclusion Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 mb-4">
              <div className="text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                {isPathologic ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span>{activeTrace.statusText}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeTrace.summary}
              </p>
            </div>
          </div>

          {/* Action to deeper simulator */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">
              Más de 470 trazos diagnósticos interactivos con registro guiado.
            </span>
            <Link
              to="/ejercicios"
              className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap"
            >
              <span>Abrir simulador</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
