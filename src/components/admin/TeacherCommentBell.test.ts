import { describe, expect, it, vi } from 'vitest';

vi.mock('../../contexts/AuthProvider', () => ({
  useAuth: () => ({ user: null, isAdmin: false, isEditor: false }),
}));

vi.mock('../../hooks/useStaffInbox', () => ({
  useStaffInbox: () => ({
    items: [],
    counts: { totalPending: 0 },
    loading: false,
    error: null,
  }),
  invalidateStaffInbox: () => undefined,
}));

vi.mock('../../services/studentToolsService', () => ({
  markCommentNotificationRead: () => undefined,
}));

import {
  teacherInboxDesktopPanelClass,
  teacherInboxMobilePanelClass,
} from './TeacherCommentBell';

describe('TeacherCommentBell mobile shell', () => {
  it('ancla la bandeja al viewport en móvil, no a la campana', () => {
    expect(teacherInboxMobilePanelClass).toContain('fixed');
    expect(teacherInboxMobilePanelClass).toContain('inset-x-0');
    expect(teacherInboxMobilePanelClass).toContain('top-14');
    expect(teacherInboxMobilePanelClass).not.toContain('right-0');
    expect(teacherInboxMobilePanelClass).not.toContain('w-[min(24rem');
  });

  it('en escritorio sigue siendo un menú anclado a la campana', () => {
    expect(teacherInboxDesktopPanelClass).toContain('absolute');
    expect(teacherInboxDesktopPanelClass).toContain('right-0');
    expect(teacherInboxDesktopPanelClass).toContain('w-[min(24rem,calc(100vw-2rem))]');
  });
});
