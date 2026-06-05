import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createAdminClient();

  const updates: Record<string, string> = {};
  if (body.status) updates.status = body.status;
  if (body.priority) updates.priority = body.priority;

  const { data, error } = await supabase
    .from('ws_tickets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Append reply message if provided
  if (body.reply) {
    await supabase.from('ws_ticket_messages').insert({
      ticket_id: id,
      from_role: body.from_role || 'admin',
      message: body.reply,
    });
  }

  return NextResponse.json(data);
}
