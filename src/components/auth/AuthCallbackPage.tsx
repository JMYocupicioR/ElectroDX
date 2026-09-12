import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../LoadingSpinner';

async function getPostLoginPath(userId: string, next?: string | null): Promise<string> {
  if (next && next.startsWith('/') && !next.startsWith('//')) return next;

  const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId);
  const roles = data?.map((r) => r.role) ?? [];
  if (roles.includes('admin')) return '/admin';
  if (roles.includes('editor')) return '/admin/revisiones';
  if (roles.includes('contributor')) return '/colaborador';
  return '/dashboard';
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Verificar si hay errores en query o hash
    const errorDescription = searchParams.get('error_description') || searchParams.get('error');
    const hash = window.location.hash;
    const isRecovery =
      searchParams.get('type') === 'recovery' ||
      searchParams.get('next') === '/auth/actualizar-password' ||
      hash.includes('type=recovery');

    if (errorDescription || hash.includes('error=')) {
      navigate('/auth/login?mode=recovery&error=expired', { replace: true });
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        // En algunos casos de recovery, la sesión se establece tras el evento onAuthStateChange
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if ((event === 'PASSWORD_RECOVERY' || isRecovery) && session) {
            authListener.subscription.unsubscribe();
            navigate('/auth/actualizar-password', { replace: true });
          } else if (session) {
            authListener.subscription.unsubscribe();
            getPostLoginPath(session.user.id, searchParams.get('next')).then((path) => {
              navigate(path, { replace: true });
            });
          }
        });

        // Timeout de fallback si no hay sesión
        setTimeout(() => {
          authListener.subscription.unsubscribe();
          navigate('/auth/login', { replace: true });
        }, 3000);
        return;
      }

      if (isRecovery) {
        navigate('/auth/actualizar-password', { replace: true });
        return;
      }

      const path = await getPostLoginPath(data.session.user.id, searchParams.get('next'));
      navigate(path, { replace: true });
    });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center pt-20">
      <LoadingSpinner />
    </div>
  );
}
