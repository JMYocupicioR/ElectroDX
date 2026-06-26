import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Home, ClipboardList } from 'lucide-react';
import { OfflineButton } from '../OfflineButton';
import { useSettingsStore } from '../../stores/settingsStore';
import { useMergedModule } from '../../hooks/useMergedModule';
import { useQuizTopicFlags } from '../../hooks/useQuizTopicFlags';
import { useAuth } from '../../contexts/AuthProvider';
import { ProposeSubtopicLink } from '../editorial/TopicContribution';
import { ModuleTopicRow } from './ModuleTopicTree';
import { PremiumGate } from '../PremiumGate';

export default function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { module: mod, loading } = useMergedModule(moduleId);
  const { canProposeContent } = useAuth();
  const { hasQuiz, moduleQuizCount } = useQuizTopicFlags();
  const lang = useSettingsStore((s) => s.language);

  if (loading && !mod) {
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

  const quizCount = moduleQuizCount(mod.id);

  return (
    <PremiumGate moduleId={mod.id}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-20">
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6 sm:mb-8">
        <Link to="/" className="hover:text-blue-500 transition-colors flex items-center gap-1 min-h-[2rem]">
          <Home className="w-3.5 h-3.5" /> {lang === 'en' ? 'Home' : 'Inicio'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 dark:text-white font-medium">{mod.emoji} {(lang === 'en' && mod.titleEn) || mod.title}</span>
      </nav>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${mod.color} mb-5`} />
        <div className="flex items-start gap-4 sm:gap-5">
          <div className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${mod.color} text-white text-2xl sm:text-3xl shadow-lg flex-shrink-0`}>
            {mod.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-mono text-slate-400 dark:text-slate-500 mb-1">
              {lang === 'en' ? 'Module' : 'Módulo'} {String(mod.number).padStart(2, '0')}
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
              {(lang === 'en' && mod.titleEn) || mod.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {(lang === 'en' && mod.descriptionEn) || mod.description}
            </p>
            {quizCount > 0 && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400">
                <ClipboardList className="w-4 h-4" />
                {quizCount} {lang === 'en' ? 'assessments available' : 'evaluaciones disponibles'}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <OfflineButton moduleId={mod.id} />
              {canProposeContent && (
                <ProposeSubtopicLink moduleId={mod.id} label="Agregar tema al módulo" />
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="space-y-3 sm:space-y-4"
      >
        {mod.topics.map((topic, i) => (
          <ModuleTopicRow
            key={topic.id}
            topic={topic}
            moduleId={mod.id}
            moduleNumber={mod.number}
            indexPath={`${mod.number}.${i + 1}`}
            depth={0}
            lang={lang}
            hasQuiz={hasQuiz}
            canProposeContent={canProposeContent}
          />
        ))}
      </motion.div>

        <div className="mt-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-500 transition-colors min-h-[44px]">
            {lang === 'en' ? '← Back to all modules' : '← Volver a todos los módulos'}
          </Link>
        </div>
      </main>
    </PremiumGate>
  );
}
