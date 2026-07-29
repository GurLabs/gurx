import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { isSupabaseReady, supabase } from '../lib/supabase';
import { ADMIN_EMAIL } from '../lib/brand';
import type { Profile, UserRole } from '../types';

interface AuthContextValue {
  ready: boolean;
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  isAdmin: boolean;
  isStaff: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signInWithGitHub: (redirectTo?: string) => Promise<void>;
  signInWithProvider: (provider: OAuthProvider, redirectTo?: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (input: SignUpInput) => Promise<{ needsEmailConfirm: boolean }>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
}

export type OAuthProvider = 'google' | 'github';

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  /** Optional at signup — the application form is where it becomes mandatory. */
  birthYear?: number | null;
  referredBy?: string | null;
  /** Cloudflare Turnstile token; Supabase verifies it when CAPTCHA is enabled. */
  captchaToken?: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function requireConfigured(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase bağlantısı yapılandırılmamış. Proje köküne .env dosyası ekleyip VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini girin.',
    );
  }
  return supabase;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(isSupabaseReady);
  const [ready, setReady] = useState(!isSupabaseReady);
  const mounted = useRef(true);

  const loadProfile = useCallback(async (userId: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!mounted.current) return;
    if (error) {
      console.error('[auth] profil okunamadı:', error.message);
      setProfile(null);
      return;
    }
    setProfile((data as Profile) ?? null);
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!supabase) {
      setReady(true);
      setLoading(false);
      return () => {
        mounted.current = false;
      };
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted.current) return;
      setSession(data.session);
      if (data.session?.user) await loadProfile(data.session.user.id);
      if (!mounted.current) return;
      setLoading(false);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, next) => {
      if (!mounted.current) return;
      setSession(next);
      if (next?.user) {
        await loadProfile(next.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted.current = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const user = session?.user ?? null;

  const role: UserRole = useMemo(() => {
    if (profile?.role) return profile.role;
    if (user?.email?.toLowerCase() === ADMIN_EMAIL) return 'admin';
    return 'participant';
  }, [profile?.role, user?.email]);

  const signInWithProvider = useCallback(
    async (provider: OAuthProvider, redirectTo?: string) => {
      const sb = requireConfigured();
      const { error } = await sb.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            redirectTo ?? '/dashboard',
          )}`,
          // GitHub hides the address unless this scope is requested, which
          // leaves the profile without an e-mail.
          scopes: provider === 'github' ? 'read:user user:email' : undefined,
        },
      });
      if (error) throw error;
    },
    [],
  );

  const signInWithGoogle = useCallback(
    (redirectTo?: string) => signInWithProvider('google', redirectTo),
    [signInWithProvider],
  );

  const signInWithGitHub = useCallback(
    (redirectTo?: string) => signInWithProvider('github', redirectTo),
    [signInWithProvider],
  );

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const sb = requireConfigured();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUpWithPassword = useCallback(async (input: SignUpInput) => {
    const sb = requireConfigured();
    const { data, error } = await sb.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        captchaToken: input.captchaToken ?? undefined,
        data: {
          full_name: input.fullName,
          birth_year: input.birthYear ?? null,
          referred_by: input.referredBy ?? null,
        },
      },
    });
    if (error) throw error;
    return { needsEmailConfirm: !data.session };
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const sb = requireConfigured();
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profil`,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [loadProfile, user]);

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      const sb = requireConfigured();
      if (!user) throw new Error('Oturum bulunamadı.');

      /*
       * Upsert, not update: accounts created before the profile trigger existed
       * have no row, and a plain UPDATE matches zero rows and reports no error —
       * the save silently does nothing. `.select()` makes a blocked or missing
       * write fail loudly instead.
       */
      const { data, error } = await sb
        .from('profiles')
        .upsert(
          { id: user.id, email: user.email ?? profile?.email ?? '', ...patch },
          { onConflict: 'id' },
        )
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        throw new Error(
          'Profil kaydedilemedi: satır güncellenmedi. Supabase RLS politikalarını kontrol edin.',
        );
      }

      setProfile(data as Profile);
    },
    [profile?.email, user],
  );

  const value: AuthContextValue = {
    ready,
    configured: isSupabaseReady,
    loading,
    session,
    user,
    profile,
    role,
    isAdmin: role === 'admin',
    isStaff: role === 'staff' || role === 'admin',
    signInWithGoogle,
    signInWithGitHub,
    signInWithProvider,
    signInWithPassword,
    signUpWithPassword,
    sendPasswordReset,
    signOut,
    refreshProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
