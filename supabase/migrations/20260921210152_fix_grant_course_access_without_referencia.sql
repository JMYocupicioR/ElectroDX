-- grant_course_access / admin_admit_student_to_course still inserted a row for
-- course_id = 'referencia'. That course was removed in
-- 20260918170000_admin_delete_course, so the FK on course_enrollments.course_id
-- failed and PostgREST returned HTTP 409. Access to shared reference modules is
-- already resolved by has_course_access() from any active sellable enrollment.

CREATE OR REPLACE FUNCTION public.grant_course_access(
  target_user_id UUID,
  p_course_id TEXT,
  p_method TEXT DEFAULT 'manual',
  p_reference TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden otorgar acceso a un curso';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.courses WHERE id = p_course_id) THEN
    RAISE EXCEPTION 'Curso no encontrado';
  END IF;

  INSERT INTO public.course_enrollments (
    user_id, course_id, status, granted_by, granted_at, expires_at,
    payment_method, payment_reference, notes, updated_at
  ) VALUES (
    target_user_id, p_course_id, 'active', auth.uid(), now(), p_expires_at,
    p_method, p_reference, p_notes, now()
  )
  ON CONFLICT (user_id, course_id) DO UPDATE SET
    status = 'active',
    granted_by = auth.uid(),
    granted_at = now(),
    expires_at = p_expires_at,
    payment_method = EXCLUDED.payment_method,
    payment_reference = EXCLUDED.payment_reference,
    notes = EXCLUDED.notes,
    updated_at = now();

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'grant_course',
    'user',
    target_user_id::text,
    jsonb_build_object('course_id', p_course_id, 'method', p_method, 'reference', p_reference)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_admit_student_to_course(
  p_user_id UUID,
  p_course_id TEXT,
  p_notes TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT 'manual',
  p_payment_reference TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS public.course_enrollments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
  v_row public.course_enrollments;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores o el profesor titular pueden admitir cursistas.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.courses WHERE id = p_course_id) THEN
    RAISE EXCEPTION 'Curso no encontrado.';
  END IF;

  INSERT INTO public.course_enrollments (
    user_id,
    course_id,
    status,
    granted_by,
    granted_at,
    reviewed_by,
    reviewed_at,
    expires_at,
    payment_method,
    payment_reference,
    notes,
    updated_at
  ) VALUES (
    p_user_id,
    p_course_id,
    'active',
    v_admin_id,
    now(),
    v_admin_id,
    now(),
    p_expires_at,
    p_payment_method,
    p_payment_reference,
    p_notes,
    now()
  )
  ON CONFLICT (user_id, course_id) DO UPDATE SET
    status = 'active',
    granted_by = v_admin_id,
    granted_at = now(),
    reviewed_by = v_admin_id,
    reviewed_at = now(),
    expires_at = EXCLUDED.expires_at,
    payment_method = COALESCE(EXCLUDED.payment_method, public.course_enrollments.payment_method),
    payment_reference = COALESCE(EXCLUDED.payment_reference, public.course_enrollments.payment_reference),
    notes = COALESCE(EXCLUDED.notes, public.course_enrollments.notes),
    updated_at = now()
  RETURNING * INTO v_row;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'student')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    v_admin_id,
    'admin_admit_course_student',
    'course_enrollment',
    v_row.id::text,
    jsonb_build_object(
      'target_user_id', p_user_id::text,
      'course_id', p_course_id,
      'payment_method', p_payment_method,
      'payment_reference', p_payment_reference
    )
  );

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_course_access(uuid, text, text, text, text, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_course_access(uuid, text, text, text, text, timestamptz) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_admit_student_to_course(uuid, text, text, text, text, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_admit_student_to_course(uuid, text, text, text, text, timestamptz) TO authenticated;
