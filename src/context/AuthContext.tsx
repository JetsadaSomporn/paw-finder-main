import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  username: string | null;
  fullName: string | null;
  displayName: string | null;
  signOut: () => Promise<void>;
  refreshProfile: (userId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  username: null,
  fullName: null,
  displayName: null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);

  // Fetch profile fields (username, full_name) for a given user id (or current user)
  const refreshProfile = async (userId?: string) => {
    try {
      const id = userId ?? user?.id;
      if (!id) return;
      const { data } = await supabase.from('profiles').select('username, full_name').eq('id', id).single();
      setUsername(data?.username ?? null);
      setFullName(data?.full_name ?? null);
    } catch (e) {
      setUsername(null);
      setFullName(null);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out', e);
      throw e;
    }
  };

  useEffect(() => {
    // Check active session and set user + username
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await refreshProfile(session.user.id);
        } else {
          setUsername(null);
          setFullName(null);
        }
      } catch (e) {
        setUser(null);
        setUsername(null);
      } finally {
        setLoading(false);
      }
    };

    load();

    // Listen for auth state changes (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await refreshProfile(session.user.id);
        } else {
          setUsername(null);
          setFullName(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const displayName = username ?? fullName ?? null;

  return (
    <AuthContext.Provider value={{ user, loading, username, fullName, displayName, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};