import type { LiveWorkshop } from '../types/database';
import { splitStoredDescription } from '../components/admin/liveClassFormUtils';

export interface SessionTeacher {
  id: string;
  name: string;
  specialty?: string | null;
}

export interface SessionTopicRef {
  topicId: string;
  moduleId: string;
}

export interface SessionBrief {
  teachers: SessionTeacher[];
  topics: SessionTopicRef[];
}

export interface SessionBriefRow {
  workshop_id: string;
  kind: string;
  teacher_id: string | null;
  teacher_name: string | null;
  topic_id: string | null;
  module_id: string | null;
  teacher_specialty?: string | null;
}

export function emptySessionBrief(): SessionBrief {
  return { teachers: [], topics: [] };
}

export function foldSessionBriefRows(rows: SessionBriefRow[]): Map<string, SessionBrief> {
  const map = new Map<string, SessionBrief>();
  const ensure = (workshopId: string) => {
    const current = map.get(workshopId);
    if (current) return current;
    const created = emptySessionBrief();
    map.set(workshopId, created);
    return created;
  };

  for (const row of rows) {
    if (!row.workshop_id) continue;
    const brief = ensure(row.workshop_id);
    if (row.kind === 'teacher' && row.teacher_id) {
      const specialty = row.teacher_specialty?.trim() || null;
      const existing = brief.teachers.find((teacher) => teacher.id === row.teacher_id);
      if (!existing) {
        brief.teachers.push({
          id: row.teacher_id,
          name: row.teacher_name?.trim() || 'Profesor',
          specialty,
        });
      } else if (!existing.specialty && specialty) {
        existing.specialty = specialty;
      }
    }
    if (row.kind === 'topic' && row.topic_id) {
      if (!brief.topics.some((topic) => topic.topicId === row.topic_id)) {
        brief.topics.push({
          topicId: row.topic_id,
          moduleId: row.module_id || '',
        });
      }
    }
  }

  return map;
}

export function briefForWorkshop(workshop: LiveWorkshop, brief?: SessionBrief | null): SessionBrief {
  const savedTopicIds = readSessionTopicIds(workshop);
  const topics = savedTopicIds.length
    ? savedTopicIds.map((topicId) => ({ topicId, moduleId: workshop.module_id }))
    : brief?.topics.length
      ? brief.topics
      : workshop.topic_id
        ? [{ topicId: workshop.topic_id, moduleId: workshop.module_id }]
        : [];
  return {
    teachers: brief?.teachers ?? [],
    topics,
  };
}

/** Texto para el alumno, sin la sede ni el listado automático de temas. */
export function sessionSummaryText(description: string | null | undefined): string {
  const { description: body } = splitStoredDescription(description);
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (line.includes('Temas cubiertos')) return false;
      if (line.includes('Código de acceso')) return false;
      return true;
    })
    .join('\n')
    .trim();
}

export function sessionLocation(description: string | null | undefined): string {
  return splitStoredDescription(description).location;
}

export function sessionModalityLabel(modality: LiveWorkshop['session_modality']): string {
  return modality === 'in_person' ? 'Presencial' : 'En línea';
}

const SESSION_TOPIC_IDS_KEY = 'session_topic_ids';

/** Temas que el docente guardó en esta clase. Vacío si la sesión aún no tiene lista explícita. */
export function readSessionTopicIds(workshop: Pick<LiveWorkshop, 'clinical_case_json'>): string[] {
  const raw = workshop.clinical_case_json?.[SESSION_TOPIC_IDS_KEY];
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((id): id is string => typeof id === 'string' && id.trim().length > 0))];
}

export function withSessionTopicIds(
  existing: Record<string, unknown> | null | undefined,
  topicIds: string[],
): Record<string, unknown> {
  return {
    ...(existing ?? {}),
    [SESSION_TOPIC_IDS_KEY]: [...new Set(topicIds.map((id) => id.trim()).filter(Boolean))],
  };
}

function icsStamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function icsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function buildSessionIcs(workshop: LiveWorkshop, location = ''): string {
  const start = icsStamp(workshop.scheduled_at);
  const endDate = new Date(workshop.scheduled_at);
  endDate.setMinutes(endDate.getMinutes() + (workshop.duration_minutes || 90));
  const end = icsStamp(endDate.toISOString());
  const place = location || (workshop.session_modality === 'in_person' ? 'Sede por confirmar' : 'En línea');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ElectroDx//Clases//ES',
    'BEGIN:VEVENT',
    `UID:${workshop.id}@electrodx`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${icsText(workshop.title)}`,
    `LOCATION:${icsText(place)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}
