import type { Topic } from '../types/content';
import type { LiveWorkshop, TopicTeachingCommitment, WorkshopRegistration, WorkshopVideoProgress } from '../types/database';
import type { ClassAttendanceRecord } from '../types/academicGradebook';
import { attendanceStatusSatisfiesSession } from '../services/attendanceService';
import { readSessionTopicIds } from './liveSessionBrief';

export type TopicRecordingWatchStatus = 'pending' | 'watched';

export interface TopicRecordingInfo {
  workshop: LiveWorkshop;
  status: TopicRecordingWatchStatus;
}

export interface TopicRecordingEntry {
  topicId: string;
  topicTitle: string;
  workshop: LiveWorkshop;
}

/** Grabaciones vinculadas al tema y a sus subtemas, sin repetir el mismo taller. */
export function collectTopicRecordings(
  topic: Topic,
  byTopicId: Map<string, LiveWorkshop>,
): TopicRecordingEntry[] {
  const entries: TopicRecordingEntry[] = [];
  const seenWorkshopIds = new Set<string>();
  const walk = (node: Topic) => {
    const workshop = byTopicId.get(node.id);
    if (workshop && !seenWorkshopIds.has(workshop.id)) {
      seenWorkshopIds.add(workshop.id);
      entries.push({ topicId: node.id, topicTitle: node.title, workshop });
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(topic);
  return entries;
}

/** Talleres cancelados o sin grabación no cuentan para el menú del temario. */
export function isRecordedWorkshop(workshop: LiveWorkshop): boolean {
  return workshop.status !== 'cancelled' && Boolean(workshop.recording_url?.trim());
}

/**
 * Mapa tema → taller grabado.
 * Fuentes: topic_id primario, session_topic_ids y commitments docentes.
 */
export function buildRecordedWorkshopByTopicId(
  workshops: LiveWorkshop[],
  commitments: TopicTeachingCommitment[] = [],
): Map<string, LiveWorkshop> {
  const byId = new Map(workshops.map((w) => [w.id, w]));
  const map = new Map<string, LiveWorkshop>();

  const setIfRecorded = (topicId: string | null | undefined, workshop: LiveWorkshop | undefined) => {
    if (!topicId || !workshop || !isRecordedWorkshop(workshop)) return;
    if (!map.has(topicId)) map.set(topicId, workshop);
  };

  for (const workshop of workshops) {
    if (!isRecordedWorkshop(workshop)) continue;
    setIfRecorded(workshop.topic_id, workshop);
    for (const topicId of readSessionTopicIds(workshop)) {
      setIfRecorded(topicId, workshop);
    }
  }

  for (const commitment of commitments) {
    if (!commitment.workshop_id || commitment.status === 'withdrawn') continue;
    setIfRecorded(commitment.topic_id, byId.get(commitment.workshop_id));
  }

  return map;
}

/** En el índice del alumno (solo temas raíz) sube la grabación del propio tema o de un hijo. */
export function resolveTopicRecording(
  topic: Topic,
  byTopicId: Map<string, LiveWorkshop>,
): LiveWorkshop | undefined {
  const direct = byTopicId.get(topic.id);
  if (direct) return direct;
  if (!topic.children?.length) return undefined;
  for (const child of topic.children) {
    const found = resolveTopicRecording(child, byTopicId);
    if (found) return found;
  }
  return undefined;
}

export function isRecordingAttendanceAccredited(params: {
  workshopId: string;
  progress?: Pick<WorkshopVideoProgress, 'is_fully_watched'> | null;
  registration?: Pick<WorkshopRegistration, 'attended'> | null;
  attendance?: Pick<ClassAttendanceRecord, 'workshop_id' | 'status'> | null;
}): boolean {
  if (params.progress?.is_fully_watched) return true;
  if (params.registration?.attended) return true;
  return attendanceStatusSatisfiesSession(params.attendance?.status);
}

export function topicRecordingInfo(
  workshop: LiveWorkshop | undefined,
  accreditedWorkshopIds: Set<string>,
): TopicRecordingInfo | null {
  if (!workshop || !isRecordedWorkshop(workshop)) return null;
  return {
    workshop,
    status: accreditedWorkshopIds.has(workshop.id) ? 'watched' : 'pending',
  };
}
