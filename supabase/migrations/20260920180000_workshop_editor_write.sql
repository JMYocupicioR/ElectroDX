-- Allow academic staff (editor) to plan live classes from the calendar.
-- Drafts remain visible to staff; published sessions stay public.

DROP POLICY IF EXISTS "workshops_public_read" ON public.live_workshops;
CREATE POLICY "workshops_public_read" ON public.live_workshops
  FOR SELECT
  USING (
    status IN ('scheduled', 'live', 'completed')
    OR public.is_admin()
    OR public.is_editor()
  );

DROP POLICY IF EXISTS "workshops_admin_write" ON public.live_workshops;
CREATE POLICY "workshops_staff_write" ON public.live_workshops
  FOR ALL
  USING (public.is_admin() OR public.is_editor())
  WITH CHECK (public.is_admin() OR public.is_editor());
