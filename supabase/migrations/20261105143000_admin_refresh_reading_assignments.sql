-- Recalcula lecturas de tareas desde student_completed_topics.
-- 1) Trigger: cualquier alta/baja de tema leído actualiza las tareas del alumno.
-- 2) RPC admin: la bandeja/cohorte puede forzar el cierre de lecturas desfasadas.

CREATE OR REPLACE FUNCTION public.trg_completed_topics_refresh_reading()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := COALESCE(NEW.user_id, OLD.user_id);
  IF v_uid IS NOT NULL THEN
    PERFORM public.refresh_reading_assignment_progress(v_uid);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_completed_topics_refresh_reading ON public.student_completed_topics;
CREATE TRIGGER trg_completed_topics_refresh_reading
  AFTER INSERT OR UPDATE OR DELETE ON public.student_completed_topics
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_completed_topics_refresh_reading();

CREATE OR REPLACE FUNCTION public.admin_refresh_reading_assignments(
  p_student_ids uuid[] DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_student uuid;
  v_count integer := 0;
BEGIN
  IF v_uid IS NULL OR NOT public.is_admin(v_uid) THEN
    RAISE EXCEPTION 'Solo un administrador puede recalcular lecturas de la cohorte.';
  END IF;

  IF p_student_ids IS NULL OR cardinality(p_student_ids) = 0 THEN
    FOR v_student IN
      SELECT DISTINCT student_id
      FROM public.student_assignments
      WHERE cardinality(reading_topic_ids) > 0
    LOOP
      PERFORM public.refresh_reading_assignment_progress(v_student);
      v_count := v_count + 1;
    END LOOP;
  ELSE
    FOREACH v_student IN ARRAY p_student_ids
    LOOP
      IF v_student IS NULL THEN
        CONTINUE;
      END IF;
      PERFORM public.refresh_reading_assignment_progress(v_student);
      v_count := v_count + 1;
    END LOOP;
  END IF;

  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.admin_refresh_reading_assignments(uuid[]) IS
  'Recalcula reading_done_ids / cierre de tareas de lectura para alumnos (o toda la cohorte). Solo admin.';

REVOKE ALL ON FUNCTION public.admin_refresh_reading_assignments(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_refresh_reading_assignments(uuid[]) TO authenticated;
