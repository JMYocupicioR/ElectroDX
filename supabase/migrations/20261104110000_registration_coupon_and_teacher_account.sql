-- ============================================================================
-- Migración: Soporte de Cupones en Registro de Nuevo Usuario y Cuentas de Profesor
-- 2026-11-04
-- ============================================================================

-- 1. Agregar columna account_type a scholarship_coupons
ALTER TABLE public.scholarship_coupons
  ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'student' CHECK (account_type IN ('student', 'teacher'));

-- Marcar cupones de docentes existentes
UPDATE public.scholarship_coupons
SET account_type = 'teacher', auto_admit = true
WHERE UPPER(TRIM(code)) = 'VIP-DOCENTE-100' OR code ILIKE '%DOCENTE%' OR code ILIKE '%PROFESOR%';

-- 2. Actualizar validate_scholarship_coupon para soportar usuarios no autenticados (flujo de registro) y p_course_id opcional
CREATE OR REPLACE FUNCTION public.validate_scholarship_coupon(
  p_code TEXT,
  p_course_id TEXT DEFAULT NULL
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
  v_already_redeemed BOOLEAN := false;
  v_role_label TEXT;
BEGIN
  IF v_clean_code = '' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Ingresa un código de cupón o beca.');
  END IF;

  SELECT * INTO v_coupon
  FROM public.scholarship_coupons
  WHERE UPPER(TRIM(code)) = v_clean_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'El código ingresado no existe o no es válido.');
  END IF;

  IF NOT v_coupon.is_active THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Este código de beca está actualmente inactivo o pausado.');
  END IF;

  IF v_coupon.starts_at IS NOT NULL AND now() < v_coupon.starts_at THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Este código aún no entra en vigencia.');
  END IF;

  IF v_coupon.expires_at IS NOT NULL AND now() > v_coupon.expires_at THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Este código ha expirado.');
  END IF;

  -- Si se especificó curso y el cupón está restringido a otro curso
  IF p_course_id IS NOT NULL AND p_course_id <> '' AND v_coupon.course_id IS NOT NULL AND v_coupon.course_id <> p_course_id THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Este código aplica únicamente para otro programa del catálogo.');
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'error', 'El cupo de becas para este código se ha agotado.');
  END IF;

  -- Si hay sesión activa, verificar cédula y redención previa
  IF v_uid IS NOT NULL THEN
    IF v_coupon.requires_cedula_verified THEN
      SELECT COALESCE(cedula_verified, false) INTO v_is_cedula_verified
      FROM public.profiles
      WHERE id = v_uid;

      IF NOT v_is_cedula_verified THEN
        RETURN jsonb_build_object(
          'valid', false,
          'error', 'Este cupón requiere que tu cédula profesional esté verificada en tu expediente antes de canjear.'
        );
      END IF;
    END IF;

    IF v_coupon.course_id IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 FROM public.scholarship_coupon_redemptions
        WHERE coupon_id = v_coupon.id
          AND user_id = v_uid
          AND course_id = v_coupon.course_id
      ) INTO v_already_redeemed;

      IF v_already_redeemed THEN
        RETURN jsonb_build_object(
          'valid', false,
          'error', 'Ya has redimido este código de beca para este programa anteriormente.'
        );
      END IF;
    END IF;
  END IF;

  -- Determinar etiqueta legible del beneficio
  IF v_coupon.account_type = 'teacher' THEN
    v_role_label := 'Cuenta de Profesor Invitado / Docente';
  ELSIF v_coupon.discount_percent = 100 THEN
    v_role_label := 'Alumno con Beca al 100% (Exención Total)';
  ELSE
    v_role_label := 'Alumno con Beca Parcial (' || v_coupon.discount_percent || '% Descuento)';
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'coupon_id', v_coupon.id,
    'code', v_coupon.code,
    'discount_percent', v_coupon.discount_percent,
    'description', v_coupon.description,
    'course_id', v_coupon.course_id,
    'auto_admit', v_coupon.auto_admit,
    'requires_cedula_verified', v_coupon.requires_cedula_verified,
    'account_type', v_coupon.account_type,
    'target_role_label', v_role_label
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_scholarship_coupon(TEXT, TEXT) TO anon, authenticated;

-- 3. Actualizar admin_save_scholarship_coupon para soportar p_account_type
CREATE OR REPLACE FUNCTION public.admin_save_scholarship_coupon(
  p_id UUID,
  p_code TEXT,
  p_discount_percent INTEGER,
  p_description TEXT,
  p_course_id TEXT,
  p_max_uses INTEGER,
  p_starts_at TIMESTAMPTZ,
  p_expires_at TIMESTAMPTZ,
  p_is_active BOOLEAN,
  p_auto_admit BOOLEAN,
  p_requires_cedula_verified BOOLEAN,
  p_account_type TEXT DEFAULT 'student'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_clean_code TEXT := UPPER(TRIM(COALESCE(p_code, '')));
  v_result_id UUID;
  v_account_type TEXT := COALESCE(p_account_type, 'student');
BEGIN
  IF v_uid IS NULL OR NOT (public.is_admin(v_uid) OR public.is_editor(v_uid)) THEN
    RAISE EXCEPTION 'Acceso denegado: solo personal docente o directivo puede gestionar cupones.';
  END IF;

  IF v_clean_code = '' THEN
    RAISE EXCEPTION 'El código del cupón no puede estar vacío.';
  END IF;

  IF p_discount_percent < 1 OR p_discount_percent > 100 THEN
    RAISE EXCEPTION 'El porcentaje de beca debe estar entre 1 y 100.';
  END IF;

  IF v_account_type NOT IN ('student', 'teacher') THEN
    v_account_type := 'student';
  END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.scholarship_coupons (
      code,
      discount_percent,
      description,
      course_id,
      max_uses,
      starts_at,
      expires_at,
      is_active,
      auto_admit,
      requires_cedula_verified,
      account_type,
      created_by
    )
    VALUES (
      v_clean_code,
      p_discount_percent,
      NULLIF(TRIM(p_description), ''),
      NULLIF(TRIM(p_course_id), ''),
      p_max_uses,
      COALESCE(p_starts_at, now()),
      p_expires_at,
      COALESCE(p_is_active, true),
      COALESCE(p_auto_admit, false),
      COALESCE(p_requires_cedula_verified, false),
      v_account_type,
      v_uid
    )
    RETURNING id INTO v_result_id;
  ELSE
    UPDATE public.scholarship_coupons
    SET
      code = v_clean_code,
      discount_percent = p_discount_percent,
      description = NULLIF(TRIM(p_description), ''),
      course_id = NULLIF(TRIM(p_course_id), ''),
      max_uses = p_max_uses,
      starts_at = COALESCE(p_starts_at, starts_at),
      expires_at = p_expires_at,
      is_active = COALESCE(p_is_active, is_active),
      auto_admit = COALESCE(p_auto_admit, auto_admit),
      requires_cedula_verified = COALESCE(p_requires_cedula_verified, requires_cedula_verified),
      account_type = v_account_type,
      updated_at = now()
    WHERE id = p_id
    RETURNING id INTO v_result_id;
  END IF;

  RETURN v_result_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_save_scholarship_coupon(
  UUID, TEXT, INTEGER, TEXT, TEXT, INTEGER, TIMESTAMPTZ, TIMESTAMPTZ, BOOLEAN, BOOLEAN, BOOLEAN, TEXT
) TO authenticated;

-- 4. Función RPC: Aplicar cupón de registro al crear usuario
CREATE OR REPLACE FUNCTION public.apply_registration_coupon(
  p_user_id UUID,
  p_coupon_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean_code TEXT := UPPER(TRIM(COALESCE(p_coupon_code, '')));
  v_coupon public.scholarship_coupons%ROWTYPE;
  v_course_record RECORD;
BEGIN
  IF p_user_id IS NULL OR v_clean_code = '' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Parámetros inválidos.');
  END IF;

  -- Bloqueo pesimista para evitar sobre-canjes concurrentes
  SELECT * INTO v_coupon
  FROM public.scholarship_coupons
  WHERE UPPER(TRIM(code)) = v_clean_code
    AND is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (expires_at IS NULL OR expires_at > now())
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Cupón no encontrado o inactivo.');
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN jsonb_build_object('success', false, 'message', 'El cupo de este cupón está agotado.');
  END IF;

  -- A. Si es cupón para cuenta de Profesor / Docente
  IF v_coupon.account_type = 'teacher' THEN
    -- Asignar rol docente / contributor
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user_id, 'contributor')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Marcar perfil como verificado
    UPDATE public.profiles
    SET verified_at = COALESCE(verified_at, now()),
        updated_at = now()
    WHERE id = p_user_id;

    -- Inscribir y activar en todos los cursos del catálogo
    FOR v_course_record IN SELECT id FROM public.courses LOOP
      INSERT INTO public.course_enrollments (
        user_id,
        course_id,
        status,
        granted_at,
        payment_method,
        payment_reference,
        coupon_id,
        coupon_code,
        discount_percent
      )
      VALUES (
        p_user_id,
        v_course_record.id,
        'active',
        now(),
        'beca',
        v_coupon.code,
        v_coupon.id,
        v_coupon.code,
        100
      )
      ON CONFLICT (user_id, course_id) DO UPDATE
        SET status = 'active',
            granted_at = COALESCE(course_enrollments.granted_at, now()),
            payment_method = 'beca',
            payment_reference = v_coupon.code,
            coupon_id = v_coupon.id,
            coupon_code = v_coupon.code,
            discount_percent = 100,
            updated_at = now();
    END LOOP;

  -- B. Si es cupón para Alumno con Beca
  ELSE
    -- Asegurar rol de estudiante
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user_id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Si el cupón apunta a un curso específico
    IF v_coupon.course_id IS NOT NULL THEN
      IF v_coupon.auto_admit OR v_coupon.discount_percent = 100 THEN
        INSERT INTO public.course_enrollments (
          user_id,
          course_id,
          status,
          granted_at,
          payment_method,
          payment_reference,
          coupon_id,
          coupon_code,
          discount_percent
        )
        VALUES (
          p_user_id,
          v_coupon.course_id,
          'active',
          now(),
          'beca',
          v_coupon.code,
          v_coupon.id,
          v_coupon.code,
          v_coupon.discount_percent
        )
        ON CONFLICT (user_id, course_id) DO UPDATE
          SET status = 'active',
              granted_at = COALESCE(course_enrollments.granted_at, now()),
              payment_method = 'beca',
              payment_reference = v_coupon.code,
              coupon_id = v_coupon.id,
              coupon_code = v_coupon.code,
              discount_percent = v_coupon.discount_percent,
              updated_at = now();
      ELSE
        INSERT INTO public.course_enrollments (
          user_id,
          course_id,
          status,
          requested_at,
          payment_method,
          payment_reference,
          coupon_id,
          coupon_code,
          discount_percent
        )
        VALUES (
          p_user_id,
          v_coupon.course_id,
          'pending',
          now(),
          'beca',
          v_coupon.code,
          v_coupon.id,
          v_coupon.code,
          v_coupon.discount_percent
        )
        ON CONFLICT (user_id, course_id) DO UPDATE
          SET payment_method = 'beca',
              payment_reference = v_coupon.code,
              coupon_id = v_coupon.id,
              coupon_code = v_coupon.code,
              discount_percent = v_coupon.discount_percent,
              updated_at = now();
      END IF;
    END IF;
  END IF;

  -- Registrar redención en la tabla de auditoría (evita duplicados con ON CONFLICT DO NOTHING)
  INSERT INTO public.scholarship_coupon_redemptions (
    coupon_id,
    user_id,
    course_id,
    discount_percent,
    redeemed_at
  )
  VALUES (
    v_coupon.id,
    p_user_id,
    COALESCE(v_coupon.course_id, 'catalogo_general'),
    v_coupon.discount_percent,
    now()
  )
  ON CONFLICT (coupon_id, user_id, course_id) DO NOTHING;

  -- Incrementar contador de usos
  UPDATE public.scholarship_coupons
  SET used_count = used_count + 1,
      updated_at = now()
  WHERE id = v_coupon.id;

  RETURN jsonb_build_object(
    'success', true,
    'account_type', v_coupon.account_type,
    'code', v_coupon.code,
    'discount_percent', v_coupon.discount_percent
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_registration_coupon(UUID, TEXT) TO anon, authenticated, service_role;

-- 5. Actualizar trigger handle_new_user para que procese automáticamente raw_user_meta_data->>'coupon_code'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon_code TEXT;
  v_account_type TEXT;
BEGIN
  v_coupon_code := NULLIF(TRIM(NEW.raw_user_meta_data->>'coupon_code'), '');
  v_account_type := NEW.raw_user_meta_data->>'account_type';

  INSERT INTO public.profiles (
    id,
    display_name,
    avatar_url,
    credentials,
    institution,
    academic_institution,
    specialty,
    residency_year,
    cedula_profesional,
    comefyr_member_id,
    cedula_verified,
    cedula_data
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'credentials',
    NEW.raw_user_meta_data->>'institution',
    NEW.raw_user_meta_data->>'academic_institution',
    NEW.raw_user_meta_data->>'specialty',
    NEW.raw_user_meta_data->>'residency_year',
    NEW.raw_user_meta_data->>'cedula_profesional',
    NEW.raw_user_meta_data->>'comefyr_member_id',
    COALESCE((NEW.raw_user_meta_data->>'cedula_verified')::boolean, false),
    (NEW.raw_user_meta_data->>'cedula_data')::jsonb
  )
  ON CONFLICT (id) DO UPDATE
    SET display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
        credentials = COALESCE(EXCLUDED.credentials, profiles.credentials),
        institution = COALESCE(EXCLUDED.institution, profiles.institution),
        academic_institution = COALESCE(EXCLUDED.academic_institution, profiles.academic_institution),
        specialty = COALESCE(EXCLUDED.specialty, profiles.specialty),
        residency_year = COALESCE(EXCLUDED.residency_year, profiles.residency_year),
        cedula_profesional = COALESCE(EXCLUDED.cedula_profesional, profiles.cedula_profesional),
        updated_at = now();

  -- Por defecto rol student
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Si se indicó cuenta docente
  IF v_account_type = 'teacher' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'contributor')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- Si tiene cupón ingresado durante el registro, aplicarlo dentro de bloque EXCEPTION
  IF v_coupon_code IS NOT NULL THEN
    BEGIN
      PERFORM public.apply_registration_coupon(NEW.id, v_coupon_code);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'apply_registration_coupon falló para usuario %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;

