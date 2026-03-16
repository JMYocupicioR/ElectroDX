import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getModuleById } from '../../content/modules';
import { Topic } from '../../types/content';
import { ChevronRight, Home, BookOpen } from 'lucide-react';
import { OfflineButton } from '../OfflineButton';

function countChildren(topics: Topic[]): number {
  let c = 0;
  for (const t of topics) { c++; if (t.children) c += countChildren(t.children); }
  return c;
}

function getPreview(topic: Topic): string {
  const src = topic.content || (topic.children?.[0]?.content) || '';
  if (!src) return '';
  // Strip markdown syntax for clean preview
  const clean = src
    .replace(/\*\*([^*]+)\*\*/g, '$1')     // bold
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[•\-\*]\s/g, '')              // bullets
    .replace(/\n+/g, ' ')                    // newlines
    .trim();
  return clean.length > 100 ? clean.slice(0, 100) + '…' : clean;
}

export default function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const mod = getModuleById(moduleId || '');

  if (!mod) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-28 text-center">
        <h1 className="text-2xl font-bold mb-4">Módulo no encontrado</h1>
        <Link to="/" className="text-blue-500 hover:underline">← Volver al inicio</Link>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6 sm:mb-8">
        <Link to="/" className="hover:text-blue-500 transition-colors flex items-center gap-1 min-h-[2rem]">
          <Home className="w-3.5 h-3.5" /> Inicio
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 dark:text-white font-medium">{mod.emoji} {mod.title}</span>
      </nav>

      {/* Module Header with gradient accent */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${mod.color} mb-5`} />
        <div className="flex items-start gap-4 sm:gap-5">
          <div className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${mod.color} text-white text-2xl sm:text-3xl shadow-lg flex-shrink-0`}>
            {mod.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-mono text-slate-400 dark:text-slate-500 mb-1">Módulo {String(mod.number).padStart(2, '0')}</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">{mod.title}</h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{mod.description}</p>
            <div className="mt-3">
              <OfflineButton moduleId={mod.id} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Topics List */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="space-y-3 sm:space-y-4"
      >
        {mod.topics.map((topic, i) => {
          const preview = getPreview(topic);
          const childCount = topic.children ? countChildren(topic.children) : 0;

          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.04 }}
            >
              <Link
                to={`/modulo/${mod.id}/${topic.id}`}
                className="group flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-lg hover:shadow-blue-100/30 dark:hover:shadow-blue-900/10 transition-all duration-300 active:scale-[0.99]"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-300 font-mono text-xs sm:text-sm font-bold group-hover:from-blue-50 group-hover:to-blue-100 dark:group-hover:from-blue-900/40 dark:group-hover:to-blue-800/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all">
                  {String(mod.number)}.{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm sm:text-base leading-snug">
                    {topic.title}
                  </h3>
                  {preview && (
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{preview}</p>
                  )}
                  {childCount > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                      <span className="text-[0.65rem] sm:text-xs text-slate-400 dark:text-slate-500">{childCount} subtemas</span>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-0.5" />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Back */}
      <div className="mt-10 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-500 transition-colors min-h-[44px]">
          ← Volver a todos los módulos
        </Link>
      </div>
    </main>
  );
}
