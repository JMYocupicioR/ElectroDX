import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { TopicRecordingsSection } from './TopicRecordingsSection';
import type { TopicRecordingEntry } from '../../utils/recordedWorkshopTopics';
import type { LiveWorkshop } from '../../types/database';

describe('TopicRecordingsSection Component', () => {
  const sampleWorkshop = {
    id: 'ws-sample-1',
    module_id: 'mod-1',
    topic_id: 'topic-intro',
    title: 'Clase: Bienvenido al curso',
    description: 'Introducción al curso',
    scheduled_at: '2026-11-03T18:00:00Z',
    duration_minutes: 90,
    stream_url: null,
    status: 'completed',
    recording_url: 'https://drive.google.com/file/d/test-sample/view',
    session_modality: 'online',
    allow_recording_attendance: true,
    attendance_closed: false,
  } as unknown as LiveWorkshop;

  const entries: TopicRecordingEntry[] = [
    {
      topicId: 'topic-intro',
      topicTitle: 'Bienvenido al curso',
      workshop: sampleWorkshop,
    },
  ];

  it('no renderiza nada si la lista de entradas está vacía', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <TopicRecordingsSection entries={[]} userId="user-1" />
      </MemoryRouter>
    );
    expect(html).toBe('');
  });

  it('renderiza la tarjeta de clase grabada vinculada y el indicador de asistencia', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <TopicRecordingsSection entries={entries} userId="user-1" />
      </MemoryRouter>
    );

    expect(html).toContain('Clase grabada vinculada');
    expect(html).toContain('Clase: Bienvenido al curso');
    expect(html).toContain('Tema: Bienvenido al curso');
    expect(html).toContain('Ficha del taller');
    expect(html).toContain('Ver aquí');
    expect(html).toContain('Acredita asistencia al ver el video');
  });

  it('muestra la etiqueta de grabación de repaso si el taller no acredita asistencia', () => {
    const noAttendanceWorkshop: LiveWorkshop = {
      ...sampleWorkshop,
      id: 'ws-sample-no-att',
      allow_recording_attendance: false,
    };

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <TopicRecordingsSection
          entries={[
            {
              topicId: 'topic-intro',
              topicTitle: 'Bienvenido al curso',
              workshop: noAttendanceWorkshop,
            },
          ]}
          userId="user-1"
        />
      </MemoryRouter>
    );

    expect(html).toContain('Grabación de repaso');
  });
});
