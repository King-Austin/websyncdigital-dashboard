import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const PS_BASE = 'https://api.paystack.co';

// POST /api/paystack/cancel-subscription  { project_id }
// Disables the Paystack subscription and marks the project cancelled.
export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { project_id } = await request.json();
  if (!project_id) return NextResponse.json({ error: 'project_id required' }, { status: 400 });

  const admin = createAdminClient();

  const { data: project } = await admin
    .from('ws_projects')
    .select('id, name, client_id, status, paystack_subscription_code')
    .eq('id', project_id)
    .single();

  if (!project || project.client_id !== user.id) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  if (project.status !== 'active') {
    return NextResponse.json({ error: 'Project is not currently active' }, { status: 400 });
  }
  if (!project.paystack_subscription_code) {
    // No Paystack subscription stored — just mark cancelled in DB (edge case: manual activation)
    await admin.from('ws_projects').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', project_id);
    return NextResponse.json({ ok: true });
  }

  // Fetch subscription from Paystack to get the email_token required for disable
  const subRes = await fetch(`${PS_BASE}/subscription/${project.paystack_subscription_code}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const subJson = await subRes.json();

  if (!subJson.status || !subJson.data) {
    return NextResponse.json({ error: 'Could not fetch subscription from Paystack. Please try again or contact support.' }, { status: 502 });
  }

  const emailToken = subJson.data.email_token;

  // Disable the subscription on Paystack
  const disableRes = await fetch(`${PS_BASE}/subscription/disable`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: project.paystack_subscription_code, token: emailToken }),
  });
  const disableJson = await disableRes.json();

  if (!disableJson.status) {
    return NextResponse.json({ error: disableJson.message || 'Paystack could not cancel the subscription. Please try again.' }, { status: 502 });
  }

  // Mark cancelled in DB and notify the client
  await Promise.all([
    admin.from('ws_projects').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', project_id),
    admin.from('ws_notifications').insert({
      client_id: user.id,
      type: 'billing',
      message: `Your subscription for "${project.name}" has been cancelled. No further charges will be made.`,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
