import { createBrowserClient } from '@supabase/ssr';

const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.ZopqoUt20nEV8rw6HtnRmaiXw';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;
  const safeUrl = url.startsWith('https://') ? url : FALLBACK_URL;
  const safeKey = key.startsWith('eyJ') ? key : FALLBACK_KEY;
  return createBrowserClient(safeUrl, safeKey);
}
