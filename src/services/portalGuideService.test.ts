import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  shouldShowPortalGuide,
  markPortalGuideSeen,
  PORTAL_GUIDE_VERSION,
  filterSlidesForCourse,
  resolveSlideMedia,
  validatePortalWelcomeDraft,
  detailFromText,
} from './portalGuideService';
import { supabase } from '../lib/supabase';
import type { PortalWelcomeSlide, Profile } from '../types/database';

describe('portalGuideService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('shouldShowPortalGuide', () => {
    it('returns true when profile is null or undefined', () => {
      expect(shouldShowPortalGuide(null)).toBe(true);
      expect(shouldShowPortalGuide(undefined)).toBe(true);
    });

    it('returns true when portal_guide_version is 0 or missing', () => {
      expect(shouldShowPortalGuide({} as Profile)).toBe(true);
      expect(shouldShowPortalGuide({ portal_guide_version: 0 } as Profile)).toBe(true);
    });

    it('returns false when portal_guide_version >= PORTAL_GUIDE_VERSION', () => {
      expect(shouldShowPortalGuide({ portal_guide_version: PORTAL_GUIDE_VERSION } as Profile)).toBe(false);
      expect(shouldShowPortalGuide({ portal_guide_version: 2 } as Profile)).toBe(false);
    });
  });

  describe('markPortalGuideSeen', () => {
    it('calls RPC mark_portal_guide_seen with current version', async () => {
      const rpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: { id: 'test-user', portal_guide_version: 1 } as any,
        error: null,
      } as any);

      const result = await markPortalGuideSeen();
      expect(rpcSpy).toHaveBeenCalledWith('mark_portal_guide_seen', {
        p_version: 1,
      });
      expect(result).toEqual({ error: null });
    });

    it('returns error message if RPC fails', async () => {
      vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: null,
        error: { message: 'Database error connecting' } as any,
      } as any);

      const result = await markPortalGuideSeen();
      expect(result.error).toBe('Database error connecting');
    });

    it('handles thrown exceptions gracefully', async () => {
      vi.spyOn(supabase, 'rpc').mockRejectedValue(new Error('Network failure'));

      const result = await markPortalGuideSeen();
      expect(result.error).toBe('Network failure');
    });
  });

  describe('published slides', () => {
    const slide = (overrides: Partial<PortalWelcomeSlide>): PortalWelcomeSlide => ({
      id: overrides.id ?? '1',
      sort_order: overrides.sort_order ?? 10,
      enabled: overrides.enabled ?? true,
      audience: overrides.audience ?? 'all',
      kicker: 'Guía',
      title: overrides.title ?? 'Pantalla',
      body: 'Texto',
      detail: [],
      media_items: overrides.media_items ?? [],
      media_kind: overrides.media_kind ?? 'none',
      media_url: overrides.media_url ?? null,
      media_alt: overrides.media_alt ?? null,
      updated_by: null,
      created_at: '',
      updated_at: '',
    });

    it('keeps slides for everyone and the one that matches enrollment', () => {
      const slides = [
        slide({ id: 'a', title: 'Bienvenida', sort_order: 30 }),
        slide({ id: 'b', title: 'Inscrito', audience: 'enrolled', sort_order: 10 }),
        slide({ id: 'c', title: 'Espera', audience: 'waitlist', sort_order: 20 }),
        slide({ id: 'd', title: 'Oculta', enabled: false, sort_order: 5 }),
      ];
      expect(filterSlidesForCourse(slides, 'active').map((item) => item.id)).toEqual(['b', 'a']);
      expect(filterSlidesForCourse(slides, 'pending').map((item) => item.id)).toEqual(['c', 'a']);
      expect(filterSlidesForCourse(slides, 'none').map((item) => item.id)).toEqual(['a']);
    });

    it('turns a YouTube link into an embed and drops an unknown video', () => {
      expect(
        resolveSlideMedia(
          slide({ media_kind: 'video', media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Clase' })
        )
      ).toEqual({
        kind: 'video',
        src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        alt: 'Clase',
      });
      expect(resolveSlideMedia(slide({ media_kind: 'video', media_url: 'https://example.com/clip.mp4' }))).toBeNull();
    });

    it('rejects a video that is not an allowed host', () => {
      expect(
        validatePortalWelcomeDraft({
          kicker: '',
          title: 'Video',
          body: '',
          detail: detailFromText('una\n\ndos'),
          audience: 'all',
          enabled: true,
          media_items: [
            { id: 'v', kind: 'video', url: 'https://example.com/video', label: '' },
          ],
        })
      ).toMatch(/YouTube/);
    });
  });
});
