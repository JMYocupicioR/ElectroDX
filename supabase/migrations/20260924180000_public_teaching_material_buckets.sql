-- Buckets públicos de material docente (plan gratuito de Supabase).
-- Límite global del plan Free: 50 MB por archivo y 1 GB de almacenamiento.
-- No hay bucket de video: las clases siguen por enlace (YouTube, Drive, Vimeo, Loom).
--
-- course-pdfs   → 20 MB, solo application/pdf
-- course-images →  5 MB, JPG / PNG / WebP
-- avatars       →  1 MB (ya existe). Cualquier usuario autenticado, incluido el alumno,
--                  sube solo dentro de su carpeta <uid>/… y la URL pública sirve la foto.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'course-pdfs',
    'course-pdfs',
    true,
    20971520,
    ARRAY['application/pdf']
  ),
  (
    'course-images',
    'course-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Lectura por API solo para personal editorial (el bucket público igual sirve la URL conocida).
-- Así un alumno no puede listar el material, aunque pueda ver el archivo publicado en el tema.

DROP POLICY IF EXISTS "course_pdfs_staff_read" ON storage.objects;
CREATE POLICY "course_pdfs_staff_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'course-pdfs'
    AND public.is_verified_contributor()
  );

DROP POLICY IF EXISTS "course_pdfs_staff_insert" ON storage.objects;
CREATE POLICY "course_pdfs_staff_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'course-pdfs'
    AND public.is_verified_contributor()
    AND split_part(name, '/', 1) = auth.uid()::text
  );

DROP POLICY IF EXISTS "course_pdfs_staff_update" ON storage.objects;
CREATE POLICY "course_pdfs_staff_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'course-pdfs'
    AND (
      public.is_editor()
      OR (
        public.is_verified_contributor()
        AND split_part(name, '/', 1) = auth.uid()::text
      )
    )
  )
  WITH CHECK (
    bucket_id = 'course-pdfs'
    AND (
      public.is_editor()
      OR (
        public.is_verified_contributor()
        AND split_part(name, '/', 1) = auth.uid()::text
      )
    )
  );

DROP POLICY IF EXISTS "course_pdfs_staff_delete" ON storage.objects;
CREATE POLICY "course_pdfs_staff_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'course-pdfs'
    AND (
      public.is_editor()
      OR (
        public.is_verified_contributor()
        AND split_part(name, '/', 1) = auth.uid()::text
      )
    )
  );

DROP POLICY IF EXISTS "course_images_staff_read" ON storage.objects;
CREATE POLICY "course_images_staff_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'course-images'
    AND public.is_verified_contributor()
  );

DROP POLICY IF EXISTS "course_images_staff_insert" ON storage.objects;
CREATE POLICY "course_images_staff_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'course-images'
    AND public.is_verified_contributor()
    AND split_part(name, '/', 1) = auth.uid()::text
  );

DROP POLICY IF EXISTS "course_images_staff_update" ON storage.objects;
CREATE POLICY "course_images_staff_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'course-images'
    AND (
      public.is_editor()
      OR (
        public.is_verified_contributor()
        AND split_part(name, '/', 1) = auth.uid()::text
      )
    )
  )
  WITH CHECK (
    bucket_id = 'course-images'
    AND (
      public.is_editor()
      OR (
        public.is_verified_contributor()
        AND split_part(name, '/', 1) = auth.uid()::text
      )
    )
  );

DROP POLICY IF EXISTS "course_images_staff_delete" ON storage.objects;
CREATE POLICY "course_images_staff_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'course-images'
    AND (
      public.is_editor()
      OR (
        public.is_verified_contributor()
        AND split_part(name, '/', 1) = auth.uid()::text
      )
    )
  );
