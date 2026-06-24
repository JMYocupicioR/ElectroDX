import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllSearchableTopics } from '../../content/modules';
import { useAllModules } from '../../hooks/useAllModules';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuth } from '../../contexts/AuthProvider';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  BookOpen, Zap, Crosshair, RefreshCw, Repeat, Brain, Wrench, Map, Stethoscope,
  ClipboardList, Table, BookMarked, ShieldAlert, Search, GraduationCap, Globe, Sun, Moon,
  Check, Sparkles, BarChart3, Award, Users, ClipboardCheck, ArrowRight, Lock, Unlock,
} from 'lucide-react';
import { OfflineButton, DownloadAllButton } from '../OfflineButton';

const iconMap: Record<string, any> = {
  BookOpen, Zap, Crosshair, RefreshCw, Repeat, Brain, Wrench, Map, Stethoscope,
  ClipboardList, Table, BookMarked, ShieldAlert,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const SUBSCRIPTION_BENEFITS = [
  { icon: BookOpen, title: '13 módulos · 200+ temas', desc: 'ENMG, conducción nerviosa, EMG, potenciales evocados y más.' },
  { icon: ClipboardCheck, title: 'Evaluaciones por tema', desc: 'Cuestionarios clínicos al final de cada lección con retroalimentación.' },
  { icon: BarChart3, title: 'Seguimiento de progreso', desc: 'Panel personal con avance, intentos y áreas por reforzar.' },
  { icon: Award, title: 'Contenido verificado', desc: 'Revisado por especialistas en neurofisiología clínica.' },
  { icon: Wrench, title: 'Herramientas interactivas', desc: 'Calculadoras, simuladores y modo ejercicio EMG incluidos.' },
  { icon: Zap, title: 'Modo offline', desc: 'Descarga módulos completos para estudiar sin conexión.' },
];

const FREE_VS_PREMIUM = [
  { feature: 'Lectura de todos los temas', free: true, premium: true },
  { feature: 'Herramientas interactivas y ejercicios', free: true, premium: true },
  { feature: 'Evaluaciones al final de cada tema', free: false, premium: true },
  { feature: 'Panel Mi progreso', free: false, premium: true },
  { feature: 'Descarga offline de módulos', free: true, premium: true },
  { feature: 'Verificación de cédula profesional', free: false, premium: true },
];

function countTopics(topics: any[]): number {
  let count = 0;
  for (const t of topics) {
    count++;
    if (t.children) count += countTopics(t.children);
  }
  return count;
}

export default function LandingPage() {
  const { modules } = useAllModules();
  const { user, isEnrolledPhysician } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { isDarkMode, toggleDarkMode, language, setLanguage } = useSettingsStore();
  const allTopics = useMemo(() => getAllSearchableTopics(), []);

  const enrollUrl = '/auth/login?next=' + encodeURIComponent('/colaborador/perfil');
  const totalTopics = useMemo(
    () => modules.reduce((acc, m) => acc + countTopics(m.topics), 0),
    [modules]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return allTopics
      .filter(r => r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q))
      .slice(0, 12);
  }, [searchQuery, allTopics]);

  return (
    <main className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6 backdrop-blur-sm border border-blue-500/20">
              <Sparkles className="w-4 h-4" />
              Curso en línea · Electrodiagnóstico clínico
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Curso ENMG
            </span>{' '}
            <span className="text-slate-800 dark:text-white">DeepLuxMed</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            La plataforma más completa para dominar{' '}
            <strong className="text-slate-800 dark:text-white">electroconducción nerviosa</strong>,{' '}
            <strong className="text-slate-800 dark:text-white">electromiografía</strong> y{' '}
            <strong className="text-slate-800 dark:text-white">potenciales evocados</strong>.
            Explora gratis · Suscríbete para evaluaciones y certificación de avance.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
          >
            {isEnrolledPhysician ? (
              <Link
                to="/mi-progreso"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
              >
                <BarChart3 className="w-5 h-5" />
                Ver mi progreso
              </Link>
            ) : isSupabaseConfigured ? (
              <Link
                to={enrollUrl}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
              >
                <GraduationCap className="w-5 h-5" />
                Inscribirme al curso
              </Link>
            ) : null}
            <a
              href="#modulos"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 font-medium hover:bg-white dark:hover:bg-slate-800 transition-all"
            >
              Explorar temario gratis
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="flex flex-wrap justify-center gap-6 md:gap-10 mb-10 text-sm"
          >
            {[
              { value: `${modules.length}`, label: 'Módulos' },
              { value: `${totalTopics}+`, label: 'Temas' },
              { value: '100%', label: 'Contenido clínico' },
              { value: '24/7', label: 'Acceso en línea' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{s.value}</p>
                <p className="text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Search */}
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

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex justify-center gap-3">
              <button onClick={toggleDarkMode} className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-colors" aria-label="Tema">
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
              </button>
              <button onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-colors text-sm">
                <Globe className="w-4 h-4" /> {language === 'es' ? 'ES' : 'EN'}
              </button>
            </div>
            <DownloadAllButton moduleIds={modules.map(m => m.id)} />
          </motion.div>
        </div>
      </section>

      {/* Subscription promo */}
      <section id="suscripcion" className="px-4 py-16 md:py-24 bg-gradient-to-b from-blue-50/80 via-indigo-50/40 to-transparent dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4 border border-indigo-500/20">
              <GraduationCap className="w-3.5 h-3.5" />
              Suscripción médica
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Domina el electrodiagnóstico con evaluación guiada
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              El temario es abierto para consulta. La suscripción desbloquea evaluaciones por tema,
              seguimiento de avance y acceso completo como médico inscrito.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Benefits grid */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {SUBSCRIPTION_BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/40"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mb-3">
                    <b.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{b.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </motion.div>

            {/* Pricing card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl shadow-indigo-900/30 border border-indigo-500/20"
            >
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                Para médicos
              </div>

              <p className="text-indigo-300 text-sm font-medium mb-1">Suscripción ENMG DeepLuxMed</p>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Acceso completo al curso</h3>
              <p className="text-slate-400 text-sm mb-6">
                Inscripción con verificación de cédula profesional. Ideal para residentes,
                electrofisiólogos y neurólogos en formación.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  'Evaluaciones clínicas en cada tema',
                  'Panel de progreso personalizado',
                  'Contenido actualizado por especialistas',
                  'Herramientas interactivas incluidas',
                  'Estudio offline en cualquier dispositivo',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              {isEnrolledPhysician ? (
                <Link
                  to="/mi-progreso"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Ya estás inscrito — Ver progreso
                </Link>
              ) : user ? (
                <Link
                  to="/colaborador/perfil"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 font-semibold transition-all"
                >
                  Completar inscripción
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : isSupabaseConfigured ? (
                <Link
                  to={enrollUrl}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 font-semibold transition-all"
                >
                  <GraduationCap className="w-5 h-5" />
                  Inscribirme ahora
                </Link>
              ) : null}

              <p className="text-xs text-slate-500 text-center mt-4">
                ¿Solo quieres consultar? El temario completo es gratuito sin registro.
              </p>
            </motion.div>
          </div>

          {/* Free vs Premium comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-12 rounded-2xl border border-slate-200/60 dark:border-slate-700/40 bg-white/60 dark:bg-slate-900/40 overflow-hidden"
          >
            <div className="grid grid-cols-3 text-sm font-semibold border-b border-slate-200/60 dark:border-slate-700/40">
              <div className="p-4 text-slate-600 dark:text-slate-400">Funcionalidad</div>
              <div className="p-4 text-center text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1.5">
                <Unlock className="w-4 h-4" /> Gratis
              </div>
              <div className="p-4 text-center text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1.5 bg-indigo-50/50 dark:bg-indigo-950/30">
                <Lock className="w-4 h-4" /> Suscripción
              </div>
            </div>
            {FREE_VS_PREMIUM.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 text-sm ${i < FREE_VS_PREMIUM.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
              >
                <div className="p-3.5 px-4 text-slate-700 dark:text-slate-300">{row.feature}</div>
                <div className="p-3.5 flex justify-center">
                  {row.free ? <Check className="w-4 h-4 text-emerald-500" /> : <span className="text-slate-300 dark:text-slate-600">—</span>}
                </div>
                <div className="p-3.5 flex justify-center bg-indigo-50/30 dark:bg-indigo-950/20">
                  {row.premium ? <Check className="w-4 h-4 text-indigo-500" /> : <span className="text-slate-300">—</span>}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How to enroll */}
      <section className="px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              ¿Cómo funciona la inscripción?
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Tres pasos para acceder a evaluaciones y progreso</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Crea tu cuenta', desc: 'Regístrate con tu correo profesional mediante enlace mágico.' },
              { step: '2', title: 'Completa tu perfil', desc: 'Nombre, credenciales, institución y cédula profesional.' },
              { step: '3', title: 'Accede al curso', desc: 'Tras verificación, desbloqueas evaluaciones y panel de progreso.' },
            ].map((s) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-center p-6 rounded-2xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          {!isEnrolledPhysician && isSupabaseConfigured && (
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-center mt-10"
            >
              <Link
                to={enrollUrl}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
              >
                <Users className="w-5 h-5" />
                Comenzar inscripción
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Modules Grid */}
      <section id="modulos" className="px-4 pb-20 md:pb-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{modules.length} Módulos de Aprendizaje</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Desde fundamentos hasta diagnóstico diferencial avanzado</p>
          </motion.div>

          <motion.div
            variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {modules.map((mod) => {
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

      {/* Interactive Tools */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4 border border-emerald-500/20">
              <Wrench className="w-3.5 h-3.5" />
              Incluido en la plataforma
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Herramientas Interactivas</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Aprende haciendo con simuladores diagnósticos</p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Link
                to="/herramientas/plexo-braquial"
                className="group block p-6 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-blue-200/60 dark:border-blue-700/40 hover:border-blue-400 dark:hover:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                    🧠
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                      Calculadora Diagnóstica del Plexo Braquial
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      Localiza el nivel anatómico de la lesión con evaluación MRC, reflejos y diagnóstico topográfico probabilístico.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">20+ Lesiones</span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">5 Casos Clínicos</span>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:text-blue-500 transition-colors text-xl mt-2">→</span>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mt-5"
            >
              <Link
                to="/ejercicios"
                className="group block p-6 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-red-900/20 border-2 border-amber-200/60 dark:border-amber-700/40 hover:border-amber-400 dark:hover:border-amber-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                    ⚡
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-1">
                      Modo Ejercicio EMG
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      Casos clínicos aleatorios con pistas, retroalimentación y diagnóstico diferencial.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">8 Patrones</span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">3 Dificultades</span>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:text-amber-500 transition-colors text-xl mt-2">→</span>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      {!isEnrolledPhysician && isSupabaseConfigured && (
        <section className="px-4 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center p-8 md:p-12 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-2xl shadow-indigo-500/20"
          >
            <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              ¿Listo para certificar tu aprendizaje?
            </h2>
            <p className="text-blue-100 max-w-xl mx-auto mb-8">
              Únete al curso de electrodiagnóstico más completo en español.
              Evalúa tu dominio tema a tema y lleva registro de tu progreso.
            </p>
            <Link
              to={enrollUrl}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-indigo-700 font-bold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Inscribirme al curso ENMG
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>
      )}

      <footer className="px-4 py-8 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-6xl mx-auto text-center text-sm text-slate-400 dark:text-slate-500">
          <p className="mb-1">Curso en Línea de ENMG — DeepLuxMed</p>
          <p>Temario abierto · Suscripción médica para evaluaciones y progreso</p>
        </div>
      </footer>
    </main>
  );
}
