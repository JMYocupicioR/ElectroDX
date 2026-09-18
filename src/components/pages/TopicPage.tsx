import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { findTopicByPath, getAllFlatTopics } from '../../services/contentMerge';
import { useMergedModule } from '../../hooks/useMergedModule';
import { useAuth } from '../../contexts/AuthProvider';
import { ContributionBanner, ContributorContentActions, ProposeQuizLink } from '../editorial/TopicContribution';
import { QuizGate } from '../quiz/QuizGate';
import { TopicStudyTools } from '../student/TopicStudyTools';
import { QuizTopicBadge } from '../quiz/QuizTopicBadge';
import { getQuizFlagForTopic } from '../../services/quizService';
import { CourseGate } from '../CourseGate';
import type { QuizTopicFlag } from '../../types/quiz';
import { Topic } from '../../types/content';
import { ChevronRight, Home, ArrowLeft, ArrowRight, List, X, ChevronUp, BookMarked, ExternalLink, Play, Lightbulb, Target, ImageIcon, CheckCircle2, Clock, ClipboardList } from 'lucide-react';
import { getReferencesForTopic, Reference } from '../../content/topicReferences';
import {
  toggleTopicCompleted,
  markMultipleTopics,
  setLastVisitedTopic,
  getCompletedTopics,
  TOPIC_PROGRESS_EVENT,
  getAllTopicIds,
} from '../../services/studentService';
import { getPassedQuizTopicIdsSync } from '../../services/quizCompletionGate';
import {
  buildLessonResumeUrl,
  findNextIncompleteFlatTopic,
  getNextPendingCurriculumLesson,
  isCurriculumNodeCompleted,
} from '../../services/studentResume';
import { useSettingsStore } from '../../stores/settingsStore';
import { localizedTopic } from '../../hooks/useLocalizedContent';
import { getVideoEmbedSrc, parseVideoUrl, videoMediaToExternalList } from '../../utils/mediaValidation';
import { useTopicProgress } from '../../hooks/useTopicProgress';
import { RichContent, renderInline, type RichHeadingLevel } from '../content/RichContent';

/* ─── Video Section ─── */
function topicHasVideos(topic: Topic): boolean {
  return videoMediaToExternalList(topic).length > 0;
}

function ExternalVideosSection({ topic }: { topic: Topic }) {
  const videos = videoMediaToExternalList(topic);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);

  if (videos.length === 0) return null;

  return (
    <div className="mt-5 space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
        <Play className="w-3.5 h-3.5" />
        <span>Videos ({videos.length})</span>
      </div>
      <div className={`grid gap-3 ${videos.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {videos.map((video, idx) => {
          const parsed = parseVideoUrl(video.url);
          if (!parsed) return null;
          return (
            <div key={idx} className="group">
              {activeVideo === idx ? (
                <div className="rounded-xl overflow-hidden border border-emerald-200/50 dark:border-emerald-700/30 shadow-lg shadow-emerald-500/5">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={getVideoEmbedSrc(parsed)}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={video.title}
                    />
                  </div>
                  <div className="px-3 py-2 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">{video.title}</span>
                    <button
                      onClick={() => setActiveVideo(null)}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setActiveVideo(idx)}
                  className="w-full rounded-xl border border-slate-200/60 dark:border-slate-700/30 bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-800/60 dark:to-emerald-900/10 p-4 flex items-center gap-3 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md hover:shadow-emerald-500/5 transition-all group text-left"
                >
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-400/20 transition-colors">
                    <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400 ml-0.5" />
                  </span>
                  <div className="min-w-0">
                    <span className="block text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                      {video.title}
                    </span>
                    <span className="block text-[0.7rem] text-slate-400 dark:text-slate-500 mt-0.5">Click para reproducir</span>
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Clinical Pearls Box ─── */
function ClinicalPearlsBox({ pearls, lang }: { pearls: string[]; lang?: string }) {
  const label = lang === 'en' ? 'Clinical Pearls' : 'Perlas Clínicas';
  return (
    <div className="mt-5 rounded-xl border border-amber-200/60 dark:border-amber-700/30 bg-gradient-to-br from-amber-50/80 to-yellow-50/50 dark:from-amber-900/20 dark:to-yellow-900/10 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </span>
        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">{label}</h4>
      </div>
      <ul className="space-y-2">
        {pearls.map((pearl, i) => (
          <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-amber-900 dark:text-amber-200">
            <span className="text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0">💡</span>
            <span>{renderInline(pearl, `pearl-${i}`)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Key Points Box ─── */
function KeyPointsBox({ points, lang }: { points: string[]; lang?: string }) {
  const label = lang === 'en' ? 'Key Points' : 'Puntos Clave';
  return (
    <div className="mt-5 rounded-xl border border-blue-200/60 dark:border-blue-700/30 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/10 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-800/40 flex items-center justify-center">
          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </span>
        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">{label}</h4>
      </div>
      <ul className="space-y-2">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-blue-900 dark:text-blue-200">
            <span className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0">📌</span>
            <span>{renderInline(point, `kp-${i}`)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Image Gallery ─── */
function ImageGallery({ images }: { images: { src: string; alt: string; caption?: string }[] }) {
  return (
    <div className="mt-5 space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
        <ImageIcon className="w-3.5 h-3.5" />
        <span>Imágenes ({images.length})</span>
      </div>
      <div className={`grid gap-4 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {images.map((img, idx) => (
          <figure key={idx} className="rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-700/30 shadow-sm">
            <img src={img.src} alt={img.alt} className="w-full h-auto object-cover" loading="lazy" />
            {img.caption && (
              <figcaption className="px-3 py-2 bg-slate-50/80 dark:bg-slate-800/80 text-xs text-slate-500 dark:text-slate-400 text-center italic">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}

function TopicBody({
  topic,
  lang,
  headingLevel = 3,
}: {
  topic: Topic;
  lang: 'es' | 'en';
  headingLevel?: RichHeadingLevel;
}) {
  const lt = localizedTopic(topic, lang);
  const hasContent = Boolean(lt.content);
  const hasExtras = Boolean(
    (lt.clinicalPearls && lt.clinicalPearls.length > 0)
    || (lt.keyPoints && lt.keyPoints.length > 0)
    || (topic.imageUrls && topic.imageUrls.length > 0)
    || topicHasVideos(topic)
  );
  if (!hasContent && !hasExtras) return null;

  return (
    <div>
      {hasContent && <RichContent text={lt.content!} headingLevel={headingLevel} />}
      {lt.clinicalPearls && lt.clinicalPearls.length > 0 && (
        <ClinicalPearlsBox pearls={lt.clinicalPearls} lang={lang} />
      )}
      {lt.keyPoints && lt.keyPoints.length > 0 && (
        <KeyPointsBox points={lt.keyPoints} lang={lang} />
      )}
      {topic.imageUrls && topic.imageUrls.length > 0 && (
        <ImageGallery images={topic.imageUrls} />
      )}
      {topicHasVideos(topic) && <ExternalVideosSection topic={topic} />}
    </div>
  );
}

function NestedTopicSections({
  topics,
  lang,
  parentIndex,
  registerRef,
  headingLevel = 3,
}: {
  topics: Topic[];
  lang: 'es' | 'en';
  parentIndex: string;
  registerRef: (id: string, el: HTMLElement | null) => void;
  headingLevel?: 3 | 4;
}) {
  const Heading = headingLevel === 3 ? 'h3' : 'h4';
  return (
    <div className="space-y-6">
      {topics.map((child, i) => {
        const lt = localizedTopic(child, lang);
        const nested = Boolean(child.children?.length);
        return (
          <section
            key={child.id}
            ref={(el) => registerRef(child.id, el)}
            id={`section-${child.id}`}
            className="scroll-mt-24"
          >
            <Heading className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              <span className="font-mono text-xs text-slate-400 dark:text-slate-500 mr-2">
                {parentIndex}.{i + 1}
              </span>
              {lt.title}
            </Heading>
            {lang === 'es' && child.titleEn && (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5 pl-8">{child.titleEn}</p>
            )}
            {lang === 'en' && child.title !== lt.title && (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5 pl-8">{child.title}</p>
            )}
            <div className="mt-3">
              <TopicBody topic={child} lang={lang} headingLevel={headingLevel === 3 ? 4 : 5} />
            </div>
            {nested && (
              <div className="mt-4 ml-3 sm:ml-4 pl-3 sm:pl-4 border-l border-slate-200/70 dark:border-slate-700/50">
                <NestedTopicSections
                  topics={child.children!}
                  lang={lang}
                  parentIndex={`${parentIndex}.${i + 1}`}
                  registerRef={registerRef}
                  headingLevel={4}
                />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function TocTopicTree({
  topics,
  lang,
  activeSection,
  isTopicDone,
  scrollToSection,
  depth = 0,
  canProposeContent,
  moduleId,
}: {
  topics: Topic[];
  lang: 'es' | 'en';
  activeSection: string;
  isTopicDone: (id: string) => boolean;
  scrollToSection: (id: string) => void;
  depth?: number;
  canProposeContent?: boolean;
  moduleId?: string;
}) {
  return (
    <nav className={depth === 0 ? 'space-y-1' : 'mt-0.5 ml-3 space-y-0.5 border-l border-slate-200/70 dark:border-slate-700/40 pl-2'}>
      {topics.map((child, i) => {
        const childDone = isTopicDone(child.id);
        const isActive = activeSection === child.id;
        const hasKids = Boolean(child.children?.length);
        return (
          <div key={child.id}>
            <button
              type="button"
              onClick={() => scrollToSection(child.id)}
              className={`w-full text-left rounded-xl transition-all duration-200 flex items-start gap-2 ${
                depth === 0 ? 'px-3 py-2 text-sm' : 'px-2 py-1.5 text-xs'
              } ${
                isActive
                  ? childDone
                    ? 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-medium border-l-2 border-emerald-500 shadow-xs'
                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium border-l-2 border-blue-500 shadow-xs'
                  : childDone
                    ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {childDone ? (
                <CheckCircle2 className={`${depth === 0 ? 'w-3.5 h-3.5' : 'w-3 h-3'} text-emerald-500 flex-shrink-0 mt-0.5`} />
              ) : (
                <span className="font-mono text-[0.65rem] text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0">
                  {i + 1}
                </span>
              )}
              <span className="line-clamp-2 leading-snug flex-1">{localizedTopic(child, lang).title}</span>
              {childDone && depth === 0 && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5">
                  ✓
                </span>
              )}
            </button>
            {canProposeContent && moduleId && !hasKids && (
              <div className="pl-7 pr-1">
                <ProposeQuizLink moduleId={moduleId} topicId={child.id} />
              </div>
            )}
            {hasKids && (
              <TocTopicTree
                topics={child.children!}
                lang={lang}
                activeSection={activeSection}
                isTopicDone={isTopicDone}
                scrollToSection={scrollToSection}
                depth={depth + 1}
                canProposeContent={canProposeContent}
                moduleId={moduleId}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

/* ─── References Section ─── */
function ReferencesSection({ references }: { references: Reference[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-10 pt-6 border-t border-slate-200/60 dark:border-slate-700/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
      >
        <BookMarked className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        <span>Bibliografía ({references.length})</span>
        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <ol className="mt-4 space-y-3">
              {references.map((ref, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[0.85rem] sm:text-sm leading-relaxed">
                  <span className="text-[0.7rem] font-mono text-slate-400 dark:text-slate-500 mt-1 flex-shrink-0 w-5 text-right">{i + 1}.</span>
                  <div className="text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{ref.authors}</span>
                    {' '}
                    <span className="italic">{ref.title}.</span>
                    {' '}
                    <span>{ref.journal}, {ref.year}.</span>
                    {ref.url && (
                      <>
                        {' '}
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          Abrir <ExternalLink className="w-3 h-3" />
                        </a>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Component ─── */
export default function TopicPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const lang = useSettingsStore((s) => s.language);
  const { canProposeContent, user } = useAuth();
  const homeHref = user ? '/portal' : '/';
  const homeLabel = lang === 'en' ? 'Home' : user ? 'Portal' : 'Inicio';
  const { module: mod, loading: moduleLoading } = useMergedModule(moduleId);

  const [showTOC, setShowTOC] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [quizFlag, setQuizFlag] = useState<QuizTopicFlag | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const mainRef = useRef<HTMLElement>(null);

  // Scroll tracking for scroll-to-top button and active section
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      // Reading progress
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setReadingProgress(Math.min(100, Math.round((window.scrollY / docHeight) * 100)));
      }

      // Determine active section
      const entries = Array.from(sectionRefs.current.entries());
      let active = '';
      for (const [id, el] of entries) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) active = id;
      }
      if (active) setActiveSection(active);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on route change, unless we are jumping to a pending section
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setShowTOC(false);
  }, [location.pathname]);

  const scrollToSection = useCallback((id: string) => {
    const el = sectionRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowTOC(false);
    }
  }, []);

  useEffect(() => {
    const sectionId = location.hash.startsWith('#section-')
      ? location.hash.slice('#section-'.length)
      : '';
    if (location.hash === '#evaluacion') {
      let attempts = 0;
      let timer = 0;
      const tryScroll = () => {
        const el = document.getElementById('evaluacion');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        if (attempts < 16) {
          attempts += 1;
          timer = window.setTimeout(tryScroll, 80);
        }
      };
      timer = window.setTimeout(tryScroll, 50);
      return () => window.clearTimeout(timer);
    }
    if (!sectionId) return;

    let attempts = 0;
    let timer = 0;
    const tryScroll = () => {
      const el = sectionRefs.current.get(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (attempts < 12) {
        attempts += 1;
        timer = window.setTimeout(tryScroll, 80);
      }
    };
    timer = window.setTimeout(tryScroll, 50);
    return () => window.clearTimeout(timer);
  }, [location.hash, location.pathname]);

  const registerRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el);
  }, []);

  const currentTopicCandidates = useMemo(() => {
    if (!mod) return [];
    const basePath = `/modulo/${moduleId}/`;
    const topicPathStr = location.pathname.replace(basePath, '');
    const pathParts = topicPathStr.split('/').filter(Boolean);
    const { topic: resolvedTopic, breadcrumbs } = findTopicByPath(mod.topics, pathParts);
    if (!resolvedTopic) return [];

    // Candidates in priority order:
    // 1. Current resolved topic ID
    // 2. Nearest ancestors (reverse breadcrumbs)
    // 3. Child subtopics (if parent container)
    const list: string[] = [resolvedTopic.id];
    for (let i = breadcrumbs.length - 2; i >= 0; i--) {
      if (breadcrumbs[i]?.id) list.push(breadcrumbs[i].id);
    }
    if (resolvedTopic.children && resolvedTopic.children.length > 0) {
      for (const ch of resolvedTopic.children) {
        if (ch.id) list.push(ch.id);
      }
    }
    return Array.from(new Set(list));
  }, [mod, moduleId, location.pathname]);

  useEffect(() => {
    if (!currentTopicCandidates.length) {
      setQuizFlag(null);
      return;
    }
    let isMounted = true;
    (async () => {
      for (const tid of currentTopicCandidates) {
        try {
          const flag = await getQuizFlagForTopic(tid);
          if (flag && flag.question_count > 0 && isMounted) {
            setQuizFlag(flag);
            return;
          }
        } catch {
          // continue search
        }
      }
      if (isMounted) setQuizFlag(null);
    })();
    return () => {
      isMounted = false;
    };
  }, [currentTopicCandidates]);

  const pathParts = useMemo(() => {
    const basePath = `/modulo/${moduleId}/`;
    const topicPathStr = location.pathname.replace(basePath, '');
    return topicPathStr.split('/').filter(Boolean);
  }, [moduleId, location.pathname]);

  useEffect(() => {
    if (mod && moduleId && moduleId !== mod.id) {
      const canonicalPath = pathParts.length > 0
        ? `/modulo/${mod.id}/${pathParts.join('/')}`
        : `/modulo/${mod.id}`;
      navigate(canonicalPath, { replace: true });
    }
  }, [mod, moduleId, navigate, pathParts]);

  const { topic, breadcrumbs } = useMemo(() => {
    if (!mod) return { topic: null as Topic | null, breadcrumbs: [] as Topic[] };
    return findTopicByPath(mod.topics, pathParts);
  }, [mod, pathParts]);

  const allFlat = useMemo(() => (mod ? getAllFlatTopics(mod.topics) : []), [mod]);
  const currentIndex = allFlat.findIndex((f) => f.path.join('/') === pathParts.join('/'));
  const prevTopic = currentIndex > 0 ? allFlat[currentIndex - 1] : null;
  const nextTopic = currentIndex >= 0 && currentIndex < allFlat.length - 1 ? allFlat[currentIndex + 1] : null;

  const { isCompleted: isTopicDoneHook, getModuleStats, completedTopicIds, quizGate } = useTopicProgress();
  const modStats = useMemo(() => {
    return mod ? getModuleStats(mod.topics) : null;
  }, [mod, getModuleStats]);
  const isModuleCompleted = modStats?.isFullyCompleted ?? false;

  const nextPendingTarget = useMemo(() => {
    if (!mod || !topic) return null;
    const nextInModule = findNextIncompleteFlatTopic(allFlat, currentIndex, completedTopicIds, quizGate);
    if (nextInModule) {
      return {
        title: localizedTopic(nextInModule.topic, lang).title,
        url: buildLessonResumeUrl(mod.id, nextInModule.path, nextInModule.topic, completedTopicIds, quizGate),
      };
    }
    const nextAcross = getNextPendingCurriculumLesson(
      completedTopicIds,
      {
        moduleId: mod.id,
        topicId: pathParts[0] || topic.id,
      },
      undefined,
      quizGate
    );
    if (!nextAcross) return null;
    return { title: nextAcross.topicTitle, url: nextAcross.url };
  }, [allFlat, currentIndex, completedTopicIds, lang, mod, pathParts, quizGate, topic]);

  const hasEvaluation = Boolean(quizFlag && quizFlag.question_count > 0);
  const evaluationPassed = Boolean(
    quizFlag && quizGate.passedQuizTopicIds.has(quizFlag.topic_id)
  );

  const scrollToEvaluation = useCallback(() => {
    document.getElementById('evaluacion')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    if (user && mod && topic) {
      setLastVisitedTopic(user.id, {
        moduleId: mod.id,
        moduleTitle: mod.title,
        topicId: topic.id,
        topicTitle: localizedTopic(topic, lang).title,
        url: location.pathname,
        updatedAt: new Date().toISOString(),
      });
      if (hasEvaluation) {
        setIsCompleted(evaluationPassed);
      } else {
        setIsCompleted(isCurriculumNodeCompleted(topic, getCompletedTopics(user.id), quizGate));
      }
    }
  }, [user, mod, topic, location.pathname, lang, quizGate, hasEvaluation, evaluationPassed]);

  useEffect(() => {
    const handleProgress = () => {
      if (!user || !topic) return;
      if (hasEvaluation) {
        setIsCompleted(Boolean(quizFlag && getPassedQuizTopicIdsSync(user.id).has(quizFlag.topic_id)));
      } else {
        setIsCompleted(isCurriculumNodeCompleted(topic, getCompletedTopics(user.id), quizGate));
      }
    };
    window.addEventListener(TOPIC_PROGRESS_EVENT, handleProgress);
    return () => window.removeEventListener(TOPIC_PROGRESS_EVENT, handleProgress);
  }, [user, topic, quizGate, hasEvaluation, quizFlag]);

  if (moduleLoading && !mod) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-28 text-center text-slate-500">
        {lang === 'en' ? 'Loading…' : 'Cargando…'}
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-28 text-center">
        <h1 className="text-2xl font-bold mb-4">{lang === 'en' ? 'Module not found' : 'Módulo no encontrado'}</h1>
        <Link to={homeHref} className="text-blue-500 hover:underline">{lang === 'en' ? '← Back to home' : '← Volver al portal'}</Link>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-28 text-center">
        <h1 className="text-2xl font-bold mb-4">{lang === 'en' ? 'Topic not found' : 'Tema no encontrado'}</h1>
        <Link to={`/modulo/${moduleId}`} className="text-blue-500 hover:underline">{lang === 'en' ? '← Back to module' : '← Volver al módulo'}</Link>
      </div>
    );
  }

  const hasChildContent = topic.children && topic.children.length > 0;
  const isLeafTopic = !hasChildContent;
  const firstLevelTopicId = pathParts[0] || topic.id;
  const references = getReferencesForTopic(mod.id, firstLevelTopicId);
  const lt = localizedTopic(topic, lang);
  const modTitle = (lang === 'en' && mod.titleEn) || mod.title;

  return (
    <CourseGate moduleId={moduleId!} topicId={topic.id}>
      <main ref={mainRef} id="contenido-principal" className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 pt-20 sm:pt-24 pb-24">
        {/* Grid layout: content + sidebar */}
        <div className="lg:grid lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] lg:gap-10 xl:gap-14">
        {/* Content Column */}
        <div className="min-w-0">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 sm:mb-8">
          <Link to={homeHref} className="hover:text-blue-500 transition-colors flex items-center gap-1 min-h-[2rem]">
            <Home className="w-3.5 h-3.5" /> {homeLabel}
          </Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link to={`/modulo/${mod.id}`} className="hover:text-blue-500 transition-colors truncate max-w-[140px] sm:max-w-none min-h-[2rem] inline-flex items-center gap-1.5">
            {isModuleCompleted ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {mod.emoji} {modTitle}
              </span>
            ) : (
              <span>{mod.emoji} {modTitle}</span>
            )}
          </Link>
          {breadcrumbs.map((bc, i) => (
            <span key={bc.id} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              {i < breadcrumbs.length - 1 ? (
                <Link to={`/modulo/${mod.id}/${pathParts.slice(0, i + 1).join('/')}`} className="hover:text-blue-500 transition-colors truncate max-w-[100px] sm:max-w-none min-h-[2rem] inline-flex items-center">
                  {localizedTopic(bc, lang).title}
                </Link>
              ) : (
                <span className="text-slate-800 dark:text-white font-medium truncate max-w-[140px] sm:max-w-none">{localizedTopic(bc, lang).title}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Topic Header */}
        <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Module color accent bar: green if completed, original mod.color if not */}
          <div className={`h-1.5 w-20 rounded-full transition-colors duration-500 ${
            isModuleCompleted
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/30'
              : `bg-gradient-to-r ${mod.color}`
          } mb-4`} />

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
              {lt.title}
            </h1>
            {quizFlag && quizFlag.question_count > 0 && (
              <QuizTopicBadge label={lang === 'en' ? 'Assessment' : 'Evaluación'} />
            )}
          </div>
          {lang === 'es' && topic.titleEn && (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic mb-4">{topic.titleEn}</p>
          )}
          {lang === 'en' && topic.title !== lt.title && (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic mb-4">{topic.title}</p>
          )}

          {/* Sticky/Prominent Student Lesson Status Bar */}
          {user && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 sm:p-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/50 backdrop-blur-sm shadow-xs">
              <div className="flex items-center gap-2.5">
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {lang === 'en' ? 'Lesson Completed' : 'Lección Completada'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/70 dark:border-amber-800">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    {lang === 'en' ? 'Lesson Pending' : 'Lección Pendiente'}
                  </span>
                )}
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                  {isCompleted
                    ? (lang === 'en' ? 'Registered in your study curriculum' : 'Registrada en tu progreso curricular y créditos CME')
                    : hasEvaluation
                    ? (lang === 'en' ? 'Pass the assessment at the end of this lesson to complete it' : 'Aprueba la evaluación al final de esta lección para marcarla como completada')
                    : (lang === 'en' ? 'Mark as completed when you finish studying' : 'Márcala como completada al concluir tu lectura')}
                </span>
              </div>

              {hasEvaluation && !isCompleted ? (
                <button
                  type="button"
                  onClick={scrollToEvaluation}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs shadow-cyan-600/20 flex items-center gap-1.5"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'Go to assessment' : 'Ir a la evaluación'}
                </button>
              ) : hasEvaluation && isCompleted ? (
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  {lang === 'en' ? 'Assessment passed' : 'Evaluación aprobada'}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!user || !topic) return;
                    const childIds = topic.children ? getAllTopicIds(topic.children) : [];
                    const nextState = toggleTopicCompleted(user.id, topic.id, childIds);
                    setIsCompleted(nextState);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                    isCompleted
                      ? 'bg-slate-100 dark:bg-slate-700/70 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isCompleted
                    ? (lang === 'en' ? 'Mark as pending' : 'Marcar como pendiente')
                    : (lang === 'en' ? 'Mark as completed' : 'Marcar como completada')}
                </button>
              )}
            </div>
          )}

          {topic.contributionMeta && (
            <ContributionBanner meta={topic.contributionMeta} />
          )}


          {canProposeContent && mod && (
            <div className="mb-4">
              {hasChildContent && (
                <p className="text-xs text-violet-600 dark:text-violet-400 mb-2">
                  Los cuestionarios se crean por subtema. Usa &quot;Proponer cuestionario&quot; en cada sección numerada abajo,
                  o ve a{' '}
                  <Link to="/colaborador/cuestionario" className="underline font-medium">
                    Colaborar → Nuevo cuestionario
                  </Link>
                  .
                </p>
              )}
              <ContributorContentActions
                moduleId={mod.id}
                topicId={topic.id}
                parentPath={pathParts}
                parentId={pathParts.length > 1 ? pathParts[pathParts.length - 2] : null}
                isLeafTopic={isLeafTopic}
                showSubtopic={!isLeafTopic || !hasChildContent}
              />
            </div>
          )}

          {/* Main content */}
          {lt.content && (
            <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/30 shadow-sm">
              <RichContent text={lt.content} headingLevel={2} />
              {lt.clinicalPearls && lt.clinicalPearls.length > 0 && (
                <ClinicalPearlsBox pearls={lt.clinicalPearls} lang={lang} />
              )}
              {lt.keyPoints && lt.keyPoints.length > 0 && (
                <KeyPointsBox points={lt.keyPoints} lang={lang} />
              )}
              {topic.imageUrls && topic.imageUrls.length > 0 && (
                <ImageGallery images={topic.imageUrls} />
              )}
              {topicHasVideos(topic) && <ExternalVideosSection topic={topic} />}
            </div>
          )}
          {/* Media without content */}
          {!lt.content && (topicHasVideos(topic) || lt.clinicalPearls?.length || lt.keyPoints?.length) && (
            <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/30 shadow-sm">
              {lt.clinicalPearls && lt.clinicalPearls.length > 0 && (
                <ClinicalPearlsBox pearls={lt.clinicalPearls} lang={lang} />
              )}
              {lt.keyPoints && lt.keyPoints.length > 0 && (
                <KeyPointsBox points={lt.keyPoints} lang={lang} />
              )}
              {topicHasVideos(topic) && <ExternalVideosSection topic={topic} />}
            </div>
          )}

          {/* Children: auto-expanded article sections */}
          {hasChildContent && (
            <div className="space-y-6 mt-6">
              {topic.children!.map((child, i) => {
                const lc = localizedTopic(child, lang);
                const childPath = `/modulo/${mod.id}/${[...pathParts, child.id].join('/')}`;
                const hasGrandchildren = child.children && child.children.length > 0;

                return (
                  <motion.section
                    key={child.id}
                    ref={(el) => registerRef(child.id, el)}
                    id={`section-${child.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.35 }}
                    className="scroll-mt-20"
                  >
                    <div className="rounded-2xl bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/30 shadow-sm overflow-hidden">
                      {/* Section header */}
                      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 flex items-start gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-300 text-xs font-mono font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white leading-tight">
                            {hasGrandchildren ? (
                              <Link to={childPath} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                {lc.title}
                              </Link>
                            ) : (
                              lc.title
                            )}
                          </h2>
                          {lang === 'es' && child.titleEn && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5">{child.titleEn}</p>
                          )}
                          {lang === 'en' && child.title !== lc.title && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5">{child.title}</p>
                          )}
                        </div>
                        {hasGrandchildren && (
                          <Link
                            to={childPath}
                            className="flex-shrink-0 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 mt-1 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            {child.children!.length} {lang === 'en' ? 'subtopics' : 'subtemas'} <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      {canProposeContent && mod && !child.children?.length && (
                        <div className="px-5 sm:px-6 pb-3 border-b border-slate-100 dark:border-slate-700/40">
                          <ContributorContentActions
                            moduleId={mod.id}
                            topicId={child.id}
                            parentPath={[...pathParts, child.id]}
                            parentId={topic.id}
                            isLeafTopic
                            showSubtopic={false}
                            compact
                          />
                        </div>
                      )}

                      {(hasGrandchildren
                        || lc.content
                        || lc.clinicalPearls?.length
                        || lc.keyPoints?.length
                        || child.imageUrls?.length
                        || topicHasVideos(child)) && (
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                          <div className="border-t border-slate-100 dark:border-slate-700/40 pt-4 space-y-5">
                            <TopicBody topic={child} lang={lang} />
                            {hasGrandchildren && (
                              <NestedTopicSections
                                topics={child.children!}
                                lang={lang}
                                parentIndex={String(i + 1)}
                                registerRef={registerRef}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.section>
                );
              })}
            </div>
          )}

          {/* ── Per-Topic Bibliography ── */}
          {references.length > 0 && (
            <ReferencesSection references={references} />
          )}

          {user && mod && topic && (
            <TopicStudyTools
              moduleId={mod.id}
              topicId={topic.id}
              url={location.pathname}
              title={lt.title}
              pearls={lt.clinicalPearls}
              keyPoints={lt.keyPoints}
            />
          )}

          {quizFlag && quizFlag.question_count > 0 && mod && (
            <QuizGate
              topicId={quizFlag.topic_id}
              moduleId={mod.id}
              quizFlag={quizFlag}
              onPass={() => {
                if (user && topic) {
                  const ids = [topic.id, ...(topic.children ? getAllTopicIds(topic.children) : [])];
                  markMultipleTopics(user.id, ids, true);
                }
                setIsCompleted(true);
              }}
              nextTopicUrl={nextPendingTarget?.url || (nextTopic ? `/modulo/${mod.id}/${nextTopic.path.join('/')}` : `/modulo/${mod.id}`)}
            />
          )}

          {/* Lesson Completion Action Button */}
          {user && (
            <div className="my-8 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-gradient-to-r from-blue-50/50 via-slate-50 to-indigo-50/50 dark:from-slate-800/40 dark:to-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-0.5 text-center sm:text-left">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-500 fill-emerald-500 text-white' : 'text-slate-400'}`} />
                  {isCompleted ? 'Lección completada' : '¿Terminaste de estudiar esta lección?'}
                </p>
                <p className="text-xs text-slate-500">
                  {isCompleted
                    ? nextPendingTarget
                      ? `Siguiente tema pendiente: ${nextPendingTarget.title}`
                      : 'Esta lección ya suma a tu porcentaje de avance y créditos CME en tu portal de alumno.'
                    : hasEvaluation
                    ? 'Debes aprobar la evaluación de este tema para registrarlo como completado.'
                    : 'Márcala como completada para registrar tu progreso en tu portal de estudiante.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {isCompleted && nextPendingTarget && (
                  <Link
                    to={nextPendingTarget.url}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 flex items-center gap-2"
                  >
                    Continuar siguiente
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                {hasEvaluation && !isCompleted ? (
                  <button
                    type="button"
                    onClick={scrollToEvaluation}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm flex items-center gap-2"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Ir a la evaluación
                  </button>
                ) : hasEvaluation && isCompleted ? (
                  <span className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Evaluación aprobada
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user || !topic) return;
                      const childIds = topic.children ? getAllTopicIds(topic.children) : [];
                      const nextState = toggleTopicCompleted(user.id, topic.id, childIds);
                      setIsCompleted(nextState);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-emerald-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isCompleted ? 'Completada (desmarcar)' : 'Marcar como completada'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Prev/Next Navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-700/30">
            {prevTopic ? (
              <Link
                to={`/modulo/${mod.id}/${prevTopic.path.join('/')}`}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all text-sm group flex-1 min-w-0"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[0.65rem] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">{lang === 'en' ? 'Previous' : 'Anterior'}</span>
                  <span className="block truncate text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium">
                    {localizedTopic(prevTopic.topic, lang).title}
                  </span>
                </div>
              </Link>
            ) : <div className="hidden sm:block flex-1" />}

            {isCompleted && nextPendingTarget ? (
              <Link
                to={nextPendingTarget.url}
                className="flex items-center justify-end gap-3 px-4 py-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-500 transition-all text-sm group flex-1 min-w-0 text-right"
              >
                <div className="min-w-0">
                  <span className="block text-[0.65rem] uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-0.5">
                    {lang === 'en' ? 'Next pending' : 'Siguiente pendiente'}
                  </span>
                  <span className="block truncate text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium">
                    {nextPendingTarget.title}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors flex-shrink-0" />
              </Link>
            ) : nextTopic ? (
              <Link
                to={`/modulo/${mod.id}/${nextTopic.path.join('/')}`}
                className="flex items-center justify-end gap-3 px-4 py-3.5 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all text-sm group flex-1 min-w-0 text-right"
              >
                <div className="min-w-0">
                  <span className="block text-[0.65rem] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">{lang === 'en' ? 'Next' : 'Siguiente'}</span>
                  <span className="block truncate text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium">
                    {localizedTopic(nextTopic.topic, lang).title}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
              </Link>
            ) : <div className="hidden sm:block flex-1" />}
          </div>
        </motion.article>
        </div>{/* End Content Column */}

        {/* ── Desktop TOC Sidebar (sticky in grid) ── */}
        {hasChildContent && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(var(--app-height,100vh)-8rem)] overflow-y-auto">
              <div className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/30 shadow-lg p-4">
                {/* Progress bar in TOC */}
                {(() => {
                  const completedChildrenCount = topic.children
                    ? topic.children.filter((c) => isTopicDoneHook(c.id)).length
                    : 0;
                  const totalChildrenCount = topic.children?.length ?? 0;
                  const childrenCompletionPct = totalChildrenCount > 0
                    ? Math.round((completedChildrenCount / totalChildrenCount) * 100)
                    : 0;
                  const isAllChildrenDone = totalChildrenCount > 0 && completedChildrenCount === totalChildrenCount;

                  return (
                    <>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ease-out ${
                              isAllChildrenDone
                                ? 'bg-emerald-500 shadow-sm shadow-emerald-500/40'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                            }`}
                            style={{ width: `${Math.max(readingProgress, childrenCompletionPct)}%` }}
                          />
                        </div>
                        <span className={`text-[0.65rem] font-mono tabular-nums font-bold ${
                          isAllChildrenDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {completedChildrenCount}/{totalChildrenCount} ({childrenCompletionPct}%)
                        </span>
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <List className="w-3.5 h-3.5" /> Contenido
                        </span>
                        {isAllChildrenDone && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            ✓ Completado
                          </span>
                        )}
                      </h4>
                      <TocTopicTree
                        topics={topic.children!}
                        lang={lang}
                        activeSection={activeSection}
                        isTopicDone={isTopicDoneHook}
                        scrollToSection={scrollToSection}
                        canProposeContent={canProposeContent}
                        moduleId={mod?.id}
                      />
                    </>
                  );
                })()}
                {/* Back to module link */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/40 space-y-2">
                  {isCompleted && nextPendingTarget && (
                    <Link
                      to={nextPendingTarget.url}
                      className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                      <span className="line-clamp-2">
                        {lang === 'en' ? 'Continue to' : 'Continuar a'} {nextPendingTarget.title}
                      </span>
                    </Link>
                  )}
                  <Link
                    to={`/modulo/${mod.id}`}
                    className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>{lang === 'en' ? 'Back to module' : 'Volver al módulo'}</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        )}
        </div>{/* End Grid */}
      </main>

      {/* Desktop TOC is now in the grid above — removed fixed sidebar */}

      {/* ── Mobile TOC Button ── */}
      {hasChildContent && (
        <button
          onClick={() => setShowTOC(true)}
          className="lg:hidden fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          aria-label="Tabla de contenido"
        >
          <List className="w-5 h-5" />
        </button>
      )}

      {/* ── Mobile TOC Bottom Sheet ── */}
      <AnimatePresence>
        {showTOC && hasChildContent && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowTOC(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[70vh] overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <List className="w-4 h-4" /> Contenido
                </h4>
                <button onClick={() => setShowTOC(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(70vh-4rem)] p-4">
                <TocTopicTree
                  topics={topic.children!}
                  lang={lang}
                  activeSection={activeSection}
                  isTopicDone={isTopicDoneHook}
                  scrollToSection={scrollToSection}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Scroll to Top ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-4 lg:bottom-8 lg:right-8 z-30 w-10 h-10 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/40 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform backdrop-blur-sm"
            aria-label="Ir arriba"
          >
            <ChevronUp className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </motion.button>
        )}
      </AnimatePresence>
    </CourseGate>
  );
}
