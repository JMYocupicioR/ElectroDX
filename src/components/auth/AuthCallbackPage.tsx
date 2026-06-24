import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../LoadingSpinner';

async function getPostLoginPath(userId: string, next?: string | null): Promise<string> {
  if (next && next.startsWith('/') && !next.startsWith('//')) return next;

  const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId);
  const roles = data?.map((r) => r.role) ?? [];
  if (roles.includes('admin')) return '/admin';
  return '/colaborador';
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        navigate('/auth/login', { replace: true });
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
