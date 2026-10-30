import { measureMuap, indexToMs } from './measureMuap';
import {
  PUM_DISTANT_CONFIRM_CAP,
  PUM_OFFSET_ACCEPT_MS,
  PUM_OFFSET_ZERO_MS,
  PUM_ONSET_ACCEPT_MS,
  PUM_ONSET_ZERO_MS,
  PUM_PEAK_ACCEPT_MS,
  PUM_PEAK_ACCEPT_UV,
  PUM_PEAK_WRONG_TURN_UV,
  PUM_RISE_TIME_LIMIT_US,
  type CursorFeedback,
  type MetricAnalysisResult,
  type PumGroundTruth,
  type StudentMeasurement,
} from './types';

function rampScore(errorMs: number, acceptMs: number, zeroMs: number): number {
  if (errorMs <= acceptMs) return 25;
  if (errorMs >= zeroMs) return 0;
  return 25 * (1 - (errorMs - acceptMs) / (zeroMs - acceptMs));
}

function peakScore(
  signal: number[],
  studentIndex: number,
  trueIndex: number,
  samplingRate: number,
): { score: number; accepted: boolean; wrongTurn: boolean } {
  const n = signal.length;
  const iAl = Math.max(0, Math.min(n - 1, studentIndex));
  const iTrue = Math.max(0, Math.min(n - 1, trueIndex));
  const errorMs = Math.abs(indexToMs(iAl, samplingRate) - indexToMs(iTrue, samplingRate));
  const voltageGap = Math.abs(Math.abs(signal[iAl]) - Math.abs(signal[iTrue]));
  const wrongTurn = voltageGap > PUM_PEAK_WRONG_TURN_UV;
  if (errorMs > PUM_PEAK_ACCEPT_MS || wrongTurn) {
    return { score: 0, accepted: false, wrongTurn };
  }
  const voltageOk = Math.abs(signal[iAl] - signal[iTrue]) <= PUM_PEAK_ACCEPT_UV;
  if (!voltageOk) return { score: 0, accepted: false, wrongTurn: false };
  return { score: 25, accepted: true, wrongTurn: false };
}

function onsetFeedback(
  errorMs: number,
  studentStart: number,
  trueStart: number,
  signal: number[],
  accepted: boolean,
): string {
  if (accepted) return 'Inicio alineado con el despegue del potencial.';
  const v = Math.abs(signal[Math.max(0, Math.min(signal.length - 1, studentStart))]);
  if (studentStart < trueStart && v <= 8) {
    return 'Cursor de inicio adelantado: marcaste dentro del ruido térmico de la línea de base. Eso alarga artificialmente la duración.';
  }
  if (studentStart > trueStart && v > 15) {
    return 'Cursor de inicio retrasado: omitiste la deflexión positiva inicial lenta.';
  }
  if (errorMs > PUM_ONSET_ACCEPT_MS && studentStart < trueStart) {
    return 'Cursor de inicio adelantado: marcaste dentro del ruido de fondo. Esto alarga artificialmente la duración.';
  }
  return 'Cursor de inicio retrasado: omitiste la deflexión positiva inicial lenta.';
}

function offsetFeedback(errorMs: number, studentEnd: number, trueEnd: number, accepted: boolean): string {
  if (accepted) return 'Fin alineado con el retorno a la línea de base.';
  if (studentEnd < trueEnd) {
    return 'Cursor de fin prematuro: cortaste la fase de repolarización terminal tardía.';
  }
  if (errorMs > 0) {
    return 'Cursor de fin retrasado: incluiste la onda basal posterior; la duración calculada excede el valor real.';
  }
  return 'Cursor de fin fuera de la ventana de aceptación.';
}

export function gradeMeasurement(
  signal: number[],
  truth: PumGroundTruth,
  measurement: StudentMeasurement,
  samplingRate: number,
): MetricAnalysisResult {
  const metrics = measureMuap(signal, measurement, samplingRate);

  if (measurement.discardedDistant) {
    const correct = truth.isDistant || truth.riseTimeUs > PUM_RISE_TIME_LIMIT_US;
    const feedback: CursorFeedback = correct
      ? {
          startCursor: 'No aplica: descartaste el potencial.',
          endCursor: 'No aplica: descartaste el potencial.',
          peaks: 'No aplica: descartaste el potencial.',
          riseTimeWarning:
            'PUM distante: el tiempo de ascenso es > 0.5 ms. En la práctica real debes reubicar la aguja para obtener un sonido nítido.',
          discarded: 'Correcto: la aguja está lejos de la unidad; este potencial no se cuantifica.',
        }
      : {
          startCursor: 'No aplica: descartaste el potencial.',
          endCursor: 'No aplica: descartaste el potencial.',
          peaks: 'No aplica: descartaste el potencial.',
          discarded:
            'Este potencial es nítido (tiempo de ascenso < 0.5 ms). Descartarlo pierde una unidad cuantificable.',
        };
    return {
      ...metrics,
      score: correct ? 100 : 0,
      cursorScores: { start: correct ? 25 : 0, end: correct ? 25 : 0, neg: correct ? 25 : 0, pos: correct ? 25 : 0 },
      accepted: { start: correct, end: correct, neg: correct, pos: correct },
      feedback,
    };
  }

  const startErr = Math.abs(
    indexToMs(measurement.startIndex, samplingRate) - indexToMs(truth.startIndex, samplingRate),
  );
  const endErr = Math.abs(
    indexToMs(measurement.endIndex, samplingRate) - indexToMs(truth.endIndex, samplingRate),
  );
  const startScore = rampScore(startErr, PUM_ONSET_ACCEPT_MS, PUM_ONSET_ZERO_MS);
  const endScore = rampScore(endErr, PUM_OFFSET_ACCEPT_MS, PUM_OFFSET_ZERO_MS);
  const startAccepted = startErr <= PUM_ONSET_ACCEPT_MS;
  const endAccepted = endErr <= PUM_OFFSET_ACCEPT_MS;

  const neg = peakScore(signal, measurement.negativePeakIndex, truth.negativePeakIndex, samplingRate);
  const pos = peakScore(signal, measurement.positivePeakIndex, truth.positivePeakIndex, samplingRate);

  let score = startScore + endScore + neg.score + pos.score;
  const distant = truth.isDistant || truth.riseTimeUs > PUM_RISE_TIME_LIMIT_US;
  if (distant) {
    score = Math.min(score, PUM_DISTANT_CONFIRM_CAP);
  }

  let peaksText: string;
  if (neg.accepted && pos.accepted) {
    peaksText = 'Picos positivo y negativo correctamente identificados.';
  } else if (neg.wrongTurn || pos.wrongTurn) {
    peaksText =
      'Marcaste un giro o espícula intermedia en lugar del pico máximo. La amplitud real es mayor.';
  } else if (!neg.accepted) {
    peaksText = 'El pico negativo no coincide con la espiga principal.';
  } else {
    peaksText = 'El pico positivo no coincide con la deflexión inicial más profunda.';
  }

  const feedback: CursorFeedback = {
    startCursor: onsetFeedback(startErr, measurement.startIndex, truth.startIndex, signal, startAccepted),
    endCursor: offsetFeedback(endErr, measurement.endIndex, truth.endIndex, endAccepted),
    peaks: peaksText,
  };

  if (distant) {
    feedback.riseTimeWarning =
      'PUM distante: el tiempo de ascenso es > 0.5 ms. El sonido es sordo y los componentes agudos están atenuados. Reubica la aguja; este potencial no vale para cuantificar.';
  }

  return {
    ...metrics,
    score: Math.round(score * 10) / 10,
    cursorScores: { start: startScore, end: endScore, neg: neg.score, pos: pos.score },
    accepted: { start: startAccepted, end: endAccepted, neg: neg.accepted, pos: pos.accepted },
    feedback,
  };
}
