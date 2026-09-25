-- Entregas de tareas: archivos en bucket privado y enlaces (Drive, OneDrive, Dropbox).
-- La nota sigue en student_assignments y entra al kárdex solo si status = approved.

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.student_assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('file', 'link')),
  storage_path TEXT,
  file_name TEXT,
  mime_type TEXT,
  byte_size INTEGER,
  link_url TEXT,
  link_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT assignment_submissions_payload CHECK (
    (kind = 'file' AND storage_path IS NOT NULL AND link_url IS NULL)
    OR (kind = 'link' AND link_url IS NOT NULL AND storage_path IS NULL)
  ),
  CONSTRAINT assignment_submissions_byte_size CHECK (byte_size IS NULL OR byte_size >= 0)
);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment
  ON public.assignment_submissions(assignment_id, created_at);

CREATE TABLE IF NOT EXISTS public.student_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'academic',
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'success', 'warning')),
  link_url TEXT,
  source_key TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, source_key)
);

CREATE INDEX IF NOT EXISTS idx_student_notifications_user
  ON public.student_notifications(user_id, created_at DESC);

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON public.assignment_submissions TO authenticated;
GRANT SELECT, UPDATE ON public.student_notifications TO authenticated;

-- ─── Helpers ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.assignment_accepts_delivery(p_assignment_id uuid, p_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.student_assignments sa
    WHERE sa.id = p_assignment_id
      AND sa.student_id = p_student_id
      AND sa.status IN ('pending', 'needs_revision')
      AND sa.type IN ('reading', 'practical_task', 'emg_report')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_upload_student_submission(object_name text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_parts text[];
  v_assignment uuid;
BEGIN
  IF v_uid IS NULL OR object_name IS NULL THEN
    RETURN false;
  END IF;

  v_parts := storage.foldername(object_name);
  IF v_parts IS NULL OR array_length(v_parts, 1) IS DISTINCT FROM 2 THEN
    RETURN false;
  END IF;
  IF v_parts[1] <> v_uid::text THEN
    RETURN false;
  END IF;

  BEGIN
    v_assignment := v_parts[2]::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN false;
  END;

  RETURN public.assignment_accepts_delivery(v_assignment, v_uid);
END;
$$;

REVOKE ALL ON FUNCTION public.assignment_accepts_delivery(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_upload_student_submission(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assignment_accepts_delivery(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_upload_student_submission(text) TO authenticated;

-- ─── RLS de filas ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "assignment_submissions_select" ON public.assignment_submissions;
CREATE POLICY "assignment_submissions_select" ON public.assignment_submissions
  FOR SELECT TO authenticated
  USING (
    auth.uid() = student_id
    OR public.is_admin()
    OR public.is_editor()
  );

DROP POLICY IF EXISTS "assignment_submissions_insert" ON public.assignment_submissions;
CREATE POLICY "assignment_submissions_insert" ON public.assignment_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = student_id
    AND public.assignment_accepts_delivery(assignment_id, auth.uid())
  );

DROP POLICY IF EXISTS "assignment_submissions_delete" ON public.assignment_submissions;
CREATE POLICY "assignment_submissions_delete" ON public.assignment_submissions
  FOR DELETE TO authenticated
  USING (
    (
      auth.uid() = student_id
      AND public.assignment_accepts_delivery(assignment_id, auth.uid())
    )
    OR public.is_admin()
    OR public.is_editor()
  );

DROP POLICY IF EXISTS "student_notifications_select" ON public.student_notifications;
CREATE POLICY "student_notifications_select" ON public.student_notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin() OR public.is_editor());

DROP POLICY IF EXISTS "student_notifications_update" ON public.student_notifications;
CREATE POLICY "student_notifications_update" ON public.student_notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Bucket privado ─────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-submissions',
  'student-submissions',
  false,
  15728640,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "student_submissions_insert" ON storage.objects;
CREATE POLICY "student_submissions_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'student-submissions'
    AND public.can_upload_student_submission(name)
  );

DROP POLICY IF EXISTS "student_submissions_select" ON storage.objects;
CREATE POLICY "student_submissions_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'student-submissions'
    AND (
      split_part(name, '/', 1) = auth.uid()::text
      OR public.is_admin()
      OR public.is_editor()
    )
  );

DROP POLICY IF EXISTS "student_submissions_delete" ON storage.objects;
CREATE POLICY "student_submissions_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'student-submissions'
    AND (
      public.can_upload_student_submission(name)
      OR public.is_admin()
      OR public.is_editor()
    )
  );

-- ─── Enlaces y registro de archivos ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.submission_link_host_allowed(p_url text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_host text;
BEGIN
  IF p_url IS NULL OR p_url !~* '^https://' THEN
    RETURN false;
  END IF;
  IF length(p_url) > 2000 OR position(' ' in p_url) > 0 THEN
    RETURN false;
  END IF;

  v_host := lower(split_part(split_part(substring(p_url from 9), '/', 1), ':', 1));
  IF v_host = '' THEN
    RETURN false;
  END IF;

  RETURN v_host IN (
    'drive.google.com',
    'docs.google.com',
    'drive.usercontent.google.com',
    '1drv.ms',
    'onedrive.live.com',
    'dropbox.com',
    'www.dropbox.com'
  )
  OR v_host LIKE '%.sharepoint.com'
  OR v_host LIKE '%.onedrive.live.com';
END;
$$;

CREATE OR REPLACE FUNCTION public.add_my_submission_link(
  p_assignment_id uuid,
  p_url text,
  p_label text DEFAULT NULL
)
RETURNS public.assignment_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.assignment_submissions;
  v_count int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;
  IF NOT public.assignment_accepts_delivery(p_assignment_id, v_uid) THEN
    RAISE EXCEPTION 'Esta tarea no admite entregas ahora';
  END IF;
  IF NOT public.submission_link_host_allowed(btrim(p_url)) THEN
    RAISE EXCEPTION 'El enlace debe ser https de Drive, Docs, OneDrive, SharePoint o Dropbox';
  END IF;

  SELECT count(*) INTO v_count
  FROM public.assignment_submissions
  WHERE assignment_id = p_assignment_id;

  IF v_count >= 8 THEN
    RAISE EXCEPTION 'Máximo 8 archivos o enlaces por tarea';
  END IF;

  INSERT INTO public.assignment_submissions (
    assignment_id, student_id, kind, link_url, link_label
  )
  VALUES (
    p_assignment_id,
    v_uid,
    'link',
    btrim(p_url),
    NULLIF(left(btrim(COALESCE(p_label, '')), 120), '')
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_my_submission_file(
  p_assignment_id uuid,
  p_storage_path text,
  p_file_name text,
  p_mime_type text,
  p_byte_size integer
)
RETURNS public.assignment_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.assignment_submissions;
  v_count int;
  v_prefix text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;
  IF NOT public.assignment_accepts_delivery(p_assignment_id, v_uid) THEN
    RAISE EXCEPTION 'Esta tarea no admite entregas ahora';
  END IF;
  IF p_mime_type NOT IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp') THEN
    RAISE EXCEPTION 'Solo se aceptan PDF, JPG, PNG o WebP';
  END IF;
  IF p_byte_size IS NULL OR p_byte_size <= 0 OR p_byte_size > 15728640 THEN
    RAISE EXCEPTION 'El archivo debe pesar entre 1 byte y 15 MB';
  END IF;

  v_prefix := v_uid::text || '/' || p_assignment_id::text || '/';
  IF p_storage_path IS NULL OR left(p_storage_path, length(v_prefix)) <> v_prefix THEN
    RAISE EXCEPTION 'Ruta de archivo no permitida';
  END IF;
  IF position('..' in p_storage_path) > 0 THEN
    RAISE EXCEPTION 'Ruta de archivo no permitida';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM storage.objects
    WHERE bucket_id = 'student-submissions'
      AND name = p_storage_path
  ) THEN
    RAISE EXCEPTION 'El archivo no está en el almacenamiento';
  END IF;

  SELECT count(*) INTO v_count
  FROM public.assignment_submissions
  WHERE assignment_id = p_assignment_id;

  IF v_count >= 8 THEN
    RAISE EXCEPTION 'Máximo 8 archivos o enlaces por tarea';
  END IF;

  INSERT INTO public.assignment_submissions (
    assignment_id, student_id, kind, storage_path, file_name, mime_type, byte_size
  )
  VALUES (
    p_assignment_id,
    v_uid,
    'file',
    p_storage_path,
    left(COALESCE(NULLIF(btrim(p_file_name), ''), 'entrega'), 180),
    p_mime_type,
    p_byte_size
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_my_submission(p_submission_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.assignment_submissions;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  SELECT * INTO v_row
  FROM public.assignment_submissions
  WHERE id = p_submission_id
    AND student_id = v_uid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Entrega no encontrada';
  END IF;
  IF NOT public.assignment_accepts_delivery(v_row.assignment_id, v_uid) THEN
    RAISE EXCEPTION 'La entrega ya está cerrada';
  END IF;

  DELETE FROM public.assignment_submissions WHERE id = v_row.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_my_assignment(
  p_assignment_id uuid,
  p_notes text DEFAULT NULL,
  p_submission_url text DEFAULT NULL
)
RETURNS public.student_assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.student_assignments;
  v_count int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  SELECT * INTO v_row
  FROM public.student_assignments
  WHERE id = p_assignment_id
    AND student_id = v_uid
    AND status IN ('pending', 'needs_revision');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Asignación no encontrada o no disponible para entrega';
  END IF;

  IF v_row.type IN ('reading', 'practical_task') THEN
    SELECT count(*) INTO v_count
    FROM public.assignment_submissions
    WHERE assignment_id = p_assignment_id
      AND student_id = v_uid;

    IF v_count < 1 THEN
      RAISE EXCEPTION 'Adjunta un archivo o un enlace de Drive, OneDrive o Dropbox antes de entregar';
    END IF;
  END IF;

  UPDATE public.student_assignments
  SET
    student_notes = COALESCE(p_notes, student_notes),
    submission_url = COALESCE(p_submission_url, submission_url),
    submitted_at = now(),
    status = 'submitted',
    updated_at = now()
  WHERE id = p_assignment_id
    AND student_id = v_uid
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.submission_link_host_allowed(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.add_my_submission_link(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.register_my_submission_file(uuid, text, text, text, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_my_submission(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_my_assignment(uuid, text, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.submission_link_host_allowed(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_my_submission_link(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_my_submission_file(uuid, text, text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_my_submission(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_my_assignment(uuid, text, text) TO authenticated;

-- ─── Avisos al publicar y al calificar ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.notify_student_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_due text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_due := to_char(NEW.due_date AT TIME ZONE 'America/Mexico_City', 'DD Mon YYYY HH24:MI');
    INSERT INTO public.student_notifications (
      user_id, title, message, type, severity, link_url, source_key
    )
    VALUES (
      NEW.student_id,
      'Nueva tarea: ' || NEW.title,
      COALESCE(NEW.description, 'Tu profesor publicó una actividad.') || ' Fecha límite: ' || COALESCE(v_due, ''),
      'academic',
      CASE WHEN NEW.priority = 'urgent' THEN 'warning' ELSE 'info' END,
      '/portal?tab=assignments',
      'assignment:' || NEW.id::text
    )
    ON CONFLICT (user_id, source_key) DO NOTHING;
    RETURN NEW;
  END IF;

  IF NEW.reviewed_at IS NOT NULL
     AND NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
     AND NEW.grade IS NOT NULL THEN
    INSERT INTO public.student_notifications (
      user_id, title, message, type, severity, link_url, source_key
    )
    VALUES (
      NEW.student_id,
      CASE
        WHEN NEW.status = 'needs_revision' THEN 'Corrección solicitada: ' || NEW.title
        ELSE 'Calificación: ' || NEW.title
      END,
      CASE
        WHEN NEW.status = 'needs_revision' THEN
          'Tu profesor pidió correcciones (' || NEW.grade::text || '/100). ' || COALESCE(NEW.feedback, '')
        ELSE
          'Tu entrega quedó en ' || NEW.grade::text || '/100. ' || COALESCE(NEW.feedback, '')
      END,
      'academic',
      CASE WHEN NEW.status = 'approved' THEN 'success' ELSE 'warning' END,
      '/portal?tab=assignments',
      'assignment_grade:' || NEW.id::text || ':' || NEW.reviewed_at::text
    )
    ON CONFLICT (user_id, source_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_student_assignment ON public.student_assignments;
CREATE TRIGGER trg_notify_student_assignment
  AFTER INSERT OR UPDATE ON public.student_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_student_assignment();

REVOKE ALL ON FUNCTION public.notify_student_assignment() FROM PUBLIC, anon, authenticated;
