-- Duda y discusión contextual para talleres y clases en vivo/grabadas
-- Reutiliza student_qa_threads y student_qa_replies con soporte para workshop_id y video_second

-- ─── 1. Columnas e índices ───────────────────────────────────────────────────

ALTER TABLE public.student_qa_threads
  ADD COLUMN IF NOT EXISTS workshop_id uuid REFERENCES public.live_workshops(id) ON DELETE CASCADE;

ALTER TABLE public.student_qa_threads
  ADD COLUMN IF NOT EXISTS video_second integer;

ALTER TABLE public.student_qa_threads
  DROP CONSTRAINT IF EXISTS student_qa_threads_video_second_chk;

ALTER TABLE public.student_qa_threads
  ADD CONSTRAINT student_qa_threads_video_second_chk
  CHECK (video_second IS NULL OR (video_second >= 0 AND video_second <= 86400));

CREATE INDEX IF NOT EXISTS student_qa_threads_workshop_cohort_idx
  ON public.student_qa_threads (workshop_id, created_at DESC)
  WHERE visibility = 'cohort';

CREATE INDEX IF NOT EXISTS student_qa_threads_workshop_open_idx
  ON public.student_qa_threads (workshop_id, created_at DESC)
  WHERE visibility = 'cohort' AND status = 'open';

-- ─── 2. Directorio acotado de autores por taller ──────────────────────────────

CREATE OR REPLACE FUNCTION public.workshop_discussion_directory(p_workshop_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  is_staff boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  IF NOT (
    public.is_enrolled_physician(auth.uid())
    OR public.is_admin()
    OR public.is_editor()
    OR EXISTS (
      SELECT 1 FROM public.workshop_registrations wr
      WHERE wr.workshop_id = p_workshop_id AND wr.user_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  IF p_workshop_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    COALESCE(NULLIF(trim(p.display_name), ''), 'Médico'),
    public.is_editor(p.id)
  FROM public.profiles p
  WHERE p.id IN (
    SELECT t.student_id
    FROM public.student_qa_threads t
    WHERE t.workshop_id = p_workshop_id
      AND t.visibility = 'cohort'
    UNION
    SELECT r.author_id
    FROM public.student_qa_replies r
    JOIN public.student_qa_threads t ON t.id = r.thread_id
    WHERE t.workshop_id = p_workshop_id
      AND t.visibility = 'cohort'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.workshop_discussion_directory(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.workshop_discussion_directory(uuid) TO authenticated;

-- ─── 3. Refinar políticas RLS para registro a talleres ───────────────────────

DROP POLICY IF EXISTS qa_student_own ON public.student_qa_threads;
CREATE POLICY qa_student_own ON public.student_qa_threads
  FOR SELECT USING (
    student_id = auth.uid()
    OR public.is_admin()
    OR public.is_editor()
    OR (
      visibility = 'cohort'
      AND (
        public.is_enrolled_physician(auth.uid())
        OR (
          workshop_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.workshop_registrations wr
            WHERE wr.workshop_id = student_qa_threads.workshop_id
              AND wr.user_id = auth.uid()
          )
        )
      )
    )
  );

DROP POLICY IF EXISTS qa_replies_select ON public.student_qa_replies;
CREATE POLICY qa_replies_select ON public.student_qa_replies
  FOR SELECT USING (
    author_id = auth.uid()
    OR public.is_admin()
    OR public.is_editor()
    OR EXISTS (
      SELECT 1 FROM public.student_qa_threads t
      WHERE t.id = thread_id
        AND (
          t.student_id = auth.uid()
          OR (
            t.visibility = 'cohort'
            AND (
              public.is_enrolled_physician(auth.uid())
              OR (
                t.workshop_id IS NOT NULL
                AND EXISTS (
                  SELECT 1 FROM public.workshop_registrations wr
                  WHERE wr.workshop_id = t.workshop_id
                    AND wr.user_id = auth.uid()
                )
              )
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS qa_replies_insert ON public.student_qa_replies;
CREATE POLICY qa_replies_insert ON public.student_qa_replies
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
    AND (
      public.is_admin()
      OR public.is_editor()
      OR EXISTS (
        SELECT 1 FROM public.student_qa_threads t
        WHERE t.id = thread_id
          AND (
            t.student_id = auth.uid()
            OR (
              t.visibility = 'cohort'
              AND (
                public.is_enrolled_physician(auth.uid())
                OR (
                  t.workshop_id IS NOT NULL
                  AND EXISTS (
                    SELECT 1 FROM public.workshop_registrations wr
                    WHERE wr.workshop_id = t.workshop_id
                      AND wr.user_id = auth.uid()
                  )
                )
              )
            )
          )
      )
    )
  );

-- ─── 4. Notificaciones de respuestas en talleres ─────────────────────────────

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
  v_title text;
BEGIN
  IF TG_TABLE_NAME = 'student_qa_threads' THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_thread FROM public.student_qa_threads WHERE id = NEW.thread_id;
  IF v_thread.id IS NULL OR v_thread.visibility IS DISTINCT FROM 'cohort' THEN
    RETURN NEW;
  END IF;

  v_author := NEW.author_id;
  v_owner := v_thread.student_id;
  v_message := left(NEW.body, 160);
  v_source := 'topic_reply:' || NEW.id::text;

  IF v_thread.workshop_id IS NOT NULL THEN
    v_page_url := COALESCE(NULLIF(v_thread.page_url, ''), '/taller/' || v_thread.workshop_id::text || '#clase-comentarios');
    v_title := 'Nueva respuesta en clase grabada';
  ELSE
    v_page_url := COALESCE(NULLIF(v_thread.page_url, ''), '/portal');
    v_title := 'Nueva respuesta en el tema';
  END IF;

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
      v_title,
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

-- ─── 5. Actualizar list_staff_inbox con contexto de taller ───────────────────

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
      AND n.type = 'topic_comment'
      AND n.is_read = false
  ) items
  ORDER BY items.waiting_since DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.list_staff_inbox() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_staff_inbox() TO authenticated;

