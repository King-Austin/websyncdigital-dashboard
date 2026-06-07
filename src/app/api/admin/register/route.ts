import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/admin/register  { code, email, password, name }
// Creates an ADMIN account — but only if the secret signup code matches.
// The role is set server-side with the service role, so the client can never
// grant itself admin without the code.
export async function POST(request: Request) {
  const { code, email, password, name } = await request.json();

  const expected = process.env.ADMIN_SIGNUP_CODE;
  if (!expected) {
    return NextResponse.json({ error: 'Admin signup is not configured.' }, { status: 500 });
  }
  if (code !== expected) {
    return NextResponse.json({ error: 'Invalid admin signup code.' }, { status: 403 });
  }
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Create the auth user (email confirmed so they can sign in immediately)
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: 'admin' },
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message || 'Could not create account.' }, { status: 400 });
  }

  // Upsert the profile with admin role + email
  const { error: pErr } = await admin.from('ws_profiles').upsert({
    id: data.user.id,
    email,
    name: name ?? null,
    role: 'admin',
  });

  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
