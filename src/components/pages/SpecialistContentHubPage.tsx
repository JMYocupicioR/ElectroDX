import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Video,
  FileText,
  Lightbulb,
  Image,
  Search,
  BookOpen,
  User,
  ArrowRight,
  PlayCircle,
  Clock,
  Calendar,
  Layers,
  GraduationCap,
  Play,
  X,
  Film,
} from 'lucide-react';
import { getWorkshops } from '../../services/courseService';
import { getAllPublishedTopics, getPublicProfiles, getPublishedModules } from '../../services/editorialService';
import { allModules } from '../../content/modules';
import { resolveAllTopicVideos, parseVideoUrl, getVideoEmbedSrc, getVideoThumbnailUrl, type TopicVideoItem } from '../../utils/mediaValidation';
import type { LiveWorkshop, PublishedTopic, Profile, PublishedModule } from '../../types/database';
import type { Topic } from '../../types/content';

type ContentFilter = 'all' | 'recordings' | 'guides' | 'pearls' | 'images';

interface HubTopic {
  id: string;
  module_id: string;
  title: string;
  title_en?: string | null;
  description?: string | null;
  description_en?: string | null;
  content?: string | null;
  content_en?: string | null;
  video_url?: string | null;
  media?: any;
  clinical_pearls?: string[];
  clinical_pearls_en?: string[];
  key_points?: string[];
  key_points_en?: string[];
  tags?: string[];
  key_terms?: string[];
  published_at?: string | null;
  version?: number;
  last_edited_by?: string | null;
  slug?: string | null;
  videos: TopicVideoItem[];
}

export interface LibraryVideoItem {
  id: string;
  title: string;
  url: string;
  sourceKind: 'youtube' | 'drive' | 'vimeo' | 'embed' | 'workshop';
  sourceLabel: string;
  embedSrc: string;
  thumbnailUrl?: string | null;
  moduleId?: string;
  moduleTitle?: string;
  moduleEmoji?: string;
  topicId?: string;
  topicTitle?: string;
  topicSlug?: string;
  description?: string;
  isWorkshop?: boolean;
  date?: string;
  durationMinutes?: number;
}

function flattenTopics(topics: Topic[]): Topic[] {
  const result: Topic[] = [];
  function recurse(list: Topic[]) {
    for (const t of list) {
      result.push(t);
      if (t.children && t.children.length > 0) {
        recurse(t.children);
      }
    }
  }
  recurse(topics);
  return result;
}

/* ─── Video Player Modal ─── */
function VideoPlayerModal({
  video,
  onClose,
  relatedVideos = [],
  onSelectVideo,
}: {
  video: LibraryVideoItem | null;
  onClose: () => void;
  relatedVideos?: LibraryVideoItem[];
  onSelectVideo?: (v: LibraryVideoItem) => void;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (video) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [video, onClose]);

  if (!video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {video.sourceLabel}
              </span>
              {video.moduleTitle && (
                <span className="text-xs text-slate-400 truncate flex items-center gap-1">
                  <span>{video.moduleEmoji}</span>
                  <span>{video.moduleTitle}</span>
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white truncate">
              {video.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Cerrar reproductor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={video.embedSrc}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        </div>

        {/* Footer & Actions */}
        <div className="p-4 sm:p-5 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {video.topicTitle && (
              <p>
                Lección curricular:{' '}
                <span className="font-semibold text-slate-200">{video.topicTitle}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {video.topicId && video.moduleId && (
              <Link
                to={`/modulo/${video.moduleId}/${video.topicSlug || video.topicId}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
              >
                <span>Estudiar tema completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Playlist of related videos from same topic if multiple */}
        {relatedVideos.length > 1 && (
          <div className="px-5 py-3 bg-slate-950 border-t border-slate-800/80 overflow-x-auto">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Más videos de esta sección ({relatedVideos.length}):
            </p>
            <div className="flex items-center gap-2 pb-1">
              {relatedVideos.map((rv) => {
                const isCurrent = rv.id === video.id;
                return (
                  <button
                    key={rv.id}
                    onClick={() => onSelectVideo?.(rv)}
                    className={`inline-flex items-center gap-2 p-1.5 pr-3 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 border cursor-pointer ${
                      isCurrent
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                        : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    {rv.thumbnailUrl ? (
                      <img
                        src={rv.thumbnailUrl}
                        alt=""
                        className="w-10 h-6 rounded-md object-cover flex-shrink-0"
                      />
                    ) : (
                      <span className="w-10 h-6 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center flex-shrink-0">
                        <Play className="w-3 h-3 fill-current" />
                      </span>
                    )}
                    <span className="truncate max-w-[200px] text-left">{rv.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ─── Video Card Component with Visual Thumbnail ─── */
function VideoCard({
  video,
  onPlay,
}: {
  video: LibraryVideoItem;
  onPlay: (v: LibraryVideoItem) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const hasImage = Boolean(video.thumbnailUrl && !imgError);

  return (
    <div className="group rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-purple-500/10 transition-all flex flex-col">
      {/* 16:9 Thumbnail Header */}
      <div
        onClick={() => onPlay(video)}
        className="relative aspect-video w-full bg-slate-950 overflow-hidden cursor-pointer select-none group/thumb"
      >
        {hasImage ? (
          <>
            <img
              src={video.thumbnailUrl!}
              alt={video.title}
              onError={() => setImgError(true)}
              loading="lazy"
              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
            />
            {/* Subtle dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-black/20 to-black/30 pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950/70 to-purple-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.25) 1px, transparent 0)',
                backgroundSize: '16px 16px',
              }}
            />
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 mb-1 z-10 shadow-sm">
              <Film className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-300/80 tracking-wide uppercase z-10 truncate max-w-[85%] text-center">
              {video.moduleTitle || 'Video Demostrativo'}
            </span>
          </div>
        )}

        {/* Hover Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/thumb:bg-black/45 transition-colors z-10">
          <div className="w-12 h-12 rounded-full bg-purple-600/90 group-hover/thumb:bg-purple-600 text-white flex items-center justify-center shadow-xl group-hover/thumb:scale-110 transition-all border border-white/20 backdrop-blur-xs">
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </div>
        </div>

        {/* Source Badge (top-left) */}
        <div className="absolute top-2.5 left-2.5 z-20">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold shadow-sm backdrop-blur-xs ${
              video.sourceKind === 'youtube'
                ? 'bg-red-600/90 text-white'
                : video.sourceKind === 'drive'
                ? 'bg-blue-600/90 text-white'
                : video.sourceKind === 'vimeo'
                ? 'bg-sky-500/90 text-white'
                : 'bg-purple-600/90 text-white'
            }`}
          >
            <Film className="w-3 h-3" />
            {video.sourceLabel}
          </span>
        </div>

        {/* Bottom Tag / Duration (bottom-right) */}
        <div className="absolute bottom-2.5 right-2.5 z-20">
          {video.durationMinutes ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/80 text-white backdrop-blur-xs flex items-center gap-1 shadow-sm">
              <Clock className="w-2.5 h-2.5 text-slate-300" />
              {video.durationMinutes} min
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/80 text-purple-300 backdrop-blur-xs flex items-center gap-1 shadow-sm">
              <PlayCircle className="w-2.5 h-2.5" />
              Clase
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {video.moduleTitle && (
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1 truncate">
            <span>{video.moduleEmoji}</span>
            <span className="truncate">{video.moduleTitle}</span>
          </p>
        )}

        <h3
          onClick={() => onPlay(video)}
          className="font-bold text-base text-slate-900 dark:text-white mb-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 cursor-pointer"
        >
          {video.title}
        </h3>

        {video.topicTitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5 truncate">
            Lección: <span className="font-medium text-slate-700 dark:text-slate-300">{video.topicTitle}</span>
          </p>
        )}

        {video.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {video.description}
          </p>
        )}

        {/* Action Footer */}
        <div className="mt-auto pt-3.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
          {video.date ? (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(video.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          ) : (
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
              <Film className="w-3.5 h-3.5" />
              Video clínico
            </span>
          )}

          <div className="flex items-center gap-2">
            {video.topicId && video.moduleId && (
              <Link
                to={`/modulo/${video.moduleId}/${video.topicSlug || video.topicId}`}
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Lección
              </Link>
            )}
            <button
              type="button"
              onClick={() => onPlay(video)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              Reproducir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SpecialistContentHubPage() {
  const [workshops, setWorkshops] = useState<LiveWorkshop[]>([]);
  const [topics, setTopics] = useState<HubTopic[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [modules, setModules] = useState<Map<string, PublishedModule>>(new Map());
  const [loading, setLoading] = useState(true);

  // Active playing video modal
  const [selectedModalVideo, setSelectedModalVideo] = useState<LibraryVideoItem | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContentFilter>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [wsData, topData, profData, modData] = await Promise.all([
          getWorkshops(),
          getAllPublishedTopics(),
          getPublicProfiles(),
          getPublishedModules(),
        ]);

        setWorkshops(wsData);

        // Build modules dictionary (Curriculum modules + Published custom modules)
        const modMap = new Map<string, PublishedModule>();
        for (const m of allModules) {
          modMap.set(m.id, {
            id: m.id,
            number: m.number,
            title: m.title,
            title_en: m.titleEn || null,
            emoji: m.emoji,
            description: m.description || null,
            description_en: m.descriptionEn || null,
            color: m.color,
            icon: m.icon,
            sort_order: m.number,
            version: 1,
            published_at: new Date().toISOString(),
            published_by: null,
            last_edited_by: null,
            source_revision_id: null,
          });
        }
        for (const m of modData) {
          modMap.set(m.id, m);
        }
        setModules(modMap);

        // Profiles
        const profMap = new Map<string, Profile>();
        for (const p of profData) profMap.set(p.id, p);
        setProfiles(profMap);

        // Build Topics list: Combine static curriculum topics from allModules with Supabase published topics
        const staticTopicsList: HubTopic[] = [];
        for (const m of allModules) {
          const flat = flattenTopics(m.topics);
          for (const t of flat) {
            const videos = resolveAllTopicVideos(t);
            staticTopicsList.push({
              id: t.id,
              module_id: m.id,
              title: t.title,
              title_en: t.titleEn,
              description: t.description,
              description_en: t.descriptionEn,
              content: t.content,
              content_en: t.contentEn,
              media: {
                videoUrls: t.videoUrls,
                youtubeUrls: t.youtubeUrls,
                vimeoUrls: t.vimeoUrls,
                embedUrls: t.embedUrls,
                imageUrls: t.imageUrls,
                pdfUrls: t.pdfUrls,
              },
              clinical_pearls: t.clinicalPearls,
              clinical_pearls_en: t.clinicalPearlsEn,
              key_points: t.keyPoints,
              key_points_en: t.keyPointsEn,
              tags: t.tags,
              key_terms: t.keyTerms,
              slug: t.id,
              last_edited_by: t.contributionMeta?.lastEditedBy,
              published_at: t.contributionMeta?.publishedAt,
              videos,
            });
          }
        }

        // Map published topics from Supabase
        const publishedMap = new Map<string, PublishedTopic>();
        for (const pt of topData) {
          publishedMap.set(pt.id, pt);
          if (pt.slug) publishedMap.set(pt.slug, pt);
          if (pt.module_id) publishedMap.set(`${pt.module_id}:${pt.id}`, pt);
        }

        // Merge: If a static topic has an approved published version, use published; otherwise static.
        const finalTopics: HubTopic[] = [];
        const processedCompositeKeys = new Set<string>();

        for (const st of staticTopicsList) {
          const compKey = `${st.module_id}:${st.id}`;
          if (processedCompositeKeys.has(compKey)) continue;
          processedCompositeKeys.add(compKey);

          const pub =
            publishedMap.get(compKey) ??
            publishedMap.get(st.id) ??
            (st.slug ? publishedMap.get(st.slug) : undefined);

          if (pub) {
            const videos = resolveAllTopicVideos(pub);
            finalTopics.push({
              ...pub,
              module_id: pub.module_id || st.module_id,
              videos,
            });
          } else {
            finalTopics.push(st);
          }
        }

        // Any published topic in database that wasn't in static curriculum
        for (const pt of topData) {
          const compKey = `${pt.module_id || ''}:${pt.id}`;
          if (!processedCompositeKeys.has(compKey) && !processedCompositeKeys.has(pt.id)) {
            const videos = resolveAllTopicVideos(pt);
            finalTopics.push({
              ...pt,
              videos,
            });
            processedCompositeKeys.add(compKey);
            processedCompositeKeys.add(pt.id);
          }
        }

        setTopics(finalTopics);
      } catch (err) {
        console.error('Error loading specialist content hub data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered workshops with recordings
  const recordedWorkshops = useMemo(() => {
    return workshops.filter((w) => Boolean(w.recording_url));
  }, [workshops]);

  // Topics with specialist multimedia or pearls
  const richTopics = useMemo(() => {
    return topics.filter((t) => {
      const hasMedia = Boolean(
        t.videos.length > 0 ||
        t.media?.imageUrls?.length ||
        t.media?.pdfUrls?.length
      );
      const hasPearls = Boolean(t.clinical_pearls?.length);
      const hasContent = Boolean(t.content && t.content.length > 50);
      return hasMedia || hasPearls || hasContent;
    });
  }, [topics]);

  // Comprehensive library videos list (Recorded workshops + All topic videos from lessons)
  const allLibraryVideos = useMemo(() => {
    const list: LibraryVideoItem[] = [];

    // 1. Live workshops with recordings
    for (const ws of recordedWorkshops) {
      if (!ws.recording_url) continue;
      const parsed = parseVideoUrl(ws.recording_url);
      const mod = ws.module_id ? modules.get(ws.module_id) : undefined;
      const thumb = getVideoThumbnailUrl(ws.recording_url);
      list.push({
        id: `ws-${ws.id}`,
        title: ws.title,
        url: ws.recording_url,
        sourceKind: 'workshop',
        sourceLabel: 'Taller Grabado',
        embedSrc: parsed ? getVideoEmbedSrc(parsed) : ws.recording_url,
        thumbnailUrl: thumb,
        moduleId: ws.module_id,
        moduleTitle: mod?.title,
        moduleEmoji: mod?.emoji,
        date: ws.scheduled_at,
        durationMinutes: ws.duration_minutes,
        description: ws.description || undefined,
        isWorkshop: true,
      });
    }

    // 2. Videos from all course lessons/topics
    for (const t of richTopics) {
      const mod = modules.get(t.module_id);
      for (const v of t.videos) {
        const thumb =
          v.thumbnailUrl ||
          getVideoThumbnailUrl(v.url) ||
          (t.media?.imageUrls && t.media.imageUrls.length > 0 ? t.media.imageUrls[0].src : null);
        list.push({
          id: `topic-${t.module_id}-${t.id}-${v.url}`,
          title: v.title,
          url: v.url,
          sourceKind: v.sourceKind,
          sourceLabel: v.sourceLabel,
          embedSrc: v.embedSrc,
          thumbnailUrl: thumb,
          moduleId: t.module_id,
          moduleTitle: mod?.title,
          moduleEmoji: mod?.emoji,
          topicId: t.id,
          topicTitle: t.title,
          topicSlug: t.slug || t.id,
          description: t.description || undefined,
          isWorkshop: false,
        });
      }
    }

    return list;
  }, [recordedWorkshops, richTopics, modules]);

  // Filtered videos based on module and search
  const filteredVideos = useMemo(() => {
    return allLibraryVideos.filter((v) => {
      if (selectedModule !== 'all' && v.moduleId !== selectedModule) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        (v.topicTitle && v.topicTitle.toLowerCase().includes(q)) ||
        (v.description && v.description.toLowerCase().includes(q)) ||
        (v.moduleTitle && v.moduleTitle.toLowerCase().includes(q))
      );
    });
  }, [allLibraryVideos, selectedModule, searchQuery]);

  // Filtered topics based on filter and search
  const filteredTopics = useMemo(() => {
    if (activeFilter === 'recordings') return [];
    return richTopics.filter((t) => {
      if (selectedModule !== 'all' && t.module_id !== selectedModule) return false;

      // Filter by type
      if (activeFilter === 'guides') {
        const hasGuideOrDoc = Boolean(
          (t.content && (t.content.includes('http') || t.content.includes('.pdf') || t.content.includes('Guía'))) ||
          t.media?.pdfUrls?.length ||
          t.tags?.some((tg) => tg.toLowerCase().includes('guía') || tg.toLowerCase().includes('protocolo'))
        );
        if (!hasGuideOrDoc) return false;
      }

      if (activeFilter === 'pearls') {
        if (!t.clinical_pearls || t.clinical_pearls.length === 0) return false;
      }

      if (activeFilter === 'images') {
        if (!t.media?.imageUrls || t.media.imageUrls.length === 0) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchPearls = t.clinical_pearls?.some((p) => p.toLowerCase().includes(q));
      const author = t.last_edited_by ? profiles.get(t.last_edited_by)?.display_name : '';
      const matchAuthor = author ? author.toLowerCase().includes(q) : false;
      const matchVideoTitle = t.videos?.some((v) => v.title.toLowerCase().includes(q));

      return matchTitle || matchDesc || matchPearls || matchAuthor || matchVideoTitle;
    });
  }, [richTopics, activeFilter, selectedModule, searchQuery, profiles]);

  // Dynamic filter counters
  const guidesCount = useMemo(() => {
    return richTopics.filter((t) => {
      return Boolean(
        (t.content && (t.content.includes('http') || t.content.includes('.pdf') || t.content.includes('Guía'))) ||
        t.media?.pdfUrls?.length ||
        t.tags?.some((tg) => tg.toLowerCase().includes('guía') || tg.toLowerCase().includes('protocolo'))
      );
    }).length;
  }, [richTopics]);

  const pearlsCount = useMemo(() => {
    return richTopics.filter((t) => Boolean(t.clinical_pearls?.length)).length;
  }, [richTopics]);

  const imagesCount = useMemo(() => {
    return richTopics.filter((t) => Boolean(t.media?.imageUrls?.length)).length;
  }, [richTopics]);

  const totalResultsCount =
    activeFilter === 'recordings'
      ? filteredVideos.length
      : activeFilter === 'all'
      ? filteredVideos.length + filteredTopics.length
      : filteredTopics.length;

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      {/* Video Modal Player */}
      <AnimatePresence>
        {selectedModalVideo && (
          <VideoPlayerModal
            video={selectedModalVideo}
            onClose={() => setSelectedModalVideo(null)}
            relatedVideos={
              selectedModalVideo.topicId
                ? allLibraryVideos.filter((v) => v.topicId === selectedModalVideo.topicId)
                : []
            }
            onSelectVideo={(v) => setSelectedModalVideo(v)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-5 border border-blue-200/50 dark:border-blue-800/40">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Biblioteca Docente y Colaborativa
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
          Contenido Aportado por <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
            Médicos Especialistas
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Explora todas las clases grabadas, videos demostrativos de lecciones, guías clínicas prácticas, trazados de electromiografía y perlas docentes para enriquecer tu aprendizaje.
        </p>
      </motion.div>

      {/* Search and Filters Bar */}
      <div className="mb-8 p-4 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
        {/* Search input & Module selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por tema, video, especialista, patología, técnica EMG..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
            />
          </div>

          <div>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
            >
              <option value="all">Todos los módulos curriculares</option>
              {Array.from(modules.values())
                .sort((a, b) => a.number - b.number)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.emoji} Módulo {m.number}: {m.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Content Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Todo el material ({allLibraryVideos.length + richTopics.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('recordings')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'recordings'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Clases y Videos ({allLibraryVideos.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('guides')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'guides'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Guías Clínicas y Documentos ({guidesCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('pearls')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'pearls'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Perlas Clínicas ({pearlsCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('images')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'images'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-500/20'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            Trazados EMG e Ilustraciones ({imagesCount})
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block animate-spin rounded-full h-9 w-9 border-b-2 border-blue-600"></div>
          <p className="mt-3 text-sm text-slate-500">Cargando biblioteca de especialistas...</p>
        </div>
      ) : totalResultsCount === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            No se encontraron materiales
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            No hay elementos que coincidan con tu búsqueda o filtros seleccionados.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
              setSelectedModule('all');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Section 1: Videos and Recorded Classes */}
          {(activeFilter === 'recordings' || (activeFilter === 'all' && filteredVideos.length > 0)) && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center shadow-xs">
                    <Video className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Videoteca y Clases Magistrales</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                        {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Videos clínicos demostrativos, grabaciones y tutoriales obtenidos de las lecciones del diplomado
                    </p>
                  </div>
                </div>

                {activeFilter === 'all' && filteredVideos.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setActiveFilter('recordings')}
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    Ver todos los videos ({filteredVideos.length}) <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(activeFilter === 'all' ? filteredVideos.slice(0, 6) : filteredVideos).map((v) => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    onPlay={(video) => setSelectedModalVideo(video)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Specialist Contributed Topic Content */}
          {filteredTopics.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center shadow-xs">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Guías y Materiales en Lecciones del Curso</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        {filteredTopics.length} {filteredTopics.length === 1 ? 'lección' : 'lecciones'}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Recursos clínicos, perlas docentes y videos integrados en el currículo formativo
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTopics.map((top) => {
                  const mod = modules.get(top.module_id);
                  const author = top.last_edited_by ? profiles.get(top.last_edited_by) : null;
                  const hasVideos = top.videos.length > 0;
                  const hasPearls = Boolean(top.clinical_pearls?.length);
                  const hasImages = Boolean(top.media?.imageUrls?.length);

                  return (
                    <div
                      key={`${top.module_id}-${top.id}`}
                      className="group rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all flex flex-col"
                    >
                      <div className="p-5 flex-1 flex flex-col">
                        {/* Module badge & icons */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {mod ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate">
                              <span>{mod.emoji}</span>
                              <span className="truncate">{mod.title}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Lección Clínica</span>
                          )}

                          <div className="flex items-center gap-1">
                            {hasVideos && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 text-[10px] font-bold"
                                title={`${top.videos.length} videos disponibles`}
                              >
                                <Video className="w-3 h-3" />
                                {top.videos.length}
                              </span>
                            )}
                            {hasPearls && (
                              <span className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 text-[10px]" title="Contiene perla clínica">
                                <Lightbulb className="w-3 h-3" />
                              </span>
                            )}
                            {hasImages && (
                              <span className="p-1 rounded-md bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-300 text-[10px]" title="Contiene trazados EMG">
                                <Image className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {top.title}
                        </h3>

                        {top.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                            {top.description}
                          </p>
                        )}

                        {/* Pearls sample preview if any */}
                        {top.clinical_pearls && top.clinical_pearls.length > 0 && (
                          <div className="mb-3 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-1.5">
                            <span className="mt-0.5 flex-shrink-0">💡</span>
                            <p className="line-clamp-2">{top.clinical_pearls[0]}</p>
                          </div>
                        )}

                        {/* Video Quick Player Box inside Topic Card */}
                        {hasVideos && (
                          <div className="mb-3 p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/40 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                                <Play className="w-3 h-3" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-purple-900 dark:text-purple-200 truncate">
                                  {top.videos.length === 1 ? top.videos[0].title : `${top.videos.length} videos disponibles`}
                                </p>
                                <span className="text-[10px] text-purple-600/80 dark:text-purple-400 truncate block">
                                  {top.videos[0].sourceLabel}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const videoItem: LibraryVideoItem = {
                                  id: `topic-${top.module_id}-${top.id}-${top.videos[0].url}`,
                                  title: top.videos[0].title,
                                  url: top.videos[0].url,
                                  sourceKind: top.videos[0].sourceKind,
                                  sourceLabel: top.videos[0].sourceLabel,
                                  embedSrc: top.videos[0].embedSrc,
                                  thumbnailUrl:
                                    top.videos[0].thumbnailUrl ||
                                    (top.media?.imageUrls && top.media.imageUrls.length > 0
                                      ? top.media.imageUrls[0].src
                                      : null),
                                  moduleId: top.module_id,
                                  moduleTitle: mod?.title,
                                  moduleEmoji: mod?.emoji,
                                  topicId: top.id,
                                  topicTitle: top.title,
                                  topicSlug: (top.slug || top.id) ?? top.id,
                                  description: top.description || undefined,
                                  isWorkshop: false,
                                };
                                setSelectedModalVideo(videoItem);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold transition-colors flex-shrink-0 shadow-xs cursor-pointer"
                            >
                              Ver video
                            </button>
                          </div>
                        )}

                        {/* Footer info */}
                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate max-w-[130px]">
                              {author?.display_name || 'Especialista Colaborador'}
                            </span>
                          </div>

                          <Link
                            to={`/modulo/${top.module_id}/${top.slug || top.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-xs font-bold transition-all"
                          >
                            <span>Estudiar tema</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

