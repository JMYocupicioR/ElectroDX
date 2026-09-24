-- Corrección de advertencia de seguridad Supabase Linter (0010_security_definer_view)
-- Transforma public.public_specialist_profiles a security_invoker = true
-- y habilita una política RLS controlada en public.profiles para lectura de directorio público.

-- 1. Política RLS en profiles para permitir lectura pública únicamente de especialistas admitidos y visibles
DROP POLICY IF EXISTS "profiles_public_directory_read" ON public.profiles;

CREATE POLICY "profiles_public_directory_read" ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (
    enrollment_status = 'approved'
    AND (is_public = true OR show_in_editorial_committee = true)
  );

-- 2. Recrear la vista con security_invoker = true
DROP VIEW IF EXISTS public.public_specialist_profiles;

CREATE VIEW public.public_specialist_profiles
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.display_name,
  p.credentials,
  p.institution,
  p.academic_institution,
  p.specialty,
  p.residency_year,
  p.avatar_url,
  p.bio,
  p.is_public,
  p.show_in_editorial_committee,
  COALESCE(p.cedula_verified, false) AS cedula_verified,
  p.created_at
FROM public.profiles p
WHERE p.enrollment_status = 'approved'
  AND (p.is_public = true OR p.show_in_editorial_committee = true);

COMMENT ON VIEW public.public_specialist_profiles IS
  'Directorio público con security_invoker = true. Respeta RLS y resuelve la regla 0010_security_definer_view del linter de Supabase.';

GRANT SELECT ON public.public_specialist_profiles TO anon, authenticated;
