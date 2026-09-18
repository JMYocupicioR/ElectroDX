-- Validación clínica por lotes, analítica de reactivos, Q&A por cohorte y rúbrica EMG.
-- Aplicar en Supabase local (`npx supabase db reset` / `migration up`).

-- ─── 1. Columnas de validación clínica ───────────────────────────────────────

ALTER TABLE public.published_quizzes
  ADD COLUMN IF NOT EXISTS clinical_validation_status text NOT NULL DEFAULT 'pending_review',
  ADD COLUMN IF NOT EXISTS validated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS validated_at timestamptz,
  ADD COLUMN IF NOT EXISTS validation_notes text;

COMMENT ON COLUMN public.published_quizzes.clinical_validation_status IS
  'pending_review | approved | rejected. Los reactivos nuevos no son acreditables hasta approved.';

ALTER TABLE public.published_quizzes
  DROP CONSTRAINT IF EXISTS published_quizzes_clinical_validation_status_chk;

ALTER TABLE public.published_quizzes
  ADD CONSTRAINT published_quizzes_clinical_validation_status_chk
  CHECK (clinical_validation_status IN ('pending_review', 'approved', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_published_quizzes_validation
  ON public.published_quizzes (clinical_validation_status, module_id);

-- Quizzes que pasaron revisión editorial humana siguen acreditables.
UPDATE public.published_quizzes
SET
  clinical_validation_status = 'approved',
  validated_at = COALESCE(validated_at, published_at, now()),
  validation_notes = COALESCE(validation_notes, 'Aprobado vía revisión editorial')
WHERE source_revision_id IS NOT NULL
  AND clinical_validation_status = 'pending_review';

-- Al publicar por cola editorial, marcar validated.
CREATE OR REPLACE FUNCTION public._quiz_mark_approved_on_editorial_publish()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.source_revision_id IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.source_revision_id IS DISTINCT FROM NEW.source_revision_id) THEN
    NEW.clinical_validation_status := 'approved';
    NEW.validated_by := COALESCE(NEW.last_edited_by, NEW.published_by);
    NEW.validated_at := now();
    IF NEW.validation_notes IS NULL OR btrim(NEW.validation_notes) = '' THEN
      NEW.validation_notes := 'Aprobado vía revisión editorial';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quiz_mark_approved_on_editorial_publish ON public.published_quizzes;
CREATE TRIGGER trg_quiz_mark_approved_on_editorial_publish
  BEFORE INSERT OR UPDATE OF source_revision_id ON public.published_quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public._quiz_mark_approved_on_editorial_publish();

-- ─── 2. Vista de banderas: exponer estado de validación ──────────────────────

DROP VIEW IF EXISTS public.quiz_topic_flags;

CREATE VIEW public.quiz_topic_flags
WITH (security_invoker = true)
AS
SELECT
  pq.topic_id,
  pq.module_id,
  pq.title,
  pq.pass_score,
  pq.question_count,
  pq.max_attempts,
  pq.version,
  pq.clinical_validation_status,
  EXISTS (
    SELECT 1
    FROM public.quiz_attempts qa
    WHERE qa.topic_id = pq.topic_id
      AND qa.user_id = auth.uid()
      AND qa.passed = true
  ) AS user_has_passed,
  (
    SELECT COUNT(*)::int
    FROM public.quiz_attempts qa
    WHERE qa.topic_id = pq.topic_id
      AND qa.user_id = auth.uid()
  ) AS user_attempt_count
FROM public.published_quizzes pq;

GRANT SELECT ON public.quiz_topic_flags TO anon, authenticated;

-- ─── 3. Gate de alumnos: solo quizzes aprobados ──────────────────────────────

CREATE OR REPLACE FUNCTION public.get_quiz_for_attempt(p_topic_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_quiz public.published_quizzes;
  v_questions jsonb;
  v_past_count int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión para realizar la evaluación';
  END IF;

  IF NOT public.is_enrolled_physician(v_uid) THEN
    RAISE EXCEPTION 'Requiere inscripción médica aprobada para realizar evaluaciones';
  END IF;

  SELECT * INTO v_quiz
  FROM public.published_quizzes
  WHERE topic_id = p_topic_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cuestionario no encontrado para el tema especificado';
  END IF;

  IF COALESCE(v_quiz.clinical_validation_status, 'pending_review') IS DISTINCT FROM 'approved' THEN
    RAISE EXCEPTION 'Esta evaluación está en validación académica y aún no es acreditable';
  END IF;

  IF v_quiz.max_attempts IS NOT NULL THEN
    SELECT COUNT(*) INTO v_past_count
    FROM public.quiz_attempts
    WHERE quiz_id = v_quiz.id AND user_id = v_uid;

    IF v_past_count >= v_quiz.max_attempts THEN
      RAISE EXCEPTION 'Ha alcanzado el número máximo de intentos permitidos (%)', v_quiz.max_attempts;
    END IF;
  END IF;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', q.id,
      'quiz_id', q.quiz_id,
      'sort_order', q.sort_order,
      'type', q.type,
      'stem', q.stem,
      'stem_en', q.stem_en,
      'image_url', q.image_url,
      'image_alt', q.image_alt,
      'options', public._sanitize_quiz_options(q.options),
      'difficulty', q.difficulty
    ) ORDER BY q.sort_order
  ), '[]'::jsonb)
  INTO v_questions
  FROM public.quiz_questions q
  WHERE q.quiz_id = v_quiz.id;

  RETURN jsonb_build_object(
    'id', v_quiz.id,
    'topic_id', v_quiz.topic_id,
    'module_id', v_quiz.module_id,
    'title', v_quiz.title,
    'pass_score', v_quiz.pass_score,
    'max_attempts', v_quiz.max_attempts,
    'shuffle_questions', v_quiz.shuffle_questions,
    'shuffle_options', v_quiz.shuffle_options,
    'question_count', v_quiz.question_count,
    'version', v_quiz.version,
    'published_at', v_quiz.published_at,
    'clinical_validation_status', v_quiz.clinical_validation_status,
    'questions', v_questions
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_quiz_for_attempt(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
  p_topic_id text,
  p_answers jsonb,
  p_duration_seconds int DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_quiz public.published_quizzes;
  v_past_count int;
  v_q public.quiz_questions;
  v_total int := 0;
  v_correct_count int := 0;
  v_score int;
  v_passed boolean;
  v_user_answers jsonb := '[]'::jsonb;
  v_revealed jsonb := '[]'::jsonb;
  v_ans_elem jsonb;
  v_selected_ids text[];
  v_correct_ids text[];
  v_is_correct boolean;
  v_row public.quiz_attempts;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión para realizar la evaluación';
  END IF;

  IF NOT public.is_enrolled_physician(v_uid) THEN
    RAISE EXCEPTION 'Requiere inscripción médica aprobada para realizar evaluaciones';
  END IF;

  SELECT * INTO v_quiz
  FROM public.published_quizzes
  WHERE topic_id = p_topic_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cuestionario no encontrado para el tema especificado';
  END IF;

  IF COALESCE(v_quiz.clinical_validation_status, 'pending_review') IS DISTINCT FROM 'approved' THEN
    RAISE EXCEPTION 'Esta evaluación está en validación académica y aún no es acreditable';
  END IF;

  IF v_quiz.max_attempts IS NOT NULL THEN
    SELECT COUNT(*) INTO v_past_count
    FROM public.quiz_attempts
    WHERE quiz_id = v_quiz.id AND user_id = v_uid;

    IF v_past_count >= v_quiz.max_attempts THEN
      RAISE EXCEPTION 'Ha alcanzado el número máximo de intentos permitidos (%)', v_quiz.max_attempts;
    END IF;
  END IF;

  FOR v_q IN
    SELECT * FROM public.quiz_questions
    WHERE quiz_id = v_quiz.id
    ORDER BY sort_order
  LOOP
    v_total := v_total + 1;

    SELECT elem INTO v_ans_elem
    FROM jsonb_array_elements(COALESCE(p_answers, '[]'::jsonb)) AS elem
    WHERE elem->>'questionId' = v_q.id::text
    LIMIT 1;

    IF v_ans_elem IS NOT NULL AND jsonb_typeof(v_ans_elem->'selectedIds') = 'array' THEN
      SELECT array_agg(v)::text[]
      INTO v_selected_ids
      FROM jsonb_array_elements_text(v_ans_elem->'selectedIds') AS v;
    ELSE
      v_selected_ids := '{}'::text[];
    END IF;

    SELECT COALESCE(array_agg(o->>'id'), '{}'::text[])
    INTO v_correct_ids
    FROM jsonb_array_elements(COALESCE(v_q.options, '[]'::jsonb)) o
    WHERE (o->>'isCorrect')::boolean IS TRUE;

    v_is_correct := public._quiz_is_answer_correct(v_q.type, v_q.options, v_selected_ids);
    IF v_is_correct THEN
      v_correct_count := v_correct_count + 1;
    END IF;

    v_user_answers := v_user_answers || jsonb_build_object(
      'questionId', v_q.id::text,
      'selectedIds', COALESCE(to_jsonb(v_selected_ids), '[]'::jsonb),
      'correct', v_is_correct,
      'correctIds', to_jsonb(v_correct_ids)
    );

    v_revealed := v_revealed || jsonb_build_object(
      'id', v_q.id,
      'type', v_q.type,
      'stem', v_q.stem,
      'stem_en', v_q.stem_en,
      'image_url', v_q.image_url,
      'image_alt', v_q.image_alt,
      'explanation', v_q.explanation,
      'explanation_en', v_q.explanation_en,
      'difficulty', v_q.difficulty,
      'options', v_q.options
    );
  END LOOP;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'El cuestionario no contiene preguntas publicadas';
  END IF;

  v_score := round((v_correct_count::numeric / v_total::numeric) * 100)::int;
  v_passed := v_score >= v_quiz.pass_score;

  INSERT INTO public.quiz_attempts (
    quiz_id, quiz_version, topic_id, module_id, user_id, score, passed, answers, duration_seconds
  ) VALUES (
    v_quiz.id, v_quiz.version, v_quiz.topic_id, v_quiz.module_id, v_uid,
    v_score, v_passed, v_user_answers, p_duration_seconds
  )
  RETURNING * INTO v_row;

  RETURN to_jsonb(v_row) || jsonb_build_object(
    'answers', v_user_answers,
    'revealed_questions', v_revealed
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(text, jsonb, int) TO authenticated;

-- ─── 4. RPCs de validación clínica (staff) ───────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_list_quizzes_for_validation(
  p_status text DEFAULT NULL,
  p_module_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() AND NOT public.is_editor() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  IF p_status IS NOT NULL AND p_status NOT IN ('pending_review', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Estado de validación inválido';
  END IF;

  RETURN (
    SELECT COALESCE(jsonb_agg(item), '[]'::jsonb)
    FROM (
      SELECT jsonb_build_object(
        'id', pq.id,
        'topic_id', pq.topic_id,
        'module_id', pq.module_id,
        'title', pq.title,
        'pass_score', pq.pass_score,
        'max_attempts', pq.max_attempts,
        'question_count', pq.question_count,
        'version', pq.version,
        'clinical_validation_status', pq.clinical_validation_status,
        'validated_by', pq.validated_by,
        'validated_at', pq.validated_at,
        'validation_notes', pq.validation_notes,
        'published_at', pq.published_at,
        'source_revision_id', pq.source_revision_id,
        'attempt_count', (
          SELECT COUNT(*)::int FROM public.quiz_attempts a WHERE a.quiz_id = pq.id
        ),
        'questions', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', q.id,
              'quiz_id', q.quiz_id,
              'sort_order', q.sort_order,
              'type', q.type,
              'stem', q.stem,
              'stem_en', q.stem_en,
              'image_url', q.image_url,
              'image_alt', q.image_alt,
              'options', q.options,
              'explanation', q.explanation,
              'explanation_en', q.explanation_en,
              'difficulty', q.difficulty
            ) ORDER BY q.sort_order
          ), '[]'::jsonb)
          FROM public.quiz_questions q
          WHERE q.quiz_id = pq.id
        )
      ) AS item
      FROM public.published_quizzes pq
      WHERE (p_status IS NULL OR pq.clinical_validation_status = p_status)
        AND (p_module_id IS NULL OR pq.module_id = p_module_id)
    ) listed
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_quiz_validation_status(
  p_quiz_ids uuid[],
  p_status text,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated int := 0;
BEGIN
  IF NOT public.is_admin() AND NOT public.is_editor() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  IF p_status NOT IN ('pending_review', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Estado de validación inválido';
  END IF;

  IF p_quiz_ids IS NULL OR array_length(p_quiz_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'Debe indicar al menos un cuestionario';
  END IF;

  UPDATE public.published_quizzes
  SET
    clinical_validation_status = p_status,
    validated_by = auth.uid(),
    validated_at = now(),
    validation_notes = NULLIF(btrim(COALESCE(p_notes, '')), '')
  WHERE id = ANY (p_quiz_ids);

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'quiz_clinical_validation_' || p_status,
    'published_quiz',
    COALESCE(p_quiz_ids[1]::text, 'batch'),
    jsonb_build_object(
      'status', p_status,
      'notes', p_notes,
      'quiz_ids', to_jsonb(p_quiz_ids),
      'updated', v_updated
    )
  );

  RETURN jsonb_build_object('updated', v_updated, 'status', p_status);
END;
$$;

-- Importa el banco pendiente. No pisa topic_id ya existente.
CREATE OR REPLACE FUNCTION public.admin_import_pending_quizzes(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quiz jsonb;
  v_q jsonb;
  v_quiz_id uuid;
  v_inserted int := 0;
  v_skipped int := 0;
  v_questions int := 0;
  v_count int;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  IF p_payload IS NULL OR jsonb_typeof(p_payload->'quizzes') IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Payload inválido: se espera { quizzes: [] }';
  END IF;

  FOR v_quiz IN SELECT value FROM jsonb_array_elements(p_payload->'quizzes')
  LOOP
    IF COALESCE(v_quiz->>'topic_id', '') = '' OR COALESCE(v_quiz->>'module_id', '') = '' THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.published_quizzes pq WHERE pq.topic_id = v_quiz->>'topic_id'
    ) THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    IF v_quiz->'questions' IS NOT NULL AND jsonb_typeof(v_quiz->'questions') = 'array' THEN
      v_count := jsonb_array_length(v_quiz->'questions');
    ELSE
      v_count := 0;
    END IF;

    INSERT INTO public.published_quizzes (
      topic_id, module_id, title, pass_score, max_attempts,
      shuffle_questions, shuffle_options, question_count, version,
      clinical_validation_status
    ) VALUES (
      v_quiz->>'topic_id',
      v_quiz->>'module_id',
      v_quiz->>'title',
      COALESCE((v_quiz->>'pass_score')::int, 70),
      NULLIF(v_quiz->>'max_attempts', '')::int,
      COALESCE((v_quiz->>'shuffle_questions')::boolean, true),
      COALESCE((v_quiz->>'shuffle_options')::boolean, true),
      v_count,
      1,
      'pending_review'
    )
    RETURNING id INTO v_quiz_id;

    v_inserted := v_inserted + 1;

    FOR v_q IN SELECT value FROM jsonb_array_elements(COALESCE(v_quiz->'questions', '[]'::jsonb))
    LOOP
      INSERT INTO public.quiz_questions (
        quiz_id, sort_order, type, stem, stem_en, image_url, image_alt,
        options, explanation, explanation_en, difficulty
      ) VALUES (
        v_quiz_id,
        COALESCE((v_q->>'sort_order')::int, 0),
        COALESCE(v_q->>'type', 'single'),
        COALESCE(v_q->>'stem', ''),
        v_q->>'stem_en',
        NULLIF(v_q->>'image_url', ''),
        NULLIF(v_q->>'image_alt', ''),
        COALESCE(v_q->'options', '[]'::jsonb),
        v_q->>'explanation',
        v_q->>'explanation_en',
        NULLIF(v_q->>'difficulty', '')
      );
      v_questions := v_questions + 1;
    END LOOP;
  END LOOP;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'quiz_pending_import',
    'published_quiz',
    'batch',
    jsonb_build_object('inserted', v_inserted, 'skipped', v_skipped, 'questions', v_questions)
  );

  RETURN jsonb_build_object(
    'inserted', v_inserted,
    'skipped', v_skipped,
    'questions', v_questions
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_quizzes_for_validation(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_quiz_validation_status(uuid[], text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_import_pending_quizzes(jsonb) TO authenticated;

-- ─── 5. Analítica por reactivo ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_question_stats(p_module_id text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() AND NOT public.is_editor() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  RETURN (
    SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.miss_rate DESC, s.attempt_count DESC), '[]'::jsonb)
    FROM (
      SELECT
        q.id AS question_id,
        q.quiz_id,
        pq.topic_id,
        pq.module_id,
        pq.title AS quiz_title,
        q.stem,
        q.difficulty,
        COUNT(*)::int AS attempt_count,
        COUNT(*) FILTER (WHERE COALESCE((elem->>'correct')::boolean, false) IS NOT TRUE)::int AS miss_count,
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE COALESCE((elem->>'correct')::boolean, false) IS NOT TRUE)
          / NULLIF(COUNT(*), 0),
          1
        ) AS miss_rate
      FROM public.quiz_attempts a
      JOIN public.published_quizzes pq ON pq.id = a.quiz_id
      JOIN LATERAL jsonb_array_elements(COALESCE(a.answers, '[]'::jsonb)) elem ON true
      JOIN public.quiz_questions q ON q.id::text = elem->>'questionId'
      WHERE p_module_id IS NULL OR pq.module_id = p_module_id
      GROUP BY q.id, q.quiz_id, pq.topic_id, pq.module_id, pq.title, q.stem, q.difficulty
      ORDER BY
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE COALESCE((elem->>'correct')::boolean, false) IS NOT TRUE)
          / NULLIF(COUNT(*), 0),
          1
        ) DESC NULLS LAST,
        COUNT(*) DESC
      LIMIT 80
    ) s
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_question_stats(text) TO authenticated;

-- ─── 6. Tablas de herramientas del alumno (si 20260916 no está aplicada) ─────

CREATE TABLE IF NOT EXISTS public.student_flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id text NOT NULL,
  front text NOT NULL,
  back text NOT NULL,
  due_at timestamptz NOT NULL DEFAULT now(),
  interval_days int NOT NULL DEFAULT 1,
  ease numeric NOT NULL DEFAULT 2.5,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_qa_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id text,
  topic_id text,
  title text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_qa_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.student_qa_threads(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.emg_report_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url text,
  interpretation jsonb NOT NULL DEFAULT '{}'::jsonb,
  rubric_score numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_qa_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_qa_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emg_report_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS flashcards_own ON public.student_flashcards;
CREATE POLICY flashcards_own ON public.student_flashcards
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS emg_report_own ON public.emg_report_submissions;
CREATE POLICY emg_report_own ON public.emg_report_submissions
  FOR ALL USING (student_id = auth.uid() OR public.is_admin() OR public.is_editor())
  WITH CHECK (student_id = auth.uid() OR public.is_admin() OR public.is_editor());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_flashcards TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.student_qa_threads TO authenticated;
GRANT SELECT, INSERT ON public.student_qa_replies TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.emg_report_submissions TO authenticated;

ALTER TABLE public.student_flashcards
  ADD COLUMN IF NOT EXISTS repetitions int NOT NULL DEFAULT 0;

-- ─── 7. Q&A por cohorte ──────────────────────────────────────────────────────

ALTER TABLE public.student_qa_threads
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'private';

ALTER TABLE public.student_qa_threads
  DROP CONSTRAINT IF EXISTS student_qa_threads_visibility_chk;

ALTER TABLE public.student_qa_threads
  ADD CONSTRAINT student_qa_threads_visibility_chk
  CHECK (visibility IN ('private', 'cohort'));

DROP POLICY IF EXISTS qa_student_own ON public.student_qa_threads;
DROP POLICY IF EXISTS qa_student_insert ON public.student_qa_threads;
DROP POLICY IF EXISTS qa_student_update ON public.student_qa_threads;
DROP POLICY IF EXISTS qa_student_delete ON public.student_qa_threads;
CREATE POLICY qa_student_own ON public.student_qa_threads
  FOR SELECT USING (
    student_id = auth.uid()
    OR public.is_admin()
    OR public.is_editor()
    OR (
      visibility = 'cohort'
      AND public.is_enrolled_physician(auth.uid())
    )
  );

CREATE POLICY qa_student_insert ON public.student_qa_threads
  FOR INSERT WITH CHECK (
    student_id = auth.uid()
    OR public.is_admin()
    OR public.is_editor()
  );

CREATE POLICY qa_student_update ON public.student_qa_threads
  FOR UPDATE USING (
    student_id = auth.uid()
    OR public.is_admin()
    OR public.is_editor()
  )
  WITH CHECK (
    student_id = auth.uid()
    OR public.is_admin()
    OR public.is_editor()
  );

CREATE POLICY qa_student_delete ON public.student_qa_threads
  FOR DELETE USING (
    student_id = auth.uid()
    OR public.is_admin()
    OR public.is_editor()
  );

DROP POLICY IF EXISTS qa_replies_rw ON public.student_qa_replies;
DROP POLICY IF EXISTS qa_replies_select ON public.student_qa_replies;
DROP POLICY IF EXISTS qa_replies_insert ON public.student_qa_replies;
CREATE POLICY qa_replies_select ON public.student_qa_replies
  FOR SELECT USING (
    author_id = auth.uid()
    OR public.is_admin()
    OR public.is_editor()
    OR EXISTS (
      SELECT 1 FROM public.student_qa_threads t
      WHERE t.id = thread_id
        AND (
          t.student_id = auth.uid()
          OR (t.visibility = 'cohort' AND public.is_enrolled_physician(auth.uid()))
        )
    )
  );

CREATE POLICY qa_replies_insert ON public.student_qa_replies
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
    AND (
      public.is_admin()
      OR public.is_editor()
      OR EXISTS (
        SELECT 1 FROM public.student_qa_threads t
        WHERE t.id = thread_id
          AND (
            t.student_id = auth.uid()
            OR (t.visibility = 'cohort' AND public.is_enrolled_physician(auth.uid()))
          )
      )
    )
  );

-- ─── 8. Rúbrica de reportes EMG ──────────────────────────────────────────────

ALTER TABLE public.emg_report_submissions
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT 'Reporte EMG',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'submitted',
  ADD COLUMN IF NOT EXISTS feedback text,
  ADD COLUMN IF NOT EXISTS rubric jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION public.grade_emg_report(
  p_report_id uuid,
  p_rubric jsonb,
  p_score numeric,
  p_feedback text DEFAULT NULL
)
RETURNS public.emg_report_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.emg_report_submissions;
BEGIN
  IF NOT public.is_admin() AND NOT public.is_editor() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  UPDATE public.emg_report_submissions
  SET
    rubric = COALESCE(p_rubric, '{}'::jsonb),
    rubric_score = p_score,
    feedback = p_feedback,
    status = 'graded',
    updated_at = now()
  WHERE id = p_report_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reporte EMG no encontrado';
  END IF;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grade_emg_report(uuid, jsonb, numeric, text) TO authenticated;
