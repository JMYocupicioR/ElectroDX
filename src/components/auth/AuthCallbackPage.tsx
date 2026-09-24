import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { postLoginPathFromRoles } from '../../utils/postLoginPath';
import { LoadingSpinner } from '../LoadingSpinner';

async function getPostLoginPath(userId: string, next?: string | null): Promise<string> {
  const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId);
  const roles = data?.map((r) => r.role) ?? [];
  return postLoginPathFromRoles(roles, next);
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let settled = false;
    const next = searchParams.get('next');
    const hash = window.location.hash;
    const isRecovery =
      searchParams.get('type') === 'recovery' ||
      next === '/auth/actualizar-password' ||
      hash.includes('type=recovery');

    const errorDescription = searchParams.get('error_description') || searchParams.get('error');
    if (errorDescription || hash.includes('error=')) {
      navigate('/auth/login?mode=recovery&error=expired', { replace: true });
      return;
    }

    const finish = async (userId: string, recovery: boolean) => {
      if (settled) return;
      settled = true;
      if (recovery) {
        navigate('/auth/actualizar-password', { replace: true });
        return;
      }
      const path = await getPostLoginPath(userId, next);
      navigate(path, { replace: true });
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) return;
      const recovery = isRecovery || event === 'PASSWORD_RECOVERY';
      void finish(session.user.id, recovery);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void finish(data.session.user.id, isRecovery);
    });

    const timer = window.setTimeout(() => {
      authListener.subscription.unsubscribe();
      if (settled) return;
      settled = true;
      navigate(isRecovery ? '/auth/login?mode=recovery&error=expired' : '/auth/login', { replace: true });
    }, 4000);

    return () => {
      settled = true;
      window.clearTimeout(timer);
      authListener.subscription.unsubscribe();
    };
  }, [navigate, searchParams]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center pt-20">
      <LoadingSpinner />
    </div>
  );
}
