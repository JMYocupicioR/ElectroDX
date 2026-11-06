import { describe, expect, it } from 'vitest';
import type { LiveWorkshop, TopicTeachingCommitment } from '../types/database';
import type { Topic } from '../types/content';
import {
  buildRecordedWorkshopByTopicId,
  collectTopicRecordings,
  isRecordingAttendanceAccredited,
  isRecordedWorkshop,
  resolveTopicRecording,
  topicRecordingInfo,
} from './recordedWorkshopTopics';

function workshop(partial: Partial<LiveWorkshop> & Pick<LiveWorkshop, 'id'>): LiveWorkshop {
  return {
    module_id: 'fundamentals',
    topic_id: null,
    title: 'Clase',
    description: null,
    scheduled_at: '2026-01-01T19:00:00.000Z',
    duration_minutes: 90,
    stream_url: null,
    recording_url: 'https://youtube.com/watch?v=abc',
    max_capacity: null,
    clinical_case_revision_id: null,
    clinical_case_json: null,
    status: 'completed',
    created_by: 'u1',
    updated_at: '2026-01-01T19:00:00.000Z',
    created_at: '2026-01-01T19:00:00.000Z',
    ...partial,
  };
}

describe('recordedWorkshopTopics', () => {
  it('ignora talleres sin grabación o cancelados', () => {
    expect(isRecordedWorkshop(workshop({ id: '1', recording_url: null }))).toBe(false);
    expect(isRecordedWorkshop(workshop({ id: '2', status: 'cancelled' }))).toBe(false);
    expect(isRecordedWorkshop(workshop({ id: '3' }))).toBe(true);
  });

  it('mapea por topic_id, session_topic_ids y commitments', () => {
    const ws = workshop({
      id: 'ws1',
      topic_id: 'primary',
      clinical_case_json: { session_topic_ids: ['extra-a', 'extra-b'] },
    });
    const commitments: TopicTeachingCommitment[] = [
      {
        id: 'c1',
        cohort_id: '2026-general',
        module_id: 'fundamentals',
        topic_id: 'via-commitment',
        teacher_id: 't1',
        status: 'confirmed',
        milestone_id: null,
        workshop_id: 'ws1',
        proposed_at: '2026-01-01T00:00:00.000Z',
        confirmed_by: null,
        confirmed_at: null,
      },
    ];
    const map = buildRecordedWorkshopByTopicId([ws], commitments);
    expect(map.get('primary')?.id).toBe('ws1');
    expect(map.get('extra-a')?.id).toBe('ws1');
    expect(map.get('extra-b')?.id).toBe('ws1');
    expect(map.get('via-commitment')?.id).toBe('ws1');
  });

  it('resuelve grabación en un hijo del tema raíz', () => {
    const ws = workshop({ id: 'ws1', topic_id: 'clinical-role' });
    const map = buildRecordedWorkshopByTopicId([ws]);
    const topic: Topic = {
      id: 'intro-neurodiagnostics',
      title: 'Intro',
      children: [{ id: 'clinical-role', title: 'Rol' }],
    };
    expect(resolveTopicRecording(topic, map)?.id).toBe('ws1');
  });

  it('colecta grabaciones del tema y sus subtemas sin repetir talleres', () => {
    const ws1 = workshop({ id: 'ws1', topic_id: 'root' });
    const ws2 = workshop({ id: 'ws2', topic_id: 'child' });
    const map = buildRecordedWorkshopByTopicId([ws1, ws2]);
    map.set('grandchild', ws1);
    const topic: Topic = {
      id: 'root',
      title: 'Raíz',
      children: [
        { id: 'child', title: 'Hijo' },
        { id: 'grandchild', title: 'Nieto' },
      ],
    };
    const entries = collectTopicRecordings(topic, map);
    expect(entries.map((entry) => entry.workshop.id)).toEqual(['ws1', 'ws2']);
    expect(entries.map((entry) => entry.topicTitle)).toEqual(['Raíz', 'Hijo']);
  });

  it('acredita por progreso, registro o asistencia', () => {
    expect(
      isRecordingAttendanceAccredited({
        workshopId: 'ws1',
        progress: { is_fully_watched: true },
      }),
    ).toBe(true);
    expect(
      isRecordingAttendanceAccredited({
        workshopId: 'ws1',
        registration: { attended: true },
      }),
    ).toBe(true);
    expect(
      isRecordingAttendanceAccredited({
        workshopId: 'ws1',
        attendance: { workshop_id: 'ws1', status: 'present' },
      }),
    ).toBe(true);
    expect(isRecordingAttendanceAccredited({ workshopId: 'ws1' })).toBe(false);
  });

  it('arma info pendiente/visto', () => {
    const ws = workshop({ id: 'ws1' });
    expect(topicRecordingInfo(ws, new Set())?.status).toBe('pending');
    expect(topicRecordingInfo(ws, new Set(['ws1']))?.status).toBe('watched');
    expect(topicRecordingInfo(undefined, new Set())).toBeNull();
  });
});
