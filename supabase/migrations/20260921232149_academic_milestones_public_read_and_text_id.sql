-- Cortes académicos: el PDF público del temario y el calendario admin
-- deben leer las mismas fechas. El id de la app es texto (mls_corte_…),
-- no UUID, y el brochure se descarga sin sesión.

ALTER TABLE public.academic_milestones
  ALTER COLUMN id DROP DEFAULT;

ALTER TABLE public.academic_milestones
  ALTER COLUMN id TYPE TEXT USING id::text;

DROP POLICY IF EXISTS "academic_milestones_read" ON public.academic_milestones;
DROP POLICY IF EXISTS "academic_milestones_admin_write" ON public.academic_milestones;

CREATE POLICY "academic_milestones_public_read"
  ON public.academic_milestones
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "academic_milestones_admin_write"
  ON public.academic_milestones
  FOR ALL
  TO authenticated
  USING (public.is_admin() OR public.is_editor())
  WITH CHECK (public.is_admin() OR public.is_editor());

GRANT SELECT ON public.academic_milestones TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.academic_milestones TO authenticated;
