import { describe, expect, it } from 'vitest';
import { mergeServerNotifications } from './assignmentSubmissionService';
import type { StudentNotification } from './studentService';
import type { ServerStudentNotification } from './assignmentSubmissionService';

const local: StudentNotification[] = [
  {
    id: 'notif_asg_11111111-1111-4111-8111-111111111111',
    title: 'local',
    message: 'pendiente',
    type: 'quiz',
    createdAt: '2026-09-01T00:00:00Z',
    isRead: false,
  },
  {
    id: 'notif_cedula_verified',
    title: 'cédula',
    message: 'ok',
    type: 'cedula',
    createdAt: '2026-09-02T00:00:00Z',
    isRead: true,
  },
];

const server: ServerStudentNotification[] = [
  {
    id: '22222222-2222-4222-8222-222222222222',
    user_id: '33333333-3333-4333-8333-333333333333',
    title: 'Nueva tarea: Reporte',
    message: 'Fecha límite',
    type: 'academic',
    severity: 'info',
    link_url: '/portal?tab=assignments',
    source_key: 'assignment:11111111-1111-4111-8111-111111111111',
    is_read: false,
    created_at: '2026-09-03T00:00:00Z',
  },
];

describe('mergeServerNotifications', () => {
  it('sustituye el aviso local de la tarea por el aviso del servidor', () => {
    const merged = mergeServerNotifications(local, server);
    expect(merged.map((item) => item.title)).toEqual(['Nueva tarea: Reporte', 'cédula']);
  });

  it('conserva los avisos locales si el servidor no tiene filas', () => {
    expect(mergeServerNotifications(local, [])).toEqual(local);
  });
});
