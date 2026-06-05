import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.ZopqoUt20nEV8rw6HtnRmaiXw';

export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;
  const safeUrl = url.startsWith('https://') ? url : FALLBACK_URL;
  const safeKey = key.startsWith('eyJ') ? key : FALLBACK_KEY;

  return createServerClient(safeUrl, safeKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {}
      },
    },
  });
}
