import { allModules } from '../content/modules';
import type { Topic } from '../types/content';
import type { PublishedTopic, TopicMedia } from '../types/database';
import {
  getVideoDedupKey,
  resolveAllTopicVideos,
  videoMediaToExternalList,
  type VideoMediaPayload,
} from '../utils/mediaValidation';
import { buildLibraryVideoPicks, type LibraryVideoPick } from '../utils/libraryVideoCatalog';
import { isRecordedWorkshop } from '../utils/recordedWorkshopTopics';
import { getWorkshopDurationInfo } from '../utils/workshopDurationUtils';
import { getWorkshops } from './courseService';
import { getAllPublishedTopics } from './editorialService';

function flattenTopics(topics: Topic[]): Topic[] {
  const result: Topic[] = [];
  const walk = (list: Topic[]) => {
    for (const topic of list) {
      result.push(topic);
      if (topic.children?.length) walk(topic.children);
    }
  };
  walk(topics);
  return result;
}

function mediaMetaByKey(payload: VideoMediaPayload): Map<string, { durationSeconds?: number; authorId?: string }> {
  const map = new Map<string, { durationSeconds?: number; authorId?: string }>();
  for (const video of videoMediaToExternalList(payload)) {
    const key = getVideoDedupKey(video.url);
    if (!key) continue;
    map.set(key, {
      durationSeconds: video.durationSeconds,
      authorId: video.authorId,
    });
  }
  return map;
}

function pushLessonVideos(
  sources: LibraryVideoPick[],
  topic: {
    id: string;
    title?: string | null;
    content?: string | null;
    video_url?: string | null;
    videoUrls?: VideoMediaPayload['videoUrls'];
    youtubeUrls?: VideoMediaPayload['youtubeUrls'];
    vimeoUrls?: VideoMediaPayload['vimeoUrls'];
    embedUrls?: VideoMediaPayload['embedUrls'];
    media?: TopicMedia | null;
  },
  moduleId: string,
  moduleTitle?: string,
) {
  const media = topic.media ?? topic;
  const meta = mediaMetaByKey({
    videoUrls: media.videoUrls,
    youtubeUrls: media.youtubeUrls,
    vimeoUrls: media.vimeoUrls,
    embedUrls: media.embedUrls,
  });
  const videos = resolveAllTopicVideos({
    title: topic.title,
    content: topic.content,
    video_url: topic.video_url,
    videoUrls: media.videoUrls,
    youtubeUrls: media.youtubeUrls,
    vimeoUrls: media.vimeoUrls,
    embedUrls: media.embedUrls,
    media,
  });

  for (const video of videos) {
    const key = getVideoDedupKey(video.url) ?? `raw:${video.url}`;
    const info = meta.get(key);
    const minutes =
      info?.durationSeconds && info.durationSeconds > 0
        ? Math.max(1, Math.round(info.durationSeconds / 60))
        : undefined;
    sources.push({
      id: `lesson-${moduleId}-${topic.id}-${key}`,
      title: video.title,
      url: video.url,
      dedupKey: key,
      kind: 'lesson',
      sourceLabel: video.sourceLabel,
      moduleTitle,
      topicTitle: topic.title ?? undefined,
      durationMinutes: minutes,
      authorId: info?.authorId,
    });
  }
}

let catalogCache: { at: number; rows: LibraryVideoPick[] } | null = null;
const CATALOG_TTL_MS = 60_000;

/** Videos que ya aparecen en la biblioteca: clases grabadas y videos de lección. */
export async function listLibraryVideoPicks(): Promise<LibraryVideoPick[]> {
  if (catalogCache && Date.now() - catalogCache.at < CATALOG_TTL_MS) {
    return catalogCache.rows;
  }

  const workshops = await getWorkshops();
  let published: PublishedTopic[] = [];
  try {
    published = await getAllPublishedTopics();
  } catch (err) {
    console.warn('[libraryVideoCatalog] No se pudieron leer los temas publicados:', err);
  }

  const moduleTitle = new Map(allModules.map((mod) => [mod.id, mod.title]));
  const sources: LibraryVideoPick[] = [];

  for (const workshop of workshops) {
    if (!isRecordedWorkshop(workshop) || !workshop.recording_url?.trim()) continue;
    const duration = getWorkshopDurationInfo(workshop);
    const url = workshop.recording_url.trim();
    sources.push({
      id: `ws-${workshop.id}`,
      title: workshop.title,
      url,
      dedupKey: getVideoDedupKey(url) ?? `raw:${url}`,
      kind: 'workshop',
      sourceLabel: 'Taller grabado',
      moduleTitle: workshop.module_id ? moduleTitle.get(workshop.module_id) : undefined,
      durationMinutes: duration.minutes > 0 ? duration.minutes : undefined,
      workshopId: workshop.id,
      date: workshop.scheduled_at,
    });
  }

  for (const mod of allModules) {
    for (const topic of flattenTopics(mod.topics)) {
      pushLessonVideos(sources, topic, mod.id, mod.title);
    }
  }

  for (const topic of published) {
    pushLessonVideos(sources, topic, topic.module_id, moduleTitle.get(topic.module_id));
  }

  const rows = buildLibraryVideoPicks(sources);
  catalogCache = { at: Date.now(), rows };
  return rows;
}
