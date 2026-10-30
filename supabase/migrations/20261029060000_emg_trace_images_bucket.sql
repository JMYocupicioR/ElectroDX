-- ═══════════════════════════════════════════════════════════════════════════════
-- NeuroSAFEMX: Bucket de Almacenamiento Especial para Imágenes de Trazos EMG
-- Almacena ecografías neuromusculares, fotos de montaje de electrodos y clínica.
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'emg-trace-images',
  'emg-trace-images',
  true,
  10485760, -- 10 MB por archivo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de lectura pública: cualquier usuario (incluso anónimo en temas públicos) puede ver la imagen
DROP POLICY IF EXISTS "emg_trace_images_public_read" ON storage.objects;
CREATE POLICY "emg_trace_images_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'emg-trace-images');

-- Política de subida: personal docente, editores o administradores autenticados
DROP POLICY IF EXISTS "emg_trace_images_staff_insert" ON storage.objects;
CREATE POLICY "emg_trace_images_staff_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'emg-trace-images'
    AND (
      public.is_admin()
      OR public.is_editor()
      OR public.is_verified_contributor()
    )
  );

-- Política de actualización y borrado por personal editorial
DROP POLICY IF EXISTS "emg_trace_images_staff_modify" ON storage.objects;
CREATE POLICY "emg_trace_images_staff_modify" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'emg-trace-images'
    AND (
      public.is_admin()
      OR public.is_editor()
    )
  );

