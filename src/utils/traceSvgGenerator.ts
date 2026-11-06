import { CLINICAL_PRESETS } from '../components/simulator/traceEngine/defaultPresets';
import type {
  NeedlePattern,
  TraceCaseDefinition,
  TraceParameters,
  TraceStudyType,
} from '../components/simulator/traceEngine/types';

export interface RenderTraceSvgInput {
  tracePresetId?: string;
  variant?: 'normal' | 'pathologic' | 'comparison';
  studyType?: TraceStudyType;
  latencyMs?: number;
  amplitude?: number;
  durationMs?: number;
  proximalLatencyMs?: number;
  proximalAmplitude?: number;
  proximalDurationMs?: number;
  conductionBlock?: boolean;
  temporalDispersion?: boolean;
  needlePattern?: NeedlePattern;
  sweepMsPerDiv?: number;
  gainPerDiv?: string;
  headerTitle?: string;
  hideDiagnosis?: boolean;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function parseSweepMsPerDiv(sweepSpeed?: string, fallback = 2): number {
  if (!sweepSpeed) return fallback;
  const m = sweepSpeed.match(/([\d.]+)\s*ms/i);
  return m ? Number(m[1]) || fallback : fallback;
}

function parseGainValue(sensitivity?: string, fallback = 2): { value: number; unit: string } {
  if (!sensitivity) return { value: fallback, unit: 'mV' };
  const m = sensitivity.match(/([\d.]+)\s*(mV|µV|uV)/i);
  if (!m) return { value: fallback, unit: 'mV' };
  return {
    value: Number(m[1]) || fallback,
    unit: m[2].toLowerCase() === 'uv' ? 'µV' : m[2],
  };
}

function generateEvokedPath(params: {
  x0: number;
  width: number;
  yBase: number;
  pxPerDivY: number;
  totalTimeMs: number;
  latencyMs: number;
  amplitude: number;
  durationMs: number;
  gainPerDivValue: number;
  temporalDispersion?: boolean;
  polyphasia?: number;
}): { path: string; onsetX: number; peakX: number; peakY: number } {
  const {
    x0,
    width,
    yBase,
    pxPerDivY,
    totalTimeMs,
    latencyMs,
    amplitude,
    durationMs,
    gainPerDivValue,
    temporalDispersion,
    polyphasia,
  } = params;

  const samples = 360;
  const pts: string[] = [];
  const ampPx = Math.min((amplitude / Math.max(gainPerDivValue, 0.1)) * pxPerDivY, pxPerDivY * 3.4);
  const effDur = temporalDispersion ? durationMs * 1.35 : durationMs;

  let peakX = x0;
  let peakY = yBase;

  for (let i = 0; i <= samples; i++) {
    const frac = i / samples;
    const t = frac * totalTimeMs;
    const x = x0 + frac * width;
    let yOffset = 0;

    // Small stimulus artifact at t = 0.35..0.65 ms
    if (t >= 0.35 && t <= 0.65) {
      const s = (t - 0.35) / 0.3;
      yOffset = -Math.sin(s * Math.PI * 2) * 10;
    } else if (t >= latencyMs) {
      const dt = t - latencyMs;
      if (dt <= effDur * 2.2) {
        const u = dt / Math.max(effDur, 0.8);
        // Biphasic negative-first potential (upward is negative in EMG convention)
        if (u <= 1.0) {
          yOffset = -ampPx * Math.sin(u * Math.PI) * Math.pow(1 - u * 0.25, 0.8);
        } else if (u <= 2.1) {
          const u2 = (u - 1.0) / 1.1;
          yOffset = ampPx * 0.42 * Math.sin(u2 * Math.PI) * (1 - u2 * 0.4);
        }
        if ((polyphasia && polyphasia > 20) || temporalDispersion) {
          yOffset += -ampPx * 0.18 * Math.sin(u * Math.PI * 4.5) * Math.exp(-u * 0.7);
        }
      }
    }

    const y = yBase + yOffset;
    if (y < peakY) {
      peakY = y;
      peakX = x;
    }
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }

  const onsetX = x0 + Math.min(Math.max(latencyMs / totalTimeMs, 0), 0.98) * width;
  return { path: pts.join(' '), onsetX, peakX, peakY };
}

function generateNeedlePath(params: {
  x0: number;
  width: number;
  yBase: number;
  pxPerDivY: number;
  pattern: NeedlePattern;
}): string {
  const { x0, width, yBase, pxPerDivY, pattern } = params;
  const samples = 480;
  const pts: string[] = [];

  for (let i = 0; i <= samples; i++) {
    const frac = i / samples;
    const x = x0 + frac * width;
    let dy = 0;

    if (pattern === 'fibrillations') {
      const period = 0.14;
      const local = (frac % period) / period;
      if (local < 0.18) {
        const u = local / 0.18;
        dy =
          u < 0.5
            ? -pxPerDivY * 1.3 * Math.sin(u * 2 * Math.PI)
            : pxPerDivY * 0.5 * Math.sin((u - 0.5) * 2 * Math.PI);
      }
    } else if (pattern === 'positive_waves') {
      const period = 0.18;
      const local = (frac % period) / period;
      if (local < 0.08) {
        dy = pxPerDivY * 1.6 * Math.sin((local / 0.08) * Math.PI);
      } else if (local < 0.38) {
        const u = (local - 0.08) / 0.3;
        dy = -pxPerDivY * 0.45 * Math.sin(u * Math.PI) * (1 - u);
      }
    } else if (pattern === 'myotonia') {
      const env = 0.35 + 0.65 * Math.sin(frac * Math.PI);
      const freq = 18 + 14 * Math.sin(frac * Math.PI);
      const phase = (frac * freq) % 1;
      if (phase < 0.25) {
        dy = pxPerDivY * 1.5 * env * Math.sin((phase / 0.25) * Math.PI);
      } else if (phase < 0.55) {
        dy = -pxPerDivY * 0.55 * env * Math.sin(((phase - 0.25) / 0.3) * Math.PI);
      }
    } else if (pattern === 'neurogenic_mup') {
      const period = 0.28;
      const local = (frac % period) / period;
      if (local > 0.1 && local < 0.45) {
        const u = (local - 0.1) / 0.35;
        dy =
          -pxPerDivY * 2.4 * Math.sin(u * Math.PI * 2) +
          pxPerDivY * 0.5 * Math.sin(u * Math.PI * 6);
      }
    } else if (pattern === 'myopathic_mup') {
      const period = 0.09;
      const local = (frac % period) / period;
      if (local < 0.45) {
        const u = local / 0.45;
        dy = -pxPerDivY * 0.55 * Math.sin(u * Math.PI * 5) * Math.sin(u * Math.PI);
      }
    } else if (pattern === 'fasciculations') {
      if ((frac > 0.22 && frac < 0.32) || (frac > 0.68 && frac < 0.78)) {
        const u = frac < 0.5 ? (frac - 0.22) / 0.1 : (frac - 0.68) / 0.1;
        dy = -pxPerDivY * 2.0 * Math.sin(u * Math.PI * 3);
      }
    } else if (pattern === 'normal_mup') {
      const period = 0.22;
      const local = (frac % period) / period;
      if (local > 0.1 && local < 0.32) {
        const u = (local - 0.1) / 0.22;
        dy = -pxPerDivY * 1.2 * Math.sin(u * Math.PI * 2);
      }
    }

    const y = yBase + dy;
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return pts.join(' ');
}

export function renderCalibratedTraceSvg(input: RenderTraceSvgInput): {
  svg: string;
  presetUsed?: TraceCaseDefinition;
  summaryMeta: {
    studyType: TraceStudyType;
    sweepSpeed: string;
    sensitivity: string;
    latencyMs: number;
    amplitude: number;
    durationMs: number;
  };
} {
  const preset = input.tracePresetId
    ? CLINICAL_PRESETS.find((p) => p.id === input.tracePresetId)
    : undefined;

  const variant = input.variant ?? 'pathologic';
  const activeTrace: TraceParameters | undefined = preset
    ? variant === 'normal'
      ? preset.normal
      : preset.pathologic ?? preset.normal
    : undefined;

  const studyType: TraceStudyType = input.studyType ?? preset?.studyType ?? 'motor';
  const sweepMsPerDiv =
    input.sweepMsPerDiv ?? parseSweepMsPerDiv(preset?.sweepSpeed, studyType === 'needle' ? 10 : 2);
  const gainParsed = parseGainValue(
    input.gainPerDiv ?? preset?.sensitivity,
    studyType === 'sensory' ? 20 : studyType === 'needle' ? 100 : 2
  );
  const sweepSpeedLabel = `${sweepMsPerDiv} ms / div`;
  const sensitivityLabel = `${gainParsed.value} ${gainParsed.unit} / div`;

  const latencyMs = input.latencyMs ?? activeTrace?.latency ?? 4.2;
  const amplitude = input.amplitude ?? activeTrace?.amplitude ?? 5.0;
  const durationMs = input.durationMs ?? activeTrace?.duration ?? 6.0;
  const needlePattern = input.needlePattern ?? activeTrace?.needlePattern;
  const conductionBlock = input.conductionBlock ?? activeTrace?.conductionBlock ?? false;
  const temporalDispersion = input.temporalDispersion ?? activeTrace?.temporalDispersion ?? false;

  const hideDiagnosis = input.hideDiagnosis !== false;
  const headerTitle =
    input.headerTitle ??
    (hideDiagnosis
      ? `Registro Electrodiagnóstico (${studyType === 'motor' ? 'CMAP' : studyType === 'sensory' ? 'SNAP' : studyType === 'needle' ? 'EMG Aguja' : 'Respuesta Tardía'})`
      : preset?.title ?? 'Trazado EMG Calibrado');

  const width = 800;
  const height = 420;
  const padX = 48;
  const padTop = 52;
  const gridW = width - padX * 2;
  const gridH = 304;
  const cols = 10;
  const rows = 8;
  const pxPerDivX = gridW / cols;
  const pxPerDivY = gridH / rows;
  const totalTimeMs = sweepMsPerDiv * cols;

  // Grid lines
  const vLines: string[] = [];
  for (let c = 0; c <= cols; c++) {
    const x = padX + c * pxPerDivX;
    const major = c === 0 || c === 5 || c === cols;
    vLines.push(
      `<line x1="${x}" y1="${padTop}" x2="${x}" y2="${padTop + gridH}" stroke="${
        major ? '#1e3a5f' : '#0f233d'
      }" stroke-width="${major ? '1.3' : '0.8'}" stroke-dasharray="${major ? '' : '3,3'}" />`
    );
  }

  const hLines: string[] = [];
  for (let r = 0; r <= rows; r++) {
    const y = padTop + r * pxPerDivY;
    const major = r === 0 || r === 4 || r === rows;
    hLines.push(
      `<line x1="${padX}" y1="${y}" x2="${padX + gridW}" y2="${y}" stroke="${
        major ? '#1e3a5f' : '#0f233d'
      }" stroke-width="${major ? '1.3' : '0.8'}" stroke-dasharray="${major ? '' : '3,3'}" />`
    );
  }

  const isDualComparison =
    variant === 'comparison' && preset?.normal && preset?.pathologic && studyType !== 'needle';
  const hasProximal =
    !isDualComparison &&
    studyType !== 'needle' &&
    Boolean(
      input.proximalAmplitude !== undefined ||
        activeTrace?.proximalAmplitude !== undefined ||
        conductionBlock
    );

  let traceElements = '';

  if (studyType === 'needle' || needlePattern) {
    const yBase = padTop + gridH * 0.52;
    const path = generateNeedlePath({
      x0: padX,
      width: gridW,
      yBase,
      pxPerDivY,
      pattern: needlePattern ?? 'fibrillations',
    });
    traceElements = `
      <path d="${path}" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    `;
  } else if (isDualComparison && preset?.normal && preset?.pathologic) {
    const yTop = padTop + gridH * 0.34;
    const yBot = padTop + gridH * 0.74;
    const ch1 = generateEvokedPath({
      x0: padX,
      width: gridW,
      yBase: yTop,
      pxPerDivY,
      totalTimeMs,
      latencyMs: preset.normal.latency,
      amplitude: preset.normal.amplitude,
      durationMs: preset.normal.duration,
      gainPerDivValue: gainParsed.value,
    });
    const ch2 = generateEvokedPath({
      x0: padX,
      width: gridW,
      yBase: yBot,
      pxPerDivY,
      totalTimeMs,
      latencyMs: preset.pathologic.latency,
      amplitude: preset.pathologic.amplitude,
      durationMs: preset.pathologic.duration,
      gainPerDivValue: gainParsed.value,
      temporalDispersion: preset.pathologic.temporalDispersion,
      polyphasia: preset.pathologic.polyphasia,
    });
    traceElements = `
      <path d="${ch1.path}" fill="none" stroke="#38bdf8" stroke-width="2.2" />
      <line x1="${ch1.onsetX.toFixed(1)}" y1="${(yTop - 22).toFixed(1)}" x2="${ch1.onsetX.toFixed(1)}" y2="${(yTop + 22).toFixed(1)}" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,2" />
      <text x="${(padX + 8).toFixed(1)}" y="${(yTop - 12).toFixed(1)}" fill="#38bdf8" font-family="monospace" font-size="11">CH1 (Control / Distal): L=${preset.normal.latency} ms · A=${preset.normal.amplitude} ${gainParsed.unit}</text>

      <path d="${ch2.path}" fill="none" stroke="#10b981" stroke-width="2.4" />
      <line x1="${ch2.onsetX.toFixed(1)}" y1="${(yBot - 22).toFixed(1)}" x2="${ch2.onsetX.toFixed(1)}" y2="${(yBot + 22).toFixed(1)}" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,2" />
      <text x="${(padX + 8).toFixed(1)}" y="${(yBot - 12).toFixed(1)}" fill="#10b981" font-family="monospace" font-size="11">CH2 (Estudio): L=${preset.pathologic.latency} ms · A=${preset.pathologic.amplitude} ${gainParsed.unit}</text>
    `;
  } else if (hasProximal) {
    const yTop = padTop + gridH * 0.34;
    const yBot = padTop + gridH * 0.74;
    const proxLat = input.proximalLatencyMs ?? activeTrace?.proximalLatency ?? +(latencyMs + 4.1).toFixed(1);
    const proxAmp =
      input.proximalAmplitude ??
      activeTrace?.proximalAmplitude ??
      (conductionBlock ? +(amplitude * 0.38).toFixed(1) : +(amplitude * 0.92).toFixed(1));
    const proxDur =
      input.proximalDurationMs ??
      activeTrace?.proximalDuration ??
      (temporalDispersion ? +(durationMs * 1.45).toFixed(1) : durationMs);

    const distal = generateEvokedPath({
      x0: padX,
      width: gridW,
      yBase: yTop,
      pxPerDivY,
      totalTimeMs,
      latencyMs,
      amplitude,
      durationMs,
      gainPerDivValue: gainParsed.value,
    });
    const proximal = generateEvokedPath({
      x0: padX,
      width: gridW,
      yBase: yBot,
      pxPerDivY,
      totalTimeMs,
      latencyMs: proxLat,
      amplitude: proxAmp,
      durationMs: proxDur,
      gainPerDivValue: gainParsed.value,
      temporalDispersion,
    });
    traceElements = `
      <path d="${distal.path}" fill="none" stroke="#10b981" stroke-width="2.3" />
      <line x1="${distal.onsetX.toFixed(1)}" y1="${(yTop - 22).toFixed(1)}" x2="${distal.onsetX.toFixed(1)}" y2="${(yTop + 22).toFixed(1)}" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,2" />
      <text x="${(padX + 8).toFixed(1)}" y="${(yTop - 12).toFixed(1)}" fill="#10b981" font-family="monospace" font-size="11">A1 Estímulo Distal · L1=${latencyMs} ms · Amp=${amplitude} ${gainParsed.unit}</text>

      <path d="${proximal.path}" fill="none" stroke="#38bdf8" stroke-width="2.3" />
      <line x1="${proximal.onsetX.toFixed(1)}" y1="${(yBot - 22).toFixed(1)}" x2="${proximal.onsetX.toFixed(1)}" y2="${(yBot + 22).toFixed(1)}" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,2" />
      <text x="${(padX + 8).toFixed(1)}" y="${(yBot - 12).toFixed(1)}" fill="#38bdf8" font-family="monospace" font-size="11">A2 Estímulo Proximal · L2=${proxLat} ms · Amp=${proxAmp} ${gainParsed.unit}</text>
    `;
  } else {
    const yBase = padTop + gridH * 0.56;
    const single = generateEvokedPath({
      x0: padX,
      width: gridW,
      yBase,
      pxPerDivY,
      totalTimeMs,
      latencyMs,
      amplitude,
      durationMs,
      gainPerDivValue: gainParsed.value,
      temporalDispersion,
      polyphasia: activeTrace?.polyphasia,
    });
    traceElements = `
      <path d="${single.path}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <line x1="${single.onsetX.toFixed(1)}" y1="${(yBase - 32).toFixed(1)}" x2="${single.onsetX.toFixed(1)}" y2="${(yBase + 32).toFixed(1)}" stroke="#f59e0b" stroke-width="1.6" stroke-dasharray="4,2" />
      <text x="${(single.onsetX + 5).toFixed(1)}" y="${(yBase + 26).toFixed(1)}" fill="#f59e0b" font-family="monospace" font-size="11" font-weight="bold">L1: ${latencyMs} ms</text>
      <circle cx="${single.peakX.toFixed(1)}" cy="${single.peakY.toFixed(1)}" r="3.5" fill="#38bdf8" />
    `;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeXml(headerTitle)}">
  <rect width="${width}" height="${height}" rx="12" fill="#060d1a" />
  <rect x="${padX}" y="${padTop}" width="${gridW}" height="${gridH}" fill="#081224" stroke="#1e3a5f" stroke-width="1.5" />
  ${vLines.join('\n  ')}
  ${hLines.join('\n  ')}
  ${traceElements}
  <text x="${padX}" y="32" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700">${escapeXml(headerTitle)}</text>
  <text x="${width - padX}" y="32" text-anchor="end" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="600">Barrido: ${escapeXml(sweepSpeedLabel)} | Ganancia: ${escapeXml(sensitivityLabel)}</text>
  <text x="${padX}" y="${height - 22}" fill="#94a3b8" font-family="monospace" font-size="11">Escala: 10 div horizontales (${totalTimeMs} ms totales) × 8 div verticales · Negatividad hacia arriba (-)</text>
  <text x="${width - padX}" y="${height - 22}" text-anchor="end" fill="#64748b" font-family="monospace" font-size="11">NeuroSAFE EDX Calibrated Trace</text>
</svg>`;

  return {
    svg,
    presetUsed: preset,
    summaryMeta: {
      studyType,
      sweepSpeed: sweepSpeedLabel,
      sensitivity: sensitivityLabel,
      latencyMs,
      amplitude,
      durationMs,
    },
  };
}

export function buildDefaultTraceAltText(meta: {
  studyType: TraceStudyType;
  sweepSpeed: string;
  sensitivity: string;
  latencyMs: number;
  amplitude: number;
}): string {
  const label =
    meta.studyType === 'motor'
      ? 'CMAP motor'
      : meta.studyType === 'sensory'
      ? 'SNAP sensitivo'
      : meta.studyType === 'needle'
      ? 'EMG de aguja'
      : 'Respuesta tardía';
  return `Trazado electrodiagnóstico (${label}) calibrado a ${meta.sweepSpeed} y ganancia ${meta.sensitivity}; latencia de inicio ${meta.latencyMs} ms.`;
}

/**
 * Renderiza un trazo EMG calibrado y lo sube al bucket público `emg-trace-images`
 * de Supabase Storage para adjuntarlo a un reactivo `image_choice`.
 */
export async function uploadRenderedTraceSvgToStorage(
  topicId: string,
  input: RenderTraceSvgInput,
  customAlt?: string
): Promise<{
  imageUrl: string;
  imageAlt: string;
  svg: string;
  summaryMeta: ReturnType<typeof renderCalibratedTraceSvg>['summaryMeta'];
}> {
  const rendered = renderCalibratedTraceSvg({
    ...input,
    hideDiagnosis: input.hideDiagnosis !== false,
  });
  const imageAlt = customAlt?.trim() || buildDefaultTraceAltText(rendered.summaryMeta);
  const safeTopic = (topicId || 'general').replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
  const slug = (input.tracePresetId ?? input.studyType ?? 'trace')
    .replace(/[^a-z0-9-_]/gi, '-')
    .toLowerCase();
  const storagePath = `quiz-traces/${safeTopic}/${slug}-${Date.now()}.svg`;

  const { supabase, isSupabaseConfigured } = await import('../lib/supabase');
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no está configurado para subir imágenes al bucket emg-trace-images.');
  }

  const blob = new Blob([rendered.svg], { type: 'image/svg+xml;charset=utf-8' });
  const { error: uploadErr } = await supabase.storage
    .from('emg-trace-images')
    .upload(storagePath, blob, {
      contentType: 'image/svg+xml',
      upsert: true,
    });

  if (uploadErr) {
    throw new Error(`No se pudo subir el trazo a emg-trace-images: ${uploadErr.message}`);
  }

  const { data: pub } = supabase.storage.from('emg-trace-images').getPublicUrl(storagePath);
  return {
    imageUrl: pub.publicUrl,
    imageAlt,
    svg: rendered.svg,
    summaryMeta: rendered.summaryMeta,
  };
}

