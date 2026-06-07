import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const PS_BASE = 'https://api.paystack.co';

// POST /api/paystack/initialize  { project_id }
// Initializes a Paystack subscription checkout and returns authorization_url.
// We call /transaction/initialize with plan + metadata so:
//   1. Paystack treats the charge as a subscription enrollment (recurring).
//   2. The webhook receives metadata.project_id to know which project to activate.
export async function POST(request: Request) {
  const secret   = process.env.PAYSTACK_SECRET_KEY;
  const planCode = process.env.NEXT_PUBLIC_PAYSTACK_PLAN_CODE;
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!secret)   return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 });
  if (!planCode) return NextResponse.json({ error: 'Plan code not configured' }, { status: 500 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { project_id } = await request.json();
  if (!project_id) return NextResponse.json({ error: 'project_id required' }, { status: 400 });

  const admin = createAdminClient();

  const { data: project } = await admin
    .from('ws_projects')
    .select('id, name, client_id')
    .eq('id', project_id)
    .single();

  if (!project || project.client_id !== user.id) {
    return NextResponse.json({ error: 'project not found' }, { status: 404 });
  }

  const { data: profile } = await admin
    .from('ws_profiles')
    .select('email')
    .eq('id', user.id)
    .single();

  const email = profile?.email ?? user.email;
  if (!email) return NextResponse.json({ error: 'no email on account' }, { status: 400 });

  // /transaction/initialize with a plan code = subscription enrollment.
  // Paystack charges the first month, stores the card, and auto-debits monthly.
  // metadata.project_id is how the webhook knows which project to activate.
  const res = await fetch(`${PS_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: 999900, // 9,999 NGN in kobo — must match plan amount exactly
      plan: planCode,
      callback_url: `${appUrl}/client/projects?paid=${project_id}`,
      metadata: {
        project_id: project.id,
        project_name: project.name,
        client_id: user.id,
      },
    }),
  });

  const json = await res.json();
  if (!json.status) {
    return NextResponse.json({ error: json.message || 'Paystack error' }, { status: 502 });
  }

  // Mark processing so the client sees in-progress and won't click Pay again.
  // The webhook flips it to 'active' on confirmed payment.
  await admin
    .from('ws_projects')
    .update({ status: 'processing', updated_at: new Date().toISOString() })
    .eq('id', project.id)
    .in('status', ['submitted', 'processing', 'cancelled']);

  return NextResponse.json({ authorization_url: json.data.authorization_url });
}
