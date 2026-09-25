const ALLOWED_HOSTS = new Set([
  'drive.google.com',
  'docs.google.com',
  'drive.usercontent.google.com',
  '1drv.ms',
  'onedrive.live.com',
  'dropbox.com',
  'www.dropbox.com',
]);

export const SUBMISSION_FILE_MAX_BYTES = 15 * 1024 * 1024;
export const SUBMISSION_MAX_ITEMS = 8;

const FILE_MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function submissionFileError(file: File): string | null {
  const mime = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
  if (!FILE_MIME_TO_EXT[mime] && !file.name.toLowerCase().endsWith('.pdf')) {
    return 'Solo se aceptan PDF, JPG, PNG o WebP.';
  }
  if (file.name.toLowerCase().endsWith('.pdf') && mime && mime !== 'application/pdf') {
    return 'El archivo no es un PDF válido.';
  }
  if (file.size <= 0 || file.size > SUBMISSION_FILE_MAX_BYTES) {
    return 'El archivo debe pesar como máximo 15 MB.';
  }
  return null;
}

export function submissionFileMime(file: File): string {
  if (file.type === 'image/jpg') return 'image/jpeg';
  if (FILE_MIME_TO_EXT[file.type]) return file.type;
  if (file.name.toLowerCase().endsWith('.pdf')) return 'application/pdf';
  return file.type;
}

export function submissionFileExtension(mime: string): string {
  return FILE_MIME_TO_EXT[mime] ?? 'bin';
}

export function submissionLinkError(raw: string): string | null {
  const url = raw.trim();
  if (!url) return 'Pega un enlace.';
  if (url.length > 2000 || /\s/.test(url)) return 'El enlace no es válido.';
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return 'El enlace no es válido.';
  }
  if (parsed.protocol !== 'https:') return 'El enlace debe empezar con https://.';
  const host = parsed.hostname.toLowerCase();
  const allowed =
    ALLOWED_HOSTS.has(host) ||
    host.endsWith('.sharepoint.com') ||
    host.endsWith('.onedrive.live.com');
  if (!allowed) {
    return 'Usa un enlace de Google Drive, Docs, OneDrive, SharePoint o Dropbox.';
  }
  return null;
}
