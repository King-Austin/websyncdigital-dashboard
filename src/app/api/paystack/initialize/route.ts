import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const PS_BASE = 'https://api.paystack.co';

// POST /api/paystack/initialize  { project_id }
// Returns an authorization_url to redirect the client to.
export async function POST(request: Request) {
  const secret   = process.env.PAYSTACK_SECRET_KEY;
  const planCode = process.env.NEXT_PUBLIC_PAYSTACK_PLAN_CODE;
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!secret)   return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 });
  if (!planCode) return NextResponse.json({ error: 'Plan code not configured' }, { status: 500 });

  // Paystack's /transaction/initialize requires `amount` (in kobo) even when a
  // plan is supplied. Fetch the plan's amount so the two always match.
  const planRes  = await fetch(`${PS_BASE}/plan/${planCode}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const planJson = await planRes.json();
  const planAmount = planJson?.data?.amount;
  if (!planAmount) {
    return NextResponse.json({ error: 'Could not read plan amount from Paystack' }, { status: 502 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { project_id } = await request.json();
  if (!project_id) return NextResponse.json({ error: 'project_id required' }, { status: 400 });

  const admin = createAdminClient();

  // Confirm the project belongs to this user and grab their email
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

  // Initialize a transaction tied to the plan, tagged with project_id in metadata
  const res = await fetch(`${PS_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: planAmount,
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

  // Mark the project as 'processing' the moment checkout starts, so the client
  // sees it's in progress and isn't tempted to pay again. The webhook flips it
  // to 'active' on confirmed payment (or it stays processing if they abandon).
  await admin
    .from('ws_projects')
    .update({ status: 'processing', updated_at: new Date().toISOString() })
    .eq('id', project.id)
    .eq('status', 'submitted'); // only from submitted, never downgrade an active one

  return NextResponse.json({ authorization_url: json.data.authorization_url });
}
