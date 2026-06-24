const ALLOWED_IMAGE_HOSTS = [
  'drive.google.com',
  'lh3.googleusercontent.com',
  'i.imgur.com',
  'images.unsplash.com',
  'upload.wikimedia.org',
];

const DRIVE_FILE_REGEX = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
const DRIVE_OPEN_REGEX = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
const DRIVE_UC_REGEX = /drive\.google\.com\/uc\?(?:export=\w+&)?id=([a-zA-Z0-9_-]+)/;
const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const YOUTUBE_START_REGEX = /[?&]t=(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?|start=(\d+)/;
const VIMEO_REGEX = /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/;
const DAILYMOTION_REGEX = /(?:dai\.ly\/|dailymotion\.com\/video\/)([a-zA-Z0-9]+)/;
const LOOM_REGEX = /loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/;

const ALLOWED_EMBED_HOSTS = [
  'www.youtube.com',
  'youtube.com',
  'youtu.be',
  'drive.google.com',
  'player.vimeo.com',
  'vimeo.com',
  'www.dailymotion.com',
  'dai.ly',
  'www.loom.com',
  'loom.com',
];

export type ExternalVideoInput = { title: string; url: string };

/** Accept legacy editor shapes (driveId, videoId, embedUrl) saved before unified url field */
export function normalizeExternalVideoItem(
  item: Partial<ExternalVideoInput> & { driveId?: string; videoId?: string; embedUrl?: string }
): ExternalVideoInput {
  return {
    title: item.title ?? '',
    url: (item.url ?? item.driveId ?? item.videoId ?? item.embedUrl ?? '').trim(),
  };
}

export function resolveExternalVideos(
  payload: VideoMediaPayload & { externalVideos?: ExternalVideoInput[] }
): ExternalVideoInput[] {
  const fromTyped = videoMediaToExternalList(payload);
  const fromEditor = (payload.externalVideos ?? []).map(normalizeExternalVideoItem);

  if (fromEditor.length === 0) return fromTyped;

  const merged = fromEditor.map((item, i) => ({
    title: item.title || fromTyped[i]?.title || '',
    url: item.url || fromTyped[i]?.url || '',
  }));

  if (merged.every((v) => !v.url) && fromTyped.length > 0) return fromTyped;

  return merged;
}

export type ParsedVideo =
  | { kind: 'drive'; driveId: string }
  | { kind: 'youtube'; videoId: string; startTime?: number }
  | { kind: 'vimeo'; videoId: string }
  | { kind: 'embed'; embedUrl: string };

export type VideoMediaPayload = {
  videoUrls?: { title: string; driveId: string }[];
  youtubeUrls?: { title: string; videoId: string; startTime?: number }[];
  vimeoUrls?: { title: string; videoId: string }[];
  embedUrls?: { title: string; embedUrl: string }[];
};

export function parseDriveId(url: string): string | null {
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{15,}$/.test(trimmed)) return trimmed;
  return (
    trimmed.match(DRIVE_FILE_REGEX)?.[1] ??
    trimmed.match(DRIVE_OPEN_REGEX)?.[1] ??
    trimmed.match(DRIVE_UC_REGEX)?.[1] ??
    null
  );
}

export function parseYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return trimmed.match(YOUTUBE_REGEX)?.[1] ?? null;
}

function parseYouTubeStartTime(url: string): number | undefined {
  const match = url.match(YOUTUBE_START_REGEX);
  if (!match) return undefined;
  if (match[4]) return Number(match[4]);
  const h = Number(match[1] ?? 0);
  const m = Number(match[2] ?? 0);
  const s = Number(match[3] ?? 0);
  const total = h * 3600 + m * 60 + s;
  return total > 0 ? total : undefined;
}

export function parseVimeoId(url: string): string | null {
  const trimmed = url.trim();
  return trimmed.match(VIMEO_REGEX)?.[1] ?? null;
}

function isAllowedEmbedUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return false;
    return ALLOWED_EMBED_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith('.' + host)
    );
  } catch {
    return false;
  }
}

export function parseVideoUrl(url: string): ParsedVideo | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/^http:\/\//i, 'https://');

  const driveId = parseDriveId(normalized);
  if (
    driveId &&
    (normalized.includes('drive.google') || /^[a-zA-Z0-9_-]{15,}$/.test(normalized))
  ) {
    return { kind: 'drive', driveId };
  }

  const youtubeId = parseYouTubeId(normalized);
  if (youtubeId) {
    return { kind: 'youtube', videoId: youtubeId, startTime: parseYouTubeStartTime(normalized) };
  }

  const vimeoId = parseVimeoId(normalized);
  if (vimeoId) return { kind: 'vimeo', videoId: vimeoId };

  const dailymotionId = normalized.match(DAILYMOTION_REGEX)?.[1];
  if (dailymotionId) {
    return { kind: 'embed', embedUrl: `https://www.dailymotion.com/embed/video/${dailymotionId}` };
  }

  const loomId = normalized.match(LOOM_REGEX)?.[1];
  if (loomId) {
    return { kind: 'embed', embedUrl: `https://www.loom.com/embed/${loomId}` };
  }

  if (normalized.startsWith('https://') && isAllowedEmbedUrl(normalized)) {
    return { kind: 'embed', embedUrl: normalized };
  }

  return null;
}

export function getVideoEmbedSrc(parsed: ParsedVideo): string {
  switch (parsed.kind) {
    case 'drive':
      return `https://drive.google.com/file/d/${parsed.driveId}/preview`;
    case 'youtube': {
      const params = parsed.startTime ? `?start=${parsed.startTime}` : '';
      return `https://www.youtube.com/embed/${parsed.videoId}${params}`;
    }
    case 'vimeo':
      return `https://player.vimeo.com/video/${parsed.videoId}`;
    case 'embed':
      return parsed.embedUrl;
  }
}

export function videoMediaToExternalList(media: VideoMediaPayload): ExternalVideoInput[] {
  const list: ExternalVideoInput[] = [];
  for (const v of media.videoUrls ?? []) {
    list.push({ title: v.title, url: v.driveId });
  }
  for (const v of media.youtubeUrls ?? []) {
    list.push({ title: v.title, url: v.videoId });
  }
  for (const v of media.vimeoUrls ?? []) {
    list.push({ title: v.title, url: v.videoId });
  }
  for (const v of media.embedUrls ?? []) {
    list.push({ title: v.title, url: v.embedUrl });
  }
  return list;
}

export function externalListToVideoMedia(videos: ExternalVideoInput[]): VideoMediaPayload {
  const videoUrls: { title: string; driveId: string }[] = [];
  const youtubeUrls: { title: string; videoId: string; startTime?: number }[] = [];
  const vimeoUrls: { title: string; videoId: string }[] = [];
  const embedUrls: { title: string; embedUrl: string }[] = [];

  for (const video of videos) {
    const parsed = parseVideoUrl(video.url);
    if (!parsed) continue;
    switch (parsed.kind) {
      case 'drive':
        videoUrls.push({ title: video.title, driveId: parsed.driveId });
        break;
      case 'youtube':
        youtubeUrls.push({
          title: video.title,
          videoId: parsed.videoId,
          startTime: parsed.startTime,
        });
        break;
      case 'vimeo':
        vimeoUrls.push({ title: video.title, videoId: parsed.videoId });
        break;
      case 'embed':
        embedUrls.push({ title: video.title, embedUrl: parsed.embedUrl });
        break;
    }
  }

  return { videoUrls, youtubeUrls, vimeoUrls, embedUrls };
}

export function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return false;
    if (ALLOWED_IMAGE_HOSTS.some((host) => parsed.hostname === host || parsed.hostname.endsWith('.' + host))) {
      return true;
    }
    return /\.(png|jpe?g|gif|webp|svg)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

export function validateMediaPayload(payload: VideoMediaPayload & {
  imageUrls?: { src: string; alt: string }[];
}): string[] {
  const errors: string[] = [];

  const externalVideos = resolveExternalVideos(payload);
  for (const video of externalVideos) {
    if (!video.title.trim()) errors.push('Cada video externo necesita título.');
    if (!parseVideoUrl(video.url)) {
      errors.push(
        `URL de video no reconocida: ${video.url}. Usa YouTube, Vimeo, Google Drive, Loom, Dailymotion u otra URL de embed compatible.`
      );
    }
  }

  for (const image of payload.imageUrls ?? []) {
    if (!image.alt.trim()) errors.push('Cada imagen necesita texto alternativo (alt).');
    if (!isAllowedImageUrl(image.src)) {
      errors.push(`URL de imagen no permitida: ${image.src}`);
    }
  }

  return errors;
}
