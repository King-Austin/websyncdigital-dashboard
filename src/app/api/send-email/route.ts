import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/send-email
// Admin-only. Sends to all clients, a single client (by id) or a raw email.
// Recipients come from ws_profiles (no mock data). Every send is logged to ws_email_log.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const admin = createAdminClient();
  const { data: me } = await admin.from('ws_profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { to, subject, body, recipientName } = await request.json();
  if (!subject || !body) {
    return NextResponse.json({ error: 'Subject and message are required.' }, { status: 400 });
  }

  // Resolve recipients straight from the database
  const recipients: { email: string; name: string }[] = [];
  let recipientLabel = recipientName || 'Recipient';

  if (to === 'all') {
    const { data: clients } = await admin
      .from('ws_profiles')
      .select('name, email')
      .eq('role', 'client')
      .not('email', 'is', null);
    (clients ?? []).forEach(c => { if (c.email) recipients.push({ email: c.email, name: c.name || 'there' }); });
    recipientLabel = 'All Clients';
  } else if (typeof to === 'string' && to.includes('@')) {
    recipients.push({ email: to, name: recipientName || 'there' });
    recipientLabel = recipientName || to;
  } else {
    const { data: client } = await admin
      .from('ws_profiles')
      .select('name, email')
      .eq('id', to)
      .single();
    if (client?.email) {
      recipients.push({ email: client.email, name: client.name || 'there' });
      recipientLabel = client.name || client.email;
    }
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No valid recipients with an email address were found.' }, { status: 400 });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'support@websyncdigital.com.ng';
  const fromName  = process.env.RESEND_FROM_NAME  || 'Websync Digital';
  const from      = `${fromName} <${fromEmail}>`;

  let sent = 0;
  let failed = recipients.length;

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const results = await Promise.allSettled(
      recipients.map(r =>
        resend.emails.send({
          from,
          to: r.email,
          subject,
          text: body.replace(/\{name\}/g, r.name),
        })
      )
    );
    sent = results.filter(r => r.status === 'fulfilled').length;
    failed = recipients.length - sent;
  } else {
    // No key configured — record the attempt as failed rather than pretending success.
    sent = 0;
    failed = recipients.length;
  }

  const status = sent === 0 ? 'failed' : failed > 0 ? 'partial' : 'sent';

  // Log the send (best-effort; never blocks the response)
  await admin.from('ws_email_log').insert({
    subject,
    body,
    recipient: recipientLabel,
    recipients: recipients.length,
    sent,
    failed,
    status,
    kind: 'campaign',
  });

  if (sent === 0) {
    return NextResponse.json(
      { error: process.env.RESEND_API_KEY ? 'All emails failed to send.' : 'Email service not configured (RESEND_API_KEY missing).' },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true, sent, failed, recipients: recipients.length });
}
