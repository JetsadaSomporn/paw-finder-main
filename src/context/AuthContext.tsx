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
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out from AuthContext:', error);
        // continue to clear local state
      }

      // wait for auth state to clear (timeout after 3s)
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          resolve();
        }, 3000);

        try {
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session?.user) {
              clearTimeout(timeout);
              subscription.unsubscribe();
              resolve();
            }
          });
        } catch (e) {
          clearTimeout(timeout);
          resolve();
        }
      });
    } catch (e) {
      console.error('Unexpected error during signOut in AuthContext:', e);
    } finally {
      // clear local auth state
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
        console.warn('Error clearing local auth state during signOut', e);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function init() {
      let session;
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
    setProfileLoading(true);
    setProfileError(null);
    const step = 'handleUserProfile';
    try {
      // Dev-only artificial delay to help visualize loading placeholder
      if (process.env.NODE_ENV === 'development') {
        await new Promise(r => setTimeout(r, 300));
      }
      // fetch existing profile by id only
      const { data: existingProfile, error: selectError, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (selectError) {
        const errCode = (selectError as any).code || (selectError as any).status || null;
        const errMsg = selectError.message || String(selectError);
        const ts = new Date().toISOString();
        const looksLikeNoRows = String(errCode) === 'PGRST116' || /no rows found/i.test(errMsg);

        if (looksLikeNoRows) {
          // Create minimal profile
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
              return;
            }
            setProfile(createdProfile || newProfile);
            setNeedsTermsAcceptance(true);
            setNeedsUsernameSetup(true);
            setProfileLoading(false);
            return;
        }

        // Other select errors (network/RLS)
        const requiresSignOut = status === 401 || status === 403;
        setProfile(null);
        setNeedsTermsAcceptance(false);
        setNeedsUsernameSetup(false);
        setProfileError({
          type: status === 403 ? 'rls_error' : 'select_error',
          step: 'select',
          message: errMsg,
          code: errCode,
          status,
          requiresSignOut,
          timestamp: ts,
          extra: selectError,
        });
        setProfileLoading(false);
        return;
      }

      if (!existingProfile) {
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
          setProfile(null);
          setNeedsTermsAcceptance(false);
          setNeedsUsernameSetup(false);
          setProfileError({
            type: insertStatus === 403 ? 'rls_error' : 'insert_error',
            step: 'insert',
            message: insertError.message || String(insertError),
            code: insertError.code || insertStatus || null,
            status: insertStatus,
            requiresSignOut: insertStatus === 403,
            timestamp: new Date().toISOString(),
            extra: insertError,
          });
          setProfileLoading(false);
          return;
        }
        setProfile(createdProfile || newProfile);
        setNeedsTermsAcceptance(true);
        setNeedsUsernameSetup(true);
        setProfileLoading(false);
      } else {
        setProfile(existingProfile);
        setNeedsTermsAcceptance(!existingProfile.terms_accepted_at);
        setNeedsUsernameSetup(!existingProfile.username);
        setProfileLoading(false);
      }
    } catch (e: any) {
      const ts = new Date().toISOString();
      setProfile(null);
      setNeedsTermsAcceptance(false);
      setNeedsUsernameSetup(false);
      setProfileError({
        type: 'unknown',
        step,
        message: e?.message || String(e),
        timestamp: ts,
        extra: e,
      });
      setProfileLoading(false);
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