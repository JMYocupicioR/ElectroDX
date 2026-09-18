-- NeuroSAFE: integridad académica, perfiles públicos, herramientas del alumno
-- Esta migración NO debe aplicarse al remoto desde el agente; solo versionado local.

-- ─── 1. Vista pública de especialistas (sin columnas sensibles) ───────────────

CREATE OR REPLACE VIEW public.public_specialist_profiles
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.display_name,
  p.credentials,
  p.institution,
  p.academic_institution,
  p.specialty,
  p.residency_year,
  p.avatar_url,
  p.bio,
  p.is_public,
  p.show_in_editorial_committee,
  COALESCE(p.cedula_verified, false) AS cedula_verified,
  p.created_at
FROM public.profiles p
WHERE p.enrollment_status = 'approved'
  AND (p.is_public = true OR p.show_in_editorial_committee = true);

GRANT SELECT ON public.public_specialist_profiles TO anon, authenticated;

DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;

CREATE POLICY "profiles_self_or_staff_read" ON public.profiles
  FOR SELECT USING (
    id = auth.uid()
    OR public.is_admin()
    OR public.is_editor()
  );

-- ─── 2. Actualización de perfil: columnas permitidas + trigger ───────────────

CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF public.is_admin() OR public.is_editor() THEN
    RETURN NEW;
  END IF;

  NEW.enrollment_status := OLD.enrollment_status;
  NEW.enrollment_verified_at := OLD.enrollment_verified_at;
  NEW.enrollment_verified_by := OLD.enrollment_verified_by;
  NEW.enrollment_requested_at := OLD.enrollment_requested_at;
  NEW.verified_at := OLD.verified_at;
  NEW.cedula_verified := OLD.cedula_verified;
  NEW.cedula_data := OLD.cedula_data;
  NEW.admin_notes := OLD.admin_notes;
  NEW.is_public := OLD.is_public;
  NEW.show_in_editorial_committee := OLD.show_in_editorial_committee;
  NEW.completed_topics := OLD.completed_topics;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_privileged_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileged_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_columns();

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE ON public.profiles TO authenticated;

COMMENT ON FUNCTION public.protect_profile_privileged_columns() IS
  'Impide que el alumno altere inscripción, cédula verificada, notas administrativas y visibilidad pública. El staff (admin/editor) sí puede actualizar cualquier columna.';

CREATE OR REPLACE FUNCTION public.update_my_profile(p_updates jsonb)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.profiles;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  UPDATE public.profiles SET
    display_name = COALESCE(p_updates->>'display_name', display_name),
    credentials = COALESCE(p_updates->>'credentials', credentials),
    institution = COALESCE(p_updates->>'institution', institution),
    academic_institution = COALESCE(p_updates->>'academic_institution', academic_institution),
    specialty = COALESCE(p_updates->>'specialty', specialty),
    residency_year = COALESCE(p_updates->>'residency_year', residency_year),
    cedula_profesional = COALESCE(p_updates->>'cedula_profesional', cedula_profesional),
    comefyr_member_id = COALESCE(p_updates->>'comefyr_member_id', comefyr_member_id),
    avatar_url = CASE WHEN p_updates ? 'avatar_url' THEN p_updates->>'avatar_url' ELSE avatar_url END,
    bio = COALESCE(p_updates->>'bio', bio),
    subspecialty = COALESCE(p_updates->>'subspecialty', subspecialty),
    specialty_cedula = COALESCE(p_updates->>'specialty_cedula', specialty_cedula),
    cmmr_certified = COALESCE((p_updates->>'cmmr_certified')::boolean, cmmr_certified),
    cmmr_number = COALESCE(p_updates->>'cmmr_number', cmmr_number),
    phone = COALESCE(p_updates->>'phone', phone),
    linkedin_url = COALESCE(p_updates->>'linkedin_url', linkedin_url),
    orcid_id = COALESCE(p_updates->>'orcid_id', orcid_id),
    clinical_interests = CASE
      WHEN p_updates ? 'clinical_interests' THEN ARRAY(SELECT jsonb_array_elements_text(p_updates->'clinical_interests'))
      ELSE clinical_interests
    END,
    updated_at = now()
  WHERE id = v_uid
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_my_profile(jsonb) TO authenticated;

-- ─── 3. Entrega de asignaciones vía RPC ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.protect_assignment_student_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF public.is_admin() OR public.is_editor() THEN
    RETURN NEW;
  END IF;

  IF NEW.student_id IS DISTINCT FROM OLD.student_id
    OR NEW.grade IS DISTINCT FROM OLD.grade
    OR NEW.feedback IS DISTINCT FROM OLD.feedback
    OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
    OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
    OR NEW.min_score IS DISTINCT FROM OLD.min_score
    OR NEW.due_date IS DISTINCT FROM OLD.due_date
    OR NEW.assigned_by IS DISTINCT FROM OLD.assigned_by
    OR NEW.target_exam_config IS DISTINCT FROM OLD.target_exam_config
    OR NEW.title IS DISTINCT FROM OLD.title
    OR NEW.type IS DISTINCT FROM OLD.type
    OR NEW.plan_id IS DISTINCT FROM OLD.plan_id
  THEN
    RAISE EXCEPTION 'No autorizado a modificar campos académicos de la asignación';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status NOT IN ('submitted')
     AND OLD.status NOT IN ('pending', 'needs_revision') THEN
    RAISE EXCEPTION 'Transición de estado no permitida';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'submitted' THEN
    RAISE EXCEPTION 'El alumno solo puede marcar una asignación como entregada';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_assignment_student_update ON public.student_assignments;
CREATE TRIGGER trg_protect_assignment_student_update
  BEFORE UPDATE ON public.student_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_assignment_student_update();

CREATE OR REPLACE FUNCTION public.submit_my_assignment(
  p_assignment_id uuid,
  p_notes text DEFAULT NULL,
  p_submission_url text DEFAULT NULL
)
RETURNS public.student_assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.student_assignments;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  UPDATE public.student_assignments
  SET
    student_notes = COALESCE(p_notes, student_notes),
    submission_url = COALESCE(p_submission_url, submission_url),
    submitted_at = now(),
    status = 'submitted',
    updated_at = now()
  WHERE id = p_assignment_id
    AND student_id = v_uid
    AND status IN ('pending', 'needs_revision')
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Asignación no encontrada o no disponible para entrega';
  END IF;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_my_assignment(uuid, text, text) TO authenticated;

-- ─── 4. Quizzes: ocultar respuestas correctas ────────────────────────────────

CREATE OR REPLACE FUNCTION public._sanitize_quiz_options(opts jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', o->>'id',
        'text', o->>'text',
        'textEn', o->>'textEn'
      )
    ),
    '[]'::jsonb
  )
  FROM jsonb_array_elements(COALESCE(opts, '[]'::jsonb)) o;
$$;

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
    'questions', v_questions
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_quiz_for_attempt(text) TO authenticated;

DROP POLICY IF EXISTS "quiz_questions_authenticated_read" ON public.quiz_questions;

CREATE POLICY "quiz_questions_staff_read" ON public.quiz_questions
  FOR SELECT USING (public.is_admin() OR public.is_editor());

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

-- ─── 5. Herramientas del alumno ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.student_lesson_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  topic_id text NOT NULL,
  body text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_id)
);

CREATE TABLE IF NOT EXISTS public.student_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  topic_id text NOT NULL,
  url text NOT NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_id)
);

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

CREATE TABLE IF NOT EXISTS public.academic_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folio text NOT NULL UNIQUE,
  issued_at timestamptz NOT NULL DEFAULT now(),
  overall_progress_pct int NOT NULL,
  average_score int NOT NULL,
  verification_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  revoked_at timestamptz
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

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.emg_report_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES public.student_assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url text,
  interpretation jsonb NOT NULL DEFAULT '{}'::jsonb,
  rubric_score numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.emg_report_submissions
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT 'Reporte EMG',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'submitted',
  ADD COLUMN IF NOT EXISTS feedback text;

ALTER TABLE public.student_lesson_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_qa_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_qa_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emg_report_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY notes_own ON public.student_lesson_notes
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY bookmarks_own ON public.student_bookmarks
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY flashcards_own ON public.student_flashcards
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY certs_own_read ON public.academic_certificates
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin() OR public.is_editor());
CREATE POLICY qa_student_own ON public.student_qa_threads
  FOR ALL USING (student_id = auth.uid() OR public.is_admin() OR public.is_editor())
  WITH CHECK (student_id = auth.uid() OR public.is_admin() OR public.is_editor());
CREATE POLICY qa_replies_rw ON public.student_qa_replies
  FOR ALL USING (
    author_id = auth.uid()
    OR public.is_admin() OR public.is_editor()
    OR EXISTS (SELECT 1 FROM public.student_qa_threads t WHERE t.id = thread_id AND t.student_id = auth.uid())
  )
  WITH CHECK (author_id = auth.uid());
CREATE POLICY push_own ON public.push_subscriptions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY emg_report_own ON public.emg_report_submissions
  FOR ALL USING (student_id = auth.uid() OR public.is_admin() OR public.is_editor())
  WITH CHECK (student_id = auth.uid() OR public.is_admin() OR public.is_editor());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_lesson_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_bookmarks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_flashcards TO authenticated;
GRANT SELECT ON public.academic_certificates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.student_qa_threads TO authenticated;
GRANT SELECT, INSERT ON public.student_qa_replies TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.push_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.emg_report_submissions TO authenticated;

CREATE OR REPLACE FUNCTION public.issue_my_certificate()
RETURNS public.academic_certificates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_profile public.profiles;
  v_avg int;
  v_progress int;
  v_passed int;
  v_available int;
  v_row public.academic_certificates;
  v_folio text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid;
  IF v_profile.cedula_verified IS NOT TRUE THEN
    RAISE EXCEPTION 'Requiere cédula profesional verificada';
  END IF;

  SELECT COALESCE(round(avg(best)), 0)::int, count(*) FILTER (WHERE best >= 80), count(*)
  INTO v_avg, v_passed, v_available
  FROM (
    SELECT topic_id, max(score) AS best
    FROM public.quiz_attempts
    WHERE user_id = v_uid
    GROUP BY topic_id
  ) s;

  SELECT COUNT(*)::int INTO v_progress
  FROM public.student_completed_topics
  WHERE user_id = v_uid;

  IF v_avg < 80 OR v_available < 8 THEN
    RAISE EXCEPTION 'Promedio o cobertura de evaluaciones insuficiente para emitir constancia';
  END IF;

  SELECT folio INTO v_folio FROM public.academic_certificates
  WHERE user_id = v_uid AND revoked_at IS NULL
  LIMIT 1;

  IF v_folio IS NOT NULL THEN
    SELECT * INTO v_row FROM public.academic_certificates WHERE folio = v_folio;
    RETURN v_row;
  END IF;

  v_folio := 'EDX-' || to_char(now(), 'YYYY') || '-' || upper(encode(gen_random_bytes(6), 'hex'));

  INSERT INTO public.academic_certificates (user_id, folio, overall_progress_pct, average_score)
  VALUES (v_uid, v_folio, LEAST(100, v_progress), v_avg)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.issue_my_certificate() TO authenticated;

CREATE OR REPLACE FUNCTION public.verify_certificate(p_folio text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE WHEN c.id IS NULL THEN jsonb_build_object('valid', false)
    ELSE jsonb_build_object(
      'valid', c.revoked_at IS NULL,
      'folio', c.folio,
      'issued_at', c.issued_at,
      'display_name', p.display_name,
      'revoked', c.revoked_at IS NOT NULL
    )
  END
  FROM (SELECT p_folio AS folio) q
  LEFT JOIN public.academic_certificates c ON c.folio = q.folio
  LEFT JOIN public.profiles p ON p.id = c.user_id;
$$;

GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

ALTER TABLE public.student_learning_plans
  ADD COLUMN IF NOT EXISTS weekly_goal_minutes int,
  ADD COLUMN IF NOT EXISTS calendar_export_url text;

ALTER TABLE public.published_quizzes
  ADD COLUMN IF NOT EXISTS clinical_validation_status text NOT NULL DEFAULT 'pending_review';

COMMENT ON COLUMN public.published_quizzes.clinical_validation_status IS
  'pending_review | approved | rejected. Los reactivos nuevos no son acreditables hasta approved.';

