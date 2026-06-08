import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/auth/check-email  { email }
// Returns { exists: boolean } — used by forgot-password to give a clear error
// before calling resetPasswordForEmail (which silently succeeds even for unknown emails).
export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ exists: false });

  const admin = createAdminClient();
  const { data } = await admin
    .from('ws_profiles')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  return NextResponse.json({ exists: !!data });
}
