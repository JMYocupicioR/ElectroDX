-- Anon lost EXECUTE on is_admin()/is_editor() in the security-advisor migration.
-- Policies that mention those functions are still evaluated for anon, so a public
-- SELECT fails with 42501 even when another branch of the policy would allow the row.

DROP POLICY IF EXISTS "workshops_public_read" ON public.live_workshops;
DROP POLICY IF EXISTS "workshops_anon_read" ON public.live_workshops;
CREATE POLICY "workshops_anon_read" ON public.live_workshops
  FOR SELECT
  TO anon
  USING (status IN ('scheduled', 'live', 'completed'));

DROP POLICY IF EXISTS "workshops_authenticated_read" ON public.live_workshops;
CREATE POLICY "workshops_authenticated_read" ON public.live_workshops
  FOR SELECT
  TO authenticated
  USING (
    status IN ('scheduled', 'live', 'completed')
    OR public.is_admin()
    OR public.is_editor()
  );

DROP POLICY IF EXISTS "workshops_staff_write" ON public.live_workshops;
CREATE POLICY "workshops_staff_write" ON public.live_workshops
  FOR ALL
  TO authenticated
  USING (public.is_admin() OR public.is_editor())
  WITH CHECK (public.is_admin() OR public.is_editor());

DROP POLICY IF EXISTS "quiz_attempts_self_read" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_self_read" ON public.quiz_attempts
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR public.is_editor()
  );
