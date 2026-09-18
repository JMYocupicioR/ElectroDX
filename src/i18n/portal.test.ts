import { describe, expect, it } from 'vitest';
import { portalCopy } from '../i18n/portal';

describe('accessibility copy', () => {
  it('has bilingual portal strings for empty and retry states', () => {
    expect(portalCopy.es.retry).toBeTruthy();
    expect(portalCopy.en.retry).toBeTruthy();
    expect(portalCopy.es.empty).toBeTruthy();
  });
});
