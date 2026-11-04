import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { MobileBottomNav } from './MobileBottomNav';

vi.mock('../../contexts/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'doctor@electrodx.com' },
    profile: { display_name: 'Dr. Juan Marcos' },
    isAdmin: false,
    isEditor: false,
  }),
}));

vi.mock('../../stores/staffViewStore', () => ({
  useStaffViewStore: (fn: (state: { view: string }) => unknown) => fn({ view: 'student' }),
}));

vi.mock('../../hooks/useStudentPendingAssignments', () => ({
  useStudentPendingAssignments: () => ({ pendingCount: 3 }),
}));

describe('MobileBottomNav', () => {
  it('renders student dock with Agenda, Biblioteca, Avisos and excludes Estudio and Cursos', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/portal']}>
        <MobileBottomNav />
      </MemoryRouter>
    );

    // Verify removed buttons are NOT present
    expect(html).not.toContain('>Estudio<');
    expect(html).not.toContain('>Cursos<');

    // Verify new buttons ARE present
    expect(html).toContain('Agenda');
    expect(html).toContain('Biblioteca');
    expect(html).toContain('Avisos');

    // Verify baseline buttons still exist
    expect(html).toContain('Portal');
    expect(html).toContain('Práctica');
    expect(html).toContain('Perfil');

    // Verify correct links
    expect(html).toContain('href="/portal"');
    expect(html).toContain('href="/portal?tab=agenda"');
    expect(html).toContain('href="/biblioteca"');
    expect(html).toContain('href="/simuladores"');
    expect(html).toContain('href="/portal?tab=notifications"');
  });

  it('correctly sets aria-current for Agenda on ?tab=agenda', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/portal?tab=agenda']}>
        <MobileBottomNav />
      </MemoryRouter>
    );

    expect(html).toContain('aria-current="page"');
    expect(html).toContain('href="/portal?tab=agenda"');
  });

  it('correctly sets aria-current for Avisos on ?tab=notifications', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/portal?tab=notifications']}>
        <MobileBottomNav />
      </MemoryRouter>
    );

    expect(html).toContain('aria-current="page"');
    expect(html).toContain('href="/portal?tab=notifications"');
  });

  it('correctly sets aria-current for Biblioteca on /biblioteca', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/biblioteca']}>
        <MobileBottomNav />
      </MemoryRouter>
    );

    expect(html).toContain('aria-current="page"');
    expect(html).toContain('href="/biblioteca"');
  });
});
