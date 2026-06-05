import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('ws_tickets')
    .select(`
      *,
      ws_profiles(name, company),
      ws_ticket_messages(id, from_role, message, created_at)
    `)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('ws_tickets')
    .insert({
      id: body.id,
      subject: body.subject,
      site: body.site,
      status: 'open',
      priority: body.priority || 'medium',
      client_id: body.client_id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
