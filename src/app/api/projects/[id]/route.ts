import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID = ['submitted', 'processing', 'active', 'cancelled'] as const;

const EDITABLE_FIELDS = [
  'name', 'business_name', 'about', 'extra_info', 'socials',
  'address', 'phone', 'business_email', 'brand_colors', 'whatsapp',
] as const;

// PUT /api/projects/[id]  → client edits their own project's brief.
// Only allowed while the project is not yet active (submitted/processing).
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const admin = createAdminClient();
  const { data: project } = await admin
    .from('ws_projects')
    .select('client_id, status')
    .eq('id', id)
    .single();

  if (!project) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (project.client_id !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (project.status === 'active') {
    return NextResponse.json({ error: 'Active projects cannot be edited here.' }, { status: 409 });
  }

  const body = await request.json();
  const updates: Record<string, string> = {};
  for (const f of EDITABLE_FIELDS) {
    if (typeof body[f] === 'string') updates[f] = body[f];
  }
  if (!updates.name) updates.name = body.name ?? '';
  if (!updates.name) return NextResponse.json({ error: 'Project name is required' }, { status: 400 });

  const { data, error } = await admin
    .from('ws_projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/projects/[id]  → client deletes their own project.
// Blocked once active (an active project is a live paid subscription).
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('ws_profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';

  const { data: project } = await admin
    .from('ws_projects')
    .select('client_id, status')
    .eq('id', id)
    .single();

  if (!project) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (project.client_id !== user.id && !isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (project.status === 'active' && !isAdmin) {
    return NextResponse.json({ error: 'Active projects cannot be deleted. Contact support to cancel.' }, { status: 409 });
  }

  const { error } = await admin.from('ws_projects').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}

// PATCH /api/projects/[id]  { status }  → admin-only manual status change
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const admin = createAdminClient();

  // Only admins may change status manually
  const { data: profile } = await admin
    .from('ws_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { status } = await request.json();
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('ws_projects')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify the client of the manual change
  if (data?.client_id) {
    const msg = status === 'active'
      ? `Your project "${data.name}" has been activated.`
      : status === 'cancelled'
      ? `Your project "${data.name}" has been marked cancelled.`
      : `Your project "${data.name}" status was updated.`;
    await admin.from('ws_notifications').insert({ client_id: data.client_id, type: 'billing', message: msg });
  }

  return NextResponse.json(data);
}
