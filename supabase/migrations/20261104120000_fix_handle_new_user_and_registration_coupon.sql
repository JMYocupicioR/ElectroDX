-- ============================================================================
-- Corrección Urgente: handle_new_user y apply_registration_coupon
-- Elimina referencias a profiles.role (los roles residen en user_roles)
-- Corrige columnas de course_enrollments (granted_at, requested_at)
-- Protege handle_new_user con bloque EXCEPTION para garantizar que auth.signUp
-- nunca falle con error 500.
-- ============================================================================

-- 1. Función RPC: Aplicar cupón de registro (corregida)
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
    -- Asignar rol docente / contributor en user_roles
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
    -- Asegurar rol de estudiante en user_roles
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

  -- Registrar redención en la tabla de auditoría (evita duplicados)
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

-- 2. Trigger handle_new_user blindado (sin profiles.role y con bloque EXCEPTION)
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

  -- Insertar perfil en public.profiles (solo columnas existentes en la tabla)
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

  -- Rol student por defecto en user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Si se indicó cuenta docente, asignar rol contributor en user_roles
  IF v_account_type = 'teacher' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'contributor')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- Aplicar cupón de forma segura dentro de un bloque EXCEPTION
  -- para garantizar que NUNCA aborte la transacción de auth.users
  IF v_coupon_code IS NOT NULL THEN
    BEGIN
      PERFORM public.apply_registration_coupon(NEW.id, v_coupon_code);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'apply_registration_coupon falló de manera no fatal para el usuario %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;

