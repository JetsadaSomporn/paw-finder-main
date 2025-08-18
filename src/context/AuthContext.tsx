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

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  profileError: { type: 'none' | 'select_error' | 'insert_error' | 'timeout'; message?: string; status?: number | null } | null;
  needsTermsAcceptance: boolean;
  needsUsernameSetup: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
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
  const [profileError, setProfileError] = useState<{ type: 'none' | 'select_error' | 'insert_error' | 'timeout'; message?: string; status?: number | null } | null>(null);
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
      // Wait for session to be available (retry up to 3 times, 300ms apart)
      let session;
      for (let i = 0; i < 3; i++) {
        const { data } = await supabase.auth.getSession();
        session = data.session;
        if (session?.user) break;
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
      }
      setLoading(false);
    }
    init();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug('AuthContext.onAuthStateChange event:', event, 'user:', session?.user?.id ?? null);
      }
      setUser(session?.user ?? null);
      if (session?.user) {
        await handleUserProfile(session.user);
      } else {
        setProfile(null);
        setNeedsTermsAcceptance(false);
        setNeedsUsernameSetup(false);
      }
      setLoading(false);
    });
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  const handleUserProfile = async (user: User) => {
    setProfileLoading(true);
    setProfileError(null);
    // helper to retry an async fn up to n times
    const retry = async (fn: () => Promise<any>, attempts = 3, delayMs = 200) => {
      let lastErr;
      for (let i = 0; i < attempts; i++) {
        try {
          return await fn();
        } catch (e) {
          lastErr = e;
          await new Promise(r => setTimeout(r, delayMs));
          delayMs *= 2;
        }
      }
      throw lastErr;
    };

    try {
      // Try SELECT with retry; using supabase client which returns error object instead of throwing
      let selectResult;
      try {
        selectResult = await retry(async () => {
          const res = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
          if (res.error) throw res.error;
          return res;
        });
      } catch (e: any) {
        console.error('[AuthContext] profiles SELECT error for user', user.id, e);
        setProfile(null);
        setNeedsTermsAcceptance(false);
        setNeedsUsernameSetup(false);
        setProfileError({ type: 'select_error', message: e?.message || String(e), status: e?.status ?? null });
        return;
      }

      const existingProfile = selectResult?.data ?? null;

      if (!existingProfile) {
        // user missing profile — create it (retry)
        const newProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
        };

        try {
          const createdRes = await retry(async () => {
            const r = await supabase.from('profiles').insert([newProfile]).select().single();
            if (r.error) throw r.error;
            return r;
          });
          setProfile(createdRes.data || newProfile);
          setNeedsTermsAcceptance(true);
          setNeedsUsernameSetup(true);
        } catch (e: any) {
          console.error('[AuthContext] profiles INSERT error for user', user.id, e);
          setProfile(null);
          setNeedsTermsAcceptance(false);
          setNeedsUsernameSetup(false);
          setProfileError({ type: 'insert_error', message: e?.message || String(e), status: e?.status ?? null });
          return;
        }

      } else {
        setProfile(existingProfile);
        setNeedsTermsAcceptance(!existingProfile.terms_accepted_at);
        setNeedsUsernameSetup(!existingProfile.username);
      }
    } finally {
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