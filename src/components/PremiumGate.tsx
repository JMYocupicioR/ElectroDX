import { ReactNode } from 'react';
import { Lock, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { useCourseStore } from '../stores/courseStore';
import { Link } from 'react-router-dom';

interface PremiumGateProps {
  moduleId: string;
  topicId?: string;
  children: ReactNode;
}

export function PremiumGate({ moduleId, topicId, children }: PremiumGateProps) {
  const { hasPremiumAccess } = useAuth();
  const { moduleAccess } = useCourseStore();

  const access = moduleAccess.get(moduleId);
  const isPremium = access?.required_tier === 'premium';
  
  // If no topic is specified, we are checking the module level.
  // If a topic IS specified, we should allow it if it's in preview_topic_ids.
  // Currently preview_topic_ids is stored as string[], but we will just check if topicId is in it.
  const isPreview = topicId && access?.preview_topic_ids?.includes(topicId);

  const canAccess = !isPremium || hasPremiumAccess || isPreview;

  if (canAccess) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-500 mb-6 shadow-sm">
        <Lock className="w-10 h-10" />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Contenido Exclusivo Premium
      </h1>
      
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
        Este módulo pertenece a la colección de especialidad clínica. Actualiza tu cuenta a DeepLux Premium para desbloquear el temario completo y los talleres en vivo.
      </p>

      <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-3xl p-6 sm:p-10 text-left max-w-2xl mx-auto shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-amber-500" />
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          Beneficios Premium
        </h3>
        
        <ul className="space-y-4 mb-8">
          {[
            'Acceso ilimitado a todos los módulos y patologías',
            'Participación en talleres híbridos de discusión de casos reales',
            'Exámenes de evaluación continua con créditos de CME (Próximamente)',
            'Soporte prioritario y revisión de propuestas clínicas'
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
            to="/cuenta"
            className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold shadow-sm text-center transition"
          >
            Gestionar Suscripción
          </Link>
          <Link
            to="/"
            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-center transition"
          >
            Explorar módulos gratuitos
          </Link>
        </div>
      </div>
    </div>
  );
}
