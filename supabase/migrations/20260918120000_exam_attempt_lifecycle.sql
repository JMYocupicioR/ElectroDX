-- ═══════════════════════════════════════════════════════════════════════════════
-- NeuroSAFEMX: Ciclo de vida de los intentos de examen
--
-- Corrige tres defectos del motor de exámenes:
--   1. Los intentos nunca se cerraban: cada montaje de la sesión insertaba una
--      fila IN_PROGRESS y nada la marcaba ABANDONED, así que el modal
--      "Examen en progreso" reaparecía indefinidamente en /examenes.
--   2. La permutación de opciones no se persistía, de modo que al reanudar un
--      intento las respuestas guardadas (índices de opción) apuntaban a otra
--      opción y el examen se calificaba mal.
--   3. El cronómetro de las evaluaciones asignadas vivía solo en localStorage.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. Cerrar los intentos huérfanos ya existentes ──────────────────────────
-- Deja vivo únicamente el más reciente por usuario para poder crear el índice
-- único parcial del paso 3.
WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY updated_at DESC, created_at DESC) AS rn
  FROM public.exam_attempts
  WHERE status = 'IN_PROGRESS'
)
UPDATE public.exam_attempts a
SET status = 'ABANDONED'
FROM ranked r
WHERE a.id = r.id
  AND r.rn > 1;

-- Los intentos rancios tampoco deben ofrecerse para reanudar.
UPDATE public.exam_attempts
SET status = 'ABANDONED'
WHERE status = 'IN_PROGRESS'
  AND updated_at < now() - interval '24 hours';

-- ─── 2. Persistencia del orden de opciones, deadline y asignación ────────────
ALTER TABLE public.exam_attempts
  ADD COLUMN IF NOT EXISTS option_order  JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS expires_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assignment_id UUID;

COMMENT ON COLUMN public.exam_attempts.option_order IS
  'Permutación de opciones mostrada al alumno: { "questionId": [2,0,3,1] } donde cada valor es el índice original en exam_questions.options. Imprescindible para reanudar sin corromper las respuestas.';
COMMENT ON COLUMN public.exam_attempts.expires_at IS
  'Marca absoluta de fin para exámenes cronometrados. Sobrevive al borrado de localStorage y permite validar el tiempo en servidor.';
COMMENT ON COLUMN public.exam_attempts.assignment_id IS
  'FK lógica a student_assignments.id cuando el intento corresponde a una evaluación asignada por el profesor. Si no es nulo, el intento no puede reiniciarse desde la pantalla de configuración.';

-- ─── 3. Un solo intento vivo por usuario ─────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS uq_exam_attempts_one_in_progress
  ON public.exam_attempts (user_id)
  WHERE status = 'IN_PROGRESS';

-- Consulta del intento pendiente: (user_id, status) + recencia
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_status_updated
  ON public.exam_attempts (user_id, status, updated_at DESC);

-- ─── 4. Cierre automático de intentos rancios ────────────────────────────────
CREATE OR REPLACE FUNCTION public.abandon_stale_exam_attempts(p_max_age_hours INT DEFAULT 24)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE public.exam_attempts
  SET status = 'ABANDONED'
  WHERE status = 'IN_PROGRESS'
    AND updated_at < now() - make_interval(hours => p_max_age_hours);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.abandon_stale_exam_attempts(INT) IS
  'Marca ABANDONED los intentos de examen sin actividad reciente. Evita que el modal de recuperación ofrezca intentos de días anteriores.';

REVOKE ALL ON FUNCTION public.abandon_stale_exam_attempts(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.abandon_stale_exam_attempts(INT) TO service_role;

-- Programación horaria si pg_cron está disponible en el proyecto.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('abandon_stale_exam_attempts')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'abandon_stale_exam_attempts');

    PERFORM cron.schedule(
      'abandon_stale_exam_attempts',
      '17 * * * *',
      $cron$SELECT public.abandon_stale_exam_attempts(24);$cron$
    );
  END IF;
END;
$$;

-- ─── 5. Sin borrado físico de intentos desde el cliente ──────────────────────
-- "Empezar examen nuevo" ahora marca ABANDONED en lugar de borrar la fila, de
-- modo que queda rastro de auditoría y una evaluación asignada no puede
-- reiniciarse destruyendo su intento. El borrado de cuenta sigue funcionando
-- porque corre en funciones SECURITY DEFINER que no pasan por RLS.
DROP POLICY IF EXISTS "Users can delete own exam attempts" ON public.exam_attempts;
