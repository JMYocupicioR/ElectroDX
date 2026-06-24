import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function LoginPage() {
  const { signInWithOtp, user, isAdmin, isEnrolledPhysician } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get('next') ?? undefined;
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (nextPath && nextPath.startsWith('/')) {
      navigate(nextPath, { replace: true });
      return;
    }
    navigate(isAdmin ? '/admin' : isEnrolledPhysician ? '/mi-progreso' : '/colaborador', { replace: true });
  }, [user, isAdmin, isEnrolledPhysician, nextPath, navigate]);

  useEffect(() => {
    if (searchParams.get('verified') === '1') setSent(true);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signInWithOtp(email, nextPath);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="pt-24 px-4 max-w-lg mx-auto">
        <p className="text-red-600">Supabase no está configurado. Revisa tu archivo .env</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-md mx-auto">
        <Link
          to={nextPath && nextPath.startsWith('/') ? nextPath : '/'}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/70 backdrop-blur p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Acceso médico
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            El contenido educativo es público sin registro.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
            Las evaluaciones al final de cada tema están reservadas para médicos inscritos y verificados.
          </p>

          {sent ? (
            <div className="flex flex-col items-center text-center py-6 gap-3">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
              <p className="font-medium text-slate-800 dark:text-slate-100">Revisa tu correo</p>
              <p className="text-sm text-slate-500">
                Enviamos un enlace mágico a <strong>{email}</strong>. Haz clic para entrar.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Correo electrónico</span>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="tu@institucion.mx"
                  />
                </div>
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:opacity-95 disabled:opacity-60 transition"
              >
                {loading ? 'Enviando…' : 'Enviar enlace mágico'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
