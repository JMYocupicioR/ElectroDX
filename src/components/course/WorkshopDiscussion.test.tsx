import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { WorkshopDiscussion } from './WorkshopDiscussion';
import type { LiveWorkshop } from '../../types/database';
import * as studentToolsService from '../../services/studentToolsService';

vi.mock('../../contexts/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'test-user-123', email: 'medico@test.com' },
    isAdmin: false,
    isEditor: false,
    isEnrolledPhysician: true,
  }),
}));

const mockWorkshop: LiveWorkshop = {
  id: 'workshop-456',
  module_id: 'm1',
  topic_id: 't1',
  title: 'Taller de Prueba EMG',
  description: 'Taller de prueba',
  scheduled_at: new Date().toISOString(),
  duration_minutes: 60,
  stream_url: null,
  recording_url: 'https://youtube.com/watch?v=123',
  max_capacity: 50,
  clinical_case_revision_id: null,
  clinical_case_json: null,
  status: 'completed',
  created_by: 'teacher-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('WorkshopDiscussion Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza la sección de discusión con el ancla clase-comentarios y el formulario de duda', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <WorkshopDiscussion workshop={mockWorkshop} />
      </MemoryRouter>
    );

    expect(html).toContain('id="clase-comentarios"');
    expect(html).toContain('Dudas y discusión de esta clase');
    expect(html).toContain('¿Tienes alguna duda sobre esta clase o video?');
    expect(html).toContain('Publicar duda');
  });

  it('valida que las funciones de servicio de hilos y directorio estén exportadas correctamente', () => {
    expect(typeof studentToolsService.listWorkshopThreads).toBe('function');
    expect(typeof studentToolsService.createWorkshopThread).toBe('function');
    expect(typeof studentToolsService.listWorkshopDiscussionDirectory).toBe('function');
  });
});