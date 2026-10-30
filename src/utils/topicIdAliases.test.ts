import { describe, expect, it } from 'vitest';
import { canonicalTopicId, canonicalTopicIds } from './topicIdAliases';

describe('legacy topic ids in academic cortes', () => {
  it('maps ethics, biosafety and temperature to the current lesson ids', () => {
    expect(canonicalTopicId('ethical-aspects')).toBe('ethics');
    expect(canonicalTopicId('safety-patient')).toBe('laboratory');
    expect(canonicalTopicId('temperature-effects')).toBe('temperature-effect');
    expect(canonicalTopicId('f-waves')).toBe('f-wave');
  });

  it('keeps ids that already match the temario', () => {
    expect(canonicalTopicId('history')).toBe('history');
  });

  it('deduplicates after remap', () => {
    expect(canonicalTopicIds(['ethics', 'ethical-aspects', 'history'])).toEqual([
      'ethics',
      'history',
    ]);
  });
});
