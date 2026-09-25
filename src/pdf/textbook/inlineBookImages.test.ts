import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchImageAsDataUrl } from './inlineBookImages';

describe('fetchImageAsDataUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps data URLs as-is', async () => {
    const data = 'data:image/png;base64,aaa';
    await expect(fetchImageAsDataUrl(data)).resolves.toBe(data);
  });

  it('converts a fetched blob when canvas is unavailable', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4]);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        blob: async () => new Blob([bytes], { type: 'image/png' }),
      })),
    );

    const result = await fetchImageAsDataUrl('https://example.com/fig.png');
    expect(result.startsWith('data:image/png;base64,')).toBe(true);
  });

  it('surfaces HTTP errors so the book can keep going', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 403,
        blob: async () => new Blob(),
      })),
    );
    vi.stubGlobal(
      'Image',
      class {
        set src(_value: string) {
          queueMicrotask(() => {
            this.onerror?.(new Event('error'));
          });
        }
        onload: ((ev: Event) => void) | null = null;
        onerror: ((ev: Event) => void) | null = null;
      },
    );

    await expect(fetchImageAsDataUrl('https://blocked.example/fig.png')).rejects.toThrow(/403|decodificar/i);
  });
});
