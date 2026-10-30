import type { SessionModality } from '../../types/academicGradebook';

const LOCATION_MARK = '📍 Ubicación: ';

export function splitIsoToLocalDateTime(iso: string): { date: string; time: string } {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return { date: '', time: '19:00' };
  const localIso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString();
  return { date: localIso.slice(0, 10), time: localIso.slice(11, 16) };
}

/** Valores `datetime-local` ya expresan la hora de pared, sin convertir zona. */
export function splitDateTimeLocalInput(value: string): { date: string; time: string } {
  if (!value) return { date: '', time: '19:00' };
  const [date, time] = value.split('T');
  return { date: date || '', time: (time || '19:00').slice(0, 5) };
}

export function splitStoredDescription(raw: string | null | undefined): {
  description: string;
  location: string;
} {
  if (!raw) return { description: '', location: '' };
  const index = raw.lastIndexOf(LOCATION_MARK);
  if (index === -1) return { description: raw.trim(), location: '' };
  const location = raw.slice(index + LOCATION_MARK.length).split('\n')[0]?.trim() ?? '';
  const description = `${raw.slice(0, index)}`.trim();
  return { description, location };
}

export function composeClassDescription(
  description: string,
  location: string,
  modality: SessionModality,
): string {
  const parts = [description.trim()];
  if (modality === 'in_person' && location.trim()) {
    parts.push(`${LOCATION_MARK}${location.trim()}`);
  }
  return parts.filter(Boolean).join('\n\n');
}
