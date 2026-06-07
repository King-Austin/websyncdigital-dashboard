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
  if (!body.subject || !body.client_id) {
    return NextResponse.json({ error: 'Subject and client are required.' }, { status: 400 });
  }
  const supabase = createAdminClient();

  // Generate the next TK-### id server-side (no client-supplied ids)
  const { data: last } = await supabase
    .from('ws_tickets')
    .select('id')
    .like('id', 'TK-%')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  const lastNum = last?.id ? parseInt(String(last.id).replace('TK-', ''), 10) || 0 : 0;
  const id = `TK-${String(lastNum + 1).padStart(3, '0')}`;

  const { data, error } = await supabase
    .from('ws_tickets')
    .insert({
      id,
      subject: body.subject,
      site: body.site || null,
      status: 'open',
      priority: body.priority || 'medium',
      client_id: body.client_id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Optional first message from the client
  if (body.message) {
    await supabase.from('ws_ticket_messages').insert({
      ticket_id: id,
      from_role: 'client',
      message: body.message,
    });
  }

  return NextResponse.json(data, { status: 201 });
}
