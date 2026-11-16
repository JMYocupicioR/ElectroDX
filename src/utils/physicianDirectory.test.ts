import { describe, expect, it } from 'vitest';
import {
  canChoosePublicSpecialistListing,
  isEditorialOrSpecialist,
  isTeachingCollaborator,
} from './physicianDirectory';

const base = {
  roles: [] as ('admin' | 'editor' | 'contributor' | 'student')[],
  show_in_editorial_committee: false,
  is_public: false,
};

describe('physician directory filters', () => {
  it('keeps a content editor out of the teaching list', () => {
    const editor = { ...base, roles: ['editor' as const], show_in_editorial_committee: true };
    expect(isEditorialOrSpecialist(editor)).toBe(true);
    expect(isTeachingCollaborator(editor)).toBe(false);
  });

  it('lists only the contributor role for teaching and revenue share', () => {
    const teacher = { ...base, roles: ['contributor' as const] };
    expect(isTeachingCollaborator(teacher)).toBe(true);
    expect(isEditorialOrSpecialist(teacher)).toBe(false);
  });

  it('keeps someone who teaches and edits in both lists', () => {
    const both = { ...base, roles: ['editor' as const, 'contributor' as const] };
    expect(isTeachingCollaborator(both)).toBe(true);
    expect(isEditorialOrSpecialist(both)).toBe(true);
  });

  it('lets faculty choose the public diplomado listing and keeps students out of that choice', () => {
    expect(canChoosePublicSpecialistListing({ roles: ['student'] })).toBe(false);
    expect(canChoosePublicSpecialistListing({ roles: [] })).toBe(false);
    expect(canChoosePublicSpecialistListing({ roles: ['contributor'] })).toBe(true);
    expect(canChoosePublicSpecialistListing({ roles: ['editor'] })).toBe(true);
    expect(canChoosePublicSpecialistListing({ roles: ['admin'] })).toBe(true);
    expect(canChoosePublicSpecialistListing({ roles: ['student', 'contributor'] })).toBe(true);
  });
});
