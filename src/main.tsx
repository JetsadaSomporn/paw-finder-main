import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { supabase } from '@/lib/supabase';

// Clean up invalid/expired Supabase JWTs before the app initializes.
// If the stored token is invalid, remove supabase-related keys and reload so the app starts without the stale token.
(async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error && /invalid|expired|jwt/i.test(String(error?.message || ''))) {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i)!;
        if (!k) continue;
        if (k.startsWith('sb-') || k.toLowerCase().includes('supabase')) {
          try { localStorage.removeItem(k); } catch {}
        }
      }
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const k = sessionStorage.key(i)!;
        if (!k) continue;
        if (k.startsWith('sb-') || k.toLowerCase().includes('supabase')) {
          try { sessionStorage.removeItem(k); } catch {}
        }
      }
      // reload so app boots without the stale token
      location.reload();
    }
  } catch {
    // ignore errors during cleanup; don't block app init
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
