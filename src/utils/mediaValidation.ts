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

export type TopicVideoItem = {
  title: string;
  url: string;
  sourceKind: 'youtube' | 'drive' | 'vimeo' | 'embed';
  sourceLabel: string;
  embedSrc: string;
  thumbnailUrl: string | null;
};

/**
 * Derives a reliable video thumbnail image URL for YouTube, Vimeo, Google Drive, or Loom.
 */
export function getVideoThumbnailUrl(url?: string | null): string | null {
  if (!url) return null;
  const parsed = parseVideoUrl(url);
  if (!parsed) return null;

  switch (parsed.kind) {
    case 'youtube':
      return `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`;
    case 'vimeo':
      return `https://vumbnail.com/${parsed.videoId}.jpg`;
    case 'drive':
      return `https://drive.google.com/thumbnail?id=${parsed.driveId}&sz=w640`;
    case 'embed': {
      const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
      if (loomMatch) {
        return `https://cdn.loom.com/sessions/thumbnails/${loomMatch[1]}-with-play.gif`;
      }
      return null;
    }
    default:
      return null;
  }
}

/**
 * Automatically extracts embedded videos from free text, Markdown links, and iframes.
 * Ensures videos pasted directly into content appear in the platform's Library and players.
 */
export function extractVideosFromContent(content?: string | null): ExternalVideoInput[] {
  if (!content) return [];
  const results: ExternalVideoInput[] = [];
  const seenVideoKeys = new Set<string>();

  // 1. Markdown links: [Title](https://...)
  const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi;
  let match: RegExpExecArray | null;
  while ((match = mdLinkRegex.exec(content)) !== null) {
    const rawTitle = match[1].trim();
    const url = match[2].trim();
    const parsed = parseVideoUrl(url);
    if (parsed) {
      const key =
        parsed.kind === 'drive'
          ? `drive:${parsed.driveId}`
          : parsed.kind === 'youtube'
          ? `youtube:${parsed.videoId}`
          : parsed.kind === 'vimeo'
          ? `vimeo:${parsed.videoId}`
          : `embed:${parsed.embedUrl}`;

      if (!seenVideoKeys.has(key)) {
        seenVideoKeys.add(key);
        results.push({
          title: rawTitle || 'Video de la lección',
          url,
        });
      }
    }
  }

  // 2. HTML iframes: <iframe ... src="https://..." ...>
  const iframeRegex = /<iframe[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi;
  while ((match = iframeRegex.exec(content)) !== null) {
    const fullTag = match[0];
    const url = match[1].trim();
    const parsed = parseVideoUrl(url);
    if (parsed) {
      const key =
        parsed.kind === 'drive'
          ? `drive:${parsed.driveId}`
          : parsed.kind === 'youtube'
          ? `youtube:${parsed.videoId}`
          : parsed.kind === 'vimeo'
          ? `vimeo:${parsed.videoId}`
          : `embed:${parsed.embedUrl}`;

      if (!seenVideoKeys.has(key)) {
        seenVideoKeys.add(key);
        const titleMatch = fullTag.match(/title=["']([^"']+)["']/i);
        const title = titleMatch ? titleMatch[1].trim() : 'Video integrado';
        results.push({ title, url });
      }
    }
  }

  // 3. Raw URLs in content (e.g. https://www.youtube.com/watch?v=...)
  const rawUrlRegex = /(https?:\/\/[^\s<>"')]+)/gi;
  while ((match = rawUrlRegex.exec(content)) !== null) {
    const url = match[1].trim();
    const parsed = parseVideoUrl(url);
    if (parsed) {
      const key =
        parsed.kind === 'drive'
          ? `drive:${parsed.driveId}`
          : parsed.kind === 'youtube'
          ? `youtube:${parsed.videoId}`
          : parsed.kind === 'vimeo'
          ? `vimeo:${parsed.videoId}`
          : `embed:${parsed.embedUrl}`;

      if (!seenVideoKeys.has(key)) {
        seenVideoKeys.add(key);
        results.push({
          title: 'Video complementario',
          url,
        });
      }
    }
  }

  return results;
}

/**
 * Resolves all videos associated with a topic, whether declared in structured media
 * properties (videoUrls, youtubeUrls, vimeoUrls), the direct video_url field, or
 * embedded in the markdown/HTML content. Deduplicates and generates embed-ready details.
 */
export function resolveAllTopicVideos(topic?: {
  title?: string | null;
  videoUrls?: { title: string; driveId: string }[];
  youtubeUrls?: { title: string; videoId: string; startTime?: number }[];
  vimeoUrls?: { title: string; videoId: string }[];
  embedUrls?: { title: string; embedUrl: string }[];
  video_url?: string | null;
  content?: string | null;
  media?: (VideoMediaPayload & { externalVideos?: ExternalVideoInput[] }) | null;
}): TopicVideoItem[] {
  if (!topic) return [];

  const rawList: ExternalVideoInput[] = [];

  // 1. Structured videos from media payload or topic direct properties
  const structured = resolveExternalVideos({
    videoUrls: topic.media?.videoUrls ?? topic.videoUrls,
    youtubeUrls: topic.media?.youtubeUrls ?? topic.youtubeUrls,
    vimeoUrls: topic.media?.vimeoUrls ?? topic.vimeoUrls,
    embedUrls: topic.media?.embedUrls ?? topic.embedUrls,
    externalVideos: topic.media?.externalVideos,
  });
  rawList.push(...structured);

  // 2. Direct topic video_url if defined
  if (topic.video_url?.trim()) {
    rawList.push({
      title: topic.title ? `Video: ${topic.title}` : 'Video principal',
      url: topic.video_url.trim(),
    });
  }

  // 3. Auto-extracted videos from text/markdown content
  const fromContent = extractVideosFromContent(topic.content);
  rawList.push(...fromContent);

  // 4. Normalize, deduplicate and compute embed details
  const seenKeys = new Set<string>();
  const items: TopicVideoItem[] = [];

  for (const item of rawList) {
    if (!item.url?.trim()) continue;
    const parsed = parseVideoUrl(item.url);
    if (!parsed) continue;

    const key =
      parsed.kind === 'drive'
        ? `drive:${parsed.driveId}`
        : parsed.kind === 'youtube'
        ? `youtube:${parsed.videoId}`
        : parsed.kind === 'vimeo'
        ? `vimeo:${parsed.videoId}`
        : `embed:${parsed.embedUrl}`;

    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    let sourceLabel = 'Video Web';
    if (parsed.kind === 'youtube') sourceLabel = 'YouTube';
    else if (parsed.kind === 'drive') sourceLabel = 'Google Drive';
    else if (parsed.kind === 'vimeo') sourceLabel = 'Vimeo';

    items.push({
      title: item.title?.trim() || 'Video de la lección',
      url: item.url.trim(),
      sourceKind: parsed.kind,
      sourceLabel,
      embedSrc: getVideoEmbedSrc(parsed),
      thumbnailUrl: getVideoThumbnailUrl(item.url),
    });
  }

  return items;
}


function isSupabasePublicImage(parsed: URL): boolean {
  return (
    parsed.hostname.endsWith('.supabase.co') &&
    /\/storage\/v1\/object\/public\/course-images\/.+\.(png|jpe?g|webp)$/i.test(parsed.pathname)
  );
}

export function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return false;
    if (isSupabasePublicImage(parsed)) return true;
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
