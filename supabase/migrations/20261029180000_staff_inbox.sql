-- Bandeja priorizada del profesor: una RPC lee las tablas vivas.
-- Las respuestas siguen en student_notifications; las dudas abiertas no se duplican ahí.

ALTER TABLE public.student_notifications
  DROP CONSTRAINT IF EXISTS student_notifications_severity_check;

ALTER TABLE public.student_notifications
  ADD CONSTRAINT student_notifications_severity_check
  CHECK (severity IN ('info', 'success', 'warning', 'urgent'));

ALTER TABLE public.student_notifications
  ADD COLUMN IF NOT EXISTS action_required BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_student_notifications_user_unread
  ON public.student_notifications (user_id, type, created_at DESC)
  WHERE is_read = false;

UPDATE public.student_notifications n
SET is_read = true
FROM public.user_roles ur
WHERE n.user_id = ur.user_id
  AND ur.role IN ('admin', 'editor')
  AND n.title = 'Nueva duda en el tema'
  AND n.is_read = false;

CREATE OR REPLACE FUNCTION public.notify_topic_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author uuid;
  v_page_url text;
  v_message text;
  v_source text;
  v_thread public.student_qa_threads;
  v_staff uuid;
  v_owner uuid;
BEGIN
  IF TG_TABLE_NAME = 'student_qa_threads' THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_thread FROM public.student_qa_threads WHERE id = NEW.thread_id;
  IF v_thread.id IS NULL OR v_thread.visibility IS DISTINCT FROM 'cohort' THEN
    RETURN NEW;
  END IF;

  v_author := NEW.author_id;
  v_page_url := COALESCE(NULLIF(v_thread.page_url, ''), '/portal');
  v_message := left(NEW.body, 160);
  v_source := 'topic_reply:' || NEW.id::text;
  v_owner := v_thread.student_id;

  FOR v_staff IN
    SELECT DISTINCT ur.user_id
    FROM public.user_roles ur
    WHERE ur.role IN ('admin', 'editor')
      AND ur.user_id IS DISTINCT FROM v_author
  LOOP
    INSERT INTO public.student_notifications (
      user_id, title, message, type, severity, link_url, source_key, action_required
    ) VALUES (
      v_staff,
      'Nueva respuesta en el tema',
      v_message,
      'topic_comment',
      'info',
      v_page_url,
      v_source,
      false
    )
    ON CONFLICT (user_id, source_key) DO NOTHING;
  END LOOP;

  IF v_owner IS DISTINCT FROM v_author
     AND NOT EXISTS (
       SELECT 1
       FROM public.user_roles ur
       WHERE ur.user_id = v_owner
         AND ur.role IN ('admin', 'editor')
     )
  THEN
    INSERT INTO public.student_notifications (
      user_id, title, message, type, severity, link_url, source_key, action_required
    ) VALUES (
      v_owner,
      'Respondieron tu duda',
      v_message,
      'topic_comment',
      'info',
      v_page_url,
      v_source || ':author',
      false
    )
    ON CONFLICT (user_id, source_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_topic_comment() FROM PUBLIC, anon, authenticated;

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
      COALESCE(NULLIF(t.title, ''), t.topic_id, 'Tema'),
      COALESCE(NULLIF(t.page_url, ''), '/modulo/' || COALESCE(t.module_id, '') || '/' || COALESCE(t.topic_id, '')),
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
    LEFT JOIN last_reply lr ON lr.thread_id = t.id
    LEFT JOIN public.profiles p ON p.id = t.student_id
    WHERE t.visibility = 'cohort'
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
      n.source_key,
      'reply'::text,
      n.title,
      n.message,
      NULL::text,
      'Comentario de tema',
      COALESCE(n.link_url, '/portal'),
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
      AND n.type = 'topic_comment'
      AND n.is_read = false
      AND n.title IS DISTINCT FROM 'Nueva duda en el tema'
  ) inbox
  ORDER BY inbox.waiting_since ASC NULLS LAST
  LIMIT 60;
END;
$$;

REVOKE ALL ON FUNCTION public.list_staff_inbox() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_staff_inbox() TO authenticated;
