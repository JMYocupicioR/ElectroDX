-- Supabase security linter fixes (search_path, RPC grants, storage listing)

-- ─── 1. Immutable search_path on helper functions ─────────────────────────────

ALTER FUNCTION public.set_updated_at() SET search_path = public;

ALTER FUNCTION public.is_enrollment_profile_complete(public.profiles) SET search_path = public;

DO $$
BEGIN
  IF to_regprocedure('public.protect_profile_fields()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.protect_profile_fields() SET search_path = public';
  END IF;
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.rls_auto_enable() SET search_path = public';
  END IF;
END $$;

-- ─── 2. Internal/trigger functions: not callable via PostgREST ───────────────

REVOKE ALL ON FUNCTION public.sync_enrollment_request() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated';
  END IF;
END $$;

-- RLS helpers: used inside policies/other functions, never from client RPC
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(public.app_role, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_verified_contributor(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_enrolled_physician(uuid) FROM PUBLIC, anon, authenticated;

-- ─── 3. Admin/editor RPCs: authenticated only (never anon/public) ───────────

DROP FUNCTION IF EXISTS public.admin_list_profiles(boolean);

REVOKE ALL ON FUNCTION public.admin_list_profiles(boolean, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_stats() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.revoke_contributor(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.grant_user_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.verify_contributor(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.verify_physician_enrollment(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reject_physician_enrollment(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.revoke_physician_enrollment(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.review_revision(uuid, public.revision_status, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_revision(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.admin_list_profiles(boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_contributor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_user_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_contributor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_physician_enrollment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_physician_enrollment(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_physician_enrollment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_revision(uuid, public.revision_status, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_revision(uuid) TO authenticated;

-- ─── 4. Avatars: public bucket URLs work without broad SELECT (prevents listing) ─

DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;

-- Optional: allow users to read their own avatar object via API if needed later
CREATE POLICY "avatars_owner_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
