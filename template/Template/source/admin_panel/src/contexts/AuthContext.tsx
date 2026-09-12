import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
    session: Session | null;
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
}

interface AuthContextType extends AuthState {
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        session: null,
        user: null,
        isAdmin: false,
        loading: true,
    });

    const checkRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) {
                console.warn('[Auth] Error checking role:', error.message);
                return false;
            }
            return data?.role === 'admin';
        } catch (err) {
            console.error('[Auth] Role check failed:', err);
            return false;
        }
    };

    useEffect(() => {
        let isMounted = true;
        let lastKnownUserId: string | null = null; // Mutable tracker to bypass stale closures

        const initSession = async () => {
            try {
                console.log('[Auth] Initializing session...');
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.warn('[Auth] Session error during init:', error.message);
                    if (isMounted) setState(s => ({ ...s, loading: false }));
                    return;
                }

                let isAdmin = false;
                if (session?.user) {
                    console.log('[Auth] Session restored for:', session.user.email);
                    lastKnownUserId = session.user.id;
                    isAdmin = await checkRole(session.user.id);
                    console.log('[Auth] Role resolved on init:', isAdmin ? 'ADMIN' : 'STUDENT');
                } else {
                    console.log('[Auth] No active session found');
                }

                if (isMounted) {
                    setState({
                        session,
                        user: session?.user ?? null,
                        isAdmin,
                        loading: false,
                    });
                }
            } catch (err: any) {
                console.error('[Auth] Unexpected error in session init:', err);
                if (isMounted) setState(s => ({ ...s, loading: false }));
            }
        };

        initSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            const newUserId = session?.user?.id;

            console.log(`[Auth] Event: ${event}`, newUserId ? `(User: ${newUserId})` : '(No Session)');

            // Skip INITIAL_SESSION — already handled by initSession above
            if (event === 'INITIAL_SESSION') {
                return;
            }

            if (event === 'SIGNED_OUT') {
                lastKnownUserId = null;
                if (isMounted) {
                    setState({ session: null, user: null, isAdmin: false, loading: false });
                }
                return;
            }

            // TOKEN_REFRESHED: silently update session without showing the loading spinner.
            if (event === 'TOKEN_REFRESHED') {
                if (isMounted && session) {
                    setState(s => ({ ...s, session, user: session.user }));
                }
                return;
            }

            // OPTIMIZATION: If it's a SIGNED_IN event but the user is the same as before, 
            // just update the session and stop. Don't trigger loading=true again.
            if (event === 'SIGNED_IN' && newUserId === lastKnownUserId) {
                if (isMounted && session) {
                    setState(s => ({ ...s, session, user: session.user, loading: false }));
                }
                return;
            }

            // For genuine SIGNED_IN (new user or first time):
            if (isMounted) {
                setState(s => ({ ...s, loading: true }));
            }
            
            lastKnownUserId = newUserId || null;

            let isAdmin = false;
            if (session?.user) {
                isAdmin = await checkRole(session.user.id);
                console.log('[Auth] Role resolved on event:', isAdmin ? 'ADMIN' : 'STUDENT');

                // Auto-create profile logic
                if (event === 'SIGNED_IN') {
                    const meta = session.user.user_metadata;
                    if (meta?.full_name) {
                        try {
                            const { data: existing } = await supabase
                                .from('user_profiles')
                                .select('user_id')
                                .eq('user_id', session.user.id)
                                .maybeSingle();

                            if (!existing) {
                                await supabase.from('user_profiles').insert({
                                    user_id: session.user.id,
                                    full_name: meta.full_name,
                                    residency_year: meta.residency_year || null,
                                    specialty: meta.specialty || 'Medicina de Rehabilitación',
                                    institution: meta.institution || null,
                                    city_state: meta.city_state || null,
                                });
                                console.log('[Auth] Profile auto-created');
                            }
                        } catch (err) {
                            console.error('[Auth] Error auto-creating profile:', err);
                        }
                    }
                }
            }

            if (isMounted) {
                setState({
                    session,
                    user: session?.user ?? null,
                    isAdmin,
                    loading: false,
                });
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ ...state, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
