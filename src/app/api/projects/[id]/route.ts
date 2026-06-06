import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID = ['submitted', 'active', 'cancelled'] as const;

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
