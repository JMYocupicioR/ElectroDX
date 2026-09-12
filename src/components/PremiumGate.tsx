import { ReactNode } from 'react';
import { Lock, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { Link } from 'react-router-dom';

interface PremiumGateProps {
  moduleId?: string;
  topicId?: string;
  title?: string;
  description?: string;
  children?: ReactNode;
}

export function PremiumGate({
  moduleId: _moduleId,
  topicId: _topicId,
  title,
  description,
  children,
}: PremiumGateProps) {
  const { user, hasPremiumAccess, isEnrolledPhysician } = useAuth();

  const canAccess = hasPremiumAccess || isEnrolledPhysician;

  if (canAccess && children) {
    return <>{children}</>;
  }

  const defaultTitle = 'Contenido Exclusivo para Alumnos con Suscripción';
  const defaultDesc =
    'El contenido completo de los módulos, lecciones prácticas, perlas clínicas, simuladores diagnósticos y evaluaciones es de acceso exclusivo mediante suscripción para médicos en formación y especialistas.';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/30 text-amber-500 mb-6 shadow-lg shadow-amber-500/10">
        <Lock className="w-10 h-10 text-amber-500" />
      </div>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
        {title || defaultTitle}
      </h1>

      <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
        {description || defaultDesc}
      </p>

      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-amber-200/80 dark:border-amber-900/50 rounded-3xl p-6 sm:p-10 text-left max-w-2xl mx-auto shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Sparkles className="w-36 h-36 text-amber-500" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
          <span>Beneficios de la Suscripción Académica</span>
        </h3>

        <ul className="space-y-3.5 mb-8">
          {[
            'Calculadora Diagnóstica de Plexo Braquial con correlación topográfica y casos reales',
            'Simulador interactivo de aguja y neuroconducción (Modo Ejercicio EMG)',
            'Acceso ilimitado a los 13 módulos clínicos y más de 200 temas formativos',
            'Evaluaciones diagnósticas al final de cada tema con retroalimentación argumentada',
            'Acreditación oficial con horas curriculares y aval COMEFYR',
          ].map((benefit, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-1 rounded-full shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-snug">
                {benefit}
              </span>
            </li>
          ))}
        </ul>

        {user ? (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 py-2 px-3 rounded-xl">
              Sesión iniciada como: <strong className="text-slate-800 dark:text-slate-200">{user.email}</strong> · Sin suscripción activa
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/temario#suscripcion"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:opacity-95 text-white rounded-xl font-semibold shadow-md text-center transition"
              >
                Activar mi suscripción
              </Link>
              <Link
                to="/temario"
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-center transition"
              >
                Ver temario general
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/auth/registro"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:opacity-95 text-white rounded-xl font-semibold shadow-md text-center transition"
            >
              Inscribirme como Alumno
            </Link>
            <Link
              to={`/auth/login?next=${encodeURIComponent(window.location.pathname)}`}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-center transition"
            >
              Ya tengo cuenta (Iniciar sesión)
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
