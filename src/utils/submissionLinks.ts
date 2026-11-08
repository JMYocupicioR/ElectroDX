const ALLOWED_HOSTS = new Set([
  'drive.google.com',
  'docs.google.com',
  'drive.usercontent.google.com',
  'forms.gle',
  'sheets.google.com',
  'slides.google.com',
  '1drv.ms',
  'onedrive.live.com',
  'dropbox.com',
  'www.dropbox.com',
  'box.com',
  'www.box.com',
  'app.box.com',
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'loom.com',
  'www.loom.com',
  'canva.com',
  'www.canva.com',
  'notion.so',
  'www.notion.so',
]);

export function normalizeSubmissionUrl(raw: string): string {
  let url = raw.trim();
  if (url && !/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

export function extractUrls(text?: string | null): string[] {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s<>"'()]+)/gi;
  const matches = text.match(urlRegex) || [];
  return Array.from(new Set(matches.map((u) => u.replace(/[.,;!?)]+$/, ''))));
}

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

const MIME_ALIASES: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'image/x-png': 'image/png',
  'application/x-pdf': 'application/pdf',
  'application/x-msword': 'application/msword',
  'application/vnd.ms-word': 'application/msword',
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
  const rawType = (file.type || '').toLowerCase().split(';')[0].trim();
  const normalizedType = MIME_ALIASES[rawType] ?? rawType;
  if (FILE_MIME_TO_EXT[normalizedType]) return normalizedType;
  const ext = fileExtension(file.name);
  return EXT_TO_MIME[ext] ?? normalizedType;
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
  const url = normalizeSubmissionUrl(raw);
  if (!url) return 'Pega un enlace.';
  if (url.length > 2000 || /\s/.test(url)) return 'El enlace no es válido.';
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return 'El enlace no es válido.';
  }
  if (parsed.protocol !== 'https:') {
    return 'El enlace debe empezar con https://.';
  }
  const host = parsed.hostname.toLowerCase();
  const allowed =
    ALLOWED_HOSTS.has(host) ||
    host.endsWith('.google.com') ||
    host.endsWith('.sharepoint.com') ||
    host.endsWith('.onedrive.live.com') ||
    host.endsWith('.dropbox.com') ||
    host.endsWith('.box.com');
  if (!allowed) {
    return 'Usa un enlace de Google Drive, Docs, OneDrive, SharePoint, Dropbox o Box.';
  }
  return null;
}
