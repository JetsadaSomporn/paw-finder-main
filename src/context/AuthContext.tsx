import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id?: string;
  username?: string;
  terms_accepted_at?: string;
  created_at?: string;
  full_name?: string;
  avatar_url?: string;
}

type AuthErrorType =
  | 'none'
  | 'no_session'
  | 'select_error'
  | 'insert_error'
  | 'rls_error'
  | 'network_error'
  | 'unknown';

interface AuthErrorDetail {
  type: AuthErrorType;
  step: string;
  message?: string;
  code?: string | number | null;
  status?: number | null;
  requiresSignOut?: boolean;
  timestamp: string;
  extra?: any;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  profileError: AuthErrorDetail | null;
  needsTermsAcceptance: boolean;
  needsUsernameSetup: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  profileLoading: false,
  profileError: null,
  needsTermsAcceptance: false,
  needsUsernameSetup: false,
  updateProfile: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<AuthErrorDetail | null>(null);
  const [needsTermsAcceptance, setNeedsTermsAcceptance] = useState(false);
  const [needsUsernameSetup, setNeedsUsernameSetup] = useState(false);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : updates as Profile);
      
      // อัพเดท state flags
      if (updates.terms_accepted_at) {
        setNeedsTermsAcceptance(false);
      }
      if (updates.username) {
        setNeedsUsernameSetup(false);
      }
    }
  };

  const signOut = async () => {
    // Immediately clear local auth state and storage so UI updates instantly
    try {
      setUser(null);
      setProfile(null);
      setNeedsTermsAcceptance(false);
      setNeedsUsernameSetup(false);

      // Remove likely supabase keys from storage to avoid stale sessions
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (!key) continue;
          const k = key.toLowerCase();
          if (k.includes('supabase') || k.startsWith('sb:') || k.startsWith('sb-') || k.includes('auth')) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        /* ignore */
      }
      try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const key = sessionStorage.key(i);
          if (!key) continue;
          const k = key.toLowerCase();
          if (k.includes('supabase') || k.startsWith('sb:') || k.startsWith('sb-') || k.includes('auth')) {
            sessionStorage.removeItem(key);
          }
        }
      } catch (e) {
        /* ignore */
      }
    } catch (e) {
      // best-effort clear
    }

    // Attempt server-side signOut but don't block UI on it
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // non-fatal, UI already cleared
        // keep profileError for visibility if needed
        setProfileError({
          type: 'unknown',
          step: 'signOut',
          message: error.message || String(error),
          timestamp: new Date().toISOString(),
          extra: error,
        });
      }
    } catch (e) {
      // ignore network signOut failures; UI already cleared
      setProfileError({
        type: 'network_error',
        step: 'signOut',
        message: (e as any)?.message || String(e),
        timestamp: new Date().toISOString(),
        extra: e,
      });
    }
  };

  // Helper: try REST fallback to read profile using stored access_token
  const restFetchProfileByUserId = async (userId?: string) => {
    try {
      if (!userId) return null;
      const supaUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
      const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
      if (!supaUrl || !anon) return null;
      // Find an access token by scanning localStorage and sessionStorage.
      // Different environments store tokens under different keys/structures; be tolerant.
      const tryParse = (v: string | null) => {
        if (!v) return null as any;
        try { return JSON.parse(v); } catch { return v; }
      };

      let token: string | null = null;
      const scanStore = (store: Storage) => {
        for (let i = store.length - 1; i >= 0; i--) {
          const key = store.key(i);
          if (!key) continue;
          const raw = store.getItem(key);
          if (!raw) continue;
          const parsed = tryParse(raw);
          // parsed may be object or string. Try common shapes.
          if (parsed && typeof parsed === 'object') {
            if (parsed.access_token && typeof parsed.access_token === 'string') return parsed.access_token;
            if (parsed.currentSession && parsed.currentSession.access_token) return parsed.currentSession.access_token;
            if (parsed.session && parsed.session.access_token) return parsed.session.access_token;
            if (parsed?.data?.access_token) return parsed.data.access_token;
            if (parsed?.token && typeof parsed.token === 'string') return parsed.token;
            if (parsed?.provider_token && typeof parsed.provider_token === 'string') return parsed.provider_token;
          } else if (typeof parsed === 'string') {
            // maybe the raw value is the token itself
            if (/^[A-Za-z0-9-_\.]+\.[A-Za-z0-9-_\.]+\.[A-Za-z0-9-_\.]+$/.test(parsed)) return parsed;
          }
        }
        return null;
      };

      token = scanStore(localStorage) || scanStore(sessionStorage) || null;
      if (!token) return null;

      const url = `${supaUrl}/rest/v1/profiles?id=eq.${userId}&select=*`;
      const resp = await fetch(url, {
        headers: {
          Authorization: 'Bearer ' + token,
          apikey: anon,
          Accept: 'application/json',
        },
      });
      if (!resp.ok) return null;
      const text = await resp.text();
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data) && data.length) return data[0];
      } catch (e) {
        return null;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function init() {
      let session;
      // Try to wire supabase-js session from localStorage token to reduce race on refresh
      try {
        const supaUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
        if (supaUrl) {
          const ref = new URL(supaUrl).host.split('.')[0];
          const storageKey = `sb-${ref}-auth-token`;
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              const access_token = parsed?.access_token || parsed?.currentSession?.access_token || null;
              const refresh_token = parsed?.refresh_token || parsed?.currentSession?.refresh_token || null;
              // Attempt a REST prefetch of the profile using stored token info so the UI can show
              // a profile immediately on refresh even if supabase-js hasn't fully wired yet.
              try {
                const userIdFromStorage = parsed?.userId || parsed?.currentSession?.user?.id || null;
                if (userIdFromStorage && access_token) {
                  const prefetched = await restFetchProfileByUserId(userIdFromStorage);
                  if (prefetched) {
                    // set prefetched profile so header/UI can render quickly
                    setProfile(prefetched as any);
                    setNeedsTermsAcceptance(!prefetched.terms_accepted_at);
                    setNeedsUsernameSetup(!prefetched.username);
                    // ensure consumers don't stay in loading state
                    setProfileLoading(false);
                    // continue to wire session below
                  }
                }
              } catch (e) {
                // ignore prefetch errors
              }
              if (access_token) {
                // setSession is idempotent and will attach token to client for subsequent calls
                // ignore result; we proceed to getSession() below
                // @ts-ignore - supabase.auth.setSession exists in v2
                await supabase.auth.setSession({ access_token, refresh_token });
              }
            } catch (e) {
              // ignore parsing errors
            }
          }
        }
      } catch (e) {
        // ignore any early wiring errors
      }
      let errorDetail: AuthErrorDetail | null = null;
      for (let i = 0; i < 3; i++) {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            errorDetail = {
              type: 'network_error',
              step: 'getSession',
              message: error.message,
              code: error.status,
              status: error.status,
              timestamp: new Date().toISOString(),
            };
            continue;
          }
          session = data.session;
          if (session?.user) break;
        } catch (e: any) {
          errorDetail = {
            type: 'unknown',
            step: 'getSession',
            message: e?.message || String(e),
            timestamp: new Date().toISOString(),
            extra: e,
          };
        }
        await new Promise(r => setTimeout(r, 300));
      }
      if (cancelled) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        await handleUserProfile(session.user);
      } else {
        setProfile(null);
        setNeedsTermsAcceptance(false);
        setNeedsUsernameSetup(false);
        setProfileError({
          type: 'no_session',
          step: 'init',
          message: 'No session/user after retries',
          timestamp: new Date().toISOString(),
          ...errorDetail
        });
      }
      setLoading(false);
    }
    init();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await handleUserProfile(session.user);
      } else {
        setProfile(null);
        setNeedsTermsAcceptance(false);
        setNeedsUsernameSetup(false);
        setProfileError({
          type: 'no_session',
          step: 'onAuthStateChange',
          message: 'No session/user in onAuthStateChange',
          timestamp: new Date().toISOString(),
        });
      }
      setLoading(false);
    });
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  const handleUserProfile = async (user: User) => {
    // If we've already prefetched a profile for this user, skip re-loading.
    if (profile && profile.id === user.id && profile.username) {
      // ensure flags are in sync
      setNeedsTermsAcceptance(!profile.terms_accepted_at);
      setNeedsUsernameSetup(!profile.username);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);
    const step = 'handleUserProfile';
    const startTs = Date.now();
    const devLog = (...args: any[]) => {
      if (process.env.NODE_ENV === 'development') console.info('[AuthContext.timeline]', ...args);
    };
    devLog('start', { userId: user?.id });
    // watchdog: if profile loading never completes within 10s, recover
    let watchdog: NodeJS.Timeout | null = null;
    const startWatchdog = () => {
      if (process.env.NODE_ENV !== 'development') return;
      watchdog = setTimeout(() => {
        console.warn('[AuthContext.timeline] watchdog timeout clearing profileLoading after 10s', { userId: user?.id });
        setProfileLoading(false);
        setProfileError({ type: 'unknown', step: 'watchdog', message: 'profile load timed out', timestamp: new Date().toISOString() });
      }, 10000);
    };
    const stopWatchdog = () => { if (watchdog) { clearTimeout(watchdog); watchdog = null; } };
    startWatchdog();
    try {
      // Dev-only artificial delay to help visualize loading placeholder
      if (process.env.NODE_ENV === 'development') {
        await new Promise(r => setTimeout(r, 300));
      }
      // fetch existing profile by id only
      devLog('supabase.select.start', { userId: user.id });
      const { data: existingProfile, error: selectError, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      devLog('supabase.select.done', { userId: user.id, existingProfile, selectError, status });

      if (selectError) {
        const errCode = (selectError as any).code || (selectError as any).status || null;
        const errMsg = selectError.message || String(selectError);
        const ts = new Date().toISOString();
        const looksLikeNoRows = String(errCode) === 'PGRST116' || /no rows found/i.test(errMsg);

        if (looksLikeNoRows) {
          // Create minimal profile
            // Try REST fallback first
            devLog('restFallback.start', { userId: user.id });
            const rest = await restFetchProfileByUserId(user.id);
            devLog('restFallback.done', { userId: user.id, rest });
            if (rest) {
              setProfile(rest as any);
              setNeedsTermsAcceptance(!rest.terms_accepted_at);
              setNeedsUsernameSetup(!rest.username);
              setProfileLoading(false);
              stopWatchdog();
              devLog('done', { userId: user.id, duration: Date.now() - startTs });
              return;
            }

            const newProfile = {
              id: user.id,
              full_name: (user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || null,
              avatar_url: (user.user_metadata as any)?.avatar_url || null,
            };
            const { data: createdProfile, error: insertError, status: insertStatus } = await supabase
              .from('profiles')
              .insert([newProfile])
              .select()
              .single();
            if (insertError) {
              setProfile(null);
              setNeedsTermsAcceptance(false);
              setNeedsUsernameSetup(false);
              setProfileError({
                type: insertStatus === 403 ? 'rls_error' : 'insert_error',
                step: 'insert-after-select',
                message: insertError.message || String(insertError),
                code: insertError.code || insertStatus || null,
                status: insertStatus,
                requiresSignOut: insertStatus === 403,
                timestamp: ts,
                extra: insertError,
              });
              setProfileLoading(false);
              stopWatchdog();
              devLog('done.error', { userId: user.id, reason: 'insert-after-select', duration: Date.now() - startTs });
              return;
            }
            setProfile(createdProfile || newProfile);
            setNeedsTermsAcceptance(true);
            setNeedsUsernameSetup(true);
            setProfileLoading(false);
            stopWatchdog();
            devLog('done', { userId: user.id, duration: Date.now() - startTs });
            return;
        }

        // Other select errors (network/RLS)
        const requiresSignOut = status === 401 || status === 403;
        // As a robust fallback, construct a client-side profile object so UI can continue.
        const fallbackProfile: Profile = {
          id: user.id,
          username: user.email ? String(user.email).split('@')[0] : undefined,
          full_name: (user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || undefined,
          avatar_url: (user.user_metadata as any)?.avatar_url || undefined,
        };
        setProfile(fallbackProfile);
        // Mark that this is not a DB-backed profile
        setNeedsTermsAcceptance(true);
        setNeedsUsernameSetup(!fallbackProfile.username);
        setProfileError({
          type: status === 403 ? 'rls_error' : 'select_error',
          step: 'select',
          message: errMsg + ' (using local fallback profile)',
          code: errCode,
          status,
          requiresSignOut,
          timestamp: ts,
          extra: selectError,
        });
        setProfileLoading(false);
        stopWatchdog();
        devLog('done.fallback', { userId: user.id, reason: 'select-error', duration: Date.now() - startTs });
        return;
      }

      if (!existingProfile) {
        // No profile by id — try REST fallback before creating
        const rest = await restFetchProfileByUserId(user.id);
        if (rest) {
          setProfile(rest as any);
          setNeedsTermsAcceptance(!rest.terms_accepted_at);
          setNeedsUsernameSetup(!rest.username);
          setProfileLoading(false);
          stopWatchdog();
          devLog('done', { userId: user.id, duration: Date.now() - startTs });
          return;
        }

        // Unexpected: no select error but also no data (treat as create path)
        const newProfile = {
          id: user.id,
          full_name: (user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || null,
          avatar_url: (user.user_metadata as any)?.avatar_url || null,
        };
        const { data: createdProfile, error: insertError, status: insertStatus } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();
        if (insertError) {
          // If insert fails, fall back to a client-only profile so UI remains usable.
          const fallbackProfile: Profile = {
            id: user.id,
            username: user.email ? String(user.email).split('@')[0] : undefined,
            full_name: (user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || undefined,
            avatar_url: (user.user_metadata as any)?.avatar_url || undefined,
          };
          setProfile(fallbackProfile);
          setNeedsTermsAcceptance(true);
          setNeedsUsernameSetup(!fallbackProfile.username);
          setProfileError({
            type: insertStatus === 403 ? 'rls_error' : 'insert_error',
            step: 'insert',
            message: (insertError && insertError.message ? insertError.message : String(insertError)) + ' (using local fallback profile)',
            code: insertError?.code || insertStatus || null,
            status: insertStatus,
            requiresSignOut: insertStatus === 403,
            timestamp: new Date().toISOString(),
            extra: insertError,
          });
          setProfileLoading(false);
          stopWatchdog();
          devLog('done.fallback', { userId: user.id, reason: 'insert-error', duration: Date.now() - startTs });
          return;
        }
        setProfile(createdProfile || newProfile);
        setNeedsTermsAcceptance(true);
        setNeedsUsernameSetup(true);
        setProfileLoading(false);
        stopWatchdog();
        devLog('done', { userId: user.id, duration: Date.now() - startTs });
      } else {
        setProfile(existingProfile);
        setNeedsTermsAcceptance(!existingProfile.terms_accepted_at);
        setNeedsUsernameSetup(!existingProfile.username);
        setProfileLoading(false);
        stopWatchdog();
        devLog('done', { userId: user.id, duration: Date.now() - startTs });
      }
    } catch (e: any) {
      const ts = new Date().toISOString();
      // On unexpected errors, fall back to a local profile so the UI can proceed.
      const fallbackProfile: Profile = {
        id: user.id,
        username: user.email ? String(user.email).split('@')[0] : undefined,
        full_name: (user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || undefined,
        avatar_url: (user.user_metadata as any)?.avatar_url || undefined,
      };
      setProfile(fallbackProfile);
      setNeedsTermsAcceptance(true);
      setNeedsUsernameSetup(!fallbackProfile.username);
      setProfileError({
        type: 'unknown',
        step,
        message: e?.message || String(e) + ' (using local fallback profile)',
        timestamp: ts,
        extra: e,
      });
      setProfileLoading(false);
      stopWatchdog();
      devLog('done.fallback', { userId: user.id, reason: 'catch', duration: Date.now() - startTs, error: (e as any)?.message || String(e) });
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile, 
  loading,
  profileLoading,
  profileError,
        needsTermsAcceptance,
        needsUsernameSetup,
  updateProfile,
  signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};