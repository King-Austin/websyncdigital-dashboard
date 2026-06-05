import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { CLIENTS_DATA } from '@/lib/data';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, body, recipientName } = await request.json();

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'support@websyncdigital.com.ng';
    const fromName  = process.env.RESEND_FROM_NAME  || 'Websync Digital';
    const from      = `${fromName} <${fromEmail}>`;

    const recipients: { email: string; name: string }[] = [];

    if (to === 'all') {
      CLIENTS_DATA.forEach(c => recipients.push({ email: c.email, name: c.name }));
    } else if (to.includes('@')) {
      recipients.push({ email: to, name: recipientName || 'Recipient' });
    } else {
      const client = CLIENTS_DATA.find(c => String(c.id) === String(to));
      if (client) recipients.push({ email: client.email, name: client.name });
    }

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

    const sent = results.filter(r => r.status === 'fulfilled').length;
    return NextResponse.json({ success: true, sent });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
