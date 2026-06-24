import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { findTopicByPath, getAllFlatTopics, findTopicInTree } from '../../services/contentMerge';
import { useMergedModule } from '../../hooks/useMergedModule';
import { useAuth } from '../../contexts/AuthProvider';
import { ContributionBanner, ContributorContentActions, ProposeQuizLink } from '../editorial/TopicContribution';
import { QuizGate } from '../quiz/QuizGate';
import { QuizTopicBadge } from '../quiz/QuizTopicBadge';
import { getQuizFlagForTopic } from '../../services/quizService';
import type { QuizTopicFlag } from '../../types/quiz';
import { Topic } from '../../types/content';
import { ChevronRight, Home, ArrowLeft, ArrowRight, List, X, ChevronUp, BookMarked, ExternalLink, Play, Lightbulb, Target, ImageIcon } from 'lucide-react';
import { getReferencesForTopic, Reference } from '../../content/topicReferences';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { localizedTopic } from '../../hooks/useLocalizedContent';
import { getVideoEmbedSrc, parseVideoUrl, videoMediaToExternalList } from '../../utils/mediaValidation';

/* ─── Rich-text renderer ─── */
function renderInline(text: string, keyPrefix: string): (string | JSX.Element)[] {
  // Step 1: split by [link text](url) patterns
  const parts: (string | JSX.Element)[] = [];
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <a
        key={`${keyPrefix}-link-${match.index}`}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 underline underline-offset-2 decoration-blue-400/40 hover:decoration-blue-500 transition-colors font-medium"
      >
        {match[1]} ↗
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // Step 2: process text segments for bold and clinical values
  return parts.flatMap((part, i) => {
    if (typeof part !== 'string') return [part];
    return formatTextSegment(part, `${keyPrefix}-${i}`);
  });
}

/* ─── Table Renderer ─── */
function renderTable(lines: string[], keyBase: string) {
  const rows = lines
    .filter(l => l.trim().startsWith('|'))
    .map(line => {
      const parts = line.trim().split('|');
      // Handle the | cell | cell | format
      if (parts[0] === '') parts.shift();
      if (parts[parts.length - 1] === '') parts.pop();
      return parts.map(p => p.trim());
    });

  if (rows.length < 1) return null;

  // Detect and filter out the separator row (e.g., |---|---|)
  const dataRows = rows.filter(row => !row.every(cell => /^[\s-:]+$/.test(cell)));
  if (dataRows.length === 0) return null;

  const header = dataRows[0];
  const body = dataRows.slice(1);

  return (
    <div key={keyBase} className="my-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900/40">
      <table className="w-full text-left border-collapse min-w-[450px]">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-slate-800/80">
            {header.map((cell, i) => (
              <th key={i} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                {renderInline(cell, `${keyBase}-th-${i}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {body.map((row, ri) => (
            <tr key={ri} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {renderInline(cell, `${keyBase}-tr-${ri}-td-${ci}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RichContent({ text, className = '' }: { text: string; className?: string }) {
  const rendered = useMemo(() => {
    // Split into structural blocks by double newline
    const blocks = text.split(/\n\n+/);

    return blocks.map((block, bIdx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      const lines = trimmed.split('\n');
      
      // 1. Check if the block contains a table
      if (lines.some(l => l.trim().startsWith('|'))) {
        const parts: JSX.Element[] = [];
        let currentTableLines: string[] = [];

        lines.forEach((line, lIdx) => {
          if (line.trim().startsWith('|')) {
            currentTableLines.push(line);
          } else {
            // Render accumulated table lines if we hit a non-table line
            if (currentTableLines.length > 0) {
              const table = renderTable(currentTableLines, `b-${bIdx}-t-${lIdx}`);
              if (table) parts.push(table);
              currentTableLines = [];
            }
            // Render the non-table line as a paragraph or part of one
            if (line.trim()) {
              parts.push(
                <p key={`b-${bIdx}-l-${lIdx}`} className={lIdx > 0 ? 'mt-3' : ''}>
                  {renderInline(line, `b-${bIdx}-l-${lIdx}`)}
                </p>
              );
            }
          }
        });

        // Finalize any remaining table lines
        if (currentTableLines.length > 0) {
          const table = renderTable(currentTableLines, `b-${bIdx}-t-end`);
          if (table) parts.push(table);
        }

        return <div key={`b-${bIdx}`}>{parts}</div>;
      }

      // 2. Check if the block is a bullet list
      const isBulletList = lines.every(l => /^[•\-\*]\s/.test(l.trim()));
      if (isBulletList) {
        return (
          <ul key={`b-${bIdx}`} className="list-none space-y-1.5 my-3 ml-1">
            {lines.map((line, lIdx) => (
              <li key={`li-${bIdx}-${lIdx}`} className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400 mt-1 flex-shrink-0">•</span>
                <span>{renderInline(line.replace(/^[•\-\*]\s*/, ''), `li-${bIdx}-${lIdx}`)}</span>
              </li>
            ))}
          </ul>
        );
      }

      // 3. Normal paragraph
      return (
        <p key={`p-${bIdx}`} className={bIdx > 0 ? 'mt-3' : ''}>
          {renderInline(trimmed, `p-${bIdx}`)}
        </p>
      );
    });
  }, [text]);

  return <div className={`text-[0.95rem] sm:text-base leading-[1.8] text-slate-700 dark:text-slate-300 ${className}`}>{rendered}</div>;
}

function formatTextSegment(text: string, keyBase: string): (string | JSX.Element)[] {
  const result: (string | JSX.Element)[] = [];
  // Bold: **text**
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > last) {
      result.push(...highlightClinical(text.slice(last, match.index), `${keyBase}-${last}`));
    }
    result.push(
      <strong key={`b-${keyBase}-${match.index}`} className="font-semibold text-slate-900 dark:text-white">
        {match[1]}
      </strong>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    result.push(...highlightClinical(text.slice(last), `${keyBase}-${last}`));
  }
  return result;
}

function highlightClinical(text: string, key: string): (string | JSX.Element)[] {
  // Highlight clinical values: numbers followed by units (ms, mV, µV, m/s, mm², Hz, °C, %)
  const clinicalRegex = /([≥≤><]?\s*\d+[\.\d]*\s*(?:ms|mV|µV|m\/s|mm²|Hz|°C|%|m\/seg))/g;
  const parts: (string | JSX.Element)[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = clinicalRegex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <span key={`cv-${key}-${match.index}`} className="font-mono text-[0.85em] px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 whitespace-nowrap">
        {match[1]}
      </span>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  if (parts.length === 0) parts.push(text);
  return parts;
}

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
  const lang = useSettingsStore((s) => s.language);
  const { canProposeContent, user, roles, profile } = useAuth();
  const { module: mod, staticModule, loading: moduleLoading } = useMergedModule(moduleId);

  const [showTOC, setShowTOC] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [quizFlag, setQuizFlag] = useState<QuizTopicFlag | null>(null);
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

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowTOC(false);
  }, [location.pathname]);

  const scrollToSection = useCallback((id: string) => {
    const el = sectionRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowTOC(false);
    }
  }, []);

  const registerRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el);
  }, []);

  const leafTopicId = useMemo(() => {
    if (!mod) return null;
    const basePath = `/modulo/${moduleId}/`;
    const topicPathStr = location.pathname.replace(basePath, '');
    const pathParts = topicPathStr.split('/').filter(Boolean);
    const { topic: resolvedTopic } = findTopicByPath(mod.topics, pathParts);
    if (!resolvedTopic || resolvedTopic.children?.length) return null;
    return resolvedTopic.id;
  }, [mod, moduleId, location.pathname]);

  useEffect(() => {
    if (!leafTopicId) {
      setQuizFlag(null);
      return;
    }
    getQuizFlagForTopic(leafTopicId)
      .then(setQuizFlag)
      .catch(() => setQuizFlag(null));
  }, [leafTopicId]);

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
        <Link to="/" className="text-blue-500 hover:underline">{lang === 'en' ? '← Back to home' : '← Volver al inicio'}</Link>
      </div>
    );
  }

  const basePath = `/modulo/${moduleId}/`;
  const topicPathStr = location.pathname.replace(basePath, '');
  const pathParts = topicPathStr.split('/').filter(Boolean);
  const { topic, breadcrumbs } = findTopicByPath(mod.topics, pathParts);
  const allFlat = getAllFlatTopics(mod.topics);
  const currentIndex = allFlat.findIndex(f => f.path.join('/') === pathParts.join('/'));
  const prevTopic = currentIndex > 0 ? allFlat[currentIndex - 1] : null;
  const nextTopic = currentIndex < allFlat.length - 1 ? allFlat[currentIndex + 1] : null;

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

  // Get references for first-level topic
  const firstLevelTopicId = pathParts[0] || topic.id;
  const references = getReferencesForTopic(mod.id, firstLevelTopicId);

  // Localized fields for the main topic
  const lt = localizedTopic(topic, lang);
  const modTitle = (lang === 'en' && mod.titleEn) || mod.title;

  return (
    <>
      <main ref={mainRef} className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 pt-20 sm:pt-24 pb-24">
        {/* Grid layout: content + sidebar */}
        <div className="lg:grid lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] lg:gap-10 xl:gap-14">
        {/* Content Column */}
        <div className="min-w-0">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 sm:mb-8">
          <Link to="/" className="hover:text-blue-500 transition-colors flex items-center gap-1 min-h-[2rem]">
            <Home className="w-3.5 h-3.5" /> {lang === 'en' ? 'Home' : 'Inicio'}
          </Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link to={`/modulo/${mod.id}`} className="hover:text-blue-500 transition-colors truncate max-w-[120px] sm:max-w-none min-h-[2rem] inline-flex items-center">
            {mod.emoji} {modTitle}
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
          {/* Module color accent bar */}
          <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${mod.color} mb-4`} />

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
              {lt.title}
            </h1>
            {isLeafTopic && quizFlag && quizFlag.question_count > 0 && (
              <QuizTopicBadge label={lang === 'en' ? 'Assessment' : 'Evaluación'} />
            )}
          </div>
          {lang === 'es' && topic.titleEn && (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic mb-6">{topic.titleEn}</p>
          )}
          {lang === 'en' && topic.title !== lt.title && (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic mb-6">{topic.title}</p>
          )}

          {topic.contributionMeta && (
            <ContributionBanner meta={topic.contributionMeta} />
          )}

          {user && !canProposeContent && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 text-sm text-amber-900 dark:text-amber-200">
              {lang === 'en' ? (
                <>
                  Quiz creation requires an <strong>admin</strong>, <strong>editor</strong>, or{' '}
                  <strong>verified contributor</strong> role.{' '}
                  <Link to="/colaborador/perfil" className="underline font-medium">Complete your profile</Link>
                  {' '}or ask an admin to assign your role in Supabase.
                </>
              ) : (
                <>
                  Para proponer cuestionarios necesitas rol de <strong>admin</strong>, <strong>editor</strong> o{' '}
                  <strong>colaborador verificado</strong>.
                  {roles.length === 0 && ' Tu cuenta no tiene roles asignados aún.'}
                  {roles.includes('contributor') && !profile?.verified_at && ' Tu perfil de colaborador aún no está verificado.'}
                  {' '}
                  <Link to="/colaborador/perfil" className="underline font-medium">Completa tu perfil</Link>
                  {' '}o pide a un admin que te asigne el rol en Supabase.
                </>
              )}
            </div>
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
              <RichContent text={lt.content} />
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

                      {/* Section content — always visible */}
                      {lc.content && (
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                          <div className="border-t border-slate-100 dark:border-slate-700/40 pt-4">
                            <RichContent text={lc.content} />
                            {lc.clinicalPearls && lc.clinicalPearls.length > 0 && (
                              <ClinicalPearlsBox pearls={lc.clinicalPearls} lang={lang} />
                            )}
                            {lc.keyPoints && lc.keyPoints.length > 0 && (
                              <KeyPointsBox points={lc.keyPoints} lang={lang} />
                            )}
                            {child.imageUrls && child.imageUrls.length > 0 && (
                              <ImageGallery images={child.imageUrls} />
                            )}
                            {topicHasVideos(child) && <ExternalVideosSection topic={child} />}
                          </div>
                        </div>
                      )}
                      {/* Media without content */}
                      {!lc.content && (topicHasVideos(child) || lc.clinicalPearls?.length || lc.keyPoints?.length) && (
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                          <div className="border-t border-slate-100 dark:border-slate-700/40 pt-4">
                            {lc.clinicalPearls && lc.clinicalPearls.length > 0 && (
                              <ClinicalPearlsBox pearls={lc.clinicalPearls} lang={lang} />
                            )}
                            {lc.keyPoints && lc.keyPoints.length > 0 && (
                              <KeyPointsBox points={lc.keyPoints} lang={lang} />
                            )}
                            {topicHasVideos(child) && <ExternalVideosSection topic={child} />}
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

          {isLeafTopic && mod && (
            <QuizGate topicId={topic.id} moduleId={mod.id} quizFlag={quizFlag} />
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

            {nextTopic ? (
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
                {/* Progress bar */}
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out"
                      style={{ width: `${readingProgress}%` }}
                    />
                  </div>
                  <span className="text-[0.6rem] font-mono text-slate-400 dark:text-slate-500 tabular-nums">
                    {readingProgress}%
                  </span>
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                  <List className="w-3.5 h-3.5" /> Contenido
                </h4>
                <nav className="space-y-0.5">
                  {topic.children!.map((child, i) => (
                    <div key={child.id} className="space-y-1">
                      <button
                        onClick={() => scrollToSection(child.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-start gap-2 ${
                          activeSection === child.id
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <span className="font-mono text-[0.65rem] text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0">{i + 1}</span>
                        <span className="line-clamp-2 leading-snug">{localizedTopic(child, lang).title}</span>
                      </button>
                      {canProposeContent && mod && !child.children?.length && (
                        <div className="pl-7 pr-1">
                          <ProposeQuizLink moduleId={mod.id} topicId={child.id} />
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
                {/* Back to module link */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/40">
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
              <nav className="overflow-y-auto max-h-[calc(70vh-4rem)] p-4 space-y-1">
                {topic.children!.map((child, i) => (
                  <button
                    key={child.id}
                    onClick={() => scrollToSection(child.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-start gap-3 min-h-[44px] ${
                      activeSection === child.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-mono text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0">{i + 1}</span>
                    <span className="leading-snug">{localizedTopic(child, lang).title}</span>
                  </button>
                ))}
              </nav>
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
    </>
  );
}
