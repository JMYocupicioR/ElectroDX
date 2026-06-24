import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { AppRole, EnrollmentStatus, Profile } from '../types/database';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  isLoading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isVerifiedContributor: boolean;
  canProposeContent: boolean;
  isEnrolledPhysician: boolean;
  enrollmentStatus: EnrollmentStatus;
  isEnrollmentPending: boolean;
  bootstrapAvailable: boolean;
  refreshProfile: () => Promise<void>;
  signInWithOtp: (email: string, nextPath?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  claimBootstrapAdmin: () => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  uploadAvatar: (file: File) => Promise<{ url: string | null; error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchUserData(userId: string) {
  const { data: ctx, error: ctxError } = await supabase.rpc('get_my_auth_context');

  if (!ctxError && ctx && typeof ctx === 'object') {
    const payload = ctx as {
      profile?: Profile | null;
      roles?: AppRole[];
      bootstrap_available?: boolean;
    };
    return {
      profile: payload.profile ?? null,
      roles: (payload.roles ?? []) as AppRole[],
      bootstrapAvailable: payload.bootstrap_available === true,
    };
  }

  if (ctxError) console.error('[Auth] get_my_auth_context:', ctxError.message);

  const [profileRes, rolesRes, bootstrapRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', userId),
    supabase.rpc('bootstrap_admin_available'),
  ]);

  if (profileRes.error) console.error('[Auth] profiles:', profileRes.error.message);
  if (rolesRes.error) console.error('[Auth] user_roles:', rolesRes.error.message);

  return {
    profile: (profileRes.data as Profile | null) ?? null,
    roles: (rolesRes.data?.map((r) => r.role as AppRole) ?? []) as AppRole[],
    bootstrapAvailable: bootstrapRes.data === true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [bootstrapAvailable, setBootstrapAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  const loadUserData = useCallback(async (userId: string) => {
    const data = await fetchUserData(userId);
    setProfile(data.profile);
    setRoles(data.roles);
    setBootstrapAvailable(data.bootstrapAvailable);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user.id) return;
    await loadUserData(session.user.id);
  }, [loadUserData, session?.user.id]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        if (data.session?.user) {
          loadUserData(data.session.user.id).finally(() => {
            if (mounted) setIsLoading(false);
          });
        } else {
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('[Auth] getSession failed:', error);
        if (mounted) setIsLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'INITIAL_SESSION') return;
      if (nextSession?.user) {
        loadUserData(nextSession.user.id);
      } else {
        setProfile(null);
        setRoles([]);
        setBootstrapAvailable(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadUserData]);

  const signInWithOtp = useCallback(async (email: string, nextPath?: string) => {
    const next = nextPath && nextPath.startsWith('/') ? nextPath : undefined;
    const redirectTo = next
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
    setBootstrapAvailable(false);
  }, []);

  const claimBootstrapAdmin = useCallback(async () => {
    const { error } = await supabase.rpc('claim_bootstrap_admin');
    if (!error) await refreshProfile();
    return { error: error?.message ?? null };
  }, [refreshProfile]);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!session?.user.id) return { error: 'No autenticado' };
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id);
      if (!error) await refreshProfile();
      return { error: error?.message ?? null };
    },
    [refreshProfile, session?.user.id]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!session?.user.id) return { url: null, error: 'No autenticado' };
      if (file.size > 512 * 1024) return { url: null, error: 'Máximo 512 KB' };
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        return { url: null, error: 'Formato no permitido (JPG, PNG, WebP)' };
      }

      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${session.user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) return { url: null, error: uploadError.message };

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      const { error: profileError } = await updateProfile({ avatar_url: url });
      return { url, error: profileError };
    },
    [session?.user.id, updateProfile]
  );

  const value = useMemo<AuthContextValue>(() => {
    const hasContributorRole = roles.includes('contributor');
    const isAdmin = roles.includes('admin');
    const isEditor = roles.includes('editor');
    // Admin/editor siempre pueden proponer; colaboradores tras verificación
    const canProposeContent =
      isAdmin ||
      isEditor ||
      (Boolean(profile?.verified_at) && hasContributorRole);
    const isVerifiedContributor = canProposeContent;
    const enrollmentStatus: EnrollmentStatus = profile?.enrollment_status ?? 'none';
    const isEnrolledPhysician =
      isVerifiedContributor ||
      (enrollmentStatus === 'approved' && Boolean(profile?.enrollment_verified_at));

    return {
      session,
      user: session?.user ?? null,
      profile,
      roles,
      isLoading,
      isAdmin,
      isEditor,
      isVerifiedContributor,
      canProposeContent,
      isEnrolledPhysician,
      enrollmentStatus,
      isEnrollmentPending: enrollmentStatus === 'pending',
      bootstrapAvailable,
      refreshProfile,
      signInWithOtp,
      signOut,
      claimBootstrapAdmin,
      updateProfile,
      uploadAvatar,
    };
  }, [
      session,
      profile,
      roles,
      isLoading,
      bootstrapAvailable,
      refreshProfile,
      signInWithOtp,
      signOut,
      claimBootstrapAdmin,
      updateProfile,
      uploadAvatar,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
