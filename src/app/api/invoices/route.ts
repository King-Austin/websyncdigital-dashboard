import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/invoices?client_id=&project_id=
// Admins see all; clients see only their own (RLS-scoped via their session).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId  = searchParams.get('client_id');
  const projectId = searchParams.get('project_id');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  // Use the user's RLS-scoped session so clients only get their own invoices.
  let query = supabase
    .from('ws_invoices')
    .select('*, ws_profiles(name, company)')
    .order('created_at', { ascending: false });

  if (clientId)  query = query.eq('client_id', clientId);
  if (projectId) query = query.eq('project_id', projectId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/invoices  → admin raises an invoice (optionally tied to a project)
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const admin = createAdminClient();

  // Only admins may raise invoices
  const { data: me } = await admin.from('ws_profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await request.json();
  let { client_id } = body;
  const { project_id, kind, description, amount, due_date } = body;

  if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ error: 'A positive amount (in kobo) is required' }, { status: 400 });
  }

  // If tied to a project, derive client_id from it
  if (project_id) {
    const { data: project } = await admin
      .from('ws_projects')
      .select('client_id')
      .eq('id', project_id)
      .single();
    if (!project) return NextResponse.json({ error: 'project not found' }, { status: 404 });
    client_id = project.client_id;
  }

  if (!client_id) return NextResponse.json({ error: 'client_id or project_id required' }, { status: 400 });

  const id = body.id || `INV-${Date.now().toString(36).toUpperCase()}`;

  const { data, error } = await admin
    .from('ws_invoices')
    .insert({
      id,
      description: description ?? null,
      amount: Number(amount),
      due_date: due_date ?? null,
      status: 'unpaid',
      client_id,
      project_id: project_id ?? null,
      kind: kind ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify the client in-app
  await admin.from('ws_notifications').insert({
    client_id,
    type: 'billing',
    message: `New invoice ${id}${description ? ` — ${description}` : ''}: ₦${(Number(amount) / 100).toLocaleString()}. Pay it from your project to proceed.`,
  });

  return NextResponse.json(data, { status: 201 });
}
