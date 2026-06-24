-- Admin/editor can propose content without verified_at (matches frontend canProposeContent)

CREATE OR REPLACE FUNCTION public.is_verified_contributor(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin(check_user_id)
    OR public.has_role('editor', check_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      INNER JOIN public.user_roles ur ON ur.user_id = p.id
      WHERE p.id = check_user_id
        AND p.verified_at IS NOT NULL
        AND ur.role = 'contributor'
    );
$$;

REVOKE ALL ON FUNCTION public.is_verified_contributor(uuid) FROM PUBLIC, anon, authenticated;
