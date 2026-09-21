import { describe, expect, it } from 'vitest';
import { postLoginPath, postLoginPathFromRoles } from './postLoginPath';

describe('postLoginPath', () => {
  it('sends editors to the teacher dashboard, not /dashboard', () => {
    expect(postLoginPath({ isEditor: true })).toBe('/admin');
    expect(postLoginPathFromRoles(['editor'])).toBe('/admin');
  });

  it('keeps admins on /admin and students on /portal', () => {
    expect(postLoginPath({ isAdmin: true })).toBe('/admin');
    expect(postLoginPathFromRoles(['student'])).toBe('/portal');
  });

  it('honors a same-origin next path', () => {
    expect(postLoginPath({ isEditor: true, next: '/admin/calendario' })).toBe('/admin/calendario');
    expect(postLoginPath({ isEditor: true, next: 'https://evil.example' })).toBe('/admin');
  });
});
