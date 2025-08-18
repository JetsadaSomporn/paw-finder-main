import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Expose the client to window in development for easier debugging from DevTools
// (will not run in production builds)
if (import.meta.env.DEV) {
  try {
    // @ts-ignore - attach for debugging only
    (window as any).supabase = supabase;
  } catch (e) {
    // ignore in environments where window is not available
  }
}