// src/services/traceImageStorage.ts
// Servicio de subida y almacenamiento de imágenes complementarias de trazos EMG en Supabase Storage

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { ComplementaryImageType } from '../components/simulator/traceEngine/types';

export const TRACE_IMAGES_BUCKET = 'emg-trace-images';
export const FALLBACK_IMAGES_BUCKET = 'course-images';
export const TRACE_IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

export function validateTraceImageFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return 'Formato de imagen no admitido. Usa JPG, PNG, WebP, GIF o SVG.';
  }
  if (file.size > TRACE_IMAGE_MAX_BYTES) {
    return 'La imagen supera los 10 MB máximos permitidos.';
  }
  return null;
}

/**
 * Convierte un archivo local a Data URL base64 como respaldo offline
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Infiere el tipo de imagen complementaria a partir del nombre del archivo
 */
export function inferImageTypeFromName(fileName: string): ComplementaryImageType {
  const lower = fileName.toLowerCase();
  if (lower.includes('eco') || lower.includes('us') || lower.includes('ultrasound') || lower.includes('csa')) {
    return 'ultrasound';
  }
  if (lower.includes('montaje') || lower.includes('electrod') || lower.includes('tecnica') || lower.includes('apb') || lower.includes('adm')) {
    return 'electrode_technique';
  }
  if (lower.includes('mri') || lower.includes('rm') || lower.includes('resonancia')) {
    return 'mri';
  }
  return 'clinical';
}

export interface UploadImageResult {
  url: string;
  fileName: string;
  title: string;
  inferredType: ComplementaryImageType;
  source: 'supabase' | 'local_fallback';
  error?: string;
}

/**
 * Sube una imagen al bucket de Supabase Storage.
 * Si falla la red o el bucket aún no está creado, usa respaldo Data URL para no bloquear al docente.
 */
export async function uploadTraceImageFile(
  file: File,
  userId?: string
): Promise<UploadImageResult> {
  const validationError = validateTraceImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${userId || 'shared'}/${Date.now()}-${cleanName}`;
  const inferredType = inferImageTypeFromName(file.name);
  const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  if (!isSupabaseConfigured) {
    const dataUrl = await fileToDataUrl(file);
    return {
      url: dataUrl,
      fileName: file.name,
      title,
      inferredType,
      source: 'local_fallback',
    };
  }

  // 1. Intentar subir al bucket especial emg-trace-images
  try {
    let targetBucket = TRACE_IMAGES_BUCKET;
    let { error: uploadErr } = await supabase.storage.from(targetBucket).upload(path, file, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: true,
    });

    // 2. Si el bucket no existe aún en el proyecto remoto, intentar en course-images
    if (uploadErr && (uploadErr.message.includes('not found') || uploadErr.message.includes('bucket'))) {
      targetBucket = FALLBACK_IMAGES_BUCKET;
      const fallbackResult = await supabase.storage.from(targetBucket).upload(path, file, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: true,
      });
      uploadErr = fallbackResult.error;
    }

    if (uploadErr) {
      console.warn('Fallo en Supabase Storage, usando dataUrl local:', uploadErr.message);
      const dataUrl = await fileToDataUrl(file);
      return {
        url: dataUrl,
        fileName: file.name,
        title,
        inferredType,
        source: 'local_fallback',
        error: uploadErr.message,
      };
    }

    const { data: publicUrlData } = supabase.storage.from(targetBucket).getPublicUrl(path);
    return {
      url: publicUrlData.publicUrl,
      fileName: file.name,
      title,
      inferredType,
      source: 'supabase',
    };
  } catch (err: any) {
    console.warn('Excepción al conectar con Supabase Storage:', err);
    const dataUrl = await fileToDataUrl(file);
    return {
      url: dataUrl,
      fileName: file.name,
      title,
      inferredType,
      source: 'local_fallback',
      error: err?.message || 'Error de red',
    };
  }
}

/**
 * Sube múltiples imágenes en paralelo
 */
export async function uploadMultipleTraceImages(
  files: File[],
  userId?: string
): Promise<UploadImageResult[]> {
  const promises = files.map((file) => uploadTraceImageFile(file, userId));
  return Promise.all(promises);
}

