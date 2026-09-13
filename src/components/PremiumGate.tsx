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
  requiresStrictPremium?: boolean;
}

export function PremiumGate({
  moduleId: _moduleId,
  topicId: _topicId,
  title,
  description,
  children,
  requiresStrictPremium = false,
}: PremiumGateProps) {
  const { user, hasPremiumAccess, isEnrolledPhysician, isAdmin, isEditor } = useAuth();

  const canAccess = requiresStrictPremium
    ? (hasPremiumAccess || isAdmin || isEditor)
    : (hasPremiumAccess || isEnrolledPhysician);

  if (canAccess && children) {
    return <>{children}</>;
  }

  const defaultTitle = requiresStrictPremium
    ? 'Herramienta Exclusiva con Suscripción Premium'
    : 'Contenido Exclusivo para Alumnos con Suscripción';

  const defaultDesc = requiresStrictPremium
    ? 'El acceso a los simuladores de casos clínicos EMG y a la calculadora diagnóstica topográfica de plexo braquial está reservado para miembros con membresía Premium activa.'
    : 'El contenido completo de los módulos, lecciones prácticas, perlas clínicas, simuladores diagnósticos y evaluaciones es de acceso exclusivo mediante suscripción para médicos en formación y especialistas.';

  const premiumBenefits = [
    'Calculadora Diagnóstica de Plexo Braquial: Motor topográfico ponderado de 5 pasos (raíces C5-T1, troncos y cordones)',
    'Simulador de Casos Clínicos EMG: Práctica interactiva con trazos reales de neuroconducción y electromiografía de aguja',
    'Casos Clínicos de Alta Complejidad: Discriminación algorítmica entre neuropatías, radiculopatías, plexopatías y miopatías',
    'Actualizaciones continuas y nuevos trazos electrofisiológicos calibrados por especialistas',
  ];

  const regularBenefits = [
    'Calculadora Diagnóstica de Plexo Braquial con correlación topográfica y casos reales',
    'Simulador interactivo de aguja y neuroconducción (Modo Ejercicio EMG)',
    'Acceso ilimitado a los 13 módulos clínicos y más de 200 temas formativos',
    'Evaluaciones diagnósticas al final de cada tema con retroalimentación argumentada',
    'Acreditación oficial con horas curriculares y aval COMEFYR',
  ];

  const benefitsToDisplay = requiresStrictPremium ? premiumBenefits : regularBenefits;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/30 text-amber-500 mb-6 shadow-lg shadow-amber-500/10">
        <Lock className="w-10 h-10 text-amber-500" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        <span>{requiresStrictPremium ? 'Membresía Premium Requerida' : 'Acceso Restringido'}</span>
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
          <span>{requiresStrictPremium ? 'Funciones Desbloqueadas con Premium' : 'Beneficios de la Suscripción Académica'}</span>
        </h3>

        <ul className="space-y-3.5 mb-8">
          {benefitsToDisplay.map((benefit, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 p-1 rounded-full shrink-0">
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
            {requiresStrictPremium && isEnrolledPhysician ? (
              <div className="text-xs text-center text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 py-2.5 px-3.5 rounded-xl font-medium space-y-1">
                <p>
                  🎓 Tienes admisión activa al curso como: <strong className="font-semibold">{user.email}</strong>
                </p>
                <p className="text-[11px] text-amber-700/90 dark:text-amber-300/80">
                  Los simuladores clínicos avanzados y la calculadora de plexo requieren activación de membresía Premium.
                </p>
              </div>
            ) : (
              <div className="text-xs text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 py-2 px-3 rounded-xl">
                Sesión iniciada como: <strong className="text-slate-800 dark:text-slate-200">{user.email}</strong> · Sin suscripción Premium activa
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:opacity-95 text-white rounded-xl font-semibold shadow-md text-center transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Solicitar Acceso Premium</span>
              </Link>
              <Link
                to="/temario"
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-center transition"
              >
                Continuar al Temario
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/auth/registro"
              className="px-6 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:opacity-95 text-white rounded-xl font-semibold shadow-md text-center transition"
            >
              Registrarme en la Plataforma
            </Link>
            <Link
              to={`/auth/login?next=${encodeURIComponent(window.location.pathname)}`}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-center transition"
            >
              Iniciar Sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
