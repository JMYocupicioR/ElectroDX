import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Calendar, ArrowRight, CheckCircle, PlayCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { WorkshopCard } from '../course/WorkshopCard';
import { getWorkshops } from '../../services/courseService';
import type { LiveWorkshop } from '../../types/database';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function WorkshopsListPage() {
  const { isEnrolledPhysician } = useAuth();
  const [workshops, setWorkshops] = useState<LiveWorkshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recordings'>('upcoming');

  useEffect(() => {
    async function fetchAllWorkshops() {
      try {
        setLoading(true);
        setLoadError(null);
        const data = await getWorkshops();
        setWorkshops(data);
      } catch (err) {
        console.error('Error loading workshops:', err);
        setLoadError(err instanceof Error && err.message ? err.message : 'No se pudieron cargar los talleres.');
      } finally {
        setLoading(false);
      }
    }
    fetchAllWorkshops();
  }, []);

  const now = new Date();
  const upcomingWorkshops = workshops.filter((w) => {
    const d = new Date(w.scheduled_at);
    return d >= now || w.status === 'live';
  }).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const recordedWorkshops = workshops.filter((w) => Boolean(w.recording_url));

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-8 text-center max-w-3xl mx-auto"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
          <Video className="w-4 h-4" />
          Clases y Talleres Clínicos
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
          Sesiones en Vivo y <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Biblioteca de Grabaciones
          </span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Participa en directo para resolver dudas con los especialistas docentes o repasa a tu propio ritmo las clases magistrales y análisis de casos grabados.
        </motion.p>

        {/* Tab Controls */}
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Próximas Sesiones ({upcomingWorkshops.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recordings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'recordings'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            Clases Grabadas ({recordedWorkshops.length})
          </button>
        </div>
      </motion.div>

      {loadError ? (
        <div className="mb-8 p-4 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 text-sm font-medium text-center">
          No se pudieron cargar los talleres. {loadError}
        </div>
      ) : null}

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-slate-500">Cargando catálogo de sesiones...</p>
        </div>
      ) : activeTab === 'upcoming' ? (
        upcomingWorkshops.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-12 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
          >
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No hay talleres programados próximos
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Actualmente no tenemos eventos futuros agendados. Consulta la biblioteca de clases grabadas para ver sesiones anteriores.
            </p>
            {recordedWorkshops.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('recordings')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-500 transition-colors text-sm shadow-md shadow-purple-500/20"
              >
                <PlayCircle className="w-4 h-4" />
                Explorar {recordedWorkshops.length} clases grabadas
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {upcomingWorkshops.map((ws) => (
              <motion.div key={ws.id} variants={itemVariants}>
                <Link to={`/taller/${ws.id}`} className="block h-full">
                  <WorkshopCard workshop={ws} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )
      ) : (
        /* Tab Recordings */
        recordedWorkshops.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-12 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
          >
            <PlayCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Aún no hay grabaciones subidas
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Las clases en vivo se grabarán y se publicarán aquí (Google Drive, YouTube, etc.) para que puedas verlas cuando desees.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {recordedWorkshops.map((ws) => {
              const d = new Date(ws.scheduled_at);
              return (
                <motion.div
                  key={ws.id}
                  variants={itemVariants}
                  className="group rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all flex flex-col"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                        <PlayCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        Grabación disponible
                      </span>
                      <span className="text-xs text-slate-500">
                        {d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {ws.title}
                    </h3>

                    {ws.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                        {ws.description}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {ws.duration_minutes} min
                      </span>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/taller/${ws.id}`}
                          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          Detalles
                        </Link>
                        {ws.recording_url && (
                          <a
                            href={ws.recording_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            Ver Video ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )
      )}

      {!isEnrolledPhysician && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/50 text-center max-w-4xl mx-auto"
        >
          <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-3">
            Acceso exclusivo para miembros Premium
          </h3>
          <p className="text-amber-800/80 dark:text-amber-200/80 mb-6 max-w-2xl mx-auto">
            Para registrarte y acceder a las transmisiones en vivo o grabaciones necesitas estar inscrito y verificado en la plataforma.
          </p>
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-500 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Inscribirme ahora
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
