const URL = import.meta.env.VITE_SUPABASE_URL as string;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export async function restGet(path: string, qs = '') {
  const url = `${URL.replace(/\/+$/,'')}/rest/v1/${path}${qs}`;
  const res = await fetch(url, {
    headers: {
      apikey: KEY,
      Accept: 'application/json',
      Prefer: 'return=representation',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

export default restGet;
