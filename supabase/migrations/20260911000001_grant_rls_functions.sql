-- ==============================================================================
-- NeuroSAFEMX - Fix 42501 (403/401 Forbidden) on PostgREST & RLS evaluations
-- ==============================================================================
-- Functions evaluated inside Row Level Security (RLS) policies (such as is_admin,
-- has_role, is_enrolled_physician, has_premium_access, can_access_module) are
-- evaluated in the context of the connecting role (anon, authenticated).
-- When EXECUTE is not granted to anon/authenticated, PostgREST returns error 42501
-- (mapped to HTTP 401/403) on tables like quiz_topic_flags, live_workshops,
-- quiz_attempts, profiles, user_roles, content_revisions, audit_log.
-- ==============================================================================

-- 1. Permisos en Esquema y Tablas / Vistas
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.quiz_topic_flags TO anon, authenticated;
GRANT SELECT ON public.published_modules TO anon, authenticated;
GRANT SELECT ON public.published_topics TO anon, authenticated;
GRANT SELECT ON public.published_quizzes TO anon, authenticated;
GRANT SELECT ON public.live_workshops TO anon, authenticated;
GRANT SELECT ON public.module_access TO anon, authenticated;

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.content_revisions TO authenticated;
GRANT SELECT ON public.quiz_questions TO authenticated;
GRANT SELECT, INSERT ON public.quiz_attempts TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.workshop_registrations TO authenticated;
GRANT SELECT ON public.audit_log TO authenticated;

-- 2. Permisos de Ejecución para Funciones Helper / RLS (anon y authenticated)
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(public.app_role, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_editor(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_contributor(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_student(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_verified_contributor(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_enrolled_physician(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_premium_access(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_module(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_admin_available() TO anon, authenticated;

-- 3. Permisos de Ejecución para RPCs (authenticated)
GRANT EXECUTE ON FUNCTION public.claim_bootstrap_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_auth_context() TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(text, jsonb, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_revision(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_revision(uuid, public.revision_status, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_profiles(boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_quiz_attempts(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_user_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_user_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_contributor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_contributor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_physician_enrollment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_physician_enrollment(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_physician_enrollment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_premium_access(uuid, text, text, text, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_premium_access(uuid) TO authenticated;

-- 4. Asegurar asignación de SuperAdmin a Dr. Marcos Yocupicio
DO $$
DECLARE
  v_admin_id UUID := 'ae3bc0a9-bfee-4991-8f6c-56dbed3aa6fd';
  v_user_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = v_admin_id OR lower(email) = 'jmyocupicior@gmail.com')
  INTO v_user_exists;

  IF v_user_exists THEN
    INSERT INTO public.profiles (
      id, display_name, credentials, specialty, verified_at, enrollment_status, enrollment_verified_at
    )
    SELECT
      id,
      COALESCE(raw_user_meta_data->>'full_name', 'Dr. Marcos Yocupicio'),
      'MD, Especialista en Medicina de Rehabilitación',
      'Medicina de Rehabilitación y Electrodiagnóstico',
      now(),
      'approved',
      now()
    FROM auth.users
    WHERE id = v_admin_id OR lower(email) = 'jmyocupicior@gmail.com'
    ON CONFLICT (id) DO UPDATE SET
      verified_at = now(),
      enrollment_status = 'approved',
      enrollment_verified_at = now();

    INSERT INTO public.user_roles (user_id, role, granted_by)
    SELECT id, 'admin', id
    FROM auth.users
    WHERE id = v_admin_id OR lower(email) = 'jmyocupicior@gmail.com'
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- 5. Recargar caché de esquema de PostgREST
NOTIFY pgrst, 'reload schema';
