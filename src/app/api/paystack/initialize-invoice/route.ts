import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const PS_BASE = 'https://api.paystack.co';

// POST /api/paystack/initialize-invoice  { invoice_id }
// One-time charge for an admin-raised add-on invoice (NOT a subscription).
export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  if (!secret) return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { invoice_id } = await request.json();
  if (!invoice_id) return NextResponse.json({ error: 'invoice_id required' }, { status: 400 });

  const admin = createAdminClient();

  const { data: invoice } = await admin
    .from('ws_invoices')
    .select('id, amount, status, client_id, project_id, description')
    .eq('id', invoice_id)
    .single();

  if (!invoice || invoice.client_id !== user.id) {
    return NextResponse.json({ error: 'invoice not found' }, { status: 404 });
  }
  if (invoice.status === 'paid') {
    return NextResponse.json({ error: 'This invoice is already paid.' }, { status: 409 });
  }

  const { data: profile } = await admin
    .from('ws_profiles')
    .select('email')
    .eq('id', user.id)
    .single();

  const email = profile?.email ?? user.email;
  if (!email) return NextResponse.json({ error: 'no email on account' }, { status: 400 });

  // One-time charge: amount only, no `plan` → not recurring.
  const res = await fetch(`${PS_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      amount: invoice.amount,
      callback_url: `${appUrl}/client/projects${invoice.project_id ? `?invoice_paid=${invoice.id}` : ''}`,
      metadata: {
        invoice_id: invoice.id,
        kind: 'addon',
        client_id: user.id,
        project_id: invoice.project_id,
      },
    }),
  });

  const json = await res.json();
  if (!json.status) {
    return NextResponse.json({ error: json.message || 'Paystack error' }, { status: 502 });
  }

  return NextResponse.json({ authorization_url: json.data.authorization_url });
}
