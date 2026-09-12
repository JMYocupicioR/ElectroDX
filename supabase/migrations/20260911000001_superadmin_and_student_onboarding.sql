-- ═══════════════════════════════════════════════════════════════════════════════
-- NeuroSAFEMX: Configuración de SuperAdmin y Registro Médico de Estudiantes
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. Asignar rol Admin al SuperAdmin si ya existe en auth.users ────────────

DO $$
DECLARE
  v_admin_id UUID := 'ae3bc0a9-bfee-4991-8f6c-56dbed3aa6fd';
  v_user_exists BOOLEAN;
BEGIN
  -- Verificar si el usuario existe en auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = v_admin_id OR lower(email) = 'jmyocupicior@gmail.com')
  INTO v_user_exists;

  IF v_user_exists THEN
    -- Asegurar perfil
    INSERT INTO public.profiles (
      id, display_name, credentials, specialty, verified_at, enrollment_status, enrollment_verified_at
    )
    SELECT
      id,
      COALESCE(raw_user_meta_data->>'full_name', 'Dr. Marcos Yocupicio'),
      'MD, Especialista en Medicina de Rehabilitación',
      'Medicina de Rehabilitación y Electrodiagnóstico',
      now(),
      'approved',
      now()
    FROM auth.users
    WHERE id = v_admin_id OR lower(email) = 'jmyocupicior@gmail.com'
    ON CONFLICT (id) DO UPDATE SET
      verified_at = now(),
      enrollment_status = 'approved',
      enrollment_verified_at = now();

    -- Asignar rol admin
    INSERT INTO public.user_roles (user_id, role, granted_by)
    SELECT id, 'admin', id
    FROM auth.users
    WHERE id = v_admin_id OR lower(email) = 'jmyocupicior@gmail.com'
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- ─── 2. Trigger Perfeccionado para Registro de Estudiantes y SuperAdmin ───────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_superadmin BOOLEAN := (
    NEW.id = 'ae3bc0a9-bfee-4991-8f6c-56dbed3aa6fd'::uuid
    OR lower(NEW.email) = 'jmyocupicior@gmail.com'
  );
  v_display_name TEXT;
  v_credentials TEXT;
  v_institution TEXT;
  v_specialty TEXT;
  v_residency_year TEXT;
  v_cedula TEXT;
  v_comefyr TEXT;
BEGIN
  -- Extraer metadatos médicos del registro
  v_display_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
    split_part(NEW.email, '@', 1)
  );
  v_credentials := NULLIF(trim(NEW.raw_user_meta_data->>'credentials'), '');
  v_institution := NULLIF(trim(NEW.raw_user_meta_data->>'institution'), '');
  v_specialty := NULLIF(trim(NEW.raw_user_meta_data->>'specialty'), '');
  v_residency_year := NULLIF(trim(NEW.raw_user_meta_data->>'residency_year'), '');
  v_cedula := NULLIF(trim(NEW.raw_user_meta_data->>'cedula_profesional'), '');
  v_comefyr := NULLIF(trim(NEW.raw_user_meta_data->>'comefyr_member_id'), '');

  IF v_is_superadmin THEN
    -- Creación del SuperAdmin Único
    INSERT INTO public.profiles (
      id,
      display_name,
      credentials,
      institution,
      specialty,
      residency_year,
      cedula_profesional,
      comefyr_member_id,
      avatar_url,
      verified_at,
      enrollment_status,
      enrollment_verified_at,
      enrollment_verified_by
    ) VALUES (
      NEW.id,
      COALESCE(v_display_name, 'Dr. Marcos Yocupicio'),
      COALESCE(v_credentials, 'MD, Especialista en Medicina de Rehabilitación'),
      v_institution,
      COALESCE(v_specialty, 'Medicina de Rehabilitación y Electrodiagnóstico'),
      COALESCE(v_residency_year, 'Especialista / Director'),
      v_cedula,
      v_comefyr,
      NEW.raw_user_meta_data->>'avatar_url',
      now(),
      'approved',
      now(),
      NEW.id
    )
    ON CONFLICT (id) DO UPDATE SET
      verified_at = now(),
      enrollment_status = 'approved',
      enrollment_verified_at = now();

    INSERT INTO public.user_roles (user_id, role, granted_by)
    VALUES (NEW.id, 'admin', NEW.id)
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
    VALUES (NEW.id, 'superadmin_registered', 'user', NEW.id::text, jsonb_build_object('email', NEW.email));

  ELSE
    -- Registro Exclusivo como ESTUDIANTE MÉDICO
    INSERT INTO public.profiles (
      id,
      display_name,
      credentials,
      institution,
      specialty,
      residency_year,
      cedula_profesional,
      comefyr_member_id,
      avatar_url,
      enrollment_status,
      enrollment_requested_at
    ) VALUES (
      NEW.id,
      v_display_name,
      v_credentials,
      v_institution,
      v_specialty,
      v_residency_year,
      v_cedula,
      v_comefyr,
      NEW.raw_user_meta_data->>'avatar_url',
      CASE
        WHEN v_cedula IS NOT NULL OR v_comefyr IS NOT NULL OR v_residency_year IS NOT NULL THEN 'pending'::public.enrollment_status
        ELSE 'none'::public.enrollment_status
      END,
      now()
    )
    ON CONFLICT (id) DO NOTHING;

    -- Asignación obligatoria y exclusiva de rol: STUDENT
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
    VALUES (NEW.id, 'student_registered', 'user', NEW.id::text, jsonb_build_object(
      'email', NEW.email,
      'role', 'student',
      'institution', v_institution,
      'residency_year', v_residency_year
    ));
  END IF;

  RETURN NEW;
END;
$$;
