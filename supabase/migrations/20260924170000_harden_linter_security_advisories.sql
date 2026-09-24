-- ==============================================================================
-- Migración: Corrección Integral de Advertencias Supabase Linter (Security Advisor)
-- Fecha: 2026-09-24
--
-- Atiende:
-- 1. function_search_path_mutable (0011): search_path mutable en funciones trigger.
-- 2. rls_policy_always_true (0024): política permisiva en class_attendances.
-- 3. anon_security_definer_function_executable (0028): revocación de execute anónimo
--    en funciones sensibles/admin/internas SECURITY DEFINER.
-- 4. Funciones puramente internas/triggers sin exposición RPC a authenticated.
-- ==============================================================================

-- ─── 1. Corrección de search_path mutable en Triggers ─────────────────────────

ALTER FUNCTION public.update_exam_attempt_timestamp() SET search_path = public;
ALTER FUNCTION public.enforce_profile_visibility_integrity() SET search_path = public;
ALTER FUNCTION public.touch_syllabus_row() SET search_path = public;

-- ─── 2. Corrección de RLS permisivo en class_attendances ───────────────────────
-- Se elimina la política permisiva "class_attendances_write" (USING true).
-- Las escrituras quedan protegidas para administradores y editores docentes.

DROP POLICY IF EXISTS "class_attendances_write" ON public.class_attendances;
DROP POLICY IF EXISTS "class_attendances_admin_write" ON public.class_attendances;

CREATE POLICY "class_attendances_admin_write"
  ON public.class_attendances FOR ALL
  TO authenticated
  USING (public.is_admin() OR public.is_editor())
  WITH CHECK (public.is_admin() OR public.is_editor());

-- ─── 3. Funciones estrictamente internas / Triggers / Cron ─────────────────────
-- Estas funciones NO deben ser invocables vía PostgREST ni por anon ni por authenticated.

DO $$
BEGIN
  -- abandon_stale_exam_attempts (job de fondo/cron)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'abandon_stale_exam_attempts') THEN
    REVOKE ALL ON FUNCTION public.abandon_stale_exam_attempts(integer) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.abandon_stale_exam_attempts(integer) TO service_role;
  END IF;

  -- update_question_progress_on_answer (función de trigger)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_question_progress_on_answer') THEN
    REVOKE ALL ON FUNCTION public.update_question_progress_on_answer() FROM PUBLIC, anon, authenticated;
  END IF;

  -- rls_auto_enable (utilidad administrativa/evento)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'rls_auto_enable') THEN
    REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

-- ─── 4. Revocación de acceso anónimo en funciones SECURITY DEFINER ──────────────
-- Se revoca EXECUTE de PUBLIC y anon para asegurar que ningún usuario no autenticado
-- pueda invocar RPCs administrativas o de estudiantes.
-- (authenticated conserva su permiso de ejecución para interactuar desde el cliente,
--  y cada función valida internamente auth.uid() o is_admin()).

-- Funciones administrativas
REVOKE ALL ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_import_pending_quizzes(jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_profiles(boolean, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_quizzes_for_validation(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_question_stats(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_quiz_validation_status(uuid[], text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_toggle_editorial_committee(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_toggle_specialist_visibility(uuid, boolean) FROM PUBLIC, anon;

-- Helpers de rol y permisos (deben evaluarse únicamente en contexto de sesión)
REVOKE ALL ON FUNCTION public.bootstrap_admin_available() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_admin_available() TO authenticated;

REVOKE ALL ON FUNCTION public.can_access_module(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_module(text, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.has_course_access(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_course_access(text, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.has_premium_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_premium_access(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.has_role(public.app_role, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(public.app_role, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_contributor(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_contributor(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_editor(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_editor(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_enrolled_physician(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_enrolled_physician(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_student(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_student(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_verified_contributor(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_verified_contributor(uuid) TO authenticated;

-- RPCs de usuario autenticado
REVOKE ALL ON FUNCTION public.get_quiz_for_attempt(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_quiz_for_attempt(text) TO authenticated;

REVOKE ALL ON FUNCTION public.grade_emg_report(uuid, jsonb, numeric, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grade_emg_report(uuid, jsonb, numeric, text) TO authenticated;

REVOKE ALL ON FUNCTION public.submit_my_assignment(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_my_assignment(uuid, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.update_my_profile(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_my_profile(jsonb) TO authenticated;

-- ─── 5. Verificación de Folio de Certificados (Público) ────────────────────────
-- verify_certificate(p_folio text) está diseñada intencionalmente para consulta
-- pública por parte de empleadores o instituciones sin requerir cuenta en NeuroSAFE.
-- Se mantiene el acceso a anon y authenticated:
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;
COMMENT ON FUNCTION public.verify_certificate(text) IS
  'Endpoint público para verificar folios de diplomas. Retorna únicamente metadatos del certificado sin exponer datos personales sensibles.';
