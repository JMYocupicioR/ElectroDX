import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { allModules, getAllSearchableTopics } from '../../content/modules';
import { useSettingsStore } from '../../stores/settingsStore';
import { BookOpen, Zap, Crosshair, RefreshCw, Repeat, Brain, Wrench, Map, Stethoscope, ClipboardList, Table, BookMarked, ShieldAlert, Search, GraduationCap, Globe, Sun, Moon } from 'lucide-react';
import { OfflineButton, DownloadAllButton } from '../OfflineButton';

const iconMap: Record<string, any> = { BookOpen, Zap, Crosshair, RefreshCw, Repeat, Brain, Wrench, Map, Stethoscope, ClipboardList, Table, BookMarked, ShieldAlert };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } },
};

function countTopics(topics: any[]): number {
  let count = 0;
  for (const t of topics) {
    count++;
    if (t.children) count += countTopics(t.children);
  }
  return count;
}

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { isDarkMode, toggleDarkMode, language, setLanguage } = useSettingsStore();
  const allTopics = useMemo(() => getAllSearchableTopics(), []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return allTopics
      .filter(r => r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q))
      .slice(0, 12);
  }, [searchQuery, allTopics]);

  return (
    <main className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6 backdrop-blur-sm border border-blue-500/20">
              <GraduationCap className="w-4 h-4" />
              Plataforma de Aprendizaje en Neurodiagnóstico
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
              ENMG
            </span>{' '}
            <span className="text-slate-800 dark:text-white">DeepLuxMed</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Domina los estudios de <strong className="text-slate-800 dark:text-white">electroconducción nerviosa</strong>, <strong className="text-slate-800 dark:text-white">electromiografía</strong> y <strong className="text-slate-800 dark:text-white">potenciales evocados</strong> con la plataforma educativa más completa. 13 módulos · 200+ temas · Acceso libre.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-2xl mx-auto relative mb-6"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar: túnel carpiano, onda F, PESS mediano, miastenia..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="absolute z-50 top-full mt-2 w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl max-h-80 overflow-y-auto"
              >
                {searchResults.map((r, i) => (
                  <Link
                    key={i}
                    to={`/modulo/${r.moduleId}/${r.topicPath.join('/')}`}
                    onClick={() => setSearchQuery('')}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100/50 dark:border-slate-700/30 last:border-b-0"
                  >
                    <span className="text-xs font-mono text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md mt-0.5 whitespace-nowrap">{r.moduleTitle.substring(0, 25)}</span>
                    <div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{r.title}</span>
                      {r.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{r.description}</p>}
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex justify-center gap-3">
              <button onClick={toggleDarkMode} className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-colors">
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
              </button>
              <button onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-colors text-sm">
                <Globe className="w-4 h-4" /> {language === 'es' ? 'ES' : 'EN'}
              </button>
            </div>
            <DownloadAllButton moduleIds={allModules.map(m => m.id)} />
          </motion.div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="px-4 pb-20 md:pb-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{allModules.length} Módulos de Aprendizaje</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Desde fundamentos hasta diagnóstico diferencial avanzado</p>
          </motion.div>

          <motion.div
            variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {allModules.map((mod) => {
              const IconComponent = iconMap[mod.icon] || BookOpen;
              const topicCount = countTopics(mod.topics);

              return (
                <motion.div key={mod.id} variants={cardVariants}>
                  <Link
                    to={`/modulo/${mod.id}`}
                    className="group block h-full p-5 rounded-2xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-xl hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                        {String(mod.number).padStart(2, '0')}
                      </span>
                      <span className="text-2xl">{mod.emoji}</span>
                    </div>

                    <h3 className="font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                      {mod.title}
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                      {mod.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {topicCount} {topicCount === 1 ? 'tema' : 'temas'}
                      </span>
                      <span className="text-xs text-blue-500 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Explorar →
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100/60 dark:border-slate-700/30" onClick={(e) => e.preventDefault()}>
                      <OfflineButton moduleId={mod.id} compact />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Interactive Tools Section */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4 border border-emerald-500/20">
              <Wrench className="w-3.5 h-3.5" />
              Nuevo
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Herramientas Interactivas</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Aprende haciendo con simuladores diagnósticos</p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            >
              <Link
                to="/herramientas/plexo-braquial"
                className="group block p-6 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-blue-200/60 dark:border-blue-700/40 hover:border-blue-400 dark:hover:border-blue-500 shadow-lg hover:shadow-xl hover:shadow-blue-200/30 dark:hover:shadow-blue-900/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                    🧠
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Calculadora Diagnóstica del Plexo Braquial
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      Herramienta interactiva para localizar el nivel anatómico de la lesión.
                      Evaluación muscular MRC, reflejos, sensibilidad y diagnóstico topográfico probabilístico.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">20+ Lesiones</span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">5 Casos Clínicos</span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Wizard de 5 pasos</span>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:text-blue-500 transition-colors text-xl mt-2">→</span>
                </div>
              </Link>
            </motion.div>

            {/* Ejercicios EMG Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mt-5"
            >
              <Link
                to="/ejercicios"
                className="group block p-6 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-red-900/20 border-2 border-amber-200/60 dark:border-amber-700/40 hover:border-amber-400 dark:hover:border-amber-500 shadow-lg hover:shadow-xl hover:shadow-amber-200/30 dark:hover:shadow-amber-900/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                    ⚡
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Modo Ejercicio EMG
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                        Nuevo
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      Practica diagnosticando casos clínicos aleatorios de electromiografía.
                      Sistema de pistas, modo estudio, retroalimentación detallada y diagnóstico diferencial.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">8 Patrones</span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Casos Aleatorios</span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">3 Dificultades</span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Modo Estudio</span>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:text-amber-500 transition-colors text-xl mt-2">→</span>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      <footer className="px-4 py-8 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-6xl mx-auto text-center text-sm text-slate-400 dark:text-slate-500">
          <p className="mb-1">ENMG DeepLuxMed — Plataforma Educativa de Neurodiagnóstico</p>
          <p>Acceso libre y abierto · Contenido en constante actualización</p>
        </div>
      </footer>
    </main>
  );
}
