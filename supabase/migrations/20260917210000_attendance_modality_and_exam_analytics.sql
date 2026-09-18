-- Modalidad de sesión (presencial / en línea) para análisis de asistencias
-- y listado analítico de intentos de examen con user_id para el panel docente.

ALTER TABLE public.class_attendances
  ADD COLUMN IF NOT EXISTS session_modality TEXT NOT NULL DEFAULT 'online';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'class_attendances_session_modality_check'
  ) THEN
    ALTER TABLE public.class_attendances
      ADD CONSTRAINT class_attendances_session_modality_check
      CHECK (session_modality IN ('in_person', 'online'));
  END IF;
END $$;

COMMENT ON COLUMN public.class_attendances.session_modality IS
  'Modalidad de la sesión: in_person (presencial) u online (en línea).';

DROP POLICY IF EXISTS "quiz_attempts_self_read" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_self_read" ON public.quiz_attempts FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR public.is_editor()
  );

DROP FUNCTION IF EXISTS public.admin_list_quiz_attempts(int);

CREATE FUNCTION public.admin_list_quiz_attempts(p_limit int DEFAULT 100)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  user_email text,
  display_name text,
  module_id text,
  topic_id text,
  score int,
  passed boolean,
  duration_seconds int,
  completed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() AND NOT public.is_editor() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  RETURN QUERY
  SELECT
    qa.id,
    qa.user_id,
    u.email::text,
    p.display_name,
    qa.module_id,
    qa.topic_id,
    qa.score,
    qa.passed,
    qa.duration_seconds,
    qa.completed_at
  FROM public.quiz_attempts qa
  JOIN public.profiles p ON p.id = qa.user_id
  JOIN auth.users u ON u.id = qa.user_id
  ORDER BY qa.completed_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 100), 2000));
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_quiz_attempts(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_quiz_attempts(int) TO authenticated;
