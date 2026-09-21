import { describe, expect, it } from 'vitest';
import { isMissingRelationError } from './tableAvailability';

describe('isMissingRelationError', () => {
  it('detects a missing PostgREST table without treating RLS or UUID errors as missing', () => {
    expect(isMissingRelationError({ code: 'PGRST205', message: 'Could not find the table' }, 404)).toBe(true);
    expect(isMissingRelationError({ code: '42501', message: 'permission denied' }, 403)).toBe(false);
    expect(isMissingRelationError({ code: '22P02', message: 'invalid input syntax for type uuid' }, 400)).toBe(false);
  });
});
