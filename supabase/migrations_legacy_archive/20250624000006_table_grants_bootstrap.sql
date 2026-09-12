-- PostgREST returns 403 without table-level GRANTs (RLS alone is not enough)

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

GRANT SELECT ON public.user_roles TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.content_revisions TO authenticated;

GRANT SELECT ON public.published_topics TO anon, authenticated;
GRANT SELECT ON public.published_modules TO anon, authenticated;

GRANT SELECT ON public.audit_log TO authenticated;

GRANT SELECT ON public.published_quizzes TO anon, authenticated;
GRANT SELECT ON public.quiz_questions TO authenticated;
GRANT SELECT, INSERT ON public.quiz_attempts TO authenticated;

-- First admin bootstrap (CEO): only when no admin exists yet
CREATE OR REPLACE FUNCTION public.bootstrap_admin_available()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.claim_bootstrap_admin()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'Ya existe un administrador en la plataforma';
  END IF;

  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (uid, 'admin', uid)
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.profiles
  SET
    verified_at = COALESCE(verified_at, now()),
    enrollment_status = 'approved',
    enrollment_verified_at = COALESCE(enrollment_verified_at, now()),
    enrollment_verified_by = uid
  WHERE id = uid;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (uid, 'bootstrap_admin', 'user', uid::text, jsonb_build_object('note', 'Primer administrador'));

  RETURN jsonb_build_object('success', true, 'user_id', uid);
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_admin_available() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_bootstrap_admin() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.bootstrap_admin_available() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_bootstrap_admin() TO authenticated;
