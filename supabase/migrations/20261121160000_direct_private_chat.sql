-- ============================================================================
-- Canal de Comunicación Directa (Chat Privado 1:1 Profesor <-> Estudiante / Aspirante)
-- Soporta alumnos activos, alumnos en riesgo y aspirantes en espera de aprobación
-- ============================================================================

-- 1. Asegurar índices para consultas rápidas de hilos de chat directo (__direct_chat__)
CREATE INDEX IF NOT EXISTS idx_student_qa_threads_direct_chat_student
  ON public.student_qa_threads (student_id, updated_at DESC)
  WHERE module_id = '__direct_chat__';

CREATE INDEX IF NOT EXISTS idx_student_qa_threads_direct_chat_open
  ON public.student_qa_threads (status, updated_at DESC)
  WHERE module_id = '__direct_chat__';

CREATE INDEX IF NOT EXISTS idx_student_qa_replies_thread_created
  ON public.student_qa_replies (thread_id, created_at ASC);

-- 2. Habilitar Realtime en student_qa_threads y student_qa_replies para chat en vivo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'student_qa_threads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.student_qa_threads;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'student_qa_replies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.student_qa_replies;
  END IF;
END $$;

-- 3. Trigger para notificaciones en tiempo real de mensajes de chat directo
CREATE OR REPLACE FUNCTION public.notify_direct_chat_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_thread public.student_qa_threads;
  v_is_staff_author boolean;
  v_author_name text;
  v_student_name text;
  v_message_preview text;
  v_staff_uid uuid;
BEGIN
  SELECT * INTO v_thread
  FROM public.student_qa_threads
  WHERE id = NEW.thread_id;

  IF v_thread.id IS NULL OR COALESCE(v_thread.module_id, '') <> '__direct_chat__' THEN
    RETURN NEW;
  END IF;

  v_is_staff_author := public.is_admin(NEW.author_id) OR public.is_editor(NEW.author_id);
  v_message_preview := left(btrim(COALESCE(NEW.body, '')), 180);

  -- Actualizar estado y resumen del hilo padre
  UPDATE public.student_qa_threads
  SET
    body = CASE WHEN v_message_preview <> '' THEN v_message_preview ELSE body END,
    status = CASE WHEN v_is_staff_author THEN 'answered' ELSE 'open' END,
    updated_at = now()
  WHERE id = v_thread.id;

  SELECT COALESCE(NULLIF(btrim(p.display_name), ''), 'Dirección Académica')
  INTO v_author_name
  FROM public.profiles p
  WHERE p.id = NEW.author_id;

  SELECT COALESCE(NULLIF(btrim(p.display_name), ''), 'Médico aspirante')
  INTO v_student_name
  FROM public.profiles p
  WHERE p.id = v_thread.student_id;

  IF v_is_staff_author THEN
    -- Si el profesor envía mensaje al alumno (activo o en espera de aprobación)
    IF v_thread.student_id IS DISTINCT FROM NEW.author_id THEN
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
      ) VALUES (
        v_thread.student_id,
        '💬 Mensaje de ' || COALESCE(v_author_name, 'Dirección Académica'),
        v_message_preview,
        'direct_message',
        CASE WHEN COALESCE(v_thread.topic_id, '') = 'at_risk' THEN 'warning' ELSE 'info' END,
        '/portal?chat=1',
        'direct_chat:' || NEW.id::text,
        false,
        true
      )
      ON CONFLICT (user_id, source_key) DO NOTHING;
    END IF;
  ELSE
    -- Si el alumno o aspirante envía mensaje al profesor / dirección
    FOR v_staff_uid IN
      SELECT DISTINCT ur.user_id
      FROM public.user_roles ur
      WHERE ur.role IN ('admin', 'editor')
        AND ur.user_id IS DISTINCT FROM NEW.author_id
    LOOP
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
      ) VALUES (
        v_staff_uid,
        '💬 Mensaje directo de ' || COALESCE(v_student_name, 'Estudiante'),
        v_message_preview,
        'direct_message',
        'info',
        '/admin/mensajes?student=' || v_thread.student_id::text,
        'direct_chat_staff:' || NEW.id::text,
        false,
        true
      )
      ON CONFLICT (user_id, source_key) DO NOTHING;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_direct_chat_message() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_notify_direct_chat_reply ON public.student_qa_replies;
CREATE TRIGGER trg_notify_direct_chat_reply
  AFTER INSERT ON public.student_qa_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_direct_chat_message();

-- 4. Actualizar list_staff_inbox para incluir mensajes privados directos sin responder
CREATE OR REPLACE FUNCTION public.list_staff_inbox()
RETURNS TABLE (
  source_key text,
  kind text,
  title text,
  message text,
  actor_name text,
  context_label text,
  link_url text,
  action_required boolean,
  waiting_since timestamptz,
  due_at timestamptz,
  assignment_priority text,
  is_resubmission boolean,
  topic_has_session_soon boolean,
  is_read boolean,
  notification_id uuid
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR NOT (public.is_admin(v_uid) OR public.is_editor(v_uid)) THEN
    RAISE EXCEPTION 'Solo el personal docente puede leer la bandeja.';
  END IF;

  RETURN QUERY
  WITH staff AS (
    SELECT ur.user_id
    FROM public.user_roles ur
    WHERE ur.role IN ('admin', 'editor')
  ),
  last_reply AS (
    SELECT DISTINCT ON (r.thread_id)
      r.thread_id,
      r.author_id,
      r.created_at,
      r.body
    FROM public.student_qa_replies r
    ORDER BY r.thread_id, r.created_at DESC
  )
  SELECT * FROM (
    SELECT
      'assignment_retake:' || sa.id::text AS source_key,
      'retake'::text AS kind,
      'Reintento de examen'::text AS title,
      left(COALESCE(sa.target_exam_config->>'retakeReason', sa.title), 160) AS message,
      COALESCE(p.display_name, 'Médico cursista') AS actor_name,
      sa.title AS context_label,
      '/admin/alumnos/tareas'::text AS link_url,
      true AS action_required,
      COALESCE(
        NULLIF(sa.target_exam_config->>'retakeRequestedAt', '')::timestamptz,
        sa.updated_at,
        sa.created_at
      ) AS waiting_since,
      sa.due_date AS due_at,
      sa.priority AS assignment_priority,
      false AS is_resubmission,
      false AS topic_has_session_soon,
      false AS is_read,
      NULL::uuid AS notification_id
    FROM public.student_assignments sa
    LEFT JOIN public.profiles p ON p.id = sa.student_id
    WHERE COALESCE(sa.target_exam_config->>'retakeStatus', 'none') = 'requested'

    UNION ALL

    SELECT
      'assignment_submit:' || sa.id::text,
      'submission'::text,
      CASE WHEN sa.reviewed_at IS NOT NULL THEN 'Reentrega por calificar' ELSE 'Entrega por calificar' END,
      left(COALESCE(sa.student_notes, sa.title), 160),
      COALESCE(p.display_name, 'Médico cursista'),
      sa.title,
      '/admin/alumnos/tareas'::text,
      true,
      COALESCE(sa.submitted_at, sa.updated_at, sa.created_at),
      sa.due_date,
      sa.priority,
      sa.reviewed_at IS NOT NULL,
      false,
      false,
      NULL::uuid
    FROM public.student_assignments sa
    LEFT JOIN public.profiles p ON p.id = sa.student_id
    WHERE sa.status = 'submitted'
      AND COALESCE(sa.target_exam_config->>'retakeStatus', 'none') IS DISTINCT FROM 'requested'

    UNION ALL

    SELECT
      'question:' || t.id::text,
      'question'::text,
      'Duda sin respuesta'::text,
      left(COALESCE(lr.body, t.body), 160),
      COALESCE(p.display_name, 'Médico cursista'),
      COALESCE(w_th.title, NULLIF(t.title, ''), t.topic_id, 'Tema'),
      COALESCE(
        NULLIF(t.page_url, ''),
        CASE
          WHEN t.workshop_id IS NOT NULL THEN '/taller/' || t.workshop_id::text || '#clase-comentarios'
          ELSE '/modulo/' || COALESCE(t.module_id, '') || '/' || COALESCE(t.topic_id, '')
        END
      ),
      true,
      COALESCE(lr.created_at, t.created_at),
      NULL::timestamptz,
      NULL::text,
      false,
      EXISTS (
        SELECT 1
        FROM public.live_workshops w
        WHERE w.topic_id IS NOT NULL
          AND w.topic_id = t.topic_id
          AND w.status IN ('scheduled', 'live')
          AND w.scheduled_at <= now() + interval '24 hours'
          AND (w.status = 'live' OR w.scheduled_at >= now() - interval '30 minutes')
      ),
      false,
      NULL::uuid
    FROM public.student_qa_threads t
    LEFT JOIN public.live_workshops w_th ON w_th.id = t.workshop_id
    LEFT JOIN last_reply lr ON lr.thread_id = t.id
    LEFT JOIN public.profiles p ON p.id = t.student_id
    WHERE t.visibility = 'cohort'
      AND t.status = 'open'
      AND (
        lr.thread_id IS NULL
        OR NOT EXISTS (SELECT 1 FROM staff s WHERE s.user_id = lr.author_id)
      )

    UNION ALL

    -- Mensajes privados directos de alumnos o aspirantes en espera de admisión
    SELECT
      'direct_chat:' || t.student_id::text,
      'question'::text,
      'Mensaje privado directo'::text,
      left(COALESCE(lr.body, t.body), 160),
      COALESCE(p.display_name, 'Médico / Aspirante'),
      CASE
        WHEN COALESCE(p.enrollment_status, 'pending') <> 'approved' THEN 'En espera de admisión'
        WHEN COALESCE(t.topic_id, '') = 'at_risk' THEN 'Alumno en seguimiento'
        ELSE 'Chat directo privado'
      END,
      '/admin/mensajes?student=' || t.student_id::text,
      true,
      COALESCE(lr.created_at, t.updated_at, t.created_at),
      NULL::timestamptz,
      NULL::text,
      false,
      false,
      false,
      NULL::uuid
    FROM public.student_qa_threads t
    LEFT JOIN last_reply lr ON lr.thread_id = t.id
    LEFT JOIN public.profiles p ON p.id = t.student_id
    WHERE t.module_id = '__direct_chat__'
      AND t.status = 'open'
      AND (
        lr.thread_id IS NULL
        OR NOT EXISTS (SELECT 1 FROM staff s WHERE s.user_id = lr.author_id)
      )

    UNION ALL

    SELECT
      'admission_course:' || ce.id::text,
      'admission'::text,
      'Solicitud de admisión'::text,
      left(COALESCE(ce.request_notes, c.title, 'Curso'), 160),
      COALESCE(p.display_name, 'Médico solicitante'),
      COALESCE(c.title, ce.course_id),
      '/admin/admisiones'::text,
      true,
      COALESCE(ce.requested_at, ce.created_at),
      NULL::timestamptz,
      NULL::text,
      false,
      false,
      false,
      NULL::uuid
    FROM public.course_enrollments ce
    LEFT JOIN public.profiles p ON p.id = ce.user_id
    LEFT JOIN public.courses c ON c.id = ce.course_id
    WHERE ce.status = 'pending'

    UNION ALL

    SELECT
      'admission_profile:' || p.id::text,
      'admission'::text,
      'Perfil pendiente de admisión'::text,
      'Solicitud de acceso a la plataforma',
      COALESCE(p.display_name, 'Médico solicitante'),
      'Perfil',
      '/admin/admisiones'::text,
      true,
      p.created_at,
      NULL::timestamptz,
      NULL::text,
      false,
      false,
      false,
      NULL::uuid
    FROM public.profiles p
    WHERE p.enrollment_status = 'pending'
      AND NOT EXISTS (
        SELECT 1
        FROM public.course_enrollments ce
        WHERE ce.user_id = p.id AND ce.status = 'pending'
      )

    UNION ALL

    SELECT
      'quiz:' || q.id::text,
      'quiz'::text,
      'Quiz por validar'::text,
      left(COALESCE(q.title, q.topic_id), 160),
      NULL::text,
      COALESCE(q.title, q.topic_id),
      '/admin/quizzes'::text,
      true,
      COALESCE(q.published_at, now()),
      NULL::timestamptz,
      NULL::text,
      false,
      false,
      false,
      NULL::uuid
    FROM public.published_quizzes q
    WHERE COALESCE(q.clinical_validation_status, 'pending_review') = 'pending_review'

    UNION ALL

    SELECT
      'revision:' || r.id::text,
      'editorial'::text,
      'Tema por aprobar'::text,
      left(COALESCE(r.payload->>'title', r.target_topic_id, r.module_id), 160),
      NULL::text,
      COALESCE(r.payload->>'title', r.target_topic_id, r.module_id),
      '/admin/revisiones'::text,
      true,
      COALESCE(r.submitted_at, r.created_at),
      NULL::timestamptz,
      NULL::text,
      false,
      false,
      false,
      NULL::uuid
    FROM public.content_revisions r
    WHERE r.status = 'pending_review'

    UNION ALL

    SELECT
      'notice:' || n.id::text,
      'reply'::text,
      n.title,
      n.message,
      'Sistema de dudas',
      n.title,
      COALESCE(NULLIF(n.link_url, ''), '/admin'),
      false,
      n.created_at,
      NULL::timestamptz,
      NULL::text,
      false,
      false,
      n.is_read,
      n.id
    FROM public.student_notifications n
    WHERE n.user_id = v_uid
      AND n.type IN ('topic_comment', 'direct_message')
      AND n.is_read = false
  ) items
  ORDER BY items.waiting_since DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.list_staff_inbox() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_staff_inbox() TO authenticated;
