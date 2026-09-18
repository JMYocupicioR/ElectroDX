import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Topic } from '../types/content';
import { X, Search, ChevronDown, ChevronRight, BookOpen, Lock, CheckCircle2, Circle } from 'lucide-react';
import { useQuizTopicFlags } from '../hooks/useQuizTopicFlags';
import { QuizTopicBadge } from './quiz/QuizTopicBadge';
import { useAuth } from '../contexts/AuthProvider';
import { useCourseStore } from '../stores/courseStore';
import { useTopicProgress } from '../hooks/useTopicProgress';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useSyllabusCatalog } from '../hooks/useSyllabusCatalog';
import { getCourseIdForModule } from '../content/courseCatalog';
import type { CourseId } from '../types/database';

interface CourseSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ── Flatten topics for search ── */
function flattenForSearch(
  topics: Topic[],
  moduleId: string,
  moduleEmoji: string,
  parentPath: string[] = []
): { title: string; moduleId: string; moduleEmoji: string; path: string[] }[] {
  const results: { title: string; moduleId: string; moduleEmoji: string; path: string[] }[] = [];
  for (const t of topics) {
    const path = [...parentPath, t.id];
    results.push({ title: t.title, moduleId, moduleEmoji, path });
    if (t.children) results.push(...flattenForSearch(t.children, moduleId, moduleEmoji, path));
  }
  return results;
}

function topicTreeHasQuiz(topic: Topic, hasQuiz: (id: string) => boolean): boolean {
  if (!topic.children?.length) return hasQuiz(topic.id);
  return topic.children.some((child) => topicTreeHasQuiz(child, hasQuiz));
}

export function CourseSidebar({ isOpen, onClose }: CourseSidebarProps) {
  const location = useLocation();
  const { hasQuiz, moduleQuizCount } = useQuizTopicFlags();
  const { hasPremiumAccess, hasCourseAccess } = useAuth();
  const { moduleAccess, load: loadCourse } = useCourseStore();
  const { grouped, modulesWithOverrides, assignments } = useSyllabusCatalog();
  const { isCompleted, getModuleStats } = useTopicProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  // Find current module from URL
  const currentModuleId = useMemo(() => {
    const match = location.pathname.match(/\/modulo\/([^/]+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  // Auto-expand current module
  useEffect(() => {
    if (currentModuleId) {
      setExpandedModules(prev => new Set(prev).add(currentModuleId));
    }
  }, [currentModuleId]);

  // Close sidebar on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Flat search index
  const allTopics = useMemo(() => {
    return modulesWithOverrides.flatMap((mod) =>
      flattenForSearch(mod.topics, mod.id, mod.emoji)
    );
  }, [modulesWithOverrides]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return allTopics
      .filter(t => t.title.toLowerCase().includes(q))
      .slice(0, 15);
  }, [searchQuery, allTopics]);

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }, []);

  const isSearching = searchQuery.trim().length >= 2;
  const panelRef = useFocusTrap(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={onClose}
          />

          {/* Sidebar Panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Contenido del curso"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-[70] w-[85vw] sm:w-80 md:w-96 bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden"
          >
            <div ref={panelRef} className="flex flex-col h-full min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 dark:border-slate-800/60 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-white text-sm tracking-tight">Curso</h2>
                  <p className="text-[0.65rem] text-slate-400 dark:text-slate-500">{modulesWithOverrides.length} módulos</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Cerrar curso"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/40 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar tema..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-3" style={{ WebkitOverflowScrolling: 'touch' }}>
              {isSearching ? (
                /* ── Search Results ── */
                <div className="space-y-0.5">
                  {searchResults.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No se encontraron temas</p>
                  ) : (
                    searchResults.map((r, i) => (
                      <Link
                        key={`sr-${i}`}
                        to={`/modulo/${r.moduleId}/${r.path.join('/')}`}
                        className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors min-h-[44px]"
                      >
                        <span className="text-base flex-shrink-0 mt-0.5">{r.moduleEmoji}</span>
                        <span className="text-slate-700 dark:text-slate-300 leading-snug">{r.title}</span>
                      </Link>
                    ))
                  )}
                </div>
              ) : (
                /* ── Module Tree ── */
                <div className="space-y-4">
                  {grouped.map(({ course, modules }) => {
                    if (!modules.length) return null;
                    const courseLocked = !hasCourseAccess(course.id);
                    return (
                      <div key={course.id}>
                        <div className="px-3 py-1.5 mb-1 flex items-center gap-2">
                          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {course.title}
                          </p>
                          {courseLocked && <Lock className="w-3 h-3 text-amber-500" />}
                        </div>
                        <div className="space-y-1">
                  {modules.map((mod) => {
                    const isExpanded = expandedModules.has(mod.id);
                    const isCurrent = currentModuleId === mod.id;
                    const access = moduleAccess.get(mod.id);
                    const isFree = access?.required_tier === 'free';
                    const assignedCourse = getCourseIdForModule(assignments, mod.id);
                    const isLocked = !isFree && !(assignedCourse ? hasCourseAccess(assignedCourse as CourseId) : hasPremiumAccess);

                    return (
                      <div key={mod.id}>
                        {/* Module Header */}
                        <button
                          onClick={() => toggleModule(mod.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all min-h-[44px] ${
                            isCurrent
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <span className="text-base flex-shrink-0">{mod.emoji}</span>
                          <span className={`flex-1 text-left leading-snug ${isCurrent ? 'font-semibold' : 'font-medium'}`}>
                            {mod.title}
                          </span>
                          {isLocked && <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mr-1" />}
                          {moduleQuizCount(mod.id) > 0 && (
                            <QuizTopicBadge compact />
                          )}
                          <span className="text-[0.6rem] text-slate-400 dark:text-slate-500 font-mono flex-shrink-0 mr-1">
                            {(() => {
                              const s = getModuleStats(mod.topics);
                              return s.completed > 0 ? `${s.completed}/${s.total}` : `${s.total}`;
                            })()}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          )}
                        </button>

                        {/* Topics */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-4 pl-3 border-l-2 border-slate-200/60 dark:border-slate-700/40 space-y-0.5 py-1">
                                {mod.topics.map((topic) => {
                                  const topicUrl = `/modulo/${mod.id}/${topic.id}`;
                                  const isActive = location.pathname.startsWith(topicUrl);
                                  const done = isCompleted(topic.id);

                                  return (
                                    <Link
                                      key={topic.id}
                                      to={topicUrl}
                                      className={`block px-3 py-2 rounded-lg text-[0.8rem] sm:text-sm transition-all min-h-[40px] flex items-center gap-2 ${
                                        isActive
                                          ? 'bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium border-l-2 border-blue-500 -ml-[2px] pl-[14px]'
                                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
                                      }`}
                                    >
                                      {done ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                      ) : (
                                        <Circle className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                                      )}
                                      <span className={`leading-snug flex-1 ${done ? 'font-medium text-slate-800 dark:text-slate-200' : ''}`}>
                                        {topic.title}
                                      </span>
                                      {topicTreeHasQuiz(topic, hasQuiz) && <QuizTopicBadge compact />}
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </nav>

            {/* Footer */}
            <div className="flex-shrink-0 px-4 py-3 border-t border-slate-100 dark:border-slate-800/40 space-y-2">
              <Link
                to="/portal?tab=modules"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all font-semibold min-h-[44px]"
              >
                <BookOpen className="w-4 h-4" />
                Ir a mis clases
              </Link>
            </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
