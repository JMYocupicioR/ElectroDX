import { describe, expect, it } from 'vitest';
import type { LiveWorkshop } from '../types/database';
import {
  briefForWorkshop,
  buildSessionIcs,
  foldSessionBriefRows,
  readSessionTopicIds,
  sessionLocation,
  sessionSummaryText,
  withSessionTopicIds,
} from './liveSessionBrief';

const workshop = {
  id: 'ws-1',
  module_id: 'module-01',
  topic_id: 'tema-a',
  title: 'Clase: Introducción',
  description: 'Historia clínica\n\n📚 Temas cubiertos: voltaje\n\n📍 Ubicación: Aula 2',
  scheduled_at: '2026-11-02T02:00:00.000Z',
  duration_minutes: 90,
  stream_url: null,
  recording_url: null,
  max_capacity: null,
  clinical_case_revision_id: null,
  clinical_case_json: null,
  status: 'scheduled',
  created_by: 'teacher',
  created_at: '2026-10-01T00:00:00.000Z',
  updated_at: '2026-10-01T00:00:00.000Z',
} as LiveWorkshop;

describe('ficha pública de la clase', () => {
  it('junta docentes y temas sin repetir filas', () => {
    const map = foldSessionBriefRows([
      {
        workshop_id: 'ws-1',
        kind: 'teacher',
        teacher_id: 't1',
        teacher_name: 'Dra. Haros',
        teacher_specialty: 'Medicina de Rehabilitación',
        topic_id: null,
        module_id: null,
      },
      {
        workshop_id: 'ws-1',
        kind: 'teacher',
        teacher_id: 't1',
        teacher_name: 'Dra. Haros',
        topic_id: null,
        module_id: null,
      },
      {
        workshop_id: 'ws-1',
        kind: 'topic',
        teacher_id: null,
        teacher_name: null,
        topic_id: 'tema-a',
        module_id: 'module-01',
      },
      {
        workshop_id: 'ws-1',
        kind: 'topic',
        teacher_id: null,
        teacher_name: null,
        topic_id: 'sub-1',
        module_id: 'module-01',
      },
    ]);
    expect(map.get('ws-1')?.teachers).toEqual([
      { id: 't1', name: 'Dra. Haros', specialty: 'Medicina de Rehabilitación' },
    ]);
    expect(map.get('ws-1')?.topics.map((topic) => topic.topicId)).toEqual(['tema-a', 'sub-1']);
  });

  it('usa el tema principal del taller si la clase aún no tiene lista guardada', () => {
    expect(briefForWorkshop(workshop, { teachers: [], topics: [] }).topics).toEqual([
      { topicId: 'tema-a', moduleId: 'module-01' },
    ]);
  });

  it('guarda y vuelve a leer la lista exacta de temas de la clase', () => {
    const stored = withSessionTopicIds(workshop.clinical_case_json, ['tema-a', 'bases', 'bases']);
    expect(readSessionTopicIds({ clinical_case_json: stored })).toEqual(['tema-a', 'bases']);
    expect(
      briefForWorkshop({ ...workshop, clinical_case_json: stored }).topics.map((topic) => topic.topicId),
    ).toEqual(['tema-a', 'bases']);
  });

  it('deja la sede fuera del resumen y arma el archivo de calendario', () => {
    expect(sessionSummaryText(workshop.description)).toBe('Historia clínica');
    expect(sessionLocation(workshop.description)).toBe('Aula 2');
    const ics = buildSessionIcs(workshop, 'Aula 2');
    expect(ics).toContain('SUMMARY:Clase: Introducción');
    expect(ics).toContain('LOCATION:Aula 2');
    expect(ics).toContain('BEGIN:VEVENT');
  });
});
