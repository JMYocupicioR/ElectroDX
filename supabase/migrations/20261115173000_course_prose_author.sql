-- Resuelve la cuenta a la que se acredita el texto vigente de los temas.
-- Solo devuelve un id. No lista otros correos.

CREATE OR REPLACE FUNCTION public.course_prose_author_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT id
  FROM auth.users
  WHERE lower(email) = 'jmyocupicior@gmail.com'
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.course_prose_author_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.course_prose_author_id() TO authenticated, service_role;
