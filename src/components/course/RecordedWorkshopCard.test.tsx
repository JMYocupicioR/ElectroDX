import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { RecordedWorkshopCard } from './RecordedWorkshopCard';
import type { LiveWorkshop } from '../../types/database';

const workshop = {
  id: 'dbfa3b1e-981f-4656-af91-334cbe5aa3a0',
  module_id: 'fundamentals',
  title: 'Clase: Bienvenido al curso',
  description: 'Introducción y uso de la plataforma',
  scheduled_at: '2026-11-03T18:00:00Z',
  recording_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  clinical_case_json: { actual_duration_seconds: 1945 },
  topic_id: null,
} as LiveWorkshop;

describe('RecordedWorkshopCard', () => {
  it('muestra la miniatura del video y los datos de la clase', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <RecordedWorkshopCard
          workshop={workshop}
          brief={{
            teachers: [{ id: 't1', name: 'Dra. Ana López', specialty: 'Neurofisiología' }],
            topics: [{ topicId: 'bienvenido-al-curso', moduleId: 'fundamentals' }],
          }}
        />
      </MemoryRouter>,
    );

    expect(html).toContain('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    expect(html).toContain('Fundamentos de Neurofisiología Clínica');
    expect(html).toContain('Bienvenido al curso');
    expect(html).toContain('Dra. Ana López');
    expect(html).toContain('Neurofisiología');
    expect(html).toContain('Introducción y uso de la plataforma');
    expect(html).toContain('32 min');
    expect(html).toContain('YouTube');
    expect(html).toContain('Abrir video original');
    expect(html).toContain('/taller/dbfa3b1e-981f-4656-af91-334cbe5aa3a0');
  });
});
