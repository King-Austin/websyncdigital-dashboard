import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('ws_profiles')
    .select('email')
    .eq('id', user.id)
    .single();

  const email = profile?.email ?? user.email;
  if (!email) return NextResponse.json({ status: 'unknown' });

  const { data: payment } = await admin
    .from('ws_payments')
    .select('reference, amount, plan, paid_at, status')
    .eq('email', email)
    .eq('status', 'success')
    .order('paid_at', { ascending: false })
    .limit(1)
    .single();

  if (!payment) return NextResponse.json({ status: 'inactive' });

  // Consider active if last payment within 35 days
  const daysSince = (Date.now() - new Date(payment.paid_at).getTime()) / 86_400_000;
  return NextResponse.json({
    status: daysSince <= 35 ? 'active' : 'overdue',
    lastPayment: payment,
  });
}
