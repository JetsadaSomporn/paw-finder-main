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
  // show a small sign-in hint anchored by Header when unauthenticated actions occur
  signInHint: { visible: boolean; message: string };
  showSignInHint: (message?: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  needsTermsAcceptance: false,
  needsUsernameSetup: false,
  updateProfile: async () => {},
  signInHint: { visible: false, message: '' },
  showSignInHint: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsTermsAcceptance, setNeedsTermsAcceptance] = useState(false);
  const [needsUsernameSetup, setNeedsUsernameSetup] = useState(false);
  const [signInHint, setSignInHint] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const hideTimer = React.useRef<number | null>(null);

  const showSignInHint = (message = 'กรุณาเข้าสู่ระบบก่อนส่งข้อมูล') => {
    // clear any existing timer
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setSignInHint({ visible: true, message });
    // auto-hide after 5 seconds
    hideTimer.current = window.setTimeout(() => {
      setSignInHint({ visible: false, message: '' });
      hideTimer.current = null;
    }, 5000);
  };

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

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
    // ดึง profile ที่มีอยู่
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // ผู้ใช้ใหม่จาก Social Login - สร้าง profile
      const newProfile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      };

      const { data: createdProfile } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

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
  signInHint,
  showSignInHint,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};