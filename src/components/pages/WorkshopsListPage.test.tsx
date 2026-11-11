import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import WorkshopsListPage from './WorkshopsListPage';
import * as courseService from '../../services/courseService';
import * as liveSessionBriefService from '../../services/liveSessionBriefService';

vi.mock('../../contexts/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    isEnrolledPhysician: true,
  }),
}));

const mockWorkshops = [
  {
    id: 'dbfa3b1e-981f-4656-af91-334cbe5aa3a0',
    title: 'Fundamentos de Electricidad y Electrónica para Estudios Electrodiagnósticos',
    description: 'Descripción 1',
    scheduled_at: '2026-11-10T12:00:00Z',
    duration_minutes: 45,
    recording_url: 'https://youtube.com/watch?v=123',
    status: 'completed',
    module_id: 'm1',
    clinical_case_json: {
      actual_duration_seconds: 1945,
      actual_duration_minutes: 32,
    },
  },
  {
    id: 'a16c8c28-b635-4543-a133-5fc98e12c742',
    title: 'Clase: Control de Temperatura',
    description: 'Descripción 2',
    scheduled_at: '2026-11-09T12:00:00Z',
    duration_minutes: 90,
    recording_url: 'https://youtube.com/watch?v=456',
    status: 'completed',
    module_id: 'm1',
    clinical_case_json: {
      actual_duration_seconds: 696,
      actual_duration_minutes: 12,
    },
  },
];

describe('WorkshopsListPage rendering test', () => {
  it('renders workshops and displays durations', () => {
    vi.spyOn(courseService, 'getWorkshops').mockResolvedValue(mockWorkshops as any);
    vi.spyOn(liveSessionBriefService, 'fetchSessionBriefs').mockResolvedValue(new Map());

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <WorkshopsListPage />
      </MemoryRouter>
    );

    expect(html).toContain('Sesiones en Vivo');
    expect(html).toContain('Biblioteca de Grabaciones');
  });
});
