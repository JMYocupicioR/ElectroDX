import { supabase } from '../lib/supabase';

/** Plan Free de Supabase: máximo global 50 MB por archivo y 1 GB de almacenamiento. */
export const TEACHING_PDF_BUCKET = 'course-pdfs';
export const TEACHING_IMAGE_BUCKET = 'course-images';
export const TEACHING_PDF_MAX_BYTES = 20 * 1024 * 1024;
export const TEACHING_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function teachingFileError(kind: 'pdf' | 'image', file: File): string | null {
  if (kind === 'pdf') {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) return 'Solo se aceptan archivos PDF.';
    if (file.size > TEACHING_PDF_MAX_BYTES) {
      return 'El PDF supera 20 MB. En el plan gratuito el tope global es 50 MB; este bucket queda en 20 MB para no llenar el 1 GB de almacenamiento.';
    }
    return null;
  }

  if (!IMAGE_MIME_TO_EXT[file.type]) return 'Solo se aceptan imágenes JPG, PNG o WebP.';
  if (file.size > TEACHING_IMAGE_MAX_BYTES) {
    return 'La imagen supera 5 MB. Comprime el trazado o usa un enlace público.';
  }
  return null;
}

export async function uploadTeachingFile(
  userId: string,
  kind: 'pdf' | 'image',
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const validation = teachingFileError(kind, file);
  if (validation) return { url: null, error: validation };

  const bucket = kind === 'pdf' ? TEACHING_PDF_BUCKET : TEACHING_IMAGE_BUCKET;
  const ext = kind === 'pdf' ? 'pdf' : IMAGE_MIME_TO_EXT[file.type];
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const contentType = kind === 'pdf' ? 'application/pdf' : file.type;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType,
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('bucket not found') || msg.includes('not found')) {
      return {
        url: null,
        error:
          'El bucket de material aún no existe. Aplica la migración 20260924180000_public_teaching_material_buckets en Supabase.',
      };
    }
    if (msg.includes('row-level security') || msg.includes('not authorized') || msg.includes('403')) {
      return {
        url: null,
        error: 'Solo administradores y colaboradores verificados pueden subir material.',
      };
    }
    if (msg.includes('payload too large') || msg.includes('exceeded') || msg.includes('file size')) {
      return { url: null, error: teachingFileError(kind, file) ?? 'El archivo supera el límite del bucket.' };
    }
    return { url: null, error: error.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
