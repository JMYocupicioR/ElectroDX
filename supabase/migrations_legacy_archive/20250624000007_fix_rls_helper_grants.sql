-- RLS policies call is_admin/has_role/etc. as the authenticated role.
-- Revoking EXECUTE (security linter) broke all SELECT on profiles, user_roles, content_revisions.

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(public.app_role, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_verified_contributor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_enrolled_physician(uuid) TO authenticated;

-- Single RPC for auth context (avoids multiple round-trips)
CREATE OR REPLACE FUNCTION public.get_my_auth_context()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN NULL
    ELSE jsonb_build_object(
      'profile', (SELECT to_jsonb(p.*) FROM public.profiles p WHERE p.id = auth.uid()),
      'roles', COALESCE(
        (SELECT jsonb_agg(ur.role ORDER BY ur.role) FROM public.user_roles ur WHERE ur.user_id = auth.uid()),
        '[]'::jsonb
      ),
      'bootstrap_available', NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.get_my_auth_context() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_auth_context() TO authenticated;

NOTIFY pgrst, 'reload schema';
