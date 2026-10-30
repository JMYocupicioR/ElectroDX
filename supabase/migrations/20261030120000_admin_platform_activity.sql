-- Feed de actividad de alumnos para Auditoría.
-- Lee hechos que ya existen: lectura completada, evaluación, simulacro y comentarios.

CREATE OR REPLACE FUNCTION public.admin_platform_activity(
  p_before timestamptz DEFAULT NULL,
  p_before_id text DEFAULT NULL,
  p_limit int DEFAULT 50,
  p_kind text DEFAULT NULL
)
RETURNS TABLE (
  occurred_at timestamptz,
  actor_id uuid,
  kind text,
  topic_id text,
  module_id text,
  score numeric,
  passed boolean,
  excerpt text,
  entity_id text,
  detail text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_limit int := LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100);
BEGIN
  IF v_uid IS NULL OR NOT public.is_admin(v_uid) THEN
    RAISE EXCEPTION 'Solo un administrador puede ver la actividad de los alumnos.';
  END IF;

  RETURN QUERY
  SELECT
    src.at,
    src.actor,
    src.event_kind,
    src.topic,
    src.mod,
    src.points,
    src.did_pass,
    src.snippet,
    src.event_id,
    src.extra
  FROM (
    SELECT
      c.completed_at AS at,
      c.user_id AS actor,
      'reading'::text AS event_kind,
      c.topic_id AS topic,
      c.module_id AS mod,
      NULL::numeric AS points,
      NULL::boolean AS did_pass,
      NULL::text AS snippet,
      c.id::text AS event_id,
      NULL::text AS extra
    FROM public.student_completed_topics c

    UNION ALL

    SELECT
      q.completed_at,
      q.user_id,
      'quiz'::text,
      q.topic_id,
      q.module_id,
      q.score::numeric,
      q.passed,
      NULL::text,
      q.id::text,
      NULL::text
    FROM public.quiz_attempts q

    UNION ALL

    SELECT
      COALESCE(e.completed_at, e.started_at),
      e.user_id,
      'exam'::text,
      NULL::text,
      e.module_id,
      e.score_percentage,
      e.passed,
      NULLIF(left(array_to_string(COALESCE(e.selected_topics, '{}'::text[]), ', '), 180), ''),
      e.id::text,
      e.mode
    FROM public.exam_sessions e
    WHERE e.status = 'COMPLETED'

    UNION ALL

    SELECT
      t.created_at,
      t.student_id,
      'comment'::text,
      t.topic_id,
      t.module_id,
      NULL::numeric,
      NULL::boolean,
      NULLIF(left(t.body, 160), ''),
      t.id::text,
      NULL::text
    FROM public.student_qa_threads t

    UNION ALL

    SELECT
      r.created_at,
      r.author_id,
      'reply'::text,
      t.topic_id,
      t.module_id,
      NULL::numeric,
      NULL::boolean,
      NULLIF(left(r.body, 160), ''),
      r.id::text,
      NULL::text
    FROM public.student_qa_replies r
    JOIN public.student_qa_threads t ON t.id = r.thread_id
  ) src
  WHERE (
    p_kind IS NULL
    OR p_kind = ''
    OR src.event_kind = p_kind
    OR (p_kind = 'comment' AND src.event_kind IN ('comment', 'reply'))
  )
  AND (
    p_before IS NULL
    OR src.at < p_before
    OR (
      src.at = p_before
      AND p_before_id IS NOT NULL
      AND src.event_id < p_before_id
    )
  )
  ORDER BY src.at DESC, src.event_id DESC
  LIMIT v_limit;
END;
$$;

COMMENT ON FUNCTION public.admin_platform_activity(timestamptz, text, int, text) IS
  'Línea de tiempo de estudio para administradores: lecturas, evaluaciones, simulacros y comentarios.';

REVOKE ALL ON FUNCTION public.admin_platform_activity(timestamptz, text, int, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_platform_activity(timestamptz, text, int, text) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at
  ON public.quiz_attempts (completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_completed_at
  ON public.exam_sessions (completed_at DESC)
  WHERE status = 'COMPLETED';

CREATE INDEX IF NOT EXISTS idx_student_qa_threads_created_at
  ON public.student_qa_threads (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_qa_replies_created_at
  ON public.student_qa_replies (created_at DESC);
