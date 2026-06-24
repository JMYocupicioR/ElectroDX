-- Revoke public execute on sensitive RPCs (run after main migration)
REVOKE ALL ON FUNCTION public.grant_user_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.verify_contributor(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.review_revision(uuid, public.revision_status, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_revision(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Internal RLS helpers: not exposed via PostgREST RPC
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(public.app_role, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_verified_contributor(uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.submit_revision(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_revision(uuid, public.revision_status, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_contributor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_user_role(uuid, public.app_role) TO authenticated;
