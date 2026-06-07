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
  let subscriptionCode = project.paystack_subscription_code;

  // If we don't have a subscription code stored (e.g. project was manually activated),
  // try to find the active subscription on Paystack by customer code or email.
  if (!subscriptionCode) {
    const planCode = process.env.NEXT_PUBLIC_PAYSTACK_PLAN_CODE;

    // Try customer_code first
    if (project.paystack_customer_code) {
      const listRes = await fetch(
        `${PS_BASE}/subscription?customer=${project.paystack_customer_code}&plan=${planCode}&status=active`,
        { headers: { Authorization: `Bearer ${secret}` } }
      );
      const listJson = await listRes.json();
      subscriptionCode = listJson?.data?.[0]?.subscription_code ?? null;
    }

    // Fall back to looking up by email
    if (!subscriptionCode) {
      const { data: profile } = await admin.from('ws_profiles').select('email').eq('id', project.client_id).single();
      const email = profile?.email;
      if (email) {
        const listRes = await fetch(
          `${PS_BASE}/subscription?plan=${planCode}&status=active`,
          { headers: { Authorization: `Bearer ${secret}` } }
        );
        const listJson = await listRes.json();
        const match = listJson?.data?.find((s: any) => s.customer?.email === email);
        subscriptionCode = match?.subscription_code ?? null;
        if (subscriptionCode) {
          // Save it so future cancels don't need to search
          await admin.from('ws_projects').update({ paystack_subscription_code: subscriptionCode }).eq('id', project_id);
        }
      }
    }

    // Truly no subscription on Paystack — safe to just mark cancelled
    if (!subscriptionCode) {
      await admin.from('ws_projects').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', project_id);
      return NextResponse.json({ ok: true });
    }
  }

  // Fetch subscription from Paystack to get the email_token required for disable
  const subRes = await fetch(`${PS_BASE}/subscription/${subscriptionCode}`, {
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
    body: JSON.stringify({ code: subscriptionCode, token: emailToken }),
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
