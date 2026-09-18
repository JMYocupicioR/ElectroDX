-- ═══════════════════════════════════════════════════════════════════════════════
-- Integridad académica del simulador de exámenes
--
-- 1. Las claves (is_correct, feedback, pearl) no viajan al alumno hasta que el
--    servidor califica.
-- 2. La calificación se calcula en Postgres; el cliente no puede insertar
--    exam_sessions / exam_answers ni marcar COMPLETED a mano.
-- 3. get_exam_gap_analysis deja de aceptar el user_id de un tercero.
-- 4. search_path fijo en funciones DEFINER del motor de exámenes.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 0. Deduplicar respuestas y unique (session, question) ───────────────────
DELETE FROM public.exam_answers a
USING public.exam_answers b
WHERE a.session_id = b.session_id
  AND a.question_id = b.question_id
  AND a.ctid < b.ctid;

CREATE UNIQUE INDEX IF NOT EXISTS uq_exam_answers_session_question
  ON public.exam_answers (session_id, question_id);

ALTER TABLE public.exam_attempts
  ADD COLUMN IF NOT EXISTS exam_session_id UUID;

COMMENT ON COLUMN public.exam_attempts.exam_session_id IS
  'Sesión calificada vinculada a este intento. Evita duplicar el envío.';

-- ─── 1. Helpers de opciones ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public._sanitize_exam_options(opts jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'text', COALESCE(o->>'text', ''),
        'feedback', '',
        'is_correct', false
      )
    ),
    '[]'::jsonb
  )
  FROM jsonb_array_elements(COALESCE(opts, '[]'::jsonb)) o;
$$;

CREATE OR REPLACE FUNCTION public._exam_reorder_options(p_options jsonb, p_order jsonb)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  v_len int;
  v_out jsonb := '[]'::jsonb;
  v_idx int;
  i int;
  v_seen int[] := '{}';
BEGIN
  v_len := jsonb_array_length(COALESCE(p_options, '[]'::jsonb));
  IF p_order IS NULL OR jsonb_typeof(p_order) <> 'array' OR jsonb_array_length(p_order) <> v_len THEN
    RETURN COALESCE(p_options, '[]'::jsonb);
  END IF;

  FOR i IN 0 .. v_len - 1 LOOP
    BEGIN
      v_idx := (p_order->>i)::int;
    EXCEPTION WHEN others THEN
      RETURN COALESCE(p_options, '[]'::jsonb);
    END;
    IF v_idx IS NULL OR v_idx < 0 OR v_idx >= v_len OR v_idx = ANY (v_seen) THEN
      RETURN COALESCE(p_options, '[]'::jsonb);
    END IF;
    v_seen := v_seen || v_idx;
    v_out := v_out || jsonb_build_array(p_options->v_idx);
  END LOOP;

  RETURN v_out;
END;
$$;

CREATE OR REPLACE FUNCTION public._exam_display_to_original(p_order jsonb, p_display_idx int)
RETURNS int
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_display_idx IS NULL OR p_display_idx < 0 THEN
    RETURN NULL;
  END IF;
  IF p_order IS NULL OR jsonb_typeof(p_order) <> 'array' OR jsonb_array_length(p_order) = 0 THEN
    RETURN p_display_idx;
  END IF;
  IF p_display_idx >= jsonb_array_length(p_order) THEN
    RETURN NULL;
  END IF;
  RETURN (p_order->>p_display_idx)::int;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public._exam_original_to_display(p_order jsonb, p_original_idx int)
RETURNS int
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  i int;
BEGIN
  IF p_original_idx IS NULL THEN
    RETURN NULL;
  END IF;
  IF p_order IS NULL OR jsonb_typeof(p_order) <> 'array' OR jsonb_array_length(p_order) = 0 THEN
    RETURN p_original_idx;
  END IF;
  FOR i IN 0 .. jsonb_array_length(p_order) - 1 LOOP
    IF (p_order->>i)::int = p_original_idx THEN
      RETURN i;
    END IF;
  END LOOP;
  RETURN p_original_idx;
EXCEPTION WHEN others THEN
  RETURN p_original_idx;
END;
$$;

CREATE OR REPLACE FUNCTION public._exam_correct_original_index(p_options jsonb)
RETURNS int
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
  SELECT (ord - 1)::int
  FROM jsonb_array_elements(COALESCE(p_options, '[]'::jsonb)) WITH ORDINALITY AS t(opt, ord)
  WHERE COALESCE((opt->>'is_correct')::boolean, false)
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public._exam_question_public(q public.exam_questions)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'id', q.id,
    'island_name', q.island_name,
    'module_id', q.module_id,
    'topic_name', q.topic_name,
    'topic_id', q.topic_id,
    'stem', q.stem,
    'findings', q.findings,
    'image_url', q.image_url,
    'image_alt', q.image_alt,
    'options', public._sanitize_exam_options(q.options),
    'difficulty', q.difficulty,
    'is_critical', q.is_critical,
    'tags', q.tags,
    'status', q.status,
    'created_at', q.created_at,
    'updated_at', q.updated_at
  );
$$;

CREATE OR REPLACE FUNCTION public._exam_question_revealed(q public.exam_questions, p_order jsonb)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'id', q.id,
    'island_name', q.island_name,
    'module_id', q.module_id,
    'topic_name', q.topic_name,
    'topic_id', q.topic_id,
    'stem', q.stem,
    'findings', q.findings,
    'image_url', q.image_url,
    'image_alt', q.image_alt,
    'options', public._exam_reorder_options(q.options, p_order),
    'difficulty', q.difficulty,
    'is_critical', q.is_critical,
    'pearl', q.pearl,
    'source_reference', q.source_reference,
    'tags', q.tags,
    'status', q.status,
    'created_at', q.created_at,
    'updated_at', q.updated_at
  );
$$;

CREATE OR REPLACE FUNCTION public._exam_build_reveal(
  q public.exam_questions,
  p_order jsonb,
  p_display_idx int
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  v_shown jsonb;
  v_orig int;
  v_correct_orig int;
  v_correct_display int;
  v_is_correct boolean := false;
BEGIN
  v_shown := public._exam_reorder_options(q.options, p_order);
  v_orig := public._exam_display_to_original(p_order, p_display_idx);
  v_correct_orig := public._exam_correct_original_index(q.options);
  v_correct_display := public._exam_original_to_display(p_order, v_correct_orig);

  IF v_orig IS NOT NULL AND v_orig >= 0 AND v_orig < jsonb_array_length(COALESCE(q.options, '[]'::jsonb)) THEN
    v_is_correct := COALESCE((q.options->v_orig->>'is_correct')::boolean, false);
  END IF;

  RETURN jsonb_build_object(
    'questionId', q.id,
    'isCorrect', v_is_correct,
    'selectedIndex', p_display_idx,
    'correctIndex', v_correct_display,
    'selectedFeedback', COALESCE(v_shown->p_display_idx->>'feedback', ''),
    'correctFeedback', COALESCE(v_shown->v_correct_display->>'feedback', ''),
    'pearl', q.pearl
  );
END;
$$;

REVOKE ALL ON FUNCTION public._sanitize_exam_options(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._exam_reorder_options(jsonb, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._exam_display_to_original(jsonb, int) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._exam_original_to_display(jsonb, int) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._exam_correct_original_index(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._exam_question_public(public.exam_questions) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._exam_question_revealed(public.exam_questions, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._exam_build_reveal(public.exam_questions, jsonb, int) FROM PUBLIC, anon, authenticated;

-- ─── 2. Banco sanitizado y estadísticas de temas ─────────────────────────────
CREATE OR REPLACE FUNCTION public.get_exam_questions_for_attempt(
  p_topic_names text[] DEFAULT NULL,
  p_module_id text DEFAULT NULL,
  p_question_ids uuid[] DEFAULT NULL,
  p_critical_only boolean DEFAULT false,
  p_failed_only boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_out jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  IF NOT (
    public.is_enrolled_physician(v_uid)
    OR public.has_role('admin')
    OR public.has_role('editor')
    OR public.has_role('contributor')
  ) THEN
    RAISE EXCEPTION 'Requiere inscripción médica aprobada';
  END IF;

  SELECT COALESCE(jsonb_agg(public._exam_question_public(q) ORDER BY q.topic_name, q.difficulty), '[]'::jsonb)
  INTO v_out
  FROM public.exam_questions q
  WHERE q.status = 'PUBLISHED'
    AND (p_module_id IS NULL OR q.module_id = p_module_id)
    AND (p_topic_names IS NULL OR cardinality(p_topic_names) = 0 OR q.topic_name = ANY (p_topic_names))
    AND (p_question_ids IS NULL OR cardinality(p_question_ids) = 0 OR q.id = ANY (p_question_ids))
    AND (NOT COALESCE(p_critical_only, false) OR q.is_critical)
    AND (
      NOT COALESCE(p_failed_only, false)
      OR q.id IN (
        SELECT uqp.question_id
        FROM public.user_question_progress uqp
        WHERE uqp.user_id = v_uid
          AND uqp.attempts > 0
          AND uqp.successes < uqp.attempts
      )
    );

  RETURN COALESCE(v_out, '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_exam_topic_stats()
RETURNS TABLE (
  topic_name text,
  module_id text,
  count bigint,
  critical_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  IF NOT (
    public.is_enrolled_physician(v_uid)
    OR public.has_role('admin')
    OR public.has_role('editor')
    OR public.has_role('contributor')
  ) THEN
    RAISE EXCEPTION 'Requiere inscripción médica aprobada';
  END IF;

  RETURN QUERY
  SELECT
    q.topic_name,
    MIN(q.module_id) AS module_id,
    COUNT(*)::bigint AS count,
    COUNT(*) FILTER (WHERE q.is_critical)::bigint AS critical_count
  FROM public.exam_questions q
  WHERE q.status = 'PUBLISHED'
  GROUP BY q.topic_name
  ORDER BY COUNT(*) DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_exam_questions_for_attempt(text[], text, uuid[], boolean, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_exam_topic_stats() TO authenticated;
REVOKE ALL ON FUNCTION public.get_exam_questions_for_attempt(text[], text, uuid[], boolean, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_exam_topic_stats() FROM PUBLIC, anon;

-- ─── 3. Calificación tutor (una pregunta) ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.grade_exam_answer(
  p_attempt_id uuid,
  p_question_id uuid,
  p_selected_index int
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_attempt public.exam_attempts;
  v_q public.exam_questions;
  v_mode text;
  v_reveal jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  SELECT * INTO v_attempt
  FROM public.exam_attempts
  WHERE id = p_attempt_id
    AND user_id = v_uid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Intento no encontrado';
  END IF;

  IF v_attempt.status IS DISTINCT FROM 'IN_PROGRESS' THEN
    RAISE EXCEPTION 'El examen ya no está en curso';
  END IF;

  v_mode := COALESCE(v_attempt.config->>'feedbackMode', 'end');
  IF v_mode IS DISTINCT FROM 'immediate' THEN
    RAISE EXCEPTION 'El modo examen no revela respuestas hasta el envío';
  END IF;

  IF NOT (p_question_id = ANY (v_attempt.question_ids)) THEN
    RAISE EXCEPTION 'La pregunta no pertenece a este examen';
  END IF;

  SELECT * INTO v_q
  FROM public.exam_questions
  WHERE id = p_question_id AND status = 'PUBLISHED';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pregunta no encontrada';
  END IF;

  v_reveal := public._exam_build_reveal(
    v_q,
    v_attempt.option_order -> p_question_id::text,
    p_selected_index
  );

  UPDATE public.exam_attempts
  SET answers = COALESCE(answers, '{}'::jsonb) || jsonb_build_object(p_question_id::text, p_selected_index)
  WHERE id = p_attempt_id;

  RETURN v_reveal;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_exam_attempt_reveals(p_attempt_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_attempt public.exam_attempts;
  v_qid text;
  v_idx int;
  v_q public.exam_questions;
  v_out jsonb := '{}'::jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  SELECT * INTO v_attempt
  FROM public.exam_attempts
  WHERE id = p_attempt_id
    AND user_id = v_uid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Intento no encontrado';
  END IF;

  IF COALESCE(v_attempt.config->>'feedbackMode', 'end') IS DISTINCT FROM 'immediate' THEN
    RETURN '{}'::jsonb;
  END IF;

  FOR v_qid, v_idx IN
    SELECT key, value::int
    FROM jsonb_each_text(COALESCE(v_attempt.answers, '{}'::jsonb))
  LOOP
    SELECT * INTO v_q FROM public.exam_questions WHERE id = v_qid::uuid;
    IF FOUND THEN
      v_out := v_out || jsonb_build_object(
        v_qid,
        public._exam_build_reveal(v_q, v_attempt.option_order -> v_qid, v_idx)
      );
    END IF;
  END LOOP;

  RETURN v_out;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grade_exam_answer(uuid, uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_exam_attempt_reveals(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.grade_exam_answer(uuid, uuid, int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_exam_attempt_reveals(uuid) FROM PUBLIC, anon;

-- ─── 4. Envío y calificación en servidor ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.submit_exam_session(
  p_attempt_id uuid,
  p_answers jsonb DEFAULT '{}'::jsonb,
  p_duration_seconds int DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_attempt public.exam_attempts;
  v_qid uuid;
  v_q public.exam_questions;
  v_display_idx int;
  v_orig int;
  v_is_correct boolean;
  v_correct_count int := 0;
  v_total int := 0;
  v_score numeric(5,2);
  v_duration int;
  v_session_id uuid;
  v_answers jsonb := '{}'::jsonb;
  v_details jsonb := '[]'::jsonb;
  v_questions jsonb := '[]'::jsonb;
  v_cfg jsonb;
  v_elapsed int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  SELECT * INTO v_attempt
  FROM public.exam_attempts
  WHERE id = p_attempt_id
    AND user_id = v_uid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Intento no encontrado';
  END IF;

  IF v_attempt.status = 'COMPLETED' AND v_attempt.exam_session_id IS NOT NULL THEN
    RETURN public.get_exam_session_review(v_attempt.exam_session_id)
      || jsonb_build_object(
        'sessionId', v_attempt.exam_session_id,
        'assignmentId', v_attempt.assignment_id
      );
  END IF;

  IF v_attempt.status IS DISTINCT FROM 'IN_PROGRESS' THEN
    RAISE EXCEPTION 'El examen no se puede enviar';
  END IF;

  v_cfg := COALESCE(v_attempt.config, '{}'::jsonb);
  v_answers := COALESCE(v_attempt.answers, '{}'::jsonb);
  IF p_answers IS NOT NULL AND jsonb_typeof(p_answers) = 'object' THEN
    v_answers := v_answers || p_answers;
  END IF;

  v_elapsed := GREATEST(0, EXTRACT(EPOCH FROM (now() - v_attempt.created_at))::int);
  IF v_attempt.expires_at IS NOT NULL THEN
    v_duration := GREATEST(
      0,
      EXTRACT(EPOCH FROM (LEAST(now(), v_attempt.expires_at) - v_attempt.created_at))::int
    );
  ELSE
    v_duration := GREATEST(0, COALESCE(p_duration_seconds, v_elapsed));
    v_duration := LEAST(v_duration, GREATEST(v_elapsed + 120, 28800));
  END IF;

  FOREACH v_qid IN ARRAY v_attempt.question_ids
  LOOP
    SELECT * INTO v_q FROM public.exam_questions WHERE id = v_qid;
    IF NOT FOUND THEN
      CONTINUE;
    END IF;
    v_total := v_total + 1;

    IF (v_answers ? v_qid::text) AND jsonb_typeof(v_answers -> v_qid::text) = 'number' THEN
      v_display_idx := (v_answers ->> v_qid::text)::int;
    ELSE
      v_display_idx := NULL;
    END IF;

    v_orig := public._exam_display_to_original(v_attempt.option_order -> v_qid::text, v_display_idx);
    v_is_correct := false;
    IF v_orig IS NOT NULL
       AND v_orig >= 0
       AND v_orig < jsonb_array_length(COALESCE(v_q.options, '[]'::jsonb)) THEN
      v_is_correct := COALESCE((v_q.options->v_orig->>'is_correct')::boolean, false);
    END IF;

    IF v_is_correct THEN
      v_correct_count := v_correct_count + 1;
    END IF;

    IF v_display_idx IS NOT NULL THEN
      v_details := v_details || jsonb_build_array(jsonb_build_object(
        'question_id', v_qid,
        'selected_option_index', v_display_idx,
        'is_correct', v_is_correct,
        'topic_name', v_q.topic_name,
        'module_id', v_q.module_id,
        'is_critical', v_q.is_critical,
        'difficulty', v_q.difficulty
      ));
    END IF;

    v_questions := v_questions || jsonb_build_array(
      public._exam_question_revealed(v_q, v_attempt.option_order -> v_qid::text)
    );
  END LOOP;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'El examen no contiene preguntas';
  END IF;

  v_score := ROUND((v_correct_count::numeric / v_total::numeric) * 100, 2);

  INSERT INTO public.exam_sessions (
    user_id, mode, module_id, selected_topics, question_count_config,
    feedback_mode, time_limit_seconds, total_questions, correct_answers,
    score_percentage, duration_seconds, status, completed_at
  ) VALUES (
    v_uid,
    v_attempt.mode,
    NULLIF(v_cfg->>'moduleId', ''),
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(v_cfg->'topicNames')),
      '{}'::text[]
    ),
    NULLIF(v_cfg->>'questionCount', '')::int,
    COALESCE(v_cfg->>'feedbackMode', 'end'),
    NULLIF(v_cfg->>'timeLimitSeconds', '')::int,
    v_total,
    v_correct_count,
    v_score,
    v_duration,
    'COMPLETED',
    now()
  )
  RETURNING id INTO v_session_id;

  INSERT INTO public.exam_answers (
    session_id, question_id, topic_name, module_id, is_critical, difficulty,
    selected_option_index, is_correct, time_spent_seconds
  )
  SELECT
    v_session_id,
    (d->>'question_id')::uuid,
    d->>'topic_name',
    d->>'module_id',
    COALESCE((d->>'is_critical')::boolean, false),
    COALESCE((d->>'difficulty')::int, 2),
    (d->>'selected_option_index')::int,
    COALESCE((d->>'is_correct')::boolean, false),
    0
  FROM jsonb_array_elements(v_details) d
  ON CONFLICT (session_id, question_id) DO NOTHING;

  PERFORM set_config('neurosafe.allow_exam_complete', 'true', true);

  UPDATE public.exam_attempts
  SET
    status = 'COMPLETED',
    answers = v_answers,
    time_remaining_seconds = 0,
    exam_session_id = v_session_id
  WHERE id = p_attempt_id;

  IF v_attempt.assignment_id IS NOT NULL THEN
    BEGIN
      PERFORM public.complete_my_assigned_exam(
        v_attempt.assignment_id,
        v_session_id,
        v_score,
        v_duration
      );
    EXCEPTION WHEN others THEN
      -- La sesión ya está calificada; el asiento de la asignación no debe
      -- revertir el examen. El cliente reintenta complete_my_assigned_exam.
      NULL;
    END;
  END IF;

  RETURN jsonb_build_object(
    'sessionId', v_session_id,
    'scorePercentage', v_score,
    'correctAnswers', v_correct_count,
    'totalQuestions', v_total,
    'passed', v_score >= 70,
    'durationSeconds', v_duration,
    'assignmentId', v_attempt.assignment_id,
    'answers', v_details,
    'questions', v_questions
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_exam_session_review(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_session public.exam_sessions;
  v_attempt public.exam_attempts;
  v_out jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  SELECT * INTO v_session
  FROM public.exam_sessions
  WHERE id = p_session_id
    AND (
      user_id = v_uid
      OR public.has_role('admin')
      OR public.has_role('editor')
    );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sesión no encontrada';
  END IF;

  SELECT * INTO v_attempt
  FROM public.exam_attempts
  WHERE user_id = v_session.user_id
    AND status = 'COMPLETED'
    AND updated_at >= v_session.started_at - interval '1 hour'
  ORDER BY updated_at DESC
  LIMIT 1;

  SELECT jsonb_build_object(
    'session', to_jsonb(v_session),
    'answers', COALESCE((
      SELECT jsonb_agg(to_jsonb(a) ORDER BY a.created_at)
      FROM public.exam_answers a
      WHERE a.session_id = p_session_id
    ), '[]'::jsonb),
    'questions', COALESCE((
      SELECT jsonb_agg(
        public._exam_question_revealed(
          q,
          COALESCE(v_attempt.option_order -> a.question_id::text, '[]'::jsonb)
        )
      )
      FROM public.exam_answers a
      JOIN public.exam_questions q ON q.id = a.question_id
      WHERE a.session_id = p_session_id
    ), '[]'::jsonb)
  )
  INTO v_out;

  RETURN v_out;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_exam_session(uuid, jsonb, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_exam_session_review(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.submit_exam_session(uuid, jsonb, int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_exam_session_review(uuid) FROM PUBLIC, anon;

-- ─── 5. Analítica de brechas: solo el propio alumno (staff puede pedir otro) ─
CREATE OR REPLACE FUNCTION public.get_exam_gap_analysis(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  topic_name text,
  module_id text,
  total_attempts bigint,
  correct_attempts bigint,
  accuracy_pct numeric,
  critical_failures bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_target uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  v_target := COALESCE(p_user_id, v_uid);

  IF v_target IS DISTINCT FROM v_uid
     AND NOT public.has_role('admin')
     AND NOT public.has_role('editor') THEN
    RAISE EXCEPTION 'No autorizado a consultar la analítica de otro alumno';
  END IF;

  RETURN QUERY
  SELECT
    ea.topic_name,
    ea.module_id,
    COUNT(*)                                          AS total_attempts,
    SUM(CASE WHEN ea.is_correct THEN 1 ELSE 0 END)   AS correct_attempts,
    ROUND(AVG(CASE WHEN ea.is_correct THEN 100.0 ELSE 0 END), 1) AS accuracy_pct,
    SUM(CASE WHEN ea.is_critical AND NOT ea.is_correct THEN 1 ELSE 0 END) AS critical_failures
  FROM public.exam_answers ea
  INNER JOIN public.exam_sessions es ON es.id = ea.session_id
  WHERE es.user_id = v_target
    AND es.status = 'COMPLETED'
  GROUP BY ea.topic_name, ea.module_id
  ORDER BY accuracy_pct ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_exam_gap_analysis(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_exam_gap_analysis(uuid) TO authenticated;

-- ─── 6. Progreso por pregunta: search_path ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_question_progress_on_answer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_session_user UUID;
BEGIN
  SELECT user_id INTO v_session_user
  FROM public.exam_sessions
  WHERE id = NEW.session_id;

  IF v_session_user IS NULL THEN RETURN NEW; END IF;

  INSERT INTO public.user_question_progress (user_id, question_id, attempts, successes, consecutive_correct, is_mastered, last_attempt)
  VALUES (
    v_session_user,
    NEW.question_id,
    1,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    false,
    now()
  )
  ON CONFLICT (user_id, question_id) DO UPDATE SET
    attempts = user_question_progress.attempts + 1,
    successes = user_question_progress.successes + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    consecutive_correct = CASE
      WHEN NEW.is_correct THEN user_question_progress.consecutive_correct + 1
      ELSE 0
    END,
    is_mastered = CASE
      WHEN NEW.is_correct THEN (user_question_progress.consecutive_correct + 1) >= 3
      ELSE false
    END,
    last_attempt = now();

  RETURN NEW;
END;
$$;

-- ─── 7. El alumno no escribe calificación ni muda el banco del intento ───────
CREATE OR REPLACE FUNCTION public.protect_exam_attempt_student_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF current_setting('neurosafe.allow_exam_complete', true) = 'true' THEN
    RETURN NEW;
  END IF;

  IF public.has_role('admin') OR public.has_role('editor') THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.question_ids IS DISTINCT FROM OLD.question_ids
     OR NEW.option_order IS DISTINCT FROM OLD.option_order
     OR NEW.config IS DISTINCT FROM OLD.config
     OR NEW.mode IS DISTINCT FROM OLD.mode
     OR NEW.assignment_id IS DISTINCT FROM OLD.assignment_id
     OR NEW.expires_at IS DISTINCT FROM OLD.expires_at
     OR NEW.exam_session_id IS DISTINCT FROM OLD.exam_session_id THEN
    RAISE EXCEPTION 'No autorizado a modificar la configuración del examen';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IS DISTINCT FROM 'ABANDONED' THEN
    RAISE EXCEPTION 'El alumno no puede marcar el examen como completado';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_exam_attempt_student_update ON public.exam_attempts;
CREATE TRIGGER trg_protect_exam_attempt_student_update
  BEFORE UPDATE ON public.exam_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_exam_attempt_student_update();

CREATE OR REPLACE FUNCTION public.protect_exam_attempt_student_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  NEW.exam_session_id := NULL;
  NEW.status := 'IN_PROGRESS';

  IF NEW.assignment_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.student_assignments sa
      WHERE sa.id = NEW.assignment_id
        AND sa.student_id = auth.uid()
        AND sa.type = 'exam'
    ) THEN
      RAISE EXCEPTION 'La asignación de examen no es válida';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_exam_attempt_student_insert ON public.exam_attempts;
CREATE TRIGGER trg_protect_exam_attempt_student_insert
  BEFORE INSERT ON public.exam_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_exam_attempt_student_insert();

-- ─── 8. RLS: alumnos no leen claves ni escriben resultados ───────────────────
DROP POLICY IF EXISTS "Enrolled users can read exam questions" ON public.exam_questions;
DROP POLICY IF EXISTS "Staff can read exam questions" ON public.exam_questions;
CREATE POLICY "Staff can read exam questions"
  ON public.exam_questions FOR SELECT
  USING (
    public.has_role('admin')
    OR public.has_role('editor')
    OR public.has_role('contributor')
  );

DROP POLICY IF EXISTS "Users can insert own exam sessions" ON public.exam_sessions;
DROP POLICY IF EXISTS "Users can update own exam sessions" ON public.exam_sessions;
DROP POLICY IF EXISTS "Users can delete own exam sessions" ON public.exam_sessions;
DROP POLICY IF EXISTS "Users can insert own exam answers" ON public.exam_answers;

COMMENT ON FUNCTION public.submit_exam_session(uuid, jsonb, int) IS
  'Califica un intento de examen en el servidor, persiste la sesión y revela las claves solo al terminar.';
COMMENT ON FUNCTION public.get_exam_questions_for_attempt(text[], text, uuid[], boolean, boolean) IS
  'Devuelve el banco publicado sin is_correct, feedback ni perla clínica.';
COMMENT ON FUNCTION public.grade_exam_answer(uuid, uuid, int) IS
  'Modo tutor: califica una respuesta y devuelve feedback. Rechazado en modo examen.';
