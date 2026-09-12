-- Quiz hardening: fix review_revision PL/pgSQL shadowing, server-side scoring RPC, admin attempts

-- ─── 1. Scoring helpers ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public._quiz_correct_option_ids(p_options jsonb)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    array_agg(elem->>'id' ORDER BY elem->>'id'),
    '{}'::text[]
  )
  FROM jsonb_array_elements(p_options) AS elem
  WHERE COALESCE((elem->>'isCorrect')::boolean, false);
$$;

CREATE OR REPLACE FUNCTION public._quiz_is_answer_correct(
  p_type text,
  p_options jsonb,
  p_selected_ids text[]
)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_correct text[];
  v_selected text[];
BEGIN
  v_correct := public._quiz_correct_option_ids(p_options);

  SELECT COALESCE(array_agg(DISTINCT s ORDER BY s), '{}'::text[])
  INTO v_selected
  FROM unnest(COALESCE(p_selected_ids, '{}'::text[])) AS s
  WHERE NULLIF(trim(s), '') IS NOT NULL;

  IF p_type = 'multiple' THEN
    RETURN array_length(v_selected, 1) > 0 AND v_selected = v_correct;
  END IF;

  RETURN array_length(v_selected, 1) = 1
    AND array_length(v_correct, 1) = 1
    AND v_selected[1] = v_correct[1];
END;
$$;

-- ─── 2. Submit attempt (server validates score + max_attempts) ────────────────

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
  v_user_id uuid := auth.uid();
  v_quiz public.published_quizzes;
  v_question record;
  v_answer jsonb;
  v_selected text[];
  v_correct_count int := 0;
  v_total int := 0;
  v_score int;
  v_passed boolean;
  v_attempt_count int;
  v_answers_result jsonb := '[]'::jsonb;
  v_is_correct boolean;
  v_attempt public.quiz_attempts;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  IF NOT public.is_enrolled_physician(v_user_id) THEN
    RAISE EXCEPTION 'Acceso restringido a médicos inscritos';
  END IF;

  SELECT * INTO v_quiz
  FROM public.published_quizzes pq
  WHERE pq.topic_id = p_topic_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cuestionario no encontrado';
  END IF;

  IF v_quiz.max_attempts IS NOT NULL THEN
    SELECT count(*) INTO v_attempt_count
    FROM public.quiz_attempts qa
    WHERE qa.quiz_id = v_quiz.id AND qa.user_id = v_user_id;

    IF v_attempt_count >= v_quiz.max_attempts THEN
      RAISE EXCEPTION 'Máximo de intentos alcanzado';
    END IF;
  END IF;

  SELECT count(*) INTO v_total
  FROM public.quiz_questions qq
  WHERE qq.quiz_id = v_quiz.id;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'Cuestionario sin preguntas';
  END IF;

  FOR v_question IN
    SELECT *
    FROM public.quiz_questions qq
    WHERE qq.quiz_id = v_quiz.id
    ORDER BY qq.sort_order
  LOOP
    SELECT elem INTO v_answer
    FROM jsonb_array_elements(p_answers) AS elem
    WHERE elem->>'questionId' = v_question.id::text;

    IF v_answer IS NULL THEN
      RAISE EXCEPTION 'Falta respuesta para la pregunta %', v_question.id;
    END IF;

    SELECT COALESCE(array_agg(val ORDER BY val), '{}'::text[])
    INTO v_selected
    FROM (
      SELECT jsonb_array_elements_text(v_answer->'selectedIds') AS val
    ) AS selected_vals;

    v_is_correct := public._quiz_is_answer_correct(
      v_question.type::text,
      v_question.options,
      v_selected
    );

    IF v_is_correct THEN
      v_correct_count := v_correct_count + 1;
    END IF;

    v_answers_result := v_answers_result || jsonb_build_array(
      jsonb_build_object(
        'questionId', v_question.id,
        'selectedIds', COALESCE(v_answer->'selectedIds', '[]'::jsonb),
        'correct', v_is_correct
      )
    );
  END LOOP;

  v_score := round(100.0 * v_correct_count / v_total);
  v_passed := v_score >= v_quiz.pass_score;

  INSERT INTO public.quiz_attempts (
    quiz_id, quiz_version, topic_id, module_id, user_id,
    score, passed, answers, duration_seconds
  )
  VALUES (
    v_quiz.id, v_quiz.version, p_topic_id, v_quiz.module_id, v_user_id,
    v_score, v_passed, v_answers_result, p_duration_seconds
  )
  RETURNING * INTO v_attempt;

  RETURN to_jsonb(v_attempt);
END;
$$;

-- ─── 3. Admin: list quiz attempts ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_list_quiz_attempts(p_limit int DEFAULT 100)
RETURNS TABLE (
  id uuid,
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
  IF NOT public.is_admin() AND NOT public.has_role('editor') THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  RETURN QUERY
  SELECT
    qa.id,
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
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 100), 500));
END;
$$;

-- ─── 4. Fix review_revision variable shadowing ────────────────────────────────

CREATE OR REPLACE FUNCTION public.review_revision(
  revision_id UUID,
  new_status public.revision_status,
  notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rev public.content_revisions;
  v_topic_id TEXT;
  v_module_id TEXT;
  v_quiz_id UUID;
  p JSONB;
  q JSONB;
  i INT;
BEGIN
  IF NOT public.is_admin() AND NOT public.has_role('editor') THEN
    RAISE EXCEPTION 'No autorizado para revisar contenido';
  END IF;

  IF new_status NOT IN ('approved', 'rejected', 'changes_requested') THEN
    RAISE EXCEPTION 'Estado de revisión inválido';
  END IF;

  SELECT * INTO rev
  FROM public.content_revisions
  WHERE id = revision_id AND status = 'pending_review';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Revisión no encontrada o no está pendiente';
  END IF;

  IF new_status = 'approved' THEN
    p := rev.payload;

    IF COALESCE(p->>'revisionType', 'topic') = 'quiz' THEN
      v_topic_id := COALESCE(rev.target_topic_id, p->>'quizTopicId', p->>'id');

      IF v_topic_id IS NULL THEN
        RAISE EXCEPTION 'Revisión de cuestionario sin topic_id';
      END IF;

      IF rev.action = 'delete' THEN
        DELETE FROM public.published_quizzes pq
        WHERE pq.topic_id = v_topic_id;
      ELSE
        INSERT INTO public.published_quizzes (
          topic_id, module_id, title, pass_score, max_attempts,
          shuffle_questions, shuffle_options, version, question_count,
          published_by, last_edited_by, source_revision_id, published_at
        )
        VALUES (
          v_topic_id,
          rev.module_id,
          COALESCE(p->>'title', 'Evaluación'),
          COALESCE((p->>'passScore')::int, 70),
          NULLIF(p->>'maxAttempts', '')::int,
          COALESCE((p->>'shuffleQuestions')::boolean, true),
          COALESCE((p->>'shuffleOptions')::boolean, true),
          COALESCE(
            (SELECT pq.version FROM public.published_quizzes pq WHERE pq.topic_id = v_topic_id),
            0
          ) + 1,
          0,
          auth.uid(),
          rev.author_id,
          rev.id,
          now()
        )
        ON CONFLICT (topic_id) DO UPDATE SET
          module_id = EXCLUDED.module_id,
          title = EXCLUDED.title,
          pass_score = EXCLUDED.pass_score,
          max_attempts = EXCLUDED.max_attempts,
          shuffle_questions = EXCLUDED.shuffle_questions,
          shuffle_options = EXCLUDED.shuffle_options,
          version = public.published_quizzes.version + 1,
          question_count = 0,
          last_edited_by = EXCLUDED.last_edited_by,
          source_revision_id = EXCLUDED.source_revision_id,
          published_at = now()
        RETURNING public.published_quizzes.id INTO v_quiz_id;

        DELETE FROM public.quiz_questions qq
        WHERE qq.quiz_id = v_quiz_id;

        i := 0;
        FOR q IN SELECT jsonb_array_elements(COALESCE(p->'questions', '[]'::jsonb))
        LOOP
          INSERT INTO public.quiz_questions (
            quiz_id, sort_order, type, stem, stem_en, image_url, image_alt,
            options, explanation, explanation_en, difficulty
          )
          VALUES (
            v_quiz_id,
            COALESCE((q->>'sortOrder')::int, i),
            COALESCE(q->>'type', 'single'),
            COALESCE(q->>'stem', ''),
            q->>'stemEn',
            q->>'imageUrl',
            q->>'imageAlt',
            COALESCE(q->'options', '[]'::jsonb),
            q->>'explanation',
            q->>'explanationEn',
            q->>'difficulty'
          );
          i := i + 1;
        END LOOP;

        UPDATE public.published_quizzes pq
        SET question_count = i
        WHERE pq.id = v_quiz_id;
      END IF;

    ELSIF COALESCE(p->>'revisionType', 'topic') = 'module' THEN
      v_module_id := COALESCE(rev.module_id, p->>'id', p->>'slug', gen_random_uuid()::text);

      IF rev.action = 'delete' AND rev.module_id IS NOT NULL THEN
        DELETE FROM public.published_modules pm WHERE pm.id = rev.module_id;
      ELSE
        INSERT INTO public.published_modules (
          id, number, title, title_en, emoji, description, description_en,
          color, icon, sort_order, version,
          published_by, last_edited_by, source_revision_id, published_at
        )
        VALUES (
          v_module_id,
          COALESCE((p->>'number')::int, 99),
          COALESCE(p->>'title', 'Sin título'),
          p->>'titleEn',
          COALESCE(p->>'emoji', '📚'),
          p->>'description',
          p->>'descriptionEn',
          COALESCE(p->>'color', 'from-blue-500 to-indigo-600'),
          COALESCE(p->>'icon', 'BookOpen'),
          COALESCE((p->>'sortOrder')::int, COALESCE((p->>'number')::int, 99)),
          COALESCE(
            (SELECT pm.version FROM public.published_modules pm WHERE pm.id = v_module_id),
            0
          ) + 1,
          auth.uid(),
          rev.author_id,
          rev.id,
          now()
        )
        ON CONFLICT (id) DO UPDATE SET
          number = EXCLUDED.number,
          title = EXCLUDED.title,
          title_en = EXCLUDED.title_en,
          emoji = EXCLUDED.emoji,
          description = EXCLUDED.description,
          description_en = EXCLUDED.description_en,
          color = EXCLUDED.color,
          icon = EXCLUDED.icon,
          sort_order = EXCLUDED.sort_order,
          version = public.published_modules.version + 1,
          last_edited_by = EXCLUDED.last_edited_by,
          source_revision_id = EXCLUDED.source_revision_id,
          published_at = now();
      END IF;
    ELSE
      v_topic_id := COALESCE(rev.target_topic_id, p->>'id', gen_random_uuid()::text);

      IF rev.action = 'delete' AND rev.target_topic_id IS NOT NULL THEN
        DELETE FROM public.published_topics pt WHERE pt.id = rev.target_topic_id;
      ELSE
        INSERT INTO public.published_topics (
          id, module_id, parent_id, slug,
          title, title_en, description, description_en,
          content, content_en, media,
          clinical_pearls, clinical_pearls_en, key_points, key_points_en,
          tags, key_terms, version,
          published_by, last_edited_by, source_revision_id, published_at
        )
        VALUES (
          v_topic_id,
          rev.module_id,
          rev.parent_id,
          COALESCE(p->>'slug', v_topic_id),
          COALESCE(p->>'title', 'Sin título'),
          p->>'titleEn',
          p->>'description',
          p->>'descriptionEn',
          p->>'content',
          p->>'contentEn',
          jsonb_build_object(
            'videoUrls', COALESCE(p->'videoUrls', '[]'::jsonb),
            'youtubeUrls', COALESCE(p->'youtubeUrls', '[]'::jsonb),
            'vimeoUrls', COALESCE(p->'vimeoUrls', '[]'::jsonb),
            'embedUrls', COALESCE(p->'embedUrls', '[]'::jsonb),
            'imageUrls', COALESCE(p->'imageUrls', '[]'::jsonb)
          ),
          COALESCE(p->'clinicalPearls', '[]'::jsonb),
          COALESCE(p->'clinicalPearlsEn', '[]'::jsonb),
          COALESCE(p->'keyPoints', '[]'::jsonb),
          COALESCE(p->'keyPointsEn', '[]'::jsonb),
          COALESCE(
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(p->'tags', '[]'::jsonb))),
            '{}'::text[]
          ),
          COALESCE(
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(p->'keyTerms', '[]'::jsonb))),
            '{}'::text[]
          ),
          COALESCE(
            (SELECT pt.version FROM public.published_topics pt WHERE pt.id = v_topic_id),
            0
          ) + 1,
          auth.uid(),
          rev.author_id,
          rev.id,
          now()
        )
        ON CONFLICT (id) DO UPDATE SET
          module_id = EXCLUDED.module_id,
          parent_id = EXCLUDED.parent_id,
          slug = EXCLUDED.slug,
          title = EXCLUDED.title,
          title_en = EXCLUDED.title_en,
          description = EXCLUDED.description,
          description_en = EXCLUDED.description_en,
          content = EXCLUDED.content,
          content_en = EXCLUDED.content_en,
          media = EXCLUDED.media,
          clinical_pearls = EXCLUDED.clinical_pearls,
          clinical_pearls_en = EXCLUDED.clinical_pearls_en,
          key_points = EXCLUDED.key_points,
          key_points_en = EXCLUDED.key_points_en,
          tags = EXCLUDED.tags,
          key_terms = EXCLUDED.key_terms,
          version = public.published_topics.version + 1,
          last_edited_by = EXCLUDED.last_edited_by,
          source_revision_id = EXCLUDED.source_revision_id,
          published_at = now();
      END IF;
    END IF;
  END IF;

  UPDATE public.content_revisions
  SET
    status = new_status,
    reviewer_id = auth.uid(),
    review_notes = notes,
    reviewed_at = now()
  WHERE id = revision_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'review_revision',
    'content_revision',
    revision_id::text,
    jsonb_build_object('status', new_status, 'notes', notes)
  );
END;
$$;

-- ─── 5. Restrict direct inserts; grant RPCs ───────────────────────────────────

DROP POLICY IF EXISTS "quiz_attempts_insert_own" ON public.quiz_attempts;

REVOKE ALL ON FUNCTION public.submit_quiz_attempt(text, jsonb, int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_quiz_attempts(int) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(text, jsonb, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_quiz_attempts(int) TO authenticated;

REVOKE ALL ON FUNCTION public._quiz_correct_option_ids(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._quiz_is_answer_correct(text, jsonb, text[]) FROM PUBLIC, anon, authenticated;
