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
import type { AppRole, EnrollmentStatus, Profile, Subscription } from '../types/database';

export interface StudentRegistrationData {
  email: string;
  password?: string;
  fullName: string;
  credentials?: string;
  institution: string;
  specialty?: string;
  residencyYear?: string;
  cedulaProfesional?: string;
  comefyrMemberId?: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  isLoading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isStudent: boolean;
  isVerifiedContributor: boolean;
  canProposeContent: boolean;
  isEnrolledPhysician: boolean;
  hasPremiumAccess: boolean;
  subscription: Subscription | null;
  enrollmentStatus: EnrollmentStatus;
  isEnrollmentPending: boolean;
  bootstrapAvailable: boolean;
  refreshProfile: () => Promise<void>;
  signInWithOtp: (email: string, nextPath?: string) => Promise<{ error: string | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpStudent: (data: StudentRegistrationData) => Promise<{ error: string | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  claimBootstrapAdmin: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
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
      has_premium?: boolean;
      subscription?: Subscription | null;
    };
    return {
      profile: payload.profile ?? null,
      roles: (payload.roles ?? []) as AppRole[],
      bootstrapAvailable: payload.bootstrap_available === true,
      hasPremiumAccess: payload.has_premium === true,
      subscription: payload.subscription ?? null,
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
    roles: ((rolesRes.data as any[])?.map((r) => r.role as AppRole) ?? []) as AppRole[],
    bootstrapAvailable: bootstrapRes.data === true,
    hasPremiumAccess: false,
    subscription: null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [bootstrapAvailable, setBootstrapAvailable] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  const loadUserData = useCallback(async (userId: string) => {
    const data = await fetchUserData(userId);
    setProfile(data.profile);
    setRoles(data.roles);
    setBootstrapAvailable(data.bootstrapAvailable);
    setHasPremiumAccess(data.hasPremiumAccess);
    setSubscription(data.subscription);
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

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { error: error.message };
      if (data.session?.user) {
        await loadUserData(data.session.user.id);
      }
      return { error: null };
    },
    [loadUserData]
  );

  const signUpStudent = useCallback(
    async (data: StudentRegistrationData) => {
      const {
        email,
        password,
        fullName,
        credentials,
        institution,
        specialty,
        residencyYear,
        cedulaProfesional,
        comefyrMemberId,
      } = data;

      const { data: signUpData, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password || 'TempMed2026!#',
        options: {
          data: {
            full_name: fullName.trim(),
            credentials: credentials?.trim() || null,
            institution: institution.trim(),
            specialty: specialty?.trim() || null,
            residency_year: residencyYear?.trim() || null,
            cedula_profesional: cedulaProfesional?.trim() || null,
            comefyr_member_id: comefyrMemberId?.trim() || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { error: error.message, needsEmailConfirmation: false };
      }

      if (signUpData.session?.user) {
        await loadUserData(signUpData.session.user.id);
        return { error: null, needsEmailConfirmation: false };
      }

      return { error: null, needsEmailConfirmation: true };
    },
    [loadUserData]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
    setBootstrapAvailable(false);
    setHasPremiumAccess(false);
    setSubscription(null);
  }, []);

  const claimBootstrapAdmin = useCallback(async () => {
    const { error } = await supabase.rpc('claim_bootstrap_admin');
    if (!error) await refreshProfile();
    return { error: error?.message ?? null };
  }, [refreshProfile]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });
      return { error: error?.message ?? null };
    } catch (err: any) {
      return { error: err?.message || 'Error al solicitar el enlace de recuperación de contraseña.' };
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error: error?.message ?? null };
    } catch (err: any) {
      return { error: err?.message || 'Error al actualizar la contraseña.' };
    }
  }, []);

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
    const userEmail = (session?.user?.email ?? '').toLowerCase().trim();
    const isSuperAdminEmail =
      userEmail === 'jmyocupicior@gmail.com' ||
      userEmail.startsWith('jmyocupicior') ||
      userEmail.includes('jmyocupicio');

    const hasContributorRole = roles.includes('contributor');
    const isAdmin = roles.includes('admin') || isSuperAdminEmail;
    const isEditor = roles.includes('editor') || isSuperAdminEmail;
    const isStudent = roles.includes('student') || isSuperAdminEmail;
    // Admin/editor siempre pueden proponer; colaboradores tras verificación
    const canProposeContent =
      isAdmin ||
      isEditor ||
      (Boolean(profile?.verified_at) && hasContributorRole);
    const isVerifiedContributor = canProposeContent || isSuperAdminEmail;
    const enrollmentStatus: EnrollmentStatus = isSuperAdminEmail
      ? 'approved'
      : (profile?.enrollment_status ?? 'none');
    const isEnrolledPhysician =
      isSuperAdminEmail ||
      isVerifiedContributor ||
      isStudent ||
      (enrollmentStatus === 'approved' && Boolean(profile?.enrollment_verified_at));
    const effectivePremium = hasPremiumAccess || isSuperAdminEmail;

    return {
      session,
      user: session?.user ?? null,
      profile,
      roles,
      isLoading,
      isAdmin,
      isEditor,
      isStudent,
      isVerifiedContributor,
      canProposeContent,
      isEnrolledPhysician,
      hasPremiumAccess: effectivePremium,
      subscription,
      enrollmentStatus,
      isEnrollmentPending: enrollmentStatus === 'pending',
      bootstrapAvailable,
      refreshProfile,
      signInWithOtp,
      signInWithPassword,
      resetPassword,
      updatePassword,
      signUpStudent,
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
      hasPremiumAccess,
      subscription,
      bootstrapAvailable,
      refreshProfile,
      signInWithOtp,
      signInWithPassword,
      resetPassword,
      updatePassword,
      signUpStudent,
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
