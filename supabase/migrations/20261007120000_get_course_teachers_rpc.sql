-- RPC para que los alumnos y usuarios autenticados puedan consultar
-- la nómina de docentes del curso (colaboradores docentes y miembros académicos)
-- con seguridad definer, respetando RLS y evitando exposición de correos o datos sensibles.

CREATE OR REPLACE FUNCTION public.get_course_teachers()
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  credentials TEXT,
  institution TEXT,
  academic_institution TEXT,
  specialty TEXT,
  residency_year TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_public BOOLEAN,
  show_in_editorial_committee BOOLEAN,
  cedula_verified BOOLEAN,
  created_at TIMESTAMPTZ,
  roles TEXT[]
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
    p.avatar_url,
    p.bio,
    COALESCE(p.is_public, true) AS is_public,
    COALESCE(p.show_in_editorial_committee, false) AS show_in_editorial_committee,
    COALESCE(p.cedula_verified, false) AS cedula_verified,
    p.created_at,
    COALESCE(
      ARRAY(SELECT ur.role::text FROM public.user_roles ur WHERE ur.user_id = p.id),
      '{}'
    ) AS roles
  FROM public.profiles p
  WHERE
    p.enrollment_status = 'approved'
    AND p.display_name IS NOT NULL
    AND LOWER(p.display_name) != 'neurosafemx'
    AND (
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = p.id AND ur.role = 'contributor'
      )
      OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = p.id AND ur.role IN ('editor', 'admin')
        AND (p.credentials IS NOT NULL OR p.specialty IS NOT NULL)
      )
      OR p.is_public = true
      OR p.show_in_editorial_committee = true
    )
  ORDER BY
    CASE
      WHEN EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'contributor') THEN 1
      WHEN EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role IN ('editor', 'admin')) THEN 2
      ELSE 3
    END,
    p.display_name ASC;
$$;

COMMENT ON FUNCTION public.get_course_teachers() IS
  'Retorna la lista de docentes del curso (colaboradores docentes y cuerpo académico) para el portal del alumno.';

REVOKE ALL ON FUNCTION public.get_course_teachers() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_course_teachers() TO anon, authenticated;
