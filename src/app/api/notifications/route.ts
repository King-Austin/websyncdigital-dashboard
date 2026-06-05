import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');
  const supabase = createAdminClient();

  let query = supabase
    .from('ws_notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (clientId) query = query.eq('client_id', clientId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('ws_notifications')
    .update({ read: true })
    .eq('client_id', clientId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
