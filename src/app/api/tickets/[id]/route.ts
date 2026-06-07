import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { DASHBOARD_URL } from '@/lib/emailTemplates';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createAdminClient();

  const updates: Record<string, string> = {};
  if (body.status) updates.status = body.status;
  if (body.priority) updates.priority = body.priority;

  const { data: ticket, error } = await supabase
    .from('ws_tickets')
    .update(updates)
    .eq('id', id)
    .select('id, subject, client_id, ws_profiles(name, email)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Append the reply message if provided
  if (body.reply) {
    await supabase.from('ws_ticket_messages').insert({
      ticket_id: id,
      from_role: body.from_role || 'admin',
      message: body.reply,
    });

    // Notify the client by email (Resend) when an admin replies — real client email, no mock.
    if ((body.from_role || 'admin') === 'admin') {
      const rel = ticket?.ws_profiles as { name?: string; email?: string } | { name?: string; email?: string }[] | null;
      const prof = Array.isArray(rel) ? rel[0] : rel;
      await notifyClient(prof?.email, prof?.name, ticket?.subject ?? 'your ticket', body.reply).catch(() => {});
    }
  }

  return NextResponse.json(ticket);
}

async function notifyClient(email: string | undefined, name: string | undefined, subject: string, reply: string) {
  if (!email || !process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'support@websyncdigital.com.ng';
  const fromName  = process.env.RESEND_FROM_NAME  || 'Websync Digital';

  const sendResult = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: email,
    subject: `Re: ${subject} — Websync Support`,
    text:
      `Dear ${name || 'there'},\n\nYour support ticket "${subject}" has a new reply from our team:\n\n` +
      `"${reply}"\n\nLog in to your dashboard at ${DASHBOARD_URL} to continue the conversation.\n\nWebsync Digital Team`,
  });

  // Log the transactional send so it shows in Send History too
  const admin = createAdminClient();
  await admin.from('ws_email_log').insert({
    subject: `Re: ${subject}`,
    body: reply,
    recipient: name || email,
    recipients: 1,
    sent: sendResult.error ? 0 : 1,
    failed: sendResult.error ? 1 : 0,
    status: sendResult.error ? 'failed' : 'sent',
    kind: 'ticket',
  }).then(() => {}, () => {});
}
