import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

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
    case 'charge.success': {
      const ref = event.data.reference as string;
      // Flip matching invoice to paid by matching the paystack reference in metadata
      const clientEmail = event.data.customer?.email;
      if (clientEmail) {
        // Find the profile by email via auth
        const { data: users } = await supabase.auth.admin.listUsers();
        const user = users?.users?.find(u => u.email === clientEmail);
        if (user) {
          await supabase
            .from('ws_invoices')
            .update({ status: 'paid' })
            .eq('client_id', user.id)
            .eq('status', 'unpaid')
            .order('created_at', { ascending: true })
            .limit(1);
        }
      }
      console.log('charge.success processed:', ref);
      break;
    }

    case 'subscription.create': {
      const email = event.data.customer?.email;
      const code = event.data.subscription_code;
      if (email) {
        const { data: users } = await supabase.auth.admin.listUsers();
        const user = users?.users?.find(u => u.email === email);
        if (user) {
          await supabase
            .from('ws_notifications')
            .insert({
              client_id: user.id,
              type: 'billing',
              message: `Subscription activated (${code}). Your monthly retainer is now set up.`,
            });
        }
      }
      console.log('subscription.create processed:', code);
      break;
    }

    case 'subscription.not_renew': {
      const email = event.data.customer?.email;
      if (email) {
        const { data: users } = await supabase.auth.admin.listUsers();
        const user = users?.users?.find(u => u.email === email);
        if (user) {
          await supabase
            .from('ws_notifications')
            .insert({
              client_id: user.id,
              type: 'billing',
              message: 'Your subscription has been cancelled and will not renew.',
            });
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const email = event.data.customer?.email;
      const ref = event.data.reference;
      if (email) {
        const { data: users } = await supabase.auth.admin.listUsers();
        const user = users?.users?.find(u => u.email === email);
        if (user) {
          await supabase
            .from('ws_notifications')
            .insert({
              client_id: user.id,
              type: 'billing',
              message: `Payment failed (ref: ${ref}). Please update your payment method.`,
            });
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
