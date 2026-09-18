-- Cierre de exámenes asignados: el alumno no puede escribir grade/status=approved
-- ni reviewed_by (UUID). La entrega se asienta con un RPC SECURITY DEFINER.

CREATE OR REPLACE FUNCTION public.protect_assignment_student_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_setting('neurosafe.allow_assignment_grade', true) = 'true' THEN
    RETURN NEW;
  END IF;

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

CREATE OR REPLACE FUNCTION public.complete_my_assigned_exam(
  p_assignment_id uuid,
  p_exam_session_id uuid DEFAULT NULL,
  p_score numeric DEFAULT NULL,
  p_duration_seconds integer DEFAULT NULL
)
RETURNS public.student_assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.student_assignments;
  v_score numeric;
  v_min numeric;
  v_status text;
  v_prev_attempts integer;
  v_max integer;
  v_retake text;
  v_minutes integer;
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

  IF v_row.type <> 'exam' THEN
    RAISE EXCEPTION 'La asignación no es un examen';
  END IF;

  IF p_exam_session_id IS NOT NULL
     AND COALESCE(v_row.target_exam_config->>'lastExamSessionId', '') = p_exam_session_id::text THEN
    RETURN v_row;
  END IF;

  v_score := p_score;
  IF p_exam_session_id IS NOT NULL THEN
    SELECT es.score_percentage
    INTO v_score
    FROM public.exam_sessions es
    WHERE es.id = p_exam_session_id
      AND es.user_id = v_uid
      AND es.status = 'COMPLETED';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Sesión de examen no válida';
    END IF;
  END IF;

  IF v_score IS NULL THEN
    RAISE EXCEPTION 'No se pudo determinar la calificación';
  END IF;

  v_prev_attempts := COALESCE((v_row.target_exam_config->>'attemptsCount')::int, 0);
  v_max := COALESCE((v_row.target_exam_config->>'maxAttempts')::int, 1);
  v_retake := COALESCE(v_row.target_exam_config->>'retakeStatus', 'none');

  IF v_row.status IN ('submitted', 'approved', 'overdue') THEN
    IF p_exam_session_id IS NULL THEN
      RETURN v_row;
    END IF;

    IF v_retake IS DISTINCT FROM 'approved'
       AND v_max > 0
       AND v_prev_attempts >= v_max THEN
      RAISE EXCEPTION 'No quedan intentos disponibles';
    END IF;
  END IF;

  v_min := COALESCE(v_row.min_score, 70);
  v_status := CASE WHEN v_score >= v_min THEN 'approved' ELSE 'submitted' END;
  v_minutes := CASE
    WHEN p_duration_seconds IS NOT NULL THEN ROUND(p_duration_seconds / 60.0)::int
    ELSE NULL
  END;
  v_feedback := format(
    'Evaluación completada. Calificación: %s/100 pts.%s',
    ROUND(v_score, 0)::text,
    CASE WHEN v_minutes IS NOT NULL THEN format(' Tiempo: %s min.', v_minutes) ELSE '' END
  );

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
    submission_url = CASE
      WHEN p_exam_session_id IS NOT NULL THEN format('exam_session:%s', p_exam_session_id)
      ELSE submission_url
    END,
    target_exam_config = COALESCE(target_exam_config, '{}'::jsonb)
      || jsonb_build_object(
        'attemptsCount', v_prev_attempts + 1,
        'retakeStatus', 'none'
      )
      || CASE
           WHEN p_exam_session_id IS NOT NULL
           THEN jsonb_build_object('lastExamSessionId', p_exam_session_id::text)
           ELSE '{}'::jsonb
         END,
    updated_at = now()
  WHERE id = p_assignment_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

COMMENT ON FUNCTION public.complete_my_assigned_exam(uuid, uuid, numeric, integer) IS
  'Asienta un examen asignado con la calificación de la sesión. El alumno no escribe grade/reviewed_by directo.';

GRANT EXECUTE ON FUNCTION public.complete_my_assigned_exam(uuid, uuid, numeric, integer) TO authenticated;
REVOKE ALL ON FUNCTION public.complete_my_assigned_exam(uuid, uuid, numeric, integer) FROM PUBLIC, anon;
