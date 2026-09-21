-- Dictamen Capa A único: la constancia exige kárdex oficial ≥ mínimo + cédula.
-- Quita los umbrales paralelos (cobertura de 8 quizzes / promedio suelto).

CREATE OR REPLACE FUNCTION public.compute_kardex_scores(
  p_user_id uuid,
  p_course_id text DEFAULT NULL
)
RETURNS TABLE (
  exam_raw numeric,
  exam_has boolean,
  assign_raw numeric,
  assign_has boolean,
  attend_raw numeric,
  attend_has boolean,
  curr_raw numeric,
  curr_has boolean,
  official_grade numeric,
  is_official boolean,
  is_passing boolean,
  min_passing numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_min numeric := 80;
  v_w_exam numeric := 30;
  v_w_asg numeric := 30;
  v_w_att numeric := 20;
  v_w_cur numeric := 20;
  v_exam_raw numeric;
  v_exam_has boolean;
  v_asg_raw numeric;
  v_asg_has boolean;
  v_att_raw numeric;
  v_att_has boolean;
  v_cur_raw numeric;
  v_cur_has boolean;
  v_eligible int := 0;
  v_att_points numeric := 0;
  v_att_records int := 0;
  v_effective int := 0;
  v_topics_total int := 0;
  v_topics_done int := 0;
  v_official numeric;
  v_is_official boolean;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;
  IF p_user_id IS DISTINCT FROM v_uid
     AND NOT public.is_admin()
     AND NOT public.is_editor() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  SELECT
    COALESCE(c.min_passing_grade, 80),
    COALESCE((elem.val->>'weight')::numeric, 30),
    COALESCE((asg.val->>'weight')::numeric, 30),
    COALESCE((att.val->>'weight')::numeric, 20),
    COALESCE((cur.val->>'weight')::numeric, 20)
  INTO v_min, v_w_exam, v_w_asg, v_w_att, v_w_cur
  FROM public.academic_rubric_configs c
  LEFT JOIN LATERAL (
    SELECT e AS val FROM jsonb_array_elements(c.rubrics) e WHERE e->>'id' = 'exams' LIMIT 1
  ) elem ON true
  LEFT JOIN LATERAL (
    SELECT e AS val FROM jsonb_array_elements(c.rubrics) e WHERE e->>'id' = 'assignments' LIMIT 1
  ) asg ON true
  LEFT JOIN LATERAL (
    SELECT e AS val FROM jsonb_array_elements(c.rubrics) e WHERE e->>'id' = 'attendance' LIMIT 1
  ) att ON true
  LEFT JOIN LATERAL (
    SELECT e AS val FROM jsonb_array_elements(c.rubrics) e WHERE e->>'id' = 'curriculum' LIMIT 1
  ) cur ON true
  WHERE c.id = 'default_rubric_2026';

  IF p_course_id IS NOT NULL THEN
    SELECT round(avg(best))::numeric, count(*) > 0
    INTO v_exam_raw, v_exam_has
    FROM (
      SELECT qa.topic_id, max(qa.score)::numeric AS best
      FROM public.quiz_attempts qa
      JOIN public.course_modules cm ON cm.module_id = qa.module_id
      WHERE qa.user_id = p_user_id
        AND cm.course_id = p_course_id
        AND cm.is_visible IS DISTINCT FROM false
      GROUP BY qa.topic_id
    ) s;

    SELECT round(avg(sa.grade))::numeric, count(*) > 0
    INTO v_asg_raw, v_asg_has
    FROM public.student_assignments sa
    WHERE sa.student_id = p_user_id
      AND sa.status = 'approved'
      AND sa.grade IS NOT NULL
      AND (
        sa.target_module_id IS NULL
        OR sa.target_module_id IN (
          SELECT module_id FROM public.course_modules
          WHERE course_id = p_course_id AND is_visible IS DISTINCT FROM false
        )
      );

    SELECT count(*)::int INTO v_eligible
    FROM public.live_workshops w
    WHERE COALESCE(w.counts_for_kardex, true)
      AND (w.status = 'completed' OR w.attendance_closed OR w.scheduled_at <= now())
      AND (
        w.module_id IS NULL
        OR w.module_id IN (
          SELECT module_id FROM public.course_modules
          WHERE course_id = p_course_id AND is_visible IS DISTINCT FROM false
        )
      );

    SELECT count(*)::int INTO v_topics_total
    FROM public.published_topics pt
    JOIN public.course_modules cm ON cm.module_id = pt.module_id
    WHERE cm.course_id = p_course_id AND cm.is_visible IS DISTINCT FROM false;

    SELECT count(*)::int INTO v_topics_done
    FROM public.student_completed_topics sct
    JOIN public.course_modules cm ON cm.module_id = sct.module_id
    WHERE sct.user_id = p_user_id
      AND cm.course_id = p_course_id
      AND cm.is_visible IS DISTINCT FROM false;
  ELSE
    SELECT round(avg(score))::numeric, count(*) > 0
    INTO v_exam_raw, v_exam_has
    FROM public.quiz_attempts
    WHERE user_id = p_user_id;

    SELECT round(avg(grade))::numeric, count(*) > 0
    INTO v_asg_raw, v_asg_has
    FROM public.student_assignments
    WHERE student_id = p_user_id
      AND status = 'approved'
      AND grade IS NOT NULL;

    SELECT count(*)::int INTO v_eligible
    FROM public.live_workshops w
    WHERE COALESCE(w.counts_for_kardex, true)
      AND (w.status = 'completed' OR w.attendance_closed OR w.scheduled_at <= now());

    SELECT count(*)::int INTO v_topics_total FROM public.published_topics;
    SELECT count(*)::int INTO v_topics_done
    FROM public.student_completed_topics
    WHERE user_id = p_user_id;
  END IF;

  SELECT
    count(*),
    COALESCE(sum(
      CASE status
        WHEN 'present' THEN 1.0
        WHEN 'late' THEN 0.8
        WHEN 'excused' THEN 1.0
        ELSE 0
      END
    ), 0)
  INTO v_att_records, v_att_points
  FROM public.class_attendances
  WHERE student_id = p_user_id;

  IF v_att_records = 0 AND v_eligible = 0 THEN
    v_att_has := false;
    v_att_raw := NULL;
  ELSE
    v_att_has := true;
    v_effective := GREATEST(v_att_records, v_eligible);
    v_att_raw := CASE
      WHEN v_effective = 0 THEN 0
      ELSE least(100, round((v_att_points / v_effective) * 100))
    END;
  END IF;

  IF v_topics_total > 0 THEN
    v_cur_has := true;
    v_cur_raw := least(100, round((v_topics_done::numeric / v_topics_total) * 100));
  ELSE
    -- Sin catálogo publicado el SQL no puede clonar el temario estático: no hay dictamen oficial.
    v_cur_has := false;
    v_cur_raw := NULL;
  END IF;

  v_is_official := COALESCE(v_exam_has, false)
    AND COALESCE(v_asg_has, false)
    AND COALESCE(v_att_has, false)
    AND COALESCE(v_cur_has, false);

  IF v_is_official THEN
    v_official := least(100, round((
      COALESCE(v_exam_raw, 0) * v_w_exam +
      COALESCE(v_asg_raw, 0) * v_w_asg +
      COALESCE(v_att_raw, 0) * v_w_att +
      COALESCE(v_cur_raw, 0) * v_w_cur
    ) / 100.0, 1));
  ELSE
    v_official := NULL;
  END IF;

  exam_raw := v_exam_raw;
  exam_has := COALESCE(v_exam_has, false);
  assign_raw := v_asg_raw;
  assign_has := COALESCE(v_asg_has, false);
  attend_raw := v_att_raw;
  attend_has := COALESCE(v_att_has, false);
  curr_raw := v_cur_raw;
  curr_has := COALESCE(v_cur_has, false);
  official_grade := v_official;
  is_official := v_is_official;
  is_passing := v_is_official AND v_official IS NOT NULL AND v_official >= v_min;
  min_passing := v_min;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.compute_kardex_scores(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.compute_kardex_scores(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.issue_my_certificate(p_course_id TEXT)
RETURNS public.academic_certificates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_profile public.profiles;
  v_row public.academic_certificates;
  v_folio text;
  v_prefix text;
  v_kardex record;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid;
  IF v_profile.cedula_verified IS NOT TRUE THEN
    RAISE EXCEPTION 'Requiere cédula profesional verificada';
  END IF;

  IF p_course_id IS NOT NULL AND btrim(p_course_id) = '' THEN
    p_course_id := NULL;
  END IF;

  IF p_course_id IS NOT NULL THEN
    IF NOT public.has_course_access(p_course_id, v_uid) THEN
      RAISE EXCEPTION 'No tiene acceso al curso solicitado';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.id = p_course_id AND c.is_sellable = true) THEN
      RAISE EXCEPTION 'Solo se emite constancia para cursos formativos';
    END IF;
  END IF;

  SELECT * INTO v_kardex FROM public.compute_kardex_scores(v_uid, p_course_id);
  IF v_kardex IS NULL OR v_kardex.is_official IS NOT TRUE OR v_kardex.is_passing IS NOT TRUE THEN
    RAISE EXCEPTION 'Dictamen Capa A insuficiente';
  END IF;

  SELECT folio INTO v_folio
  FROM public.academic_certificates
  WHERE user_id = v_uid
    AND revoked_at IS NULL
    AND COALESCE(course_id, '') = COALESCE(p_course_id, '')
  LIMIT 1;

  IF v_folio IS NOT NULL THEN
    SELECT * INTO v_row FROM public.academic_certificates WHERE folio = v_folio;
    RETURN v_row;
  END IF;

  v_prefix := CASE p_course_id
    WHEN 'principiante' THEN 'EDX-P'
    WHEN 'intermedio' THEN 'EDX-I'
    WHEN 'avanzado' THEN 'EDX-A'
    ELSE 'EDX'
  END;

  v_folio := v_prefix || '-' || to_char(now(), 'YYYY') || '-' || upper(encode(gen_random_bytes(6), 'hex'));

  INSERT INTO public.academic_certificates (
    user_id, folio, overall_progress_pct, average_score, course_id
  )
  VALUES (
    v_uid,
    v_folio,
    COALESCE(v_kardex.curr_raw, 0)::int,
    round(v_kardex.official_grade)::int,
    p_course_id
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.issue_my_certificate()
RETURNS public.academic_certificates
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.issue_my_certificate(NULL::text);
$$;

REVOKE ALL ON FUNCTION public.issue_my_certificate(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_my_certificate(text) TO authenticated;
REVOKE ALL ON FUNCTION public.issue_my_certificate() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_my_certificate() TO authenticated;
