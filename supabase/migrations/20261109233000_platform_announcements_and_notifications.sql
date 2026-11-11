-- ============================================================================
-- Sistema Integral de Anuncios de Plataforma, Notificaciones In-App y Web Push
-- ============================================================================

-- 1. Asegurar permisos completos en push_subscriptions (faltaba UPDATE para upsert)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;

-- RPC seguro para guardar suscripción Web Push incluso si el navegador cambió de usuario
CREATE OR REPLACE FUNCTION public.save_my_push_subscription(
  p_endpoint TEXT,
  p_p256dh TEXT,
  p_auth TEXT,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión para registrar notificaciones push.';
  END IF;

  IF p_endpoint IS NULL OR btrim(p_endpoint) = '' THEN
    RAISE EXCEPTION 'Endpoint de suscripción inválido.';
  END IF;

  INSERT INTO public.push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
  VALUES (v_uid, btrim(p_endpoint), p_p256dh, p_auth, p_user_agent)
  ON CONFLICT (endpoint) DO UPDATE
    SET user_id = EXCLUDED.user_id,
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        user_agent = COALESCE(EXCLUDED.user_agent, public.push_subscriptions.user_agent),
        created_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.save_my_push_subscription(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_my_push_subscription(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- 2. Sincronizar talleres que ya tienen grabación o cuya fecha ya pasó a estado 'completed'
UPDATE public.live_workshops
SET status = 'completed',
    updated_at = now()
WHERE status = 'scheduled'
  AND (
    (recording_url IS NOT NULL AND btrim(recording_url) <> '')
    OR (scheduled_at IS NOT NULL AND scheduled_at + (COALESCE(duration_minutes, 90) || ' minutes')::interval < now())
  );

-- 3. Tabla Maestra de Anuncios y Emisiones de la Plataforma
CREATE TABLE IF NOT EXISTS public.platform_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('general', 'taller', 'evaluacion', 'aviso', 'recordatorio')),
  severity TEXT NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'success', 'warning', 'urgent')),
  target_scope TEXT NOT NULL DEFAULT 'all_students'
    CHECK (target_scope IN ('all_students', 'course', 'workshop', 'individual', 'staff')),
  target_course_id TEXT,
  target_workshop_id UUID REFERENCES public.live_workshops(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_url TEXT NOT NULL DEFAULT '/portal',
  action_required BOOLEAN NOT NULL DEFAULT false,
  send_push BOOLEAN NOT NULL DEFAULT true,
  recipients_count INT NOT NULL DEFAULT 0,
  push_sent_count INT NOT NULL DEFAULT 0,
  push_failed_count INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_announcements_created
  ON public.platform_announcements (created_at DESC);

ALTER TABLE public.platform_announcements ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_announcements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_notifications TO authenticated;

DROP POLICY IF EXISTS "platform_announcements_select" ON public.platform_announcements;
CREATE POLICY "platform_announcements_select" ON public.platform_announcements
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "platform_announcements_manage_staff" ON public.platform_announcements;
CREATE POLICY "platform_announcements_manage_staff" ON public.platform_announcements
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.is_editor())
  WITH CHECK (public.is_admin() OR public.is_editor());

DROP POLICY IF EXISTS "student_notifications_insert_staff" ON public.student_notifications;
CREATE POLICY "student_notifications_insert_staff" ON public.student_notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.is_editor() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "student_notifications_delete_staff" ON public.student_notifications;
CREATE POLICY "student_notifications_delete_staff" ON public.student_notifications
  FOR DELETE TO authenticated
  USING (public.is_admin() OR public.is_editor() OR auth.uid() = user_id);

-- 4. RPC Transaccional para publicar un anuncio y distribuirlo a student_notifications
CREATE OR REPLACE FUNCTION public.publish_platform_announcement(
  p_title TEXT,
  p_message TEXT,
  p_category TEXT DEFAULT 'general',
  p_severity TEXT DEFAULT 'info',
  p_target_scope TEXT DEFAULT 'all_students',
  p_target_course_id TEXT DEFAULT NULL,
  p_target_workshop_id UUID DEFAULT NULL,
  p_target_user_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT '/portal',
  p_action_required BOOLEAN DEFAULT false,
  p_send_push BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_announcement_id UUID;
  v_recipient_ids UUID[];
  v_recipients_count INT := 0;
  v_clean_title TEXT := btrim(COALESCE(p_title, ''));
  v_clean_message TEXT := btrim(COALESCE(p_message, ''));
  v_clean_url TEXT := COALESCE(NULLIF(btrim(p_action_url), ''), '/portal');
BEGIN
  IF v_uid IS NULL OR NOT (public.is_admin() OR public.is_editor()) THEN
    RAISE EXCEPTION 'Solo administradores o docentes pueden emitir anuncios.';
  END IF;

  IF v_clean_title = '' OR v_clean_message = '' THEN
    RAISE EXCEPTION 'El título y el mensaje del anuncio son obligatorios.';
  END IF;

  -- Resolver destinatarios según el alcance seleccionado
  IF p_target_scope = 'individual' AND p_target_user_id IS NOT NULL THEN
    v_recipient_ids := ARRAY[p_target_user_id];
  ELSIF p_target_scope = 'course' AND p_target_course_id IS NOT NULL AND btrim(p_target_course_id) <> '' THEN
    SELECT ARRAY_AGG(DISTINCT ce.user_id)
    INTO v_recipient_ids
    FROM public.course_enrollments ce
    WHERE ce.course_id = btrim(p_target_course_id)
      AND ce.status = 'active';
  ELSIF p_target_scope = 'workshop' AND p_target_workshop_id IS NOT NULL THEN
    SELECT ARRAY_AGG(DISTINCT wr.user_id)
    INTO v_recipient_ids
    FROM public.workshop_registrations wr
    WHERE wr.workshop_id = p_target_workshop_id;

    -- Si nadie se ha pre-registrado individualmente al taller, enviar a toda la cohorte activa
    IF v_recipient_ids IS NULL OR array_length(v_recipient_ids, 1) IS NULL THEN
      SELECT ARRAY_AGG(DISTINCT p.id)
      INTO v_recipient_ids
      FROM public.profiles p
      WHERE NOT EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = p.id AND ur.role IN ('admin', 'editor')
      );
    END IF;
  ELSIF p_target_scope = 'staff' THEN
    SELECT ARRAY_AGG(DISTINCT ur.user_id)
    INTO v_recipient_ids
    FROM public.user_roles ur
    WHERE ur.role IN ('admin', 'editor');
  ELSE
    -- 'all_students': todos los perfiles de alumnos (más el propio emisor si desea verificar en vista alumno)
    SELECT ARRAY_AGG(DISTINCT p.id)
    INTO v_recipient_ids
    FROM public.profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = p.id AND ur.role IN ('admin', 'editor')
    );
  END IF;

  v_recipients_count := COALESCE(array_length(v_recipient_ids, 1), 0);

  -- Insertar registro maestro del anuncio
  INSERT INTO public.platform_announcements (
    title,
    message,
    category,
    severity,
    target_scope,
    target_course_id,
    target_workshop_id,
    target_user_id,
    action_url,
    action_required,
    send_push,
    recipients_count,
    created_by
  )
  VALUES (
    v_clean_title,
    v_clean_message,
    p_category,
    p_severity,
    p_target_scope,
    NULLIF(btrim(COALESCE(p_target_course_id, '')), ''),
    p_target_workshop_id,
    p_target_user_id,
    v_clean_url,
    COALESCE(p_action_required, false),
    COALESCE(p_send_push, true),
    v_recipients_count,
    v_uid
  )
  RETURNING id INTO v_announcement_id;

  -- Distribuir notificaciones in-app en student_notifications (dispara Supabase Realtime a cada alumno)
  IF v_recipients_count > 0 THEN
    INSERT INTO public.student_notifications (
      user_id,
      title,
      message,
      type,
      severity,
      link_url,
      source_key,
      is_read,
      action_required
    )
    SELECT
      u_id,
      v_clean_title,
      v_clean_message,
      'announcement_' || p_category,
      p_severity,
      v_clean_url,
      'announcement:' || v_announcement_id::text,
      false,
      COALESCE(p_action_required, false)
    FROM UNNEST(v_recipient_ids) AS u_id
    ON CONFLICT (user_id, source_key) DO UPDATE
      SET title = EXCLUDED.title,
          message = EXCLUDED.message,
          severity = EXCLUDED.severity,
          link_url = EXCLUDED.link_url,
          is_read = false,
          created_at = now();
  END IF;

  RETURN jsonb_build_object(
    'announcement_id', v_announcement_id,
    'recipients_count', v_recipients_count,
    'recipient_ids', COALESCE(to_jsonb(v_recipient_ids), '[]'::jsonb)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.publish_platform_announcement(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, UUID, TEXT, BOOLEAN, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_platform_announcement(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, UUID, TEXT, BOOLEAN, BOOLEAN) TO authenticated;

-- 5. RPC para consultar historial de anuncios con métricas de lectura en vivo
CREATE OR REPLACE FUNCTION public.list_platform_announcements_with_stats(p_limit INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  title TEXT,
  message TEXT,
  category TEXT,
  severity TEXT,
  target_scope TEXT,
  target_course_id TEXT,
  target_workshop_id UUID,
  workshop_title TEXT,
  target_user_id UUID,
  target_user_name TEXT,
  action_url TEXT,
  action_required BOOLEAN,
  send_push BOOLEAN,
  recipients_count INT,
  read_count INT,
  push_sent_count INT,
  push_failed_count INT,
  created_by UUID,
  author_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_admin() OR public.is_editor()) THEN
    RAISE EXCEPTION 'No autorizado.';
  END IF;

  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.message,
    a.category,
    a.severity,
    a.target_scope,
    a.target_course_id,
    a.target_workshop_id,
    w.title AS workshop_title,
    a.target_user_id,
    tp.display_name AS target_user_name,
    a.action_url,
    a.action_required,
    a.send_push,
    GREATEST(a.recipients_count, COALESCE(stats.total_notifs, 0))::INT AS recipients_count,
    COALESCE(stats.read_notifs, 0)::INT AS read_count,
    a.push_sent_count,
    a.push_failed_count,
    a.created_by,
    COALESCE(ap.display_name, 'Dirección Académica') AS author_name,
    a.created_at
  FROM public.platform_announcements a
  LEFT JOIN public.live_workshops w ON w.id = a.target_workshop_id
  LEFT JOIN public.profiles tp ON tp.id = a.target_user_id
  LEFT JOIN public.profiles ap ON ap.id = a.created_by
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) AS total_notifs,
      COUNT(*) FILTER (WHERE sn.is_read = true) AS read_notifs
    FROM public.student_notifications sn
    WHERE sn.source_key = 'announcement:' || a.id::text
  ) stats ON true
  ORDER BY a.created_at DESC
  LIMIT COALESCE(p_limit, 50);
END;
$$;

REVOKE ALL ON FUNCTION public.list_platform_announcements_with_stats(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_platform_announcements_with_stats(INT) TO authenticated;

-- 6. RPC para eliminar un anuncio y retirar sus notificaciones in-app asociadas
CREATE OR REPLACE FUNCTION public.delete_platform_announcement(p_announcement_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_admin() OR public.is_editor()) THEN
    RAISE EXCEPTION 'No autorizado.';
  END IF;

  DELETE FROM public.student_notifications
  WHERE source_key = 'announcement:' || p_announcement_id::text;

  DELETE FROM public.platform_announcements
  WHERE id = p_announcement_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_platform_announcement(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_platform_announcement(UUID) TO authenticated;

-- 7. RPC para obtener estadísticas globales de dispositivos suscritos a Web Push
CREATE OR REPLACE FUNCTION public.get_push_subscription_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_subs INT;
  v_unique_users INT;
  v_student_subs INT;
BEGIN
  IF NOT (public.is_admin() OR public.is_editor()) THEN
    RAISE EXCEPTION 'No autorizado.';
  END IF;

  SELECT
    COUNT(*)::INT,
    COUNT(DISTINCT ps.user_id)::INT,
    COUNT(DISTINCT ps.user_id) FILTER (
      WHERE NOT EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = ps.user_id AND ur.role IN ('admin', 'editor')
      )
    )::INT
  INTO v_total_subs, v_unique_users, v_student_subs
  FROM public.push_subscriptions ps;

  RETURN jsonb_build_object(
    'total_devices', COALESCE(v_total_subs, 0),
    'unique_users', COALESCE(v_unique_users, 0),
    'student_users', COALESCE(v_student_subs, 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_push_subscription_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_push_subscription_stats() TO authenticated;

