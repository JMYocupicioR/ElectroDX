-- Al retirar un compromiso docente, desvincular el taller y limpiar workshop_instructors
-- si el docente ya no conserva otros compromisos activos en esa clase.

CREATE OR REPLACE FUNCTION public.withdraw_topic_commitment(p_commitment_id UUID)
RETURNS public.topic_teaching_commitments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row public.topic_teaching_commitments;
  v_prev_workshop_id UUID;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  IF NOT (public.is_admin() OR public.is_editor()) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  SELECT *
  INTO v_row
  FROM public.topic_teaching_commitments
  WHERE id = p_commitment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El compromiso no existe';
  END IF;

  IF v_row.teacher_id IS DISTINCT FROM v_uid AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo puedes retirar tus propios temas';
  END IF;

  v_prev_workshop_id := v_row.workshop_id;

  UPDATE public.topic_teaching_commitments
  SET status = 'withdrawn',
      workshop_id = NULL
  WHERE id = p_commitment_id
  RETURNING * INTO v_row;

  IF v_prev_workshop_id IS NOT NULL THEN
    DELETE FROM public.workshop_instructors wi
    WHERE wi.workshop_id = v_prev_workshop_id
      AND wi.teacher_id = v_row.teacher_id
      AND NOT EXISTS (
        SELECT 1
        FROM public.topic_teaching_commitments c
        WHERE c.workshop_id = v_prev_workshop_id
          AND c.teacher_id = v_row.teacher_id
          AND c.status <> 'withdrawn'
      );
  END IF;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.withdraw_topic_commitment(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.withdraw_topic_commitment(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
