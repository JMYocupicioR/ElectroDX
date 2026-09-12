-- ═══════════════════════════════════════════════════════════════════════════════
-- NeuroSAFEMX: Soporte para Verificación Oficial de Cédula Profesional (SEP)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Agregar columnas a public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cedula_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS cedula_data JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS academic_institution TEXT DEFAULT NULL;

-- 2. Actualizar handle_new_user() para persistir el estado de verificación de cédula
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
  v_cedula_verified BOOLEAN;
  v_cedula_data JSONB;
  v_academic_institution TEXT;
BEGIN
  -- Extraer metadatos médicos del registro
  v_display_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
    split_part(NEW.email, '@', 1)
  );
  v_credentials := NULLIF(trim(NEW.raw_user_meta_data->>'credentials'), '');
  v_institution := NULLIF(trim(NEW.raw_user_meta_data->>'institution'), '');
  v_academic_institution := NULLIF(trim(NEW.raw_user_meta_data->>'academic_institution'), '');
  v_specialty := NULLIF(trim(NEW.raw_user_meta_data->>'specialty'), '');
  v_residency_year := NULLIF(trim(NEW.raw_user_meta_data->>'residency_year'), '');
  v_cedula := NULLIF(trim(NEW.raw_user_meta_data->>'cedula_profesional'), '');
  v_comefyr := NULLIF(trim(NEW.raw_user_meta_data->>'comefyr_member_id'), '');
  v_cedula_verified := COALESCE((NEW.raw_user_meta_data->>'cedula_verified')::boolean, false);
  v_cedula_data := NEW.raw_user_meta_data->'cedula_data';

  IF v_is_superadmin THEN
    -- Creación del SuperAdmin Único
    INSERT INTO public.profiles (
      id,
      display_name,
      credentials,
      institution,
      academic_institution,
      specialty,
      residency_year,
      cedula_profesional,
      comefyr_member_id,
      avatar_url,
      verified_at,
      enrollment_status,
      enrollment_verified_at,
      enrollment_verified_by,
      cedula_verified,
      cedula_data
    ) VALUES (
      NEW.id,
      COALESCE(v_display_name, 'Dr. Marcos Yocupicio'),
      COALESCE(v_credentials, 'MD, Especialista en Medicina de Rehabilitación'),
      v_institution,
      COALESCE(v_academic_institution, 'Universidad Nacional Autónoma de México'),
      COALESCE(v_specialty, 'Medicina de Rehabilitación y Electrodiagnóstico'),
      COALESCE(v_residency_year, 'Especialista / Director'),
      v_cedula,
      v_comefyr,
      NEW.raw_user_meta_data->>'avatar_url',
      now(),
      'approved',
      now(),
      NEW.id,
      COALESCE(v_cedula_verified, true),
      v_cedula_data
    )
    ON CONFLICT (id) DO UPDATE SET
      verified_at = now(),
      enrollment_status = 'approved',
      enrollment_verified_at = now(),
      academic_institution = COALESCE(EXCLUDED.academic_institution, profiles.academic_institution),
      cedula_verified = EXCLUDED.cedula_verified,
      cedula_data = EXCLUDED.cedula_data;

    INSERT INTO public.user_roles (user_id, role, granted_by)
    VALUES (NEW.id, 'admin', NEW.id)
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
    VALUES (NEW.id, 'superadmin_registered', 'user', NEW.id::text, jsonb_build_object('email', NEW.email));

  ELSE
    -- Registro de Estudiante Médico
    INSERT INTO public.profiles (
      id,
      display_name,
      credentials,
      institution,
      academic_institution,
      specialty,
      residency_year,
      cedula_profesional,
      comefyr_member_id,
      avatar_url,
      enrollment_status,
      enrollment_requested_at,
      cedula_verified,
      cedula_data,
      verified_at
    ) VALUES (
      NEW.id,
      v_display_name,
      v_credentials,
      v_institution,
      v_academic_institution,
      v_specialty,
      v_residency_year,
      v_cedula,
      v_comefyr,
      NEW.raw_user_meta_data->>'avatar_url',
      CASE
        WHEN v_cedula IS NOT NULL OR v_comefyr IS NOT NULL OR v_residency_year IS NOT NULL THEN 'pending'::public.enrollment_status
        ELSE 'none'::public.enrollment_status
      END,
      now(),
      v_cedula_verified,
      v_cedula_data,
      CASE WHEN v_cedula_verified THEN now() ELSE NULL END
    )
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      credentials = COALESCE(EXCLUDED.credentials, profiles.credentials),
      institution = COALESCE(EXCLUDED.institution, profiles.institution),
      academic_institution = COALESCE(EXCLUDED.academic_institution, profiles.academic_institution),
      specialty = COALESCE(EXCLUDED.specialty, profiles.specialty),
      residency_year = COALESCE(EXCLUDED.residency_year, profiles.residency_year),
      cedula_profesional = COALESCE(EXCLUDED.cedula_profesional, profiles.cedula_profesional),
      cedula_verified = EXCLUDED.cedula_verified,
      cedula_data = EXCLUDED.cedula_data,
      verified_at = COALESCE(EXCLUDED.verified_at, profiles.verified_at);

    -- Asignación obligatoria de rol: STUDENT
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
    VALUES (NEW.id, 'student_registered', 'user', NEW.id::text, jsonb_build_object(
      'email', NEW.email,
      'role', 'student',
      'institution', v_institution,
      'academic_institution', v_academic_institution,
      'residency_year', v_residency_year,
      'cedula_verified', v_cedula_verified
    ));
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Actualizar función admin_list_profiles para retornar campos de cédula verificada
DROP FUNCTION IF EXISTS public.admin_list_profiles(boolean, text);

CREATE OR REPLACE FUNCTION public.admin_list_profiles(
  pending_only BOOLEAN DEFAULT false,
  enrollment_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  credentials TEXT,
  institution TEXT,
  academic_institution TEXT,
  specialty TEXT,
  residency_year TEXT,
  cedula_profesional TEXT,
  comefyr_member_id TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_public BOOLEAN,
  verified_at TIMESTAMPTZ,
  enrollment_status public.enrollment_status,
  enrollment_verified_at TIMESTAMPTZ,
  enrollment_requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  roles TEXT[],
  is_verified_contributor BOOLEAN,
  cedula_verified BOOLEAN,
  cedula_data JSONB
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.display_name,
    p.credentials,
    p.institution,
    p.academic_institution,
    p.specialty,
    p.residency_year,
    p.cedula_profesional,
    p.comefyr_member_id,
    p.avatar_url,
    p.bio,
    p.is_public,
    p.verified_at,
    p.enrollment_status,
    p.enrollment_verified_at,
    p.enrollment_requested_at,
    p.created_at,
    p.updated_at,
    COALESCE(
      ARRAY(SELECT ur.role::text FROM public.user_roles ur WHERE ur.user_id = p.id),
      '{}'
    ) AS roles,
    (p.verified_at IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'contributor'
    )) AS is_verified_contributor,
    COALESCE(p.cedula_verified, false) AS cedula_verified,
    p.cedula_data
  FROM public.profiles p
  WHERE
    public.is_admin()
    AND (
      NOT pending_only
      OR p.enrollment_status = 'pending'
      OR (p.verified_at IS NULL AND EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'contributor'
      ))
    )
    AND (
      enrollment_filter IS NULL
      OR (enrollment_filter = 'enrollment_pending' AND p.enrollment_status = 'pending')
      OR (enrollment_filter = 'enrolled' AND p.enrollment_status = 'approved')
      OR (enrollment_filter = 'contributor_pending' AND p.verified_at IS NULL AND EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'contributor'
      ))
      OR (enrollment_filter = 'contributors' AND EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role IN ('contributor', 'editor', 'admin')
      ))
    )
  ORDER BY p.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_profiles(boolean, text) TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. Garantizar políticas y permisos RLS en public.profiles
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles;
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT
  USING (is_public = true OR id = auth.uid() OR public.is_admin());

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. Configuración de Storage Bucket 'avatars' y Políticas RLS
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 1048576,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Permitir lectura pública a todas las fotos de perfil en el bucket 'avatars'
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Permitir subir su propio avatar (la ruta inicia con su UUID: <userId>/avatar.jpg)
DROP POLICY IF EXISTS "avatars_self_upload" ON storage.objects;
CREATE POLICY "avatars_self_upload" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (
      auth.uid()::text = split_part(name, '/', 1)
      OR public.is_admin()
    )
  );

-- Permitir actualizar su propio avatar (requerido para upsert: true)
DROP POLICY IF EXISTS "avatars_self_update" ON storage.objects;
CREATE POLICY "avatars_self_update" ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (
      auth.uid()::text = split_part(name, '/', 1)
      OR public.is_admin()
    )
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (
      auth.uid()::text = split_part(name, '/', 1)
      OR public.is_admin()
    )
  );

-- Permitir borrar su propio avatar
DROP POLICY IF EXISTS "avatars_self_delete" ON storage.objects;
CREATE POLICY "avatars_self_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (
      auth.uid()::text = split_part(name, '/', 1)
      OR public.is_admin()
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. Recargar la caché del esquema PostgREST
-- ═══════════════════════════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
