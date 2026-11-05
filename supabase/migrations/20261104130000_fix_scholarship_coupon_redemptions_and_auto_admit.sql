-- ============================================================================
-- Corrección: Redenciones de cupón generales (course_id NULL), auto-admisión y perfiles pendientes
-- 1. Permite course_id NULL en public.scholarship_coupon_redemptions para becas de catálogo completo.
-- 2. Asegura índice UNIQUE NULLS NOT DISTINCT para soportar redenciones con course_id NULL.
-- 3. Actualiza apply_registration_coupon para auto-admitir perfiles y activar todos los cursos cuando course_id es NULL.
-- 4. Actualiza handle_new_user para registrar aspirantes médicos con enrollment_status = 'pending' por defecto.
-- 5. Actualiza request_course_enrollment para sincronizar enrollment_status de profiles.
-- 6. Actualiza admin_get_coupon_redemptions para incluir redenciones de catálogo completo con LEFT JOIN.
-- ============================================================================

-- 1. Modificar tabla scholarship_coupon_redemptions
ALTER TABLE public.scholarship_coupon_redemptions
  ALTER COLUMN course_id DROP NOT NULL;

ALTER TABLE public.scholarship_coupon_redemptions
  DROP CONSTRAINT IF EXISTS scholarship_coupon_redemptions_user_course_unique;

ALTER TABLE public.scholarship_coupon_redemptions
  ADD CONSTRAINT scholarship_coupon_redemptions_user_course_unique
  UNIQUE NULLS NOT DISTINCT (coupon_id, user_id, course_id);

-- 2. Actualizar función RPC admin_get_coupon_redemptions
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
  SELECT DISTINCT ON (r.id)
    r.id AS redemption_id,
    r.coupon_id,
    r.user_id,
    r.course_id,
    COALESCE(c.title, 'Todos los programas del catálogo') AS course_title,
    r.discount_percent,
    r.redeemed_at,
    COALESCE(p.display_name, 'Sin nombre') AS display_name,
    COALESCE(u.email, 'Sin email') AS email,
    p.cedula_profesional,
    p.institution,
    COALESCE(ce.status, p.enrollment_status::text, 'activo') AS enrollment_status
  FROM public.scholarship_coupon_redemptions r
  LEFT JOIN public.courses c ON c.id = r.course_id
  LEFT JOIN public.profiles p ON p.id = r.user_id
  LEFT JOIN auth.users u ON u.id = r.user_id
  LEFT JOIN public.course_enrollments ce ON ce.user_id = r.user_id AND (ce.course_id = r.course_id OR (r.course_id IS NULL AND ce.status = 'active'))
  WHERE (public.is_admin() OR public.is_editor())
    AND r.coupon_id = p_coupon_id
  ORDER BY r.id, r.redeemed_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_coupon_redemptions(UUID) TO authenticated;

-- 3. Actualizar función RPC apply_registration_coupon
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
  v_is_auto_admit BOOLEAN := false;
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

  -- Evitar doble canje del mismo cupón por el mismo usuario
  IF EXISTS (
    SELECT 1 FROM public.scholarship_coupon_redemptions
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id
  ) THEN
    RETURN jsonb_build_object('success', true, 'message', 'Cupón ya canjeado previamente.');
  END IF;

  -- Determinar si otorga admisión automática inmediata
  v_is_auto_admit := (v_coupon.account_type = 'teacher' OR v_coupon.auto_admit = true OR v_coupon.discount_percent = 100);

  -- A. Si es cupón para cuenta de Profesor / Docente
  IF v_coupon.account_type = 'teacher' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user_id, 'contributor')
    ON CONFLICT (user_id, role) DO NOTHING;

    UPDATE public.profiles
    SET enrollment_status = 'approved',
        enrollment_verified_at = COALESCE(enrollment_verified_at, now()),
        verified_at = COALESCE(verified_at, now()),
        updated_at = now()
    WHERE id = p_user_id;

    FOR v_course_record IN SELECT id FROM public.courses WHERE is_active = true LOOP
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
        'beca_docente',
        v_coupon.code,
        v_coupon.id,
        v_coupon.code,
        100
      )
      ON CONFLICT (user_id, course_id) DO UPDATE
        SET status = 'active',
            granted_at = COALESCE(course_enrollments.granted_at, now()),
            payment_method = 'beca_docente',
            payment_reference = v_coupon.code,
            coupon_id = v_coupon.id,
            coupon_code = v_coupon.code,
            discount_percent = 100,
            updated_at = now();
    END LOOP;

  -- B. Si es cupón para Alumno con Beca
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user_id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;

    IF v_is_auto_admit THEN
      -- Auto-admitir perfil inmediatamente
      UPDATE public.profiles
      SET enrollment_status = 'approved',
          enrollment_verified_at = COALESCE(enrollment_verified_at, now()),
          verified_at = COALESCE(verified_at, now()),
          updated_at = now()
      WHERE id = p_user_id;

      IF v_coupon.course_id IS NOT NULL THEN
        -- Beca para curso específico
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
        -- Beca para todo el catálogo de cursos
        FOR v_course_record IN SELECT id FROM public.courses WHERE is_active = true LOOP
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
        END LOOP;
      END IF;

    ELSE
      -- Beca parcial o que requiere visto bueno docente: colocar en lista de espera
      UPDATE public.profiles
      SET enrollment_status = 'pending',
          enrollment_requested_at = COALESCE(enrollment_requested_at, now()),
          updated_at = now()
      WHERE id = p_user_id
        AND enrollment_status <> 'approved';

      IF v_coupon.course_id IS NOT NULL THEN
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
              requested_at = COALESCE(course_enrollments.requested_at, now()),
              updated_at = now();
      ELSE
        FOR v_course_record IN SELECT id FROM public.courses WHERE is_active = true LOOP
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
            v_course_record.id,
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
                requested_at = COALESCE(course_enrollments.requested_at, now()),
                updated_at = now();
        END LOOP;
      END IF;
    END IF;
  END IF;

  -- Registrar redención en la tabla de auditoría (permite course_id NULL)
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
    v_coupon.course_id,
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
    'discount_percent', v_coupon.discount_percent,
    'auto_admit', v_is_auto_admit
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_registration_coupon(UUID, TEXT) TO anon, authenticated, service_role;

-- 4. Actualizar trigger handle_new_user para que aspirantes se registren como 'pending'
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
    cedula_data,
    enrollment_status,
    enrollment_requested_at
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
    (NEW.raw_user_meta_data->>'cedula_data')::jsonb,
    'pending',
    now()
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

  -- Si se indicó cuenta docente
  IF v_account_type = 'teacher' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'contributor')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- Si tiene cupón, aplicarlo
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

-- 5. Actualizar request_course_enrollment para sincronizar enrollment_status de profiles
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
    FOR UPDATE;

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

    IF v_coupon.discount_percent = 100 OR v_coupon.auto_admit THEN
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
    CASE WHEN v_is_auto_admit THEN 'Admisión automática por Beca (' || v_coupon.code || ')' ELSE NULL END,
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
    review_notes = CASE WHEN v_is_auto_admit THEN 'Admisión automática por Beca (' || v_coupon.code || ')' ELSE NULL END,
    updated_at = now()
  RETURNING * INTO v_row;

  -- Sincronizar el perfil del usuario según si fue auto-admitido o en espera
  IF v_is_auto_admit THEN
    UPDATE public.profiles
    SET enrollment_status = 'approved',
        enrollment_verified_at = COALESCE(enrollment_verified_at, now()),
        verified_at = COALESCE(verified_at, now()),
        updated_at = now()
    WHERE id = v_uid;
  ELSE
    UPDATE public.profiles
    SET enrollment_status = 'pending',
        enrollment_requested_at = COALESCE(enrollment_requested_at, now()),
        updated_at = now()
    WHERE id = v_uid
      AND enrollment_status <> 'approved';
  END IF;

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

    UPDATE public.scholarship_coupons
    SET used_count = used_count + 1,
        updated_at = now()
    WHERE id = v_coupon.id;
  END IF;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_course_enrollment(TEXT, TEXT, TEXT, TEXT) TO authenticated;

