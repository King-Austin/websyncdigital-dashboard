import { NextResponse } from 'next/server';

const PS_BASE = 'https://api.paystack.co';

async function ps(path: string) {
  const res = await fetch(`${PS_BASE}${path}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    next: { revalidate: 300 }, // cache 5 min
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
}

export async function GET() {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: 'not configured' }, { status: 500 });

  // Fetch in parallel: subscriptions list + transaction totals for current month
  const now   = new Date();
  const from  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const to    = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const planCode = process.env.NEXT_PUBLIC_PAYSTACK_PLAN_CODE;
  const subQuery = planCode ? `/subscription?plan=${planCode}&perPage=200` : '/subscription?perPage=200';

  const [subscriptions, txns] = await Promise.all([
    ps(subQuery),
    ps(`/transaction?status=success&from=${from}&to=${to}&perPage=200`),
  ]);

  const activeSubs  = Array.isArray(subscriptions) ? subscriptions.filter((s: { status: string }) => s.status === 'active').length : 0;
  const allTxns     = Array.isArray(txns) ? txns : [];
  const totalCharged = allTxns.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
  const avgValue     = allTxns.length > 0 ? Math.round(totalCharged / allTxns.length) : 0;

  // Failed txns this month
  const failedTxns = await ps(`/transaction?status=failed&from=${from}&to=${to}&perPage=200`);
  const failedCount = Array.isArray(failedTxns) ? failedTxns.length : 0;

  return NextResponse.json({
    activeSubs,
    successfulCharges: allTxns.length,
    failedPayments:    failedCount,
    avgValue,          // in kobo
    totalCharged,      // in kobo
    month: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,
  });
}
