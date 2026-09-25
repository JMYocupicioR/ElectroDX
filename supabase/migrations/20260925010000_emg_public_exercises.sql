-- Allowlist of EMG exercises visible without a session.
-- Anon never calls is_admin()/is_editor(); those functions are not executable by anon.

CREATE TABLE IF NOT EXISTS public.emg_public_exercises (
  pattern_id TEXT PRIMARY KEY,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.emg_public_exercises IS 'Casos del simulador EMG visibles en modo público (sin sesión).';

ALTER TABLE public.emg_public_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "emg_public_exercises_anon_read" ON public.emg_public_exercises;
CREATE POLICY "emg_public_exercises_anon_read" ON public.emg_public_exercises
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "emg_public_exercises_authenticated_read" ON public.emg_public_exercises;
CREATE POLICY "emg_public_exercises_authenticated_read" ON public.emg_public_exercises
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "emg_public_exercises_staff_write" ON public.emg_public_exercises;
CREATE POLICY "emg_public_exercises_staff_write" ON public.emg_public_exercises
  FOR ALL
  TO authenticated
  USING (public.is_admin() OR public.is_editor())
  WITH CHECK (public.is_admin() OR public.is_editor());

GRANT SELECT ON public.emg_public_exercises TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.emg_public_exercises TO authenticated;

-- Published case rows that are on the public allowlist can be read by anon.
-- Authenticated readers keep the previous published-or-staff rule, without forcing anon through is_admin().
DROP POLICY IF EXISTS "emg_cases_select_published" ON public.emg_case_templates;

DROP POLICY IF EXISTS "emg_cases_anon_public_demo" ON public.emg_case_templates;
CREATE POLICY "emg_cases_anon_public_demo" ON public.emg_case_templates
  FOR SELECT
  TO anon
  USING (
    status = 'PUBLISHED'
    AND pattern_id IN (SELECT p.pattern_id FROM public.emg_public_exercises p)
  );

DROP POLICY IF EXISTS "emg_cases_authenticated_read" ON public.emg_case_templates;
CREATE POLICY "emg_cases_authenticated_read" ON public.emg_case_templates
  FOR SELECT
  TO authenticated
  USING (
    status = 'PUBLISHED'
    OR public.is_admin()
    OR public.is_editor()
  );
