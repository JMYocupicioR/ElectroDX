import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Calendar, ArrowRight, CheckCircle } from 'lucide-react';
import { useCourseStore } from '../../stores/courseStore';
import { useAuth } from '../../contexts/AuthProvider';
import { WorkshopCard } from '../course/WorkshopCard';

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
  const { upcomingWorkshops, load: loadCourse } = useCourseStore();

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-12 text-center max-w-3xl mx-auto"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
          <Video className="w-4 h-4" />
          Eventos Clínicos
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
          Talleres de Análisis <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            en Vivo
          </span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-lg text-slate-600 dark:text-slate-400">
          Sesiones de análisis de casos reales con los especialistas colaboradores.
          Únete a los talleres para correlacionar los hallazgos de neuroconducción y EMG con el cuadro clínico.
        </motion.p>
      </motion.div>

      {upcomingWorkshops.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-12 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
        >
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No hay talleres programados
          </h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Actualmente no tenemos eventos próximos. Los colaboradores están preparando nuevos casos clínicos.
          </p>
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
