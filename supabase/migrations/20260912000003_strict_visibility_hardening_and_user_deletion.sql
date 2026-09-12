-- ═══════════════════════════════════════════════════════════════════════════════
-- NeuroSAFEMX: Blindaje de Visibilidad Pública y Eliminación Completa de Usuarios
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Actualizar reject_physician_enrollment para desactivar visibilidad pública
CREATE OR REPLACE FUNCTION public.reject_physician_enrollment(target_user_id UUID, notes TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden rechazar inscripciones';
  END IF;

  UPDATE public.profiles
  SET
    enrollment_status = 'rejected',
    enrollment_verified_at = NULL,
    enrollment_verified_by = auth.uid(),
    is_public = false,
    show_in_editorial_committee = false,
    updated_at = now()
  WHERE id = target_user_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'reject_physician_enrollment', 'user', target_user_id::text, jsonb_build_object('notes', notes));
END;
$$;

-- 2. Actualizar revoke_physician_enrollment para desactivar visibilidad pública
CREATE OR REPLACE FUNCTION public.revoke_physician_enrollment(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden revocar inscripciones';
  END IF;

  UPDATE public.profiles
  SET
    enrollment_status = 'none',
    enrollment_verified_at = NULL,
    enrollment_verified_by = NULL,
    enrollment_requested_at = NULL,
    is_public = false,
    show_in_editorial_committee = false,
    updated_at = now()
  WHERE id = target_user_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id)
  VALUES (auth.uid(), 'revoke_physician_enrollment', 'user', target_user_id::text);
END;
$$;

-- 3. Actualizar admin_toggle_specialist_visibility con validación de aprobación
CREATE OR REPLACE FUNCTION public.admin_toggle_specialist_visibility(target_user_id UUID, show BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status public.enrollment_status;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden modificar la visibilidad en el Directorio de Especialistas';
  END IF;

  SELECT enrollment_status INTO v_status FROM public.profiles WHERE id = target_user_id;

  IF show = true AND (v_status IS NULL OR v_status != 'approved') THEN
    RAISE EXCEPTION 'No se puede hacer visible en Especialistas a un usuario con estatus no aprobado (%s)', COALESCE(v_status::text, 'sin estado');
  END IF;

  UPDATE public.profiles
  SET is_public = show,
      updated_at = now()
  WHERE id = target_user_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'toggle_specialist_visibility', 'user', target_user_id::text, jsonb_build_object('is_public', show));
END;
$$;

-- 4. Actualizar admin_toggle_editorial_committee con validación de aprobación
CREATE OR REPLACE FUNCTION public.admin_toggle_editorial_committee(target_user_id UUID, show BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status public.enrollment_status;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden modificar la visibilidad en el Comité Editorial';
  END IF;

  SELECT enrollment_status INTO v_status FROM public.profiles WHERE id = target_user_id;

  IF show = true AND (v_status IS NULL OR v_status != 'approved') THEN
    RAISE EXCEPTION 'No se puede hacer visible en Comité Editorial a un usuario con estatus no aprobado (%s)', COALESCE(v_status::text, 'sin estado');
  END IF;

  UPDATE public.profiles
  SET show_in_editorial_committee = show,
      updated_at = now()
  WHERE id = target_user_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'toggle_editorial_committee_visibility', 'user', target_user_id::text, jsonb_build_object('show_in_editorial_committee', show));
END;
$$;

-- 5. Trigger de Blindaje Estricto a Nivel de Base de Datos
CREATE OR REPLACE FUNCTION public.enforce_profile_visibility_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si el usuario no está formalmente admitido y aprobado, la visibilidad pública DEBE ser siempre false
  IF NEW.enrollment_status IS NULL OR NEW.enrollment_status != 'approved' THEN
    NEW.is_public := false;
    NEW.show_in_editorial_committee := false;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_profile_visibility_integrity ON public.profiles;

CREATE TRIGGER trg_enforce_profile_visibility_integrity
  BEFORE INSERT OR UPDATE OF enrollment_status, is_public, show_in_editorial_committee
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_visibility_integrity();

-- 6. Configurar claves foráneas para permitir borrado en cascada / anulación limpia (SET NULL)
ALTER TABLE public.audit_log DROP CONSTRAINT IF EXISTS audit_log_actor_id_fkey;
ALTER TABLE public.audit_log ADD CONSTRAINT audit_log_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_granted_by_fkey;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_enrollment_verified_by_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_enrollment_verified_by_fkey FOREIGN KEY (enrollment_verified_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_granted_by_fkey;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.module_access DROP CONSTRAINT IF EXISTS module_access_updated_by_fkey;
ALTER TABLE public.module_access ADD CONSTRAINT module_access_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.live_workshops DROP CONSTRAINT IF EXISTS live_workshops_created_by_fkey;
ALTER TABLE public.live_workshops ADD CONSTRAINT live_workshops_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.content_revisions DROP CONSTRAINT IF EXISTS content_revisions_author_id_fkey;
ALTER TABLE public.content_revisions ADD CONSTRAINT content_revisions_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.content_revisions DROP CONSTRAINT IF EXISTS content_revisions_reviewer_id_fkey;
ALTER TABLE public.content_revisions ADD CONSTRAINT content_revisions_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 7. Eliminación Completa e Irreversible de Usuario y Todos sus Rastros
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
BEGIN
  -- 1. Verificar permisos de administrador
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden eliminar usuarios de la plataforma';
  END IF;

  -- 2. Evitar auto-eliminación accidental
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'No puedes eliminar tu propia cuenta de administrador';
  END IF;

  SELECT email INTO v_user_email FROM auth.users WHERE id = target_user_id;
  SELECT display_name INTO v_user_name FROM public.profiles WHERE id = target_user_id;

  -- 3. Registrar en auditoría antes de la purga
  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(), 
    'admin_delete_user_complete', 
    'user', 
    target_user_id::text, 
    jsonb_build_object(
      'deleted_email', v_user_email,
      'deleted_name', v_user_name
    )
  );

  -- 4. Limpiar referencias foráneas que apunten al usuario
  UPDATE public.audit_log SET actor_id = NULL WHERE actor_id = target_user_id;
  UPDATE public.user_roles SET granted_by = NULL WHERE granted_by = target_user_id;
  UPDATE public.profiles SET enrollment_verified_by = NULL WHERE enrollment_verified_by = target_user_id;
  UPDATE public.subscriptions SET granted_by = NULL WHERE granted_by = target_user_id;
  UPDATE public.module_access SET updated_by = NULL WHERE updated_by = target_user_id;
  UPDATE public.live_workshops SET created_by = NULL WHERE created_by = target_user_id;
  UPDATE public.published_modules SET published_by = NULL WHERE published_by = target_user_id;
  UPDATE public.published_modules SET last_edited_by = NULL WHERE last_edited_by = target_user_id;
  UPDATE public.published_topics SET published_by = NULL WHERE published_by = target_user_id;
  UPDATE public.published_topics SET last_edited_by = NULL WHERE last_edited_by = target_user_id;
  UPDATE public.published_quizzes SET published_by = NULL WHERE published_by = target_user_id;
  UPDATE public.published_quizzes SET last_edited_by = NULL WHERE last_edited_by = target_user_id;
  UPDATE public.content_revisions SET author_id = NULL WHERE author_id = target_user_id;
  UPDATE public.content_revisions SET reviewer_id = NULL WHERE reviewer_id = target_user_id;

  -- 5. Eliminar respuestas y sesiones de exámenes
  DELETE FROM public.exam_answers 
  WHERE session_id IN (SELECT id FROM public.exam_sessions WHERE user_id = target_user_id);

  DELETE FROM public.exam_sessions WHERE user_id = target_user_id;
  DELETE FROM public.exam_attempts WHERE user_id = target_user_id;

  -- 6. Eliminar intentos y progreso de cuestionarios
  DELETE FROM public.quiz_attempts WHERE user_id = target_user_id;
  DELETE FROM public.user_question_progress WHERE user_id = target_user_id;

  -- 7. Eliminar inscripciones a talleres y suscripciones
  DELETE FROM public.workshop_registrations WHERE user_id = target_user_id;
  DELETE FROM public.subscriptions WHERE user_id = target_user_id;

  -- 8. Eliminar roles
  DELETE FROM public.user_roles WHERE user_id = target_user_id;

  -- 9. Eliminar perfil público
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- 10. Eliminar cuenta de autenticación en auth.users
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;

