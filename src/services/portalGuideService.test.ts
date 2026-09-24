import { describe, expect, it, vi, beforeEach } from 'vitest';
import { shouldShowPortalGuide, markPortalGuideSeen, PORTAL_GUIDE_VERSION } from './portalGuideService';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

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
});
