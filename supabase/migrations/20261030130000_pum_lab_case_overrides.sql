-- Ajustes docentes del laboratorio de morfología del PUM (/admin/simulador-pum).
-- Cada fila sobreescribe parcialmente un caso de fábrica (escala, banda docente,
-- forma de onda, cursores de referencia y ruido). Los alumnos solo leen.

CREATE TABLE IF NOT EXISTS public.pum_lab_case_overrides (
  case_id TEXT PRIMARY KEY CHECK (length(trim(case_id)) > 0),
  data JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(data) = 'object'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid()
);

ALTER TABLE public.pum_lab_case_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pum_lab_case_overrides_read ON public.pum_lab_case_overrides;
CREATE POLICY pum_lab_case_overrides_read
  ON public.pum_lab_case_overrides
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS pum_lab_case_overrides_staff_write ON public.pum_lab_case_overrides;
CREATE POLICY pum_lab_case_overrides_staff_write
  ON public.pum_lab_case_overrides
  FOR ALL
  TO authenticated
  USING (public.is_admin() OR public.is_editor())
  WITH CHECK (public.is_admin() OR public.is_editor());

CREATE OR REPLACE FUNCTION public.touch_pum_lab_case_overrides()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := COALESCE(auth.uid(), NEW.updated_by);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pum_lab_case_overrides_touch ON public.pum_lab_case_overrides;
CREATE TRIGGER pum_lab_case_overrides_touch
  BEFORE INSERT OR UPDATE ON public.pum_lab_case_overrides
  FOR EACH ROW EXECUTE FUNCTION public.touch_pum_lab_case_overrides();

GRANT SELECT ON public.pum_lab_case_overrides TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pum_lab_case_overrides TO authenticated;

