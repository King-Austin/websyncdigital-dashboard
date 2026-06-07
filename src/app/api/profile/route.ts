import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/profile → the signed-in user's profile (name, company, phone, email, role)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('ws_profiles')
    .select('name, company, phone, email, role')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    name:    profile?.name ?? '',
    company: profile?.company ?? '',
    phone:   profile?.phone ?? '',
    email:   profile?.email ?? user.email ?? '',
    role:    profile?.role ?? 'client',
  });
}

// PATCH /api/profile → update own name / company / phone (and optionally email).
// Email changes go through Supabase Auth and require email confirmation.
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const body = await request.json();
  const admin = createAdminClient();

  // 1. Update profile fields (name, company, phone) on ws_profiles
  const updates: Record<string, string> = {};
  if (typeof body.name === 'string')    updates.name    = body.name.trim();
  if (typeof body.company === 'string') updates.company = body.company.trim();
  if (typeof body.phone === 'string')   updates.phone   = body.phone.trim();

  if (updates.name !== undefined && updates.name.length === 0) {
    return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await admin.from('ws_profiles').update(updates).eq('id', user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2. Optional email change → goes through Supabase Auth (sends a confirmation email)
  let emailChangePending = false;
  const newEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (newEmail && newEmail !== (user.email ?? '').toLowerCase()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    // Uses the user's own session so Supabase sends the confirmation flow.
    const { error: emailErr } = await supabase.auth.updateUser({ email: newEmail });
    if (emailErr) return NextResponse.json({ error: emailErr.message }, { status: 400 });
    emailChangePending = true;
  }

  const { data: profile } = await admin
    .from('ws_profiles')
    .select('name, company, phone, email, role')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    ok: true,
    emailChangePending,
    profile: {
      name:    profile?.name ?? '',
      company: profile?.company ?? '',
      phone:   profile?.phone ?? '',
      email:   profile?.email ?? user.email ?? '',
      role:    profile?.role ?? 'client',
    },
  });
}
