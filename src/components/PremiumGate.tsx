import { ReactNode } from 'react';
import { Lock, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { Link } from 'react-router-dom';

interface PremiumGateProps {
  moduleId: string;
  topicId?: string;
  children: ReactNode;
}

export function PremiumGate({ moduleId: _moduleId, topicId: _topicId, children }: PremiumGateProps) {
  const { hasPremiumAccess, isEnrolledPhysician } = useAuth();

  const canAccess = hasPremiumAccess || isEnrolledPhysician;

  if (canAccess) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-500 mb-6 shadow-sm">
        <Lock className="w-10 h-10" />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Contenido Exclusivo para Alumnos Inscritos
      </h1>
      
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
        El contenido completo de los módulos, lecciones prácticas, perlas clínicas y evaluaciones es de acceso exclusivo mediante suscripción para médicos en formación y especialistas.
      </p>

      <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-3xl p-6 sm:p-10 text-left max-w-2xl mx-auto shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-amber-500" />
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          Beneficios de la Suscripción como Alumno
        </h3>
        
        <ul className="space-y-4 mb-8">
          {[
            'Acceso ilimitado a los 13 módulos clínicos y más de 200 temas',
            'Simuladores de Plexo Braquial y Modo Ejercicio EMG interactivo',
            'Evaluaciones diagnósticas al final de cada tema con retroalimentación',
            'Programa con respaldo académico y aval COMEFYR'
          ].map((benefit, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 p-1 rounded-full shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            to="/auth/registro"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-sm text-center transition"
          >
            Inscribirme como Alumno
          </Link>
          <Link
            to="/temario"
            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-center transition"
          >
            Ver temario y resumen del curso
          </Link>
        </div>
      </div>
    </div>
  );
}
