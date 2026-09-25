const ALLOWED_HOSTS = new Set([
  'drive.google.com',
  'docs.google.com',
  'drive.usercontent.google.com',
  '1drv.ms',
  'onedrive.live.com',
  'dropbox.com',
  'www.dropbox.com',
  'box.com',
  'www.box.com',
  'app.box.com',
]);

export const SUBMISSION_FILE_MAX_BYTES = 15 * 1024 * 1024;
export const SUBMISSION_MAX_ITEMS = 8;

const FILE_MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

const EXT_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function fileExtension(name: string): string {
  const parts = name.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

export function submissionFileMime(file: File): string {
  if (file.type === 'image/jpg') return 'image/jpeg';
  if (FILE_MIME_TO_EXT[file.type]) return file.type;
  return EXT_TO_MIME[fileExtension(file.name)] ?? file.type;
}

export function submissionFileExtension(mime: string): string {
  return FILE_MIME_TO_EXT[mime] ?? 'bin';
}

export function submissionFileError(file: File): string | null {
  const mime = submissionFileMime(file);
  if (!FILE_MIME_TO_EXT[mime]) {
    return 'Solo se aceptan PDF, Word (.doc, .docx), JPG, PNG o WebP.';
  }
  if (file.size <= 0 || file.size > SUBMISSION_FILE_MAX_BYTES) {
    return 'El archivo debe pesar como máximo 15 MB.';
  }
  return null;
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
    return 'Usa un enlace de Google Drive, Docs, OneDrive, SharePoint, Dropbox o Box.';
  }
  return null;
}
