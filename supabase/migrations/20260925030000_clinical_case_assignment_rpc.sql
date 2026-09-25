-- Cierre de casos clínicos asignados: el alumno no escribe grade/status=approved.
-- El servidor fija el snapshot una sola vez y recalcula la nota (100 / 25 / 0).

CREATE OR REPLACE FUNCTION public.start_my_clinical_case(
  p_assignment_id uuid,
  p_snapshot jsonb
)
RETURNS public.student_assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.student_assignments;
  v_cfg jsonb;
  v_mode text;
  v_minutes integer;
  v_now timestamptz := now();
  v_started text;
  v_expires text;
  v_retake text;
  v_snapshot jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  IF p_snapshot IS NULL OR jsonb_typeof(p_snapshot) <> 'object' THEN
    RAISE EXCEPTION 'El caso clínico no es válido';
  END IF;

  SELECT *
  INTO v_row
  FROM public.student_assignments
  WHERE id = p_assignment_id
    AND student_id = v_uid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Asignación no encontrada';
  END IF;

  IF v_row.type <> 'clinical_case' THEN
    RAISE EXCEPTION 'La asignación no es un caso clínico';
  END IF;

  v_cfg := COALESCE(v_row.target_exam_config, '{}'::jsonb);
  v_retake := COALESCE(v_cfg->>'retakeStatus', 'none');

  IF v_cfg ? 'clinicalSnapshot'
     AND v_retake IS DISTINCT FROM 'approved' THEN
    RETURN v_row;
  END IF;

  IF v_row.status IS DISTINCT FROM 'pending'
     AND v_retake IS DISTINCT FROM 'approved' THEN
    RETURN v_row;
  END IF;

  v_mode := COALESCE(v_cfg->>'clinicalMode', v_cfg->>'mode', p_snapshot->>'clinicalMode', 'exam');
  v_minutes := COALESCE(
    NULLIF(v_cfg->>'timeLimitMinutes', '')::int,
    NULLIF(p_snapshot->>'timeLimitMinutes', '')::int
  );
  v_started := COALESCE(NULLIF(p_snapshot->>'startedAt', ''), v_now::text);
  v_expires := NULLIF(p_snapshot->>'expiresAt', '');

  IF v_mode = 'exam' AND COALESCE(v_minutes, 0) > 0 AND v_expires IS NULL THEN
    v_expires := (v_started::timestamptz + make_interval(mins => v_minutes))::text;
  END IF;

  v_snapshot := p_snapshot
    || jsonb_build_object(
      'startedAt', v_started,
      'clinicalMode', v_mode
    );
  IF v_expires IS NOT NULL THEN
    v_snapshot := v_snapshot || jsonb_build_object('expiresAt', v_expires);
  END IF;

  PERFORM set_config('neurosafe.allow_assignment_grade', 'true', true);

  UPDATE public.student_assignments
  SET
    target_exam_config = v_cfg
      || jsonb_build_object(
        'clinicalSnapshot', v_snapshot,
        'startedAt', v_started,
        'clinicalMode', v_mode
      )
      || CASE
           WHEN v_expires IS NOT NULL THEN jsonb_build_object('expiresAt', v_expires)
           ELSE '{}'::jsonb
         END
      || CASE
           WHEN v_minutes IS NOT NULL THEN jsonb_build_object('timeLimitMinutes', v_minutes)
           ELSE '{}'::jsonb
         END,
    updated_at = v_now
  WHERE id = p_assignment_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

COMMENT ON FUNCTION public.start_my_clinical_case(uuid, jsonb) IS
  'Fija el caso generado, el inicio y el vencimiento. Si ya hay snapshot, lo devuelve sin pisarlo.';

CREATE OR REPLACE FUNCTION public.complete_my_clinical_case(
  p_assignment_id uuid,
  p_selected_pattern_id text DEFAULT NULL,
  p_hints_used integer DEFAULT 0
)
RETURNS public.student_assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.student_assignments;
  v_cfg jsonb;
  v_snap jsonb;
  v_mode text;
  v_correct_id text;
  v_correct_cat text;
  v_correct_name text;
  v_selected text;
  v_sel_cat text;
  v_sel_name text;
  v_score numeric;
  v_min numeric;
  v_status text;
  v_prev_attempts integer;
  v_max integer;
  v_retake text;
  v_hint_count integer;
  v_hints integer;
  v_seconds integer;
  v_started timestamptz;
  v_blank boolean;
  v_is_correct boolean;
  v_feedback text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  SELECT *
  INTO v_row
  FROM public.student_assignments
  WHERE id = p_assignment_id
    AND student_id = v_uid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Asignación no encontrada';
  END IF;

  IF v_row.type <> 'clinical_case' THEN
    RAISE EXCEPTION 'La asignación no es un caso clínico';
  END IF;

  v_cfg := COALESCE(v_row.target_exam_config, '{}'::jsonb);
  v_snap := v_cfg->'clinicalSnapshot';
  v_prev_attempts := COALESCE((v_cfg->>'attemptsCount')::int, 0);
  v_max := COALESCE((v_cfg->>'maxAttempts')::int, 1);
  v_retake := COALESCE(v_cfg->>'retakeStatus', 'none');

  IF v_row.status IN ('submitted', 'approved', 'overdue') THEN
    IF v_retake IS DISTINCT FROM 'approved'
       AND v_max > 0
       AND v_prev_attempts >= v_max THEN
      RETURN v_row;
    END IF;

    IF v_retake IS DISTINCT FROM 'approved'
       AND v_cfg ? 'lastClinicalAttempt' THEN
      RETURN v_row;
    END IF;
  END IF;

  IF v_snap IS NULL OR jsonb_typeof(v_snap) <> 'object' THEN
    RAISE EXCEPTION 'El caso clínico no se ha iniciado';
  END IF;

  v_correct_id := v_snap->'clinicalCase'->'correctDiagnosis'->>'patternId';
  v_correct_cat := v_snap->'clinicalCase'->'correctDiagnosis'->>'category';
  v_correct_name := v_snap->'clinicalCase'->'correctDiagnosis'->>'patternName';

  IF v_correct_id IS NULL OR btrim(v_correct_id) = '' THEN
    RAISE EXCEPTION 'El snapshot del caso no tiene diagnóstico correcto';
  END IF;

  v_selected := NULLIF(btrim(COALESCE(p_selected_pattern_id, '')), '');
  v_blank := v_selected IS NULL
    OR v_selected IN ('__sin_respuesta__', 'Sin respuesta', 'Sin respuesta (tiempo agotado)');

  IF NOT v_blank THEN
    SELECT e->>'category', e->>'patternName'
    INTO v_sel_cat, v_sel_name
    FROM jsonb_array_elements(COALESCE(v_snap->'options', '[]'::jsonb)) e
    WHERE e->>'patternId' = v_selected
    LIMIT 1;
  END IF;

  v_is_correct := (NOT v_blank) AND v_selected = v_correct_id;
  IF v_is_correct THEN
    v_score := 100;
  ELSIF (NOT v_blank) AND v_sel_cat IS NOT NULL AND v_sel_cat = v_correct_cat THEN
    v_score := 25;
  ELSE
    v_score := 0;
  END IF;

  v_mode := COALESCE(v_cfg->>'clinicalMode', v_cfg->>'mode', v_snap->>'clinicalMode', 'exam');
  v_hint_count := COALESCE(jsonb_array_length(v_snap->'hints'), 0);
  v_hints := LEAST(GREATEST(COALESCE(p_hints_used, 0), 0), GREATEST(v_hint_count, 0));
  IF v_mode = 'study' THEN
    v_score := GREATEST(0, v_score - (v_hints * 5));
  ELSE
    v_hints := 0;
  END IF;

  BEGIN
    v_started := COALESCE(v_snap->>'startedAt', v_cfg->>'startedAt')::timestamptz;
  EXCEPTION WHEN others THEN
    v_started := v_row.created_at;
  END;
  v_seconds := GREATEST(0, EXTRACT(EPOCH FROM (now() - COALESCE(v_started, now())))::int);

  v_min := COALESCE(v_row.min_score, 70);
  v_status := CASE WHEN v_score >= v_min THEN 'approved' ELSE 'submitted' END;
  v_feedback := CASE
    WHEN v_is_correct THEN
      format(
        'Diagnóstico acertado: %s. Calificación: %s/100 pts. Tiempo: %ss. Pistas: %s.',
        COALESCE(v_correct_name, v_correct_id),
        ROUND(v_score, 0)::text,
        v_seconds::text,
        v_hints::text
      )
    WHEN v_blank THEN
      format(
        'Sin diagnóstico. El caso correspondía a: %s. Calificación: %s/100 pts.',
        COALESCE(v_correct_name, v_correct_id),
        ROUND(v_score, 0)::text
      )
    ELSE
      format(
        'Diagnóstico seleccionado incorrecto: %s. Caso correspondía a: %s. Calificación: %s/100 pts.',
        COALESCE(v_sel_name, v_selected),
        COALESCE(v_correct_name, v_correct_id),
        ROUND(v_score, 0)::text
      )
  END;

  PERFORM set_config('neurosafe.allow_assignment_grade', 'true', true);

  UPDATE public.student_assignments
  SET
    grade = v_score,
    status = v_status,
    submitted_at = COALESCE(submitted_at, now()),
    reviewed_at = now(),
    reviewed_by = NULL,
    feedback = v_feedback,
    student_notes = COALESCE(student_notes, v_feedback),
    target_exam_config = v_cfg
      || jsonb_build_object(
        'attemptsCount', v_prev_attempts + 1,
        'retakeStatus', 'none',
        'lastClinicalAttempt', jsonb_build_object(
          'selectedPatternId', CASE WHEN v_blank THEN NULL ELSE v_selected END,
          'selectedPatternName', v_sel_name,
          'isCorrect', v_is_correct,
          'score', v_score,
          'hintsUsed', v_hints,
          'timeSpentSeconds', v_seconds,
          'patternName', v_correct_name,
          'correctPatternId', v_correct_id,
          'completedAt', now()
        )
      ),
    updated_at = now()
  WHERE id = p_assignment_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

COMMENT ON FUNCTION public.complete_my_clinical_case(uuid, text, integer) IS
  'Recalcula y asienta la nota del caso clínico. El alumno no escribe grade ni reviewed_by.';

GRANT EXECUTE ON FUNCTION public.start_my_clinical_case(uuid, jsonb) TO authenticated;
REVOKE ALL ON FUNCTION public.start_my_clinical_case(uuid, jsonb) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.complete_my_clinical_case(uuid, text, integer) TO authenticated;
REVOKE ALL ON FUNCTION public.complete_my_clinical_case(uuid, text, integer) FROM PUBLIC, anon;
