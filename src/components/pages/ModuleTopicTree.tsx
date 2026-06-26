import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, BookOpen, ClipboardList } from 'lucide-react';
import { Topic } from '../../types/content';
import { localizedTopic } from '../../hooks/useLocalizedContent';
import { ProposeSubtopicLink, ProposeQuizLink } from '../editorial/TopicContribution';
import { QuizTopicBadge } from '../quiz/QuizTopicBadge';

function getPreview(topic: Topic): string {
  const src = topic.content || (topic.children?.[0]?.content) || '';
  if (!src) return '';
  const clean = src
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[•\-\*]\s/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  return clean.length > 100 ? clean.slice(0, 100) + '…' : clean;
}

function topicTreeHasQuiz(
  topic: Topic,
  hasQuiz: (topicId: string) => boolean
): boolean {
  if (!topic.children?.length) return hasQuiz(topic.id);
  return topic.children.some((child) => topicTreeHasQuiz(child, hasQuiz));
}

function countLeafQuizzes(
  topic: Topic,
  hasQuiz: (topicId: string) => boolean
): number {
  if (!topic.children?.length) return hasQuiz(topic.id) ? 1 : 0;
  return topic.children.reduce((sum, child) => sum + countLeafQuizzes(child, hasQuiz), 0);
}

function ModuleTopicRow({
  topic,
  moduleId,
  moduleNumber,
  indexPath,
  depth,
  lang,
  hasQuiz,
  canProposeContent,
  parentPath = [],
}: {
  topic: Topic;
  moduleId: string;
  moduleNumber: number;
  indexPath: string;
  depth: number;
  lang: 'es' | 'en';
  hasQuiz: (topicId: string) => boolean;
  canProposeContent: boolean;
  parentPath?: string[];
}) {
  const isLeaf = !topic.children?.length;
  const showQuizBadge = isLeaf ? hasQuiz(topic.id) : topicTreeHasQuiz(topic, hasQuiz);
  const childCount = topic.children?.length ?? 0;
  const preview = getPreview(topic);
  const lt = localizedTopic(topic, lang);
  
  const currentPath = [...parentPath, topic.id];
  const topicUrl = `/modulo/${moduleId}/${currentPath.join('/')}`;

  return (
    <div className={depth > 0 ? 'ml-4 border-l border-slate-200/60 dark:border-slate-700/40 pl-3' : ''}>
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
        <Link
          to={topicUrl}
          className="group flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-300 font-mono text-xs sm:text-sm font-bold">
            {indexPath}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm sm:text-base leading-snug">
                {lt.title}
              </h3>
              {showQuizBadge && <QuizTopicBadge compact label={lang === 'en' ? 'Quiz' : 'Evaluación'} />}
            </div>
            {preview && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {preview}
              </p>
            )}
            {childCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <BookOpen className="w-3 h-3 text-slate-400" />
                <span className="text-[0.65rem] sm:text-xs text-slate-400">
                  {childCount} {lang === 'en' ? 'subtopics' : 'subtemas'}
                </span>
                {countLeafQuizzes(topic, hasQuiz) > 0 && (
                  <span className="text-[0.65rem] text-indigo-500">
                    {countLeafQuizzes(topic, hasQuiz)} {lang === 'en' ? 'quizzes' : 'evaluaciones'}
                  </span>
                )}
              </div>
            )}
            {canProposeContent && isLeaf && (
              <div className="mt-2" onClick={(e) => e.preventDefault()}>
                <ProposeQuizLink moduleId={moduleId} topicId={topic.id} />
              </div>
            )}
            {canProposeContent && depth === 0 && (
              <div className="mt-2" onClick={(e) => e.preventDefault()}>
                <ProposeSubtopicLink moduleId={moduleId} parentId={topic.id} />
              </div>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-0.5" />
        </Link>
      </motion.div>

      {topic.children && topic.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {topic.children.map((child, i) => (
            <ModuleTopicRow
              key={child.id}
              topic={child}
              moduleId={moduleId}
              moduleNumber={moduleNumber}
              indexPath={`${indexPath}.${i + 1}`}
              depth={depth + 1}
              lang={lang}
              hasQuiz={hasQuiz}
              canProposeContent={canProposeContent}
              parentPath={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { ModuleTopicRow, topicTreeHasQuiz, getPreview };
