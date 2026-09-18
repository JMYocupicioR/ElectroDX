-- ============================================================================
-- Migración: Suscripción por curso, lista de espera, admisión por profesor/admin
-- y control administrativo de precios.
-- 2026-09-18
-- ============================================================================

-- 1. Actualizar tabla course_enrollments
-- Modificar check constraint de status para soportar lista de espera ('pending'), admitido ('active'), rechazado ('rejected'), revocado ('revoked')
ALTER TABLE public.course_enrollments
  DROP CONSTRAINT IF EXISTS course_enrollments_status_check;

ALTER TABLE public.course_enrollments
  ADD CONSTRAINT course_enrollments_status_check
  CHECK (status IN ('active', 'pending', 'rejected', 'revoked'));

-- Hacer granted_at nullable para cuando la solicitud está en espera (pending)
ALTER TABLE public.course_enrollments
  ALTER COLUMN granted_at DROP NOT NULL;

-- Nuevas columnas para control de solicitudes y lista de espera
ALTER TABLE public.course_enrollments
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS request_notes TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- Índice para consultar lista de espera ordenada cronológicamente (FIFO)
CREATE INDEX IF NOT EXISTS idx_course_enrollments_waitlist
  ON public.course_enrollments (course_id, status, requested_at ASC);

-- 2. Función RPC para que el estudiante solicite admisión y entre a la lista de espera
CREATE OR REPLACE FUNCTION public.request_course_enrollment(
  p_course_id TEXT,
  p_notes TEXT DEFAULT NULL,
  p_payment_reference TEXT DEFAULT NULL
)
RETURNS public.course_enrollments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_sellable BOOLEAN;
  v_row public.course_enrollments;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión para solicitar un curso.';
  END IF;

  SELECT is_sellable INTO v_sellable
  FROM public.courses
  WHERE id = p_course_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El curso seleccionado no está disponible para inscripción.';
  END IF;

  -- Verificar si ya tiene suscripción activa
  IF EXISTS (
    SELECT 1 FROM public.course_enrollments
    WHERE user_id = v_uid AND course_id = p_course_id AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  ) THEN
    RAISE EXCEPTION 'Ya cuentas con una suscripción activa a este curso.';
  END IF;

  -- Insertar o actualizar a estado 'pending' (lista de espera)
  INSERT INTO public.course_enrollments (
    user_id,
    course_id,
    status,
    requested_at,
    request_notes,
    payment_reference,
    granted_by,
    granted_at,
    reviewed_by,
    reviewed_at,
    review_notes,
    updated_at
  ) VALUES (
    v_uid,
    p_course_id,
    'pending',
    now(),
    p_notes,
    p_payment_reference,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    now()
  )
  ON CONFLICT (user_id, course_id) DO UPDATE SET
    status = 'pending',
    requested_at = now(),
    request_notes = COALESCE(EXCLUDED.request_notes, public.course_enrollments.request_notes),
    payment_reference = COALESCE(EXCLUDED.payment_reference, public.course_enrollments.payment_reference),
    reviewed_by = NULL,
    reviewed_at = NULL,
    review_notes = NULL,
    updated_at = now()
  RETURNING * INTO v_row;

  -- Registrar en log de auditoría
  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    v_uid,
    'request_course_enrollment',
    'course_enrollment',
    v_row.id::text,
    jsonb_build_object(
      'course_id', p_course_id,
      'has_notes', (p_notes IS NOT NULL AND length(trim(p_notes)) > 0),
      'has_payment_ref', (p_payment_reference IS NOT NULL AND length(trim(p_payment_reference)) > 0)
    )
  );

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.request_course_enrollment(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_course_enrollment(text, text, text) TO authenticated;

-- 3. Función RPC para que el estudiante retire su solicitud de la lista de espera
CREATE OR REPLACE FUNCTION public.cancel_course_enrollment_request(p_course_id TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión.';
  END IF;

  DELETE FROM public.course_enrollments
  WHERE user_id = v_uid
    AND course_id = p_course_id
    AND status = 'pending';

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_course_enrollment_request(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_course_enrollment_request(text) TO authenticated;

-- 4. Función RPC exclusiva para que el Administrador admita a un cursista desde la lista de espera
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
  v_sellable BOOLEAN;
  v_row public.course_enrollments;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores o el profesor titular pueden admitir cursistas.';
  END IF;

  SELECT is_sellable INTO v_sellable
  FROM public.courses
  WHERE id = p_course_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Curso no encontrado.';
  END IF;

  -- Activar la suscripción del cursista
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

  -- Si es curso vendible, desbloquear automáticamente material compartido 'referencia'
  IF v_sellable IS TRUE THEN
    INSERT INTO public.course_enrollments (
      user_id, course_id, status, granted_by, granted_at, notes, updated_at
    ) VALUES (
      p_user_id, 'referencia', 'active', v_admin_id, now(),
      'Incluida con curso vendible', now()
    )
    ON CONFLICT (user_id, course_id) DO UPDATE SET
      status = 'active',
      granted_by = v_admin_id,
      granted_at = now(),
      updated_at = now();
  END IF;

  -- Asegurar que el usuario tenga el rol de 'student' en user_roles si no lo tenía
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'student')
  ON CONFLICT DO NOTHING;

  -- Auditoría
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

REVOKE ALL ON FUNCTION public.admin_admit_student_to_course(uuid, text, text, text, text, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_admit_student_to_course(uuid, text, text, text, text, timestamptz) TO authenticated;

-- 5. Función RPC para que el Administrador rechace una solicitud
CREATE OR REPLACE FUNCTION public.admin_reject_course_request(
  p_user_id UUID,
  p_course_id TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores pueden rechazar solicitudes.';
  END IF;

  UPDATE public.course_enrollments
  SET status = 'rejected',
      reviewed_by = v_admin_id,
      reviewed_at = now(),
      review_notes = p_reason,
      updated_at = now()
  WHERE user_id = p_user_id AND course_id = p_course_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    v_admin_id,
    'admin_reject_course_request',
    'user',
    p_user_id::text,
    jsonb_build_object('course_id', p_course_id, 'reason', p_reason)
  );

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_reject_course_request(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_reject_course_request(uuid, text, text) TO authenticated;

-- 6. Función RPC para consultar la lista de espera con datos del médico y posición en la fila
CREATE OR REPLACE FUNCTION public.admin_get_course_waitlist(
  p_course_id TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'pending'
)
RETURNS TABLE (
  enrollment_id UUID,
  user_id UUID,
  course_id TEXT,
  course_title TEXT,
  status TEXT,
  requested_at TIMESTAMPTZ,
  request_notes TEXT,
  payment_reference TEXT,
  payment_method TEXT,
  granted_at TIMESTAMPTZ,
  granted_by UUID,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  review_notes TEXT,
  display_name TEXT,
  email TEXT,
  phone TEXT,
  specialty TEXT,
  residency_year TEXT,
  institution TEXT,
  cedula_profesional TEXT,
  cedula_verified BOOLEAN,
  avatar_url TEXT,
  waitlist_position BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ce.id AS enrollment_id,
    ce.user_id,
    ce.course_id,
    c.title AS course_title,
    ce.status,
    ce.requested_at,
    ce.request_notes,
    ce.payment_reference,
    ce.payment_method,
    ce.granted_at,
    ce.granted_by,
    ce.reviewed_at,
    ce.reviewed_by,
    ce.review_notes,
    COALESCE(p.display_name, 'Sin nombre') AS display_name,
    COALESCE(u.email, 'Sin email') AS email,
    p.phone,
    p.specialty,
    p.residency_year,
    p.institution,
    p.cedula_profesional,
    COALESCE(p.cedula_verified, false) AS cedula_verified,
    p.avatar_url,
    ROW_NUMBER() OVER (
      PARTITION BY ce.course_id, ce.status
      ORDER BY ce.requested_at ASC, ce.created_at ASC
    ) AS waitlist_position
  FROM public.course_enrollments ce
  JOIN public.courses c ON c.id = ce.course_id
  LEFT JOIN public.profiles p ON p.id = ce.user_id
  LEFT JOIN auth.users u ON u.id = ce.user_id
  WHERE (public.is_admin() OR public.is_editor())
    AND (p_course_id IS NULL OR ce.course_id = p_course_id)
    AND (p_status IS NULL OR p_status = 'all' OR ce.status = p_status)
  ORDER BY ce.requested_at ASC;
$$;

REVOKE ALL ON FUNCTION public.admin_get_course_waitlist(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_course_waitlist(text, text) TO authenticated;

-- 7. Función RPC para actualizar el precio mostrado de un curso y registrar auditoría
CREATE OR REPLACE FUNCTION public.admin_update_course_price(
  p_course_id TEXT,
  p_price_display TEXT
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_admin() OR public.is_editor()) THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores pueden modificar precios.';
  END IF;

  UPDATE public.courses
  SET price_display = NULLIF(trim(p_price_display), ''),
      updated_at = now()
  WHERE id = p_course_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'update_course_price',
    'course',
    p_course_id,
    jsonb_build_object('new_price', p_price_display)
  );

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_course_price(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_course_price(text, text) TO authenticated;

-- 8. Actualizar admin_get_stats para incluir contador de solicitudes pendientes en lista de espera
CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_profiles', (SELECT COUNT(*) FROM public.profiles),
    'verified_contributors', (
      SELECT COUNT(DISTINCT p.id)
      FROM public.profiles p
      JOIN public.user_roles ur ON ur.user_id = p.id
      WHERE p.verified_at IS NOT NULL AND ur.role = 'contributor'
    ),
    'pending_verifications', (
      SELECT COUNT(DISTINCT p.id)
      FROM public.profiles p
      JOIN public.user_roles ur ON ur.user_id = p.id
      WHERE p.verified_at IS NULL AND ur.role = 'contributor'
    ),
    'total_revisions', (SELECT COUNT(*) FROM public.content_revisions),
    'pending_revisions', (SELECT COUNT(*) FROM public.content_revisions WHERE status = 'pending_review'),
    'published_topics', (SELECT COUNT(*) FROM public.published_topics),
    'published_modules', (SELECT COUNT(*) FROM public.published_modules),
    'published_quizzes', (SELECT COUNT(*) FROM public.published_quizzes),
    'total_quiz_attempts', (SELECT COUNT(*) FROM public.quiz_attempts),
    'pending_enrollments', (SELECT COUNT(*) FROM public.profiles WHERE enrollment_status = 'pending'),
    'pending_course_enrollments', (SELECT COUNT(*) FROM public.course_enrollments WHERE status = 'pending'),
    'approved_physicians', (SELECT COUNT(*) FROM public.profiles WHERE enrollment_status = 'approved'),
    'total_students', (SELECT COUNT(DISTINCT user_id) FROM public.user_roles WHERE role = 'student')
  )
  WHERE (public.is_admin() OR public.is_editor());
$$;

-- 9. Actualizar RLS de course_enrollments para asegurar lectura propia de solicitudes
DROP POLICY IF EXISTS course_enrollments_self_read ON public.course_enrollments;
CREATE POLICY course_enrollments_self_read ON public.course_enrollments
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR public.is_editor()
  );
