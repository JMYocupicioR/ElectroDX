export interface FailedBookImage {
  src: string;
  alt: string;
  reason: string;
}

export interface InlineBookImagesResult {
  inlined: number;
  failed: FailedBookImage[];
}

const MAX_WIDTH = 1400;
const JPEG_QUALITY = 0.82;

function isInlineSrc(src: string): boolean {
  return src.startsWith('data:') || src.startsWith('blob:');
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer la imagen'));
      reader.readAsDataURL(blob);
    });
  }
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base64 = btoa(binary);
  return `data:${blob.type || 'image/jpeg'};base64,${base64}`;
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('El navegador no pudo decodificar la imagen'));
    image.src = src;
  });
}

async function resizeToDataUrl(source: HTMLImageElement | HTMLCanvasElement): Promise<string> {
  if (typeof document === 'undefined') {
    throw new Error('Sin canvas para reducir la figura');
  }
  const width = 'naturalWidth' in source ? source.naturalWidth || source.width : source.width;
  const height = 'naturalHeight' in source ? source.naturalHeight || source.height : source.height;
  const scale = width > MAX_WIDTH ? MAX_WIDTH / width : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas no disponible');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

export async function fetchImageAsDataUrl(src: string): Promise<string> {
  if (isInlineSrc(src)) return src;

  try {
    const response = await fetch(src, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const blob = await response.blob();
    if (typeof document === 'undefined') {
      return blobToDataUrl(blob);
    }
    const objectUrl = URL.createObjectURL(blob);
    try {
      const image = await loadImageElement(objectUrl);
      return await resizeToDataUrl(image);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch (fetchError) {
    try {
      const image = await loadImageElement(src);
      return await resizeToDataUrl(image);
    } catch {
      const message = fetchError instanceof Error ? fetchError.message : 'Fallo de red';
      throw new Error(message);
    }
  }
}

function replaceWithFallback(img: HTMLImageElement, src: string, reason: string) {
  const fallback = document.createElement('div');
  fallback.className = 'book-figure-missing';
  const alt = img.getAttribute('alt') || 'Figura';
  fallback.innerHTML = `<p><strong>${escapeHtml(alt)}</strong></p><p>${escapeHtml(src)}</p><p>${escapeHtml(reason)}</p>`;
  img.replaceWith(fallback);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function inlineImagesInElement(root: HTMLElement): Promise<InlineBookImagesResult> {
  const images = Array.from(root.querySelectorAll('img[src]')) as HTMLImageElement[];
  const cache = new Map<string, string>();
  const failed: FailedBookImage[] = [];
  let inlined = 0;

  for (const img of images) {
    const src = img.getAttribute('src') || '';
    const alt = img.getAttribute('alt') || '';
    if (!src || isInlineSrc(src)) continue;

    try {
      let dataUrl = cache.get(src);
      if (!dataUrl) {
        dataUrl = await fetchImageAsDataUrl(src);
        cache.set(src, dataUrl);
      }
      img.setAttribute('src', dataUrl);
      inlined += 1;
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'No se pudo incrustar';
      failed.push({ src, alt, reason });
      replaceWithFallback(img, src, reason);
    }
  }

  return { inlined, failed };
}
