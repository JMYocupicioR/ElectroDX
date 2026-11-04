-- ============================================================================
-- Migración: Sistema Integral de Becas y Cupones de Ingreso (50% al 100%)
-- 2026-11-04
-- ============================================================================

-- 1. Tabla de Cupones y Códigos de Beca
CREATE TABLE IF NOT EXISTS public.scholarship_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 1 AND discount_percent <= 100),
  description TEXT,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_admit BOOLEAN NOT NULL DEFAULT false,
  requires_cedula_verified BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice único insensible a mayúsculas/minúsculas para el código
CREATE UNIQUE INDEX IF NOT EXISTS idx_scholarship_coupons_code_unique
  ON public.scholarship_coupons (UPPER(TRIM(code)));

CREATE INDEX IF NOT EXISTS idx_scholarship_coupons_active_window
  ON public.scholarship_coupons (is_active, starts_at, expires_at);

-- 2. Tabla de Redenciones / Usos de Cupones por Estudiante
CREATE TABLE IF NOT EXISTS public.scholarship_coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.scholarship_coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES public.course_enrollments(id) ON DELETE SET NULL,
  discount_percent INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT scholarship_coupon_redemptions_user_course_unique UNIQUE (coupon_id, user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user
  ON public.scholarship_coupon_redemptions (user_id);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon
  ON public.scholarship_coupon_redemptions (coupon_id);

-- 3. Extender tabla course_enrollments con campos de beca
ALTER TABLE public.course_enrollments
  ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.scholarship_coupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_percent INTEGER;

-- 4. Habilitar RLS en ambas tablas
ALTER TABLE public.scholarship_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Políticas para scholarship_coupons
DROP POLICY IF EXISTS "Admins can do all on scholarship_coupons" ON public.scholarship_coupons;
CREATE POLICY "Admins can do all on scholarship_coupons"
  ON public.scholarship_coupons
  FOR ALL
  TO authenticated
  USING (public.is_admin() OR public.is_editor())
  WITH CHECK (public.is_admin() OR public.is_editor());

DROP POLICY IF EXISTS "Authenticated users can read active scholarship_coupons" ON public.scholarship_coupons;
CREATE POLICY "Authenticated users can read active scholarship_coupons"
  ON public.scholarship_coupons
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Políticas para scholarship_coupon_redemptions
DROP POLICY IF EXISTS "Admins can read all redemptions" ON public.scholarship_coupon_redemptions;
CREATE POLICY "Admins can read all redemptions"
  ON public.scholarship_coupon_redemptions
  FOR SELECT
  TO authenticated
  USING (public.is_admin() OR public.is_editor());

DROP POLICY IF EXISTS "Users can read own redemptions" ON public.scholarship_coupon_redemptions;
CREATE POLICY "Users can read own redemptions"
  ON public.scholarship_coupon_redemptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 5. Función RPC: Validar Cupón de Beca (segura, ejecutable por estudiantes antes de enviar)
CREATE OR REPLACE FUNCTION public.validate_scholarship_coupon(
  p_code TEXT,
  p_course_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_coupon public.scholarship_coupons%ROWTYPE;
  v_clean_code TEXT := UPPER(TRIM(COALESCE(p_code, '')));
  v_is_cedula_verified BOOLEAN := false;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Debes iniciar sesión para validar un código de beca.');
  END IF;

  IF v_clean_code = '' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Ingresa un código de cupón.');
  END IF;

  SELECT * INTO v_coupon
  FROM public.scholarship_coupons
  WHERE UPPER(TRIM(code)) = v_clean_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'El código de beca no existe.');
  END IF;

  IF NOT v_coupon.is_active THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Este código de beca está actualmente pausado o inactivo.');
  END IF;

  IF v_coupon.starts_at IS NOT NULL AND now() < v_coupon.starts_at THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Este código de beca aún no entra en vigencia.');
  END IF;

  IF v_coupon.expires_at IS NOT NULL AND now() > v_coupon.expires_at THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Este código de beca ha expirado.');
  END IF;

  IF v_coupon.course_id IS NOT NULL AND v_coupon.course_id <> p_course_id THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Este código de beca no aplica para el programa seleccionado.');
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'error', 'El cupo límite para esta beca se ha agotado.');
  END IF;

  -- Comprobar si el usuario ya redimió este cupón para este curso
  IF EXISTS (
    SELECT 1 FROM public.scholarship_coupon_redemptions
    WHERE coupon_id = v_coupon.id AND user_id = v_uid AND course_id = p_course_id
  ) THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Ya has canjeado este código de beca para este curso.');
  END IF;

  -- Comprobar requisito de cédula profesional si el cupón lo exige
  IF v_coupon.requires_cedula_verified THEN
    SELECT COALESCE(cedula_verified, false) INTO v_is_cedula_verified
    FROM public.profiles
    WHERE id = v_uid;

    IF NOT v_is_cedula_verified THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'Este convenio exige tener tu cédula profesional verificada antes de aplicar.'
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'coupon_id', v_coupon.id,
    'code', v_coupon.code,
    'discount_percent', v_coupon.discount_percent,
    'description', v_coupon.description,
    'auto_admit', v_coupon.auto_admit,
    'course_id', v_coupon.course_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.validate_scholarship_coupon(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validate_scholarship_coupon(text, text) TO authenticated;

-- 6. Función RPC: Administrador crea o edita cupón de beca
CREATE OR REPLACE FUNCTION public.admin_save_scholarship_coupon(
  p_id UUID DEFAULT NULL,
  p_code TEXT DEFAULT NULL,
  p_discount_percent INTEGER DEFAULT 100,
  p_description TEXT DEFAULT NULL,
  p_course_id TEXT DEFAULT NULL,
  p_max_uses INTEGER DEFAULT NULL,
  p_starts_at TIMESTAMPTZ DEFAULT now(),
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT true,
  p_auto_admit BOOLEAN DEFAULT false,
  p_requires_cedula_verified BOOLEAN DEFAULT false
)
RETURNS public.scholarship_coupons
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
  v_clean_code TEXT := UPPER(TRIM(COALESCE(p_code, '')));
  v_row public.scholarship_coupons%ROWTYPE;
BEGIN
  IF NOT (public.is_admin() OR public.is_editor()) THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores pueden configurar cupones de beca.';
  END IF;

  IF v_clean_code = '' THEN
    RAISE EXCEPTION 'El código de cupón no puede estar vacío.';
  END IF;

  IF p_discount_percent < 1 OR p_discount_percent > 100 THEN
    RAISE EXCEPTION 'El porcentaje de beca debe estar entre 1 y 100%%.';
  END IF;

  IF p_id IS NOT NULL THEN
    -- Actualizar cupón existente
    UPDATE public.scholarship_coupons
    SET
      code = v_clean_code,
      discount_percent = p_discount_percent,
      description = p_description,
      course_id = p_course_id,
      max_uses = p_max_uses,
      starts_at = COALESCE(p_starts_at, now()),
      expires_at = p_expires_at,
      is_active = p_is_active,
      auto_admit = p_auto_admit,
      requires_cedula_verified = p_requires_cedula_verified,
      updated_at = now()
    WHERE id = p_id
    RETURNING * INTO v_row;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Cupón de beca no encontrado.';
    END IF;

    INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
    VALUES (
      v_admin_id,
      'admin_update_scholarship_coupon',
      'scholarship_coupon',
      v_row.id::text,
      jsonb_build_object('code', v_clean_code, 'discount_percent', p_discount_percent)
    );
  ELSE
    -- Insertar nuevo cupón
    INSERT INTO public.scholarship_coupons (
      code,
      discount_percent,
      description,
      course_id,
      max_uses,
      used_count,
      starts_at,
      expires_at,
      is_active,
      auto_admit,
      requires_cedula_verified,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      v_clean_code,
      p_discount_percent,
      p_description,
      p_course_id,
      p_max_uses,
      0,
      COALESCE(p_starts_at, now()),
      p_expires_at,
      p_is_active,
      p_auto_admit,
      p_requires_cedula_verified,
      v_admin_id,
      now(),
      now()
    )
    RETURNING * INTO v_row;

    INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
    VALUES (
      v_admin_id,
      'admin_create_scholarship_coupon',
      'scholarship_coupon',
      v_row.id::text,
      jsonb_build_object('code', v_clean_code, 'discount_percent', p_discount_percent)
    );
  END IF;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_save_scholarship_coupon FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_save_scholarship_coupon TO authenticated;

-- 7. Función RPC: Administrador cambia estado activo/pausado de cupón
CREATE OR REPLACE FUNCTION public.admin_toggle_coupon_status(
  p_coupon_id UUID,
  p_is_active BOOLEAN
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_admin() OR public.is_editor()) THEN
    RAISE EXCEPTION 'Acceso denegado.';
  END IF;

  UPDATE public.scholarship_coupons
  SET is_active = p_is_active, updated_at = now()
  WHERE id = p_coupon_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_toggle_coupon_status FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_toggle_coupon_status TO authenticated;

-- 8. Función RPC: Administrador elimina cupón de beca
CREATE OR REPLACE FUNCTION public.admin_delete_scholarship_coupon(
  p_coupon_id UUID
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
    RAISE EXCEPTION 'Acceso denegado: solo superadministradores pueden eliminar cupones.';
  END IF;

  DELETE FROM public.scholarship_coupons
  WHERE id = p_coupon_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    v_admin_id,
    'admin_delete_scholarship_coupon',
    'scholarship_coupon',
    p_coupon_id::text,
    jsonb_build_object('deleted_at', now())
  );

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_scholarship_coupon FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_scholarship_coupon TO authenticated;

-- 9. Función RPC: Consultar canjes/beneficiarios de un cupón
CREATE OR REPLACE FUNCTION public.admin_get_coupon_redemptions(
  p_coupon_id UUID
)
RETURNS TABLE (
  redemption_id UUID,
  coupon_id UUID,
  user_id UUID,
  course_id TEXT,
  course_title TEXT,
  discount_percent INTEGER,
  redeemed_at TIMESTAMPTZ,
  display_name TEXT,
  email TEXT,
  cedula_profesional TEXT,
  institution TEXT,
  enrollment_status TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id AS redemption_id,
    r.coupon_id,
    r.user_id,
    r.course_id,
    c.title AS course_title,
    r.discount_percent,
    r.redeemed_at,
    COALESCE(p.display_name, 'Sin nombre') AS display_name,
    COALESCE(u.email, 'Sin email') AS email,
    p.cedula_profesional,
    p.institution,
    COALESCE(ce.status, 'desconocido') AS enrollment_status
  FROM public.scholarship_coupon_redemptions r
  JOIN public.courses c ON c.id = r.course_id
  LEFT JOIN public.profiles p ON p.id = r.user_id
  LEFT JOIN auth.users u ON u.id = r.user_id
  LEFT JOIN public.course_enrollments ce ON ce.user_id = r.user_id AND ce.course_id = r.course_id
  WHERE (public.is_admin() OR public.is_editor())
    AND r.coupon_id = p_coupon_id
  ORDER BY r.redeemed_at DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_get_coupon_redemptions FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_coupon_redemptions TO authenticated;

-- 10. Actualizar request_course_enrollment para soportar códigos de beca y admisión automática (Fast-Track)
CREATE OR REPLACE FUNCTION public.request_course_enrollment(
  p_course_id TEXT,
  p_notes TEXT DEFAULT NULL,
  p_payment_reference TEXT DEFAULT NULL,
  p_coupon_code TEXT DEFAULT NULL
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
  v_coupon public.scholarship_coupons%ROWTYPE;
  v_clean_code TEXT := UPPER(TRIM(COALESCE(p_coupon_code, '')));
  v_is_auto_admit BOOLEAN := false;
  v_enrollment_status TEXT := 'pending';
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

  -- Si se proporcionó un cupón, validarlo de forma atómica
  IF v_clean_code <> '' THEN
    SELECT * INTO v_coupon
    FROM public.scholarship_coupons
    WHERE UPPER(TRIM(code)) = v_clean_code
    FOR UPDATE; -- Bloqueo de fila para evitar condiciones de carrera en cupos

    IF NOT FOUND THEN
      RAISE EXCEPTION 'El código de beca ingresado no es válido.';
    END IF;

    IF NOT v_coupon.is_active THEN
      RAISE EXCEPTION 'El código de beca está inactivo o pausado.';
    END IF;

    IF v_coupon.starts_at IS NOT NULL AND now() < v_coupon.starts_at THEN
      RAISE EXCEPTION 'El código de beca aún no ha entrado en vigor.';
    END IF;

    IF v_coupon.expires_at IS NOT NULL AND now() > v_coupon.expires_at THEN
      RAISE EXCEPTION 'El código de beca ha expirado.';
    END IF;

    IF v_coupon.course_id IS NOT NULL AND v_coupon.course_id <> p_course_id THEN
      RAISE EXCEPTION 'El código de beca no aplica para este curso.';
    END IF;

    IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
      RAISE EXCEPTION 'El cupo de becas para este código se ha agotado.';
    END IF;

    -- Si el cupón tiene 100% de beca y está configurado para auto-admisión inmediata
    IF v_coupon.discount_percent = 100 AND v_coupon.auto_admit THEN
      v_is_auto_admit := true;
      v_enrollment_status := 'active';
    END IF;
  END IF;

  -- Insertar o actualizar la inscripción
  INSERT INTO public.course_enrollments (
    user_id,
    course_id,
    status,
    requested_at,
    request_notes,
    payment_reference,
    payment_method,
    coupon_id,
    coupon_code,
    discount_percent,
    granted_by,
    granted_at,
    reviewed_by,
    reviewed_at,
    review_notes,
    updated_at
  ) VALUES (
    v_uid,
    p_course_id,
    v_enrollment_status,
    now(),
    p_notes,
    p_payment_reference,
    CASE WHEN v_coupon.id IS NOT NULL THEN 'beca_' || v_coupon.discount_percent || '_pct' ELSE 'manual' END,
    v_coupon.id,
    v_coupon.code,
    v_coupon.discount_percent,
    CASE WHEN v_is_auto_admit THEN v_uid ELSE NULL END,
    CASE WHEN v_is_auto_admit THEN now() ELSE NULL END,
    CASE WHEN v_is_auto_admit THEN v_uid ELSE NULL END,
    CASE WHEN v_is_auto_admit THEN now() ELSE NULL END,
    CASE WHEN v_is_auto_admit THEN 'Admisión automática por Beca 100% (' || v_coupon.code || ')' ELSE NULL END,
    now()
  )
  ON CONFLICT (user_id, course_id) DO UPDATE SET
    status = v_enrollment_status,
    requested_at = now(),
    request_notes = COALESCE(EXCLUDED.request_notes, public.course_enrollments.request_notes),
    payment_reference = COALESCE(EXCLUDED.payment_reference, public.course_enrollments.payment_reference),
    payment_method = EXCLUDED.payment_method,
    coupon_id = EXCLUDED.coupon_id,
    coupon_code = EXCLUDED.coupon_code,
    discount_percent = EXCLUDED.discount_percent,
    granted_by = CASE WHEN v_is_auto_admit THEN v_uid ELSE public.course_enrollments.granted_by END,
    granted_at = CASE WHEN v_is_auto_admit THEN now() ELSE public.course_enrollments.granted_at END,
    reviewed_by = CASE WHEN v_is_auto_admit THEN v_uid ELSE NULL END,
    reviewed_at = CASE WHEN v_is_auto_admit THEN now() ELSE NULL END,
    review_notes = CASE WHEN v_is_auto_admit THEN 'Admisión automática por Beca 100% (' || v_coupon.code || ')' ELSE NULL END,
    updated_at = now()
  RETURNING * INTO v_row;

  -- Si se utilizó cupón, registrar redención y sumar conteo
  IF v_coupon.id IS NOT NULL THEN
    INSERT INTO public.scholarship_coupon_redemptions (
      coupon_id,
      user_id,
      course_id,
      enrollment_id,
      discount_percent,
      redeemed_at
    ) VALUES (
      v_coupon.id,
      v_uid,
      p_course_id,
      v_row.id,
      v_coupon.discount_percent,
      now()
    )
    ON CONFLICT (coupon_id, user_id, course_id) DO UPDATE SET
      enrollment_id = v_row.id,
      discount_percent = v_coupon.discount_percent,
      redeemed_at = now();

    -- Incrementar used_count
    UPDATE public.scholarship_coupons
    SET used_count = used_count + 1, updated_at = now()
    WHERE id = v_coupon.id;
  END IF;

  -- Si hubo admisión automática, asegurar rol de estudiante y desbloquear 'referencia'
  IF v_is_auto_admit THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_uid, 'student')
    ON CONFLICT DO NOTHING;

    IF v_sellable IS TRUE THEN
      INSERT INTO public.course_enrollments (
        user_id, course_id, status, granted_by, granted_at, notes, updated_at
      ) VALUES (
        v_uid, 'referencia', 'active', v_uid, now(),
        'Incluida con beca 100%', now()
      )
      ON CONFLICT (user_id, course_id) DO UPDATE SET
        status = 'active',
        granted_by = v_uid,
        granted_at = now(),
        updated_at = now();
    END IF;
  END IF;

  -- Auditoría
  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    v_uid,
    'request_course_enrollment',
    'course_enrollment',
    v_row.id::text,
    jsonb_build_object(
      'course_id', p_course_id,
      'has_notes', (p_notes IS NOT NULL AND length(trim(p_notes)) > 0),
      'has_payment_ref', (p_payment_reference IS NOT NULL AND length(trim(p_payment_reference)) > 0),
      'coupon_code', v_coupon.code,
      'discount_percent', v_coupon.discount_percent,
      'auto_admit', v_is_auto_admit
    )
  );

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.request_course_enrollment(text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_course_enrollment(text, text, text, text) TO authenticated;

-- 11. Actualizar admin_get_course_waitlist para retornar datos de beca
DROP FUNCTION IF EXISTS public.admin_get_course_waitlist(text, text);

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
  waitlist_position BIGINT,
  coupon_code TEXT,
  discount_percent INTEGER
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
    ) AS waitlist_position,
    ce.coupon_code,
    ce.discount_percent
  FROM public.course_enrollments ce
  JOIN public.courses c ON c.id = ce.course_id
  LEFT JOIN public.profiles p ON p.id = ce.user_id
  LEFT JOIN auth.users u ON u.id = ce.user_id
  WHERE (public.is_admin() OR public.is_editor())
    AND (p_course_id IS NULL OR ce.course_id = p_course_id)
    AND (
      p_status = 'all'
      OR (p_status IS NULL AND ce.status = 'pending')
      OR ce.status = p_status
    )
  ORDER BY ce.requested_at ASC, ce.created_at ASC;
$$;

REVOKE ALL ON FUNCTION public.admin_get_course_waitlist(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_course_waitlist(text, text) TO authenticated;

