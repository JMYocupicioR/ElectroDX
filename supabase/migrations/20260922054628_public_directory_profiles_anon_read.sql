-- El directorio público (/comite-editorial, /especialistas) debe poder leer
-- solo columnas no sensibles. profiles quedó bloqueado a self/staff y la vista
-- heredaba ese RLS (security_invoker = true), así que un visitante veía lista vacía
-- aunque el admin hubiera marcado visibilidad.

DROP VIEW IF EXISTS public.public_specialist_profiles;

CREATE VIEW public.public_specialist_profiles
WITH (security_invoker = false) AS
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
  'Directorio público: corre como owner para no heredar RLS de profiles. Solo columnas no sensibles de médicos admitidos con visibilidad activa.';

GRANT SELECT ON public.public_specialist_profiles TO anon, authenticated;
