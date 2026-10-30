// src/components/simulator/traceEngine/signalMath.ts
// Motor matemático biofísico de generación de curvas neurofisiológicas calibradas (EMG / NCV)

import type { TraceParameters, TraceStudyType, WaveformControlPoint } from './types';

export interface TracePlotGeometry {
  width: number;
  height: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  plotWidth: number;
  plotHeight: number;
  baselineY: number;
  timeWindowMs: number;
  maxAmpDisplay: number;
  ampUnits: string;
}

export function computeGeometry(
  studyType: TraceStudyType,
  sweepSpeedStr: string,
  sensitivityStr: string,
  width = 600,
  height = 260
): TracePlotGeometry {
  const paddingLeft = 52;
  const paddingRight = 24;
  const paddingTop = 26;
  const paddingBottom = 34;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const baselineY = paddingTop + plotHeight * 0.62;

  // Derivar ventana temporal (10 divisiones horizontales estándar)
  let msPerDiv = 2; // Default 2 ms/div (20 ms window)
  if (sweepSpeedStr.includes('1 ms')) msPerDiv = 1;
  else if (sweepSpeedStr.includes('5 ms')) msPerDiv = 5;
  else if (sweepSpeedStr.includes('10 ms')) msPerDiv = 10;
  else if (sweepSpeedStr.includes('20 ms')) msPerDiv = 20;
  else if (studyType === 'sensory') msPerDiv = 1;
  else if (studyType === 'needle') msPerDiv = 10;

  const timeWindowMs = msPerDiv * 10;

  // Derivar amplitud máxima mostrada (8 divisiones verticales estándar)
  let ampUnits = 'mV';
  let valPerDiv = 2; // Default 2 mV/div

  if (studyType === 'sensory') {
    ampUnits = 'µV';
    valPerDiv = 10; // 10 µV / div
    if (sensitivityStr.includes('20')) valPerDiv = 20;
    else if (sensitivityStr.includes('50')) valPerDiv = 50;
  } else if (studyType === 'needle') {
    ampUnits = 'µV';
    valPerDiv = 50; // 50 µV / div
    if (sensitivityStr.includes('100')) valPerDiv = 100;
    else if (sensitivityStr.includes('200')) valPerDiv = 200;
  } else {
    // motor
    ampUnits = 'mV';
    valPerDiv = 2; // 2 mV / div
    if (sensitivityStr.includes('1 mV')) valPerDiv = 1;
    else if (sensitivityStr.includes('5 mV')) valPerDiv = 5;
  }

  const maxAmpDisplay = valPerDiv * 8;

  return {
    width,
    height,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    plotWidth,
    plotHeight,
    baselineY,
    timeWindowMs,
    maxAmpDisplay,
    ampUnits,
  };
}

export interface GeneratedCurve {
  pathData: string;
  proximalPathData?: string;
  onsetX: number;
  peakX: number;
  peakY: number;
  timeWindowMs: number;
}

/**
 * Genera la curva fisiológica continua basada en los parámetros electrofisiológicos
 */
export function generateWaveform(
  params: TraceParameters,
  studyType: TraceStudyType,
  geo: TracePlotGeometry,
  showProximal = false
): GeneratedCurve {
  const { plotHeight, maxAmpDisplay } = geo;
  const numSamples = 240;

  // Escala vertical: píxeles por mV o µV (convención electrodiagnóstica: negativo es arriba)
  const ampScale = (plotHeight * 0.52) / Math.max(0.1, maxAmpDisplay);

  if (params.customWaveform?.points && params.customWaveform.points.length >= 2) {
    return generateCustomPointsWaveform(params.customWaveform.points, geo, ampScale);
  }

  if (studyType === 'needle') {
    return generateNeedleWaveform(params, geo, numSamples);
  }

  if (studyType === 'sensory') {
    return generateSensoryWaveform(params, geo, numSamples);
  }

  // Por defecto: Motor CMAP
  return generateMotorCmapWaveform(params, geo, numSamples, ampScale, showProximal);
}

export function calculateMetricsFromControlPoints(points: WaveformControlPoint[]): {
  latency: number;
  amplitude: number;
  duration: number;
} {
  if (!points || points.length === 0) return { latency: 3.4, amplitude: 9.0, duration: 5.2 };

  const onsetPt = points.find((p) => p.type === 'onset') ?? points[0];
  const peakPt = points.reduce((max, p) => (p.voltage > max.voltage ? p : max), points[0]);
  const returnPt = points.find((p) => p.type === 'return') ?? points[points.length - 1];

  const latency = parseFloat(Math.max(0, onsetPt.timeMs).toFixed(1));
  const amplitude = parseFloat(Math.max(0, peakPt.voltage).toFixed(1));
  const duration = parseFloat(Math.max(1.0, returnPt.timeMs - onsetPt.timeMs).toFixed(1));

  return { latency, amplitude, duration };
}

function generateCustomPointsWaveform(
  points: WaveformControlPoint[],
  geo: TracePlotGeometry,
  ampScale: number
): GeneratedCurve {
  const { plotWidth, baselineY, paddingLeft, timeWindowMs } = geo;
  const sorted = [...points].sort((a, b) => a.timeMs - b.timeMs);

  const onsetPt = sorted.find((p) => p.type === 'onset') ?? sorted[0];
  const peakPt = sorted.reduce((max, p) => (p.voltage > max.voltage ? p : max), sorted[0]);

  const calcOnsetX = paddingLeft + (onsetPt.timeMs / timeWindowMs) * plotWidth;
  const calcPeakX = paddingLeft + (peakPt.timeMs / timeWindowMs) * plotWidth;
  const calcPeakY = baselineY - peakPt.voltage * ampScale;

  const numSamples = 240;
  const sampledPoints: [number, number][] = [];

  for (let i = 0; i <= numSamples; i++) {
    const t = (i / numSamples) * timeWindowMs;
    const x = paddingLeft + (t / timeWindowMs) * plotWidth;
    let y = baselineY;

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
      y = baselineY - v * ampScale;
    }

    y += (Math.sin(i * 1.5) + Math.cos(i * 2.8)) * 0.35;
    sampledPoints.push([x, y]);
  }

  const pathData = sampledPoints.reduce(
    (acc, [x, y], idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`,
    ''
  );

  return {
    pathData,
    onsetX: calcOnsetX,
    peakX: calcPeakX,
    peakY: calcPeakY,
    timeWindowMs,
  };
}

function generateMotorCmapWaveform(
  params: TraceParameters,
  geo: TracePlotGeometry,
  numSamples: number,
  ampScale: number,
  showProximal: boolean
): GeneratedCurve {
  const { plotWidth, baselineY, paddingLeft, timeWindowMs } = geo;
  const latency = Math.max(0.2, params.latency);
  const amplitude = Math.max(0, params.amplitude);
  const duration = Math.max(1.5, params.duration);
  const polyphasiaFactor = (params.polyphasia || 0) / 100;

  const peakOffset = amplitude * ampScale;
  const calcOnsetX = paddingLeft + (latency / timeWindowMs) * plotWidth;
  const calcPeakX = calcOnsetX + ((duration * 0.35) / timeWindowMs) * plotWidth;
  const calcPeakY = baselineY - peakOffset;

  const points: [number, number][] = [];

  for (let i = 0; i <= numSamples; i++) {
    const t = (i / numSamples) * timeWindowMs;
    const x = paddingLeft + (t / timeWindowMs) * plotWidth;
    let y = baselineY;

    // Artefacto de estimulación en t = 0.4 ms
    if (t >= 0.25 && t <= 0.75) {
      const stimPhase = (t - 0.25) / 0.5;
      y += Math.sin(stimPhase * Math.PI * 2) * 14;
    }

    // Onda CMAP
    if (t >= latency && t <= latency + duration) {
      const relT = (t - latency) / duration;
      if (relT < 0.6) {
        // Fase negativa principal inicial (arriba)
        const negPhase = Math.sin((relT / 0.6) * Math.PI);
        let deflection = negPhase * peakOffset;

        // Si hay dispersión temporal o polifasia, añadir ondulación secundaria
        if (polyphasiaFactor > 0 && relT > 0.3) {
          deflection += Math.sin(relT * Math.PI * 6) * (peakOffset * polyphasiaFactor * 0.35);
        }

        y -= deflection;
      } else {
        // Fase positiva secundaria (abajo)
        const posPhase = Math.sin(((relT - 0.6) / 0.4) * Math.PI);
        y += posPhase * (peakOffset * 0.42);
      }
    }

    // Ruido basal suave
    const noise = (Math.sin(i * 1.5) + Math.cos(i * 2.8)) * 0.35;
    y += noise;

    points.push([x, y]);
  }

  const pathData = points.reduce(
    (acc, [x, y], idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`,
    ''
  );

  let proximalPathData: string | undefined;

  if (showProximal) {
    const proxLatency = params.proximalLatency ?? latency + 4.2;
    const hasBlock = !!params.conductionBlock;
    const proxAmp = params.proximalAmplitude ?? (hasBlock ? amplitude * 0.42 : amplitude * 0.92);
    const proxDur = params.proximalDuration ?? (hasBlock ? duration * 1.35 : duration * 1.08);
    const proxPeakOffset = proxAmp * ampScale;

    const proxPoints: [number, number][] = [];
    for (let i = 0; i <= numSamples; i++) {
      const t = (i / numSamples) * timeWindowMs;
      const x = paddingLeft + (t / timeWindowMs) * plotWidth;
      let y = baselineY;

      // Artefacto proximal
      if (t >= 0.25 && t <= 0.75) {
        const stimPhase = (t - 0.25) / 0.5;
        y += Math.sin(stimPhase * Math.PI * 2) * 11;
      }

      if (t >= proxLatency && t <= proxLatency + proxDur) {
        const relT = (t - proxLatency) / proxDur;
        if (relT < 0.6) {
          y -= Math.sin((relT / 0.6) * Math.PI) * proxPeakOffset;
        } else {
          y += Math.sin(((relT - 0.6) / 0.4) * Math.PI) * (proxPeakOffset * 0.42);
        }
      }

      y += (Math.sin(i * 2.1) + Math.cos(i * 3.4)) * 0.3;
      proxPoints.push([x, y]);
    }

    proximalPathData = proxPoints.reduce(
      (acc, [x, y], idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`,
      ''
    );
  }

  return {
    pathData,
    proximalPathData,
    onsetX: calcOnsetX,
    peakX: calcPeakX,
    peakY: calcPeakY,
    timeWindowMs,
  };
}

function generateSensoryWaveform(
  params: TraceParameters,
  geo: TracePlotGeometry,
  numSamples: number
): GeneratedCurve {
  const { plotWidth, plotHeight, baselineY, paddingLeft, timeWindowMs, maxAmpDisplay } = geo;
  const latency = Math.max(0.2, params.latency);
  const amplitude = Math.max(0, params.amplitude);
  const duration = Math.max(0.8, params.duration);

  const ampScale = (plotHeight * 0.55) / Math.max(1, maxAmpDisplay);
  const peakOffset = amplitude * ampScale;
  const calcOnsetX = paddingLeft + (latency / timeWindowMs) * plotWidth;
  const calcPeakX = calcOnsetX + ((duration * 0.3) / timeWindowMs) * plotWidth;
  const calcPeakY = baselineY - peakOffset;

  const points: [number, number][] = [];

  for (let i = 0; i <= numSamples; i++) {
    const t = (i / numSamples) * timeWindowMs;
    const x = paddingLeft + (t / timeWindowMs) * plotWidth;
    let y = baselineY;

    // Artefacto de estímulo rápido
    if (t >= 0.15 && t <= 0.45) {
      const stimPhase = (t - 0.15) / 0.3;
      y += Math.sin(stimPhase * Math.PI * 2) * 10;
    }

    // SNAP: rápida deflexión negativa aguda (pico arriba) y positiva (abajo)
    if (t >= latency && t <= latency + duration) {
      const relT = (t - latency) / duration;
      if (relT < 0.15) {
        // Pequeño dip positivo inicial pre-onset
        y += Math.sin((relT / 0.15) * Math.PI) * (peakOffset * 0.18);
      } else if (relT < 0.6) {
        // Pico negativo agudo
        const phase = (relT - 0.15) / 0.45;
        y -= Math.sin(phase * Math.PI) * peakOffset;
      } else {
        // Rebound positivo agudo
        const phase = (relT - 0.6) / 0.4;
        y += Math.sin(phase * Math.PI) * (peakOffset * 0.55);
      }
    }

    y += (Math.sin(i * 2.3) + Math.cos(i * 4.1)) * 0.3;
    points.push([x, y]);
  }

  const pathData = points.reduce(
    (acc, [x, y], idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`,
    ''
  );

  return {
    pathData,
    onsetX: calcOnsetX,
    peakX: calcPeakX,
    peakY: calcPeakY,
    timeWindowMs,
  };
}

function generateNeedleWaveform(
  params: TraceParameters,
  geo: TracePlotGeometry,
  numSamples: number
): GeneratedCurve {
  const { plotWidth, plotHeight, baselineY, paddingLeft, timeWindowMs, maxAmpDisplay } = geo;
  const pattern = params.needlePattern || 'normal_silence';
  const ampScale = (plotHeight * 0.5) / Math.max(10, maxAmpDisplay);
  const amplitude = params.amplitude || 80;
  const peakOffset = amplitude * ampScale;

  const points: [number, number][] = [];

  for (let i = 0; i <= numSamples; i++) {
    const t = (i / numSamples) * timeWindowMs;
    const x = paddingLeft + (t / timeWindowMs) * plotWidth;
    let y = baselineY;

    if (pattern === 'normal_silence') {
      // Silencio eléctrico normal con micro-ondulaciones térmicas
      y += (Math.sin(i * 0.8) + Math.cos(i * 1.9)) * 0.5;
    } else if (pattern === 'fibrillations') {
      // Fibrilaciones rítmicas (cada 25 ms aprox, deflexión positiva rápida hacia abajo y pico negativo agudo hacia arriba)
      const period = 22;
      const modT = t % period;
      if (modT >= 2 && modT <= 5.5) {
        const rel = (modT - 2) / 3.5;
        if (rel < 0.3) {
          y += Math.sin((rel / 0.3) * Math.PI) * (peakOffset * 0.35); // deflexión positiva
        } else {
          y -= Math.sin(((rel - 0.3) / 0.7) * Math.PI) * peakOffset; // pico negativo
        }
      }
      y += (Math.sin(i * 1.2) + Math.cos(i * 2.7)) * 0.4;
    } else if (pattern === 'positive_waves') {
      // Ondas agudas positivas (PSW: inmersión rápida hacia abajo y retorno lento exponencial)
      const period = 38;
      const modT = t % period;
      if (modT >= 3 && modT <= 16) {
        const rel = (modT - 3) / 13;
        if (rel < 0.15) {
          y += (rel / 0.15) * peakOffset * 1.2;
        } else {
          y += (1 - (rel - 0.15) / 0.85) * peakOffset * 1.2 * Math.exp(-rel * 2);
        }
      }
      y += (Math.sin(i * 1.1) + Math.cos(i * 2.2)) * 0.4;
    } else if (pattern === 'fasciculations') {
      // Fasciculaciones: disparos aislados e irregulares de gran amplitud
      if ((t >= 15 && t <= 24) || (t >= 65 && t <= 75)) {
        const start = t >= 65 ? 65 : 15;
        const dur = t >= 65 ? 10 : 9;
        const rel = (t - start) / dur;
        y -= Math.sin(rel * Math.PI * 3) * peakOffset * 1.3 * (1 - rel);
      }
      y += (Math.sin(i * 0.9) + Math.cos(i * 2.1)) * 0.5;
    } else if (pattern === 'myotonia') {
      // Descargas miotónicas de alta frecuencia modulada en amplitud
      const myoAmp = peakOffset * (0.5 + 0.5 * Math.sin(t * 0.08));
      y += Math.sin(t * 1.2) * myoAmp * 0.8;
    } else if (pattern === 'neurogenic_mup') {
      // PUM neurógeno gigante (> 5 mV / duración prolongada)
      if (t >= 35 && t <= 52) {
        const rel = (t - 35) / 17;
        y -= Math.sin(rel * Math.PI * 2) * peakOffset * 1.6;
      }
      y += (Math.sin(i * 1.2) + Math.cos(i * 2.5)) * 0.4;
    } else if (pattern === 'myopathic_mup') {
      // PUM miopático: baja amplitud, corta duración, polifásico
      if ((t >= 20 && t <= 27) || (t >= 45 && t <= 52) || (t >= 70 && t <= 77)) {
        const base = t >= 70 ? 70 : t >= 45 ? 45 : 20;
        const rel = (t - base) / 7;
        y -= Math.sin(rel * Math.PI * 4) * peakOffset * 0.7;
      }
      y += (Math.sin(i * 1.5) + Math.cos(i * 3.1)) * 0.4;
    }

    points.push([x, y]);
  }

  const pathData = points.reduce(
    (acc, [x, y], idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`,
    ''
  );

  return {
    pathData,
    onsetX: paddingLeft + plotWidth * 0.25,
    peakX: paddingLeft + plotWidth * 0.35,
    peakY: baselineY - peakOffset * 0.8,
    timeWindowMs,
  };
}
