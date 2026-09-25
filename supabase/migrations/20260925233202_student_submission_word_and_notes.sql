-- Word en el bucket de entregas, y permitir entregar solo con texto.

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
WHERE id = 'student-submissions';

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
  IF p_mime_type NOT IN (
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) THEN
    RAISE EXCEPTION 'Solo se aceptan PDF, Word, JPG, PNG o WebP';
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
  v_notes text := NULLIF(btrim(COALESCE(p_notes, '')), '');
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

    IF v_count < 1 AND v_notes IS NULL THEN
      RAISE EXCEPTION 'Escribe tu respuesta, adjunta un archivo o agrega un enlace antes de entregar';
    END IF;
  END IF;

  UPDATE public.student_assignments
  SET
    student_notes = COALESCE(v_notes, student_notes),
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
    'www.dropbox.com',
    'box.com',
    'www.box.com',
    'app.box.com'
  )
  OR v_host LIKE '%.sharepoint.com'
  OR v_host LIKE '%.onedrive.live.com';
END;
$$;

REVOKE ALL ON FUNCTION public.submission_link_host_allowed(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.register_my_submission_file(uuid, text, text, text, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_my_assignment(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submission_link_host_allowed(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_my_submission_file(uuid, text, text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_my_assignment(uuid, text, text) TO authenticated;
