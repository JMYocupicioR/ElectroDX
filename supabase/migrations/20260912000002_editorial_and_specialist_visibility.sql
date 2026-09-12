-- ═══════════════════════════════════════════════════════════════════════════════
-- NeuroSAFEMX: Control Administrativo de Visibilidad Pública
-- Comité Editorial (/comite-editorial) y Directorio de Especialistas (/especialistas)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Agregar columna show_in_editorial_committee en public.profiles y fijar is_public por defecto false
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_in_editorial_committee BOOLEAN DEFAULT false;

ALTER TABLE public.profiles
  ALTER COLUMN is_public SET DEFAULT false;

-- 2. Inicializar miembros del comité:
-- Solo la cuenta principal de la dirección/superadmin inicia visible en comité público
UPDATE public.profiles
SET show_in_editorial_committee = true
WHERE id = 'ae3bc0a9-bfee-4991-8f6c-56dbed3aa6fd'::uuid;

UPDATE public.profiles
SET show_in_editorial_committee = false
WHERE id != 'ae3bc0a9-bfee-4991-8f6c-56dbed3aa6fd'::uuid;

-- 3. Actualizar política RLS para permitir lectura pública de miembros del comité o especialistas
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;

CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (
    is_public = true
    OR show_in_editorial_committee = true
    OR auth.uid() = id
    OR public.is_admin()
  );

-- 4. RPC para alternar visibilidad en Comité Editorial
CREATE OR REPLACE FUNCTION public.admin_toggle_editorial_committee(target_user_id UUID, show BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden modificar la visibilidad en el Comité Editorial';
  END IF;

  UPDATE public.profiles
  SET show_in_editorial_committee = show,
      updated_at = now()
  WHERE id = target_user_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'toggle_editorial_committee_visibility', 'user', target_user_id::text, jsonb_build_object('show_in_editorial_committee', show));
END;
$$;

-- 5. RPC para alternar visibilidad en Directorio de Especialistas
CREATE OR REPLACE FUNCTION public.admin_toggle_specialist_visibility(target_user_id UUID, show BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden modificar la visibilidad en el Directorio de Especialistas';
  END IF;

  UPDATE public.profiles
  SET is_public = show,
      updated_at = now()
  WHERE id = target_user_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'toggle_specialist_visibility', 'user', target_user_id::text, jsonb_build_object('is_public', show));
END;
$$;

-- 6. Actualizar admin_list_profiles para retornar show_in_editorial_committee y enriquecer filtros
DROP FUNCTION IF EXISTS public.admin_list_profiles(boolean, text);

CREATE OR REPLACE FUNCTION public.admin_list_profiles(
  pending_only BOOLEAN DEFAULT false,
  enrollment_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  email TEXT,
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
  show_in_editorial_committee BOOLEAN,
  verified_at TIMESTAMPTZ,
  enrollment_status public.enrollment_status,
  enrollment_verified_at TIMESTAMPTZ,
  enrollment_requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  roles TEXT[],
  is_verified_contributor BOOLEAN,
  cedula_verified BOOLEAN,
  cedula_data JSONB,
  has_premium BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    COALESCE(au.email::text, '') AS email,
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
    COALESCE(p.is_public, true) AS is_public,
    COALESCE(p.show_in_editorial_committee, false) AS show_in_editorial_committee,
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
    p.cedula_data,
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.user_id = p.id AND s.tier = 'premium' AND s.is_active = true AND (s.expires_at IS NULL OR s.expires_at > now())
    ) AS has_premium
  FROM public.profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE
    public.is_admin()
    AND (
      NOT pending_only
      OR p.enrollment_status IN ('pending', 'none')
      OR (p.verified_at IS NULL AND EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'contributor'
      ))
    )
    AND (
      enrollment_filter IS NULL
      OR enrollment_filter = 'all'
      OR (enrollment_filter = 'enrollment_pending' AND p.enrollment_status IN ('pending', 'none'))
      OR (enrollment_filter = 'enrolled' AND p.enrollment_status = 'approved')
      OR (enrollment_filter = 'comite' AND (
        EXISTS (
          SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role IN ('editor', 'admin')
        )
        OR p.show_in_editorial_committee = true
        OR p.is_public = true
      ))
      OR (enrollment_filter = 'contributors' AND EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role IN ('contributor', 'editor', 'admin')
      ))
      OR (enrollment_filter = 'premium' AND EXISTS (
        SELECT 1 FROM public.subscriptions s WHERE s.user_id = p.id AND s.tier = 'premium' AND s.is_active = true AND (s.expires_at IS NULL OR s.expires_at > now())
      ))
    )
  ORDER BY p.created_at DESC;
$$;

-- 7. Otorgar permisos de ejecución a authenticated
GRANT EXECUTE ON FUNCTION public.admin_toggle_editorial_committee(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_toggle_specialist_visibility(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_profiles(boolean, text) TO authenticated;
