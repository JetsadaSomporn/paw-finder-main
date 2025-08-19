import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  username: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  username: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

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
          try {
            const { data } = await supabase.from('profiles').select('username').eq('id', session.user.id).single();
            setUsername(data?.username ?? null);
          } catch (e) {
            setUsername(null);
          }
        } else {
          setUsername(null);
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
          try {
            const { data } = await supabase.from('profiles').select('username').eq('id', session.user.id).single();
            setUsername(data?.username ?? null);
          } catch (e) {
            setUsername(null);
          }
        } else {
          setUsername(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, username, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};