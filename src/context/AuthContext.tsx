import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
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
    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug('AuthContext.getSession result on init:', session?.user?.id ?? null, session);
      }
      setUser(session?.user ?? null);

      // ดึง profile เฉพาะเมื่อมี user
      if (session?.user) {
        await handleUserProfile(session.user);
      } else {
        setProfile(null);
        setNeedsTermsAcceptance(false);
        setNeedsUsernameSetup(false);
      }

      setLoading(false);
    });

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

    return () => subscription.unsubscribe();
  }, []);

  const handleUserProfile = async (user: User) => {
    // ดึง profile ที่มีอยู่ (ตรวจ error เพื่อจับ RLS/permission failures)
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (selectError) {
      // Log error for debugging (dev only)
      console.error('profiles SELECT error for user', user.id, selectError);
      // ensure profile is null to fallback to email, but surface issue in console
      setProfile(null);
      setNeedsTermsAcceptance(false);
      setNeedsUsernameSetup(false);
      return;
    }

    if (!existingProfile) {
      // ผู้ใช้ใหม่จาก Social Login - สร้าง profile
      const newProfile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      };

      const { data: createdProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (insertError) {
        console.error('profiles INSERT error for user', user.id, insertError);
        setProfile(null);
        setNeedsTermsAcceptance(false);
        setNeedsUsernameSetup(false);
        return;
      }

      setProfile(createdProfile || newProfile);
      setNeedsTermsAcceptance(true); // ผู้ใช้ใหม่ต้องยอมรับ Terms
      setNeedsUsernameSetup(true); // ผู้ใช้ใหม่ต้องตั้ง Username
    } else {
      setProfile(existingProfile);
      setNeedsTermsAcceptance(!existingProfile.terms_accepted_at);
      setNeedsUsernameSetup(!existingProfile.username);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile, 
        loading,
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