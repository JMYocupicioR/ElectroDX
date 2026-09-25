import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Circle,
  Eye,
  EyeOff,
  Pencil,
} from 'lucide-react';
import type { Module, Topic } from '../../types/content';
import type { SyllabusTopicOverride } from '../../types/database';
import type { GroupedSyllabusCourse } from '../../content/courseCatalog';
import { QuizTopicBadge } from '../quiz/QuizTopicBadge';
import { SortableList } from '../common/SortableList';
import { SyllabusQuickAddMenu, type SyllabusQuickAddAction } from './SyllabusQuickAddMenu';
import { isTopicVisible, topicHasBody } from '../../utils/syllabusTree';

interface CourseSyllabusEditorTreeProps {
  grouped: GroupedSyllabusCourse[];
  overrides: SyllabusTopicOverride[];
  pathname: string;
  currentModuleId: string | null;
  expandedModules: Set<string>;
  hasQuiz: (topicId: string) => boolean;
  busy: boolean;
  onToggleModule: (moduleId: string) => void;
  onReorderModules: (courseId: string, moduleIds: string[], from: number, to: number) => void;
  onReorderTopics: (moduleId: string, siblings: Topic[], from: number, to: number) => void;
  onToggleModuleVisible: (moduleId: string, nextVisible: boolean) => void;
  onToggleTopicVisible: (moduleId: string, topic: Topic, siblings: Topic[], nextVisible: boolean) => void;
  onQuickAdd: (action: SyllabusQuickAddAction, ctx: {
    moduleId: string;
    moduleTitle: string;
    topic?: Topic;
    parentId?: string | null;
  }) => void;
}

function topicTreeHasQuiz(topic: Topic, hasQuiz: (id: string) => boolean): boolean {
  if (!topic.children?.length) return hasQuiz(topic.id);
  return topic.children.some((child) => topicTreeHasQuiz(child, hasQuiz));
}

export function CourseSyllabusEditorTree({
  grouped,
  overrides,
  pathname,
  currentModuleId,
  expandedModules,
  hasQuiz,
  busy,
  onToggleModule,
  onReorderModules,
  onReorderTopics,
  onToggleModuleVisible,
  onToggleTopicVisible,
  onQuickAdd,
}: CourseSyllabusEditorTreeProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {grouped.map(({ course, rows }) => {
        if (!rows.length) return null;
        const moduleIds = rows.map((row) => row.module.id);
        return (
          <div key={course.id}>
            <div className="px-3 py-1.5 mb-1">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {course.title}
              </p>
            </div>
            <SortableList
              items={rows}
              getId={(row) => row.module.id}
              disabled={busy}
              onReorder={(from, to) => onReorderModules(course.id, moduleIds, from, to)}
              renderItem={(row, handle) => {
                const mod = row.module;
                const isExpanded = expandedModules.has(mod.id);
                const isCurrent = currentModuleId === mod.id;
                const visible = row.isVisible;
                return (
                  <div className={!visible ? 'opacity-55' : ''}>
                    <div
                      className={`w-full flex items-center gap-1 px-1.5 py-1.5 rounded-xl text-sm min-h-[44px] ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {handle}
                      <button
                        type="button"
                        onClick={() => onToggleModule(mod.id)}
                        className="flex-1 flex items-center gap-2 min-w-0 py-1 text-left"
                      >
                        <span className="text-base flex-shrink-0">{mod.emoji}</span>
                        <span className={`flex-1 break-words line-clamp-2 leading-snug ${isCurrent ? 'font-semibold' : 'font-medium'}`}>
                          {mod.title}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        aria-label={visible ? 'Ocultar módulo a los alumnos' : 'Mostrar módulo a los alumnos'}
                        title={visible ? 'Ocultar módulo' : 'Mostrar módulo'}
                        onClick={() => onToggleModuleVisible(mod.id, !visible)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <SyllabusQuickAddMenu
                        actions={[
                          { id: 'topic', label: 'Agregar tema' },
                          { id: 'live-class', label: 'Programar clase' },
                        ]}
                        onAction={(action) =>
                          onQuickAdd(action, { moduleId: mod.id, moduleTitle: mod.title })
                        }
                      />
                    </div>
                    {isExpanded && (
                      <div className="ml-4 pl-2 border-l-2 border-slate-200/60 dark:border-slate-700/40 py-1">
                        <TopicEditorList
                          module={mod}
                          topics={mod.topics}
                          parentId={null}
                          parentPath={[mod.id]}
                          pathname={pathname}
                          overrides={overrides}
                          expandedTopics={expandedTopics}
                          hasQuiz={hasQuiz}
                          busy={busy}
                          onToggleTopic={toggleTopic}
                          onReorderTopics={onReorderTopics}
                          onToggleTopicVisible={onToggleTopicVisible}
                          onQuickAdd={onQuickAdd}
                        />
                        {mod.topics.length === 0 && (
                          <p className="px-3 py-2 text-[11px] text-slate-400">Este módulo aún no tiene temas.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function TopicEditorList({
  module,
  topics,
  parentId,
  parentPath,
  pathname,
  overrides,
  expandedTopics,
  hasQuiz,
  busy,
  onToggleTopic,
  onReorderTopics,
  onToggleTopicVisible,
  onQuickAdd,
}: {
  module: Module;
  topics: Topic[];
  parentId: string | null;
  parentPath: string[];
  pathname: string;
  overrides: SyllabusTopicOverride[];
  expandedTopics: Set<string>;
  hasQuiz: (topicId: string) => boolean;
  busy: boolean;
  onToggleTopic: (topicId: string) => void;
  onReorderTopics: (moduleId: string, siblings: Topic[], from: number, to: number) => void;
  onToggleTopicVisible: (moduleId: string, topic: Topic, siblings: Topic[], nextVisible: boolean) => void;
  onQuickAdd: CourseSyllabusEditorTreeProps['onQuickAdd'];
}) {
  return (
    <SortableList
      items={topics}
      getId={(topic) => `${parentId ?? 'root'}:${topic.id}`}
      disabled={busy}
      onReorder={(from, to) => onReorderTopics(module.id, topics, from, to)}
      renderItem={(topic, handle) => {
        const path = [...parentPath, topic.id];
        const topicUrl = `/modulo/${path.join('/')}`;
        const isActive = pathname.startsWith(topicUrl);
        const visible = isTopicVisible(overrides, module.id, topic.id);
        const hasChildren = Boolean(topic.children?.length);
        const isOpen = expandedTopics.has(topic.id);
        const emptyLeaf = !hasChildren && !topicHasBody(topic);
        return (
          <div className={!visible ? 'opacity-50' : ''}>
            <div
              className={`flex items-center gap-1 px-1 py-1 rounded-lg text-[0.8rem] min-h-[40px] ${
                isActive
                  ? 'bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {handle}
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => onToggleTopic(topic.id)}
                  className="p-0.5 text-slate-400"
                  aria-label={isOpen ? 'Cerrar subtemas' : 'Abrir subtemas'}
                >
                  {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <Circle className="w-2.5 h-2.5 mx-0.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
              )}
              <Link
                to={topicUrl}
                className="flex-1 min-w-0 break-words line-clamp-2 leading-snug hover:underline"
                title={topic.title}
              >
                {topic.title}
              </Link>
              {emptyLeaf && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"
                  title="Tema sin contenido todavía"
                />
              )}
              {topicTreeHasQuiz(topic, hasQuiz) && <QuizTopicBadge compact />}
              <button
                type="button"
                disabled={busy}
                aria-label={visible ? 'Ocultar tema' : 'Mostrar tema'}
                title={visible ? 'Ocultar a los alumnos' : 'Mostrar a los alumnos'}
                onClick={() => onToggleTopicVisible(module.id, topic, topics, !visible)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
              <Link
                to={`/colaborador/nueva-revision?moduleId=${module.id}&topicId=${topic.id}&action=update${
                  parentId ? `&parentId=${parentId}` : ''
                }`}
                state={{ from: pathname }}
                title="Editar contenido"
                className="p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={(event) => event.stopPropagation()}
              >
                <Pencil className="w-3 h-3" />
              </Link>
              <SyllabusQuickAddMenu
                actions={[
                  { id: 'subtopic', label: 'Agregar subtema' },
                  { id: 'document', label: 'Adjuntar documento' },
                  { id: 'link', label: 'Adjuntar link o video' },
                  { id: 'live-class', label: 'Programar clase' },
                  { id: 'quiz', label: 'Evaluación' },
                  { id: 'edit', label: 'Editar contenido' },
                ]}
                onAction={(action) =>
                  onQuickAdd(action, {
                    moduleId: module.id,
                    moduleTitle: module.title,
                    topic,
                    parentId,
                  })
                }
              />
            </div>
            {hasChildren && isOpen && (
              <div className="ml-4 pl-2 border-l border-slate-200/70 dark:border-slate-700/40">
                <TopicEditorList
                  module={module}
                  topics={topic.children ?? []}
                  parentId={topic.id}
                  parentPath={path}
                  pathname={pathname}
                  overrides={overrides}
                  expandedTopics={expandedTopics}
                  hasQuiz={hasQuiz}
                  busy={busy}
                  onToggleTopic={onToggleTopic}
                  onReorderTopics={onReorderTopics}
                  onToggleTopicVisible={onToggleTopicVisible}
                  onQuickAdd={onQuickAdd}
                />
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
