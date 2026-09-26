-- Conversación por tema: índice, enlace de la lección, directorio acotado de
-- autores, avisos inmediatos a profesores y borrado de dudas/respuestas.

-- ─── 1. Columna e índices ────────────────────────────────────────────────────

ALTER TABLE public.student_qa_threads
  ADD COLUMN IF NOT EXISTS page_url text;

ALTER TABLE public.student_qa_threads
  DROP CONSTRAINT IF EXISTS student_qa_threads_page_url_len;

ALTER TABLE public.student_qa_threads
  ADD CONSTRAINT student_qa_threads_page_url_len
  CHECK (page_url IS NULL OR char_length(page_url) <= 500);

CREATE INDEX IF NOT EXISTS student_qa_threads_topic_cohort_idx
  ON public.student_qa_threads (topic_id, created_at DESC)
  WHERE visibility = 'cohort';

CREATE INDEX IF NOT EXISTS student_qa_threads_open_cohort_idx
  ON public.student_qa_threads (created_at DESC)
  WHERE visibility = 'cohort' AND status = 'open';

-- ─── 2. Directorio de autores (sin abrir profiles) ───────────────────────────

CREATE OR REPLACE FUNCTION public.topic_discussion_directory(p_topic_id text)
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
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  IF p_topic_id IS NULL OR length(trim(p_topic_id)) = 0 THEN
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
    WHERE t.topic_id = p_topic_id
      AND t.visibility = 'cohort'
    UNION
    SELECT r.author_id
    FROM public.student_qa_replies r
    JOIN public.student_qa_threads t ON t.id = r.thread_id
    WHERE t.topic_id = p_topic_id
      AND t.visibility = 'cohort'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.topic_discussion_directory(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.topic_discussion_directory(text) TO authenticated;

-- ─── 3. Borrado de hilos y respuestas ────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_qa_threads TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.student_qa_replies TO authenticated;

DROP POLICY IF EXISTS qa_replies_delete ON public.student_qa_replies;
CREATE POLICY qa_replies_delete ON public.student_qa_replies
  FOR DELETE USING (
    author_id = auth.uid()
    OR public.is_admin()
    OR public.is_editor()
  );

-- ─── 4. Aviso inmediato a profesores (y al autor si responden) ───────────────

CREATE OR REPLACE FUNCTION public.notify_topic_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author uuid;
  v_page_url text;
  v_title text;
  v_message text;
  v_source text;
  v_thread public.student_qa_threads;
  v_staff uuid;
  v_owner uuid;
BEGIN
  IF TG_TABLE_NAME = 'student_qa_threads' THEN
    IF NEW.visibility IS DISTINCT FROM 'cohort' THEN
      RETURN NEW;
    END IF;
    v_author := NEW.student_id;
    v_page_url := COALESCE(NULLIF(NEW.page_url, ''), '/portal');
    v_title := 'Nueva duda en el tema';
    v_message := left(NEW.body, 160);
    v_source := 'topic_comment:' || NEW.id::text;
    v_owner := NEW.student_id;
  ELSE
    SELECT * INTO v_thread FROM public.student_qa_threads WHERE id = NEW.thread_id;
    IF v_thread.id IS NULL OR v_thread.visibility IS DISTINCT FROM 'cohort' THEN
      RETURN NEW;
    END IF;
    v_author := NEW.author_id;
    v_page_url := COALESCE(NULLIF(v_thread.page_url, ''), '/portal');
    v_title := 'Nueva respuesta en el tema';
    v_message := left(NEW.body, 160);
    v_source := 'topic_comment:' || NEW.id::text;
    v_owner := v_thread.student_id;
  END IF;

  FOR v_staff IN
    SELECT DISTINCT ur.user_id
    FROM public.user_roles ur
    WHERE ur.role IN ('admin', 'editor')
      AND ur.user_id IS DISTINCT FROM v_author
  LOOP
    INSERT INTO public.student_notifications (
      user_id, title, message, type, severity, link_url, source_key
    ) VALUES (
      v_staff, v_title, v_message, 'topic_comment', 'info', v_page_url, v_source
    )
    ON CONFLICT (user_id, source_key) DO NOTHING;
  END LOOP;

  IF TG_TABLE_NAME = 'student_qa_replies'
     AND v_owner IS DISTINCT FROM v_author
     AND NOT EXISTS (
       SELECT 1
       FROM public.user_roles ur
       WHERE ur.user_id = v_owner
         AND ur.role IN ('admin', 'editor')
     )
  THEN
    INSERT INTO public.student_notifications (
      user_id, title, message, type, severity, link_url, source_key
    ) VALUES (
      v_owner,
      'Respondieron tu duda',
      v_message,
      'topic_comment',
      'info',
      v_page_url,
      v_source || ':author'
    )
    ON CONFLICT (user_id, source_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_topic_comment() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_notify_topic_thread ON public.student_qa_threads;
CREATE TRIGGER trg_notify_topic_thread
  AFTER INSERT ON public.student_qa_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_topic_comment();

DROP TRIGGER IF EXISTS trg_notify_topic_reply ON public.student_qa_replies;
CREATE TRIGGER trg_notify_topic_reply
  AFTER INSERT ON public.student_qa_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_topic_comment();

-- ─── 5. Realtime de avisos ───────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'student_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.student_notifications;
  END IF;
END $$;
