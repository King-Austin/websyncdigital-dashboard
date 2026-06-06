import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

async function findProfileByEmail(supabase: ReturnType<typeof createAdminClient>, email: string) {
  const { data } = await supabase
    .from('ws_profiles')
    .select('id')
    .eq('email', email)
    .single();
  return data;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-paystack-signature');
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret || !signature) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 401 });
  }

  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  const supabase = createAdminClient();

  switch (event.event) {
    case 'charge.success':
    case 'invoice.payment': {
      const ref     = event.data.reference ?? event.data.transaction?.reference;
      const email   = event.data.customer?.email ?? event.data.subscription?.customer?.email;
      const amt     = event.data.amount ?? 0;
      const plan    = event.data.plan?.name ?? event.data.subscription?.plan?.name ?? 'Monthly';
      const paidAt  = event.data.paid_at ?? new Date().toISOString();
      const projectId = event.data.metadata?.project_id ?? null;
      const subCode   = event.data.subscription_code ?? event.data.subscription?.subscription_code ?? null;
      const custCode  = event.data.customer?.customer_code ?? null;

      if (email && ref) {
        // Record the payment (tagged with the project it paid for)
        await supabase.from('ws_payments').upsert({
          reference: ref,
          email,
          amount: amt,
          status: 'success',
          plan,
          project_id: projectId,
          paid_at: paidAt,
          event_type: event.event,
        }, { onConflict: 'reference' });

        const profile = await findProfileByEmail(supabase, email);

        // Activate the specific project this payment was for
        if (projectId) {
          await supabase
            .from('ws_projects')
            .update({
              status: 'active',
              paystack_subscription_code: subCode,
              paystack_customer_code: custCode,
              updated_at: new Date().toISOString(),
            })
            .eq('id', projectId);
        } else if (subCode) {
          // Renewal (invoice.payment) carries no metadata — match by subscription code
          await supabase
            .from('ws_projects')
            .update({ status: 'active', updated_at: new Date().toISOString() })
            .eq('paystack_subscription_code', subCode);
        }

        if (profile) {
          await supabase.from('ws_notifications').insert({
            client_id: profile.id,
            type: 'billing',
            message: `Payment of ₦${(amt / 100).toLocaleString()} received (ref: ${ref}). Your project is now active.`,
          });
        }
      }
      break;
    }

    case 'subscription.create': {
      const email = event.data.customer?.email;
      const code  = event.data.subscription_code;
      if (email) {
        const profile = await findProfileByEmail(supabase, email);
        if (profile) {
          await supabase.from('ws_notifications').insert({
            client_id: profile.id,
            type: 'billing',
            message: `Subscription activated (${code}). Your monthly retainer is now set up.`,
          });
        }
      }
      break;
    }

    case 'subscription.not_renew':
    case 'subscription.disable': {
      const email   = event.data.customer?.email;
      const subCode = event.data.subscription_code ?? null;

      // Cancel the matching project(s)
      if (subCode) {
        await supabase
          .from('ws_projects')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('paystack_subscription_code', subCode);
      }

      if (email) {
        const profile = await findProfileByEmail(supabase, email);
        if (profile) {
          await supabase.from('ws_notifications').insert({
            client_id: profile.id,
            type: 'billing',
            message: 'Your subscription has been cancelled and will not renew.',
          });
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const email = event.data.customer?.email;
      const ref   = event.data.reference;
      if (email) {
        const profile = await findProfileByEmail(supabase, email);
        if (profile) {
          await supabase.from('ws_notifications').insert({
            client_id: profile.id,
            type: 'billing',
            message: `Payment failed (ref: ${ref}). Please update your payment method to avoid service interruption.`,
          });
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
