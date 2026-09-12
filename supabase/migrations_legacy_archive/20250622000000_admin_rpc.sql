-- Admin RPC helpers for dashboard and user management

CREATE OR REPLACE FUNCTION public.admin_list_profiles(pending_only boolean DEFAULT false)
RETURNS TABLE (
  id uuid, email text, display_name text, credentials text, institution text,
  specialty text, bio text, avatar_url text, is_public boolean,
  verified_at timestamptz, created_at timestamptz, roles text[]
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  RETURN QUERY
  SELECT p.id, u.email::text, p.display_name, p.credentials, p.institution, p.specialty,
    p.bio, p.avatar_url, p.is_public, p.verified_at, p.created_at,
    COALESCE(ARRAY(SELECT ur.role::text FROM public.user_roles ur WHERE ur.user_id = p.id), '{}'::text[])
  FROM public.profiles p JOIN auth.users u ON u.id = p.id
  WHERE (NOT pending_only OR p.verified_at IS NULL)
  ORDER BY p.created_at DESC;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.is_admin() AND NOT public.has_role('editor') THEN RAISE EXCEPTION 'No autorizado'; END IF;
  SELECT jsonb_build_object(
    'pending_users', (SELECT count(*) FROM public.profiles WHERE verified_at IS NULL),
    'verified_users', (SELECT count(*) FROM public.profiles WHERE verified_at IS NOT NULL),
    'pending_revisions', (SELECT count(*) FROM public.content_revisions WHERE status = 'pending_review'),
    'published_topics', (SELECT count(*) FROM public.published_topics),
    'approved_revisions', (SELECT count(*) FROM public.content_revisions WHERE status = 'approved')
  ) INTO result;
  RETURN result;
END; $$;

CREATE OR REPLACE FUNCTION public.revoke_contributor(target_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF target_user_id = auth.uid() THEN RAISE EXCEPTION 'No puedes revocarte a ti mismo'; END IF;
  UPDATE public.profiles SET verified_at = NULL WHERE id = target_user_id;
  DELETE FROM public.user_roles WHERE user_id = target_user_id AND role IN ('contributor', 'editor');
  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id)
  VALUES (auth.uid(), 'revoke_contributor', 'user', target_user_id::text);
END; $$;

REVOKE ALL ON FUNCTION public.admin_list_profiles(boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_stats() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.revoke_contributor(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_profiles(boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_contributor(uuid) TO authenticated;
