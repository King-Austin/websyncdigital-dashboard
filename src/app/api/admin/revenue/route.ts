import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const MONTHLY_FEE_NAIRA = 9999;

// Aggregates real revenue figures straight from the database — no mock data.
// MRR  = active projects × monthly fee
// YTD  = sum of successful ws_payments this calendar year (kobo → naira)
// Chart = successful payments grouped by month for the current year
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const admin = createAdminClient();

  // Gate to admins only
  const { data: me } = await admin.from('ws_profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const [{ data: projects }, { data: payments }] = await Promise.all([
    admin
      .from('ws_projects')
      .select('id, name, status, client_id, ws_profiles ( name, company, email )'),
    admin
      .from('ws_payments')
      .select('reference, email, amount, status, plan, paid_at')
      .eq('status', 'success')
      .order('paid_at', { ascending: false }),
  ]);

  const allProjects = projects ?? [];
  const allPayments = payments ?? [];

  const activeProjects = allProjects.filter(p => p.status === 'active');
  const mrr = activeProjects.length * MONTHLY_FEE_NAIRA;
  const arr = mrr * 12;

  // YTD collected (this calendar year), payments are stored in kobo
  const year = new Date().getFullYear();
  const ytdKobo = allPayments
    .filter(p => p.paid_at && new Date(p.paid_at).getFullYear() === year)
    .reduce((s, p) => s + (p.amount ?? 0), 0);
  const ytd = Math.round(ytdKobo / 100);

  // Monthly chart for the current year (Jan..current month), values in naira
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthly = MONTHS.slice(0, new Date().getMonth() + 1).map((m, idx) => {
    const kobo = allPayments
      .filter(p => p.paid_at && new Date(p.paid_at).getFullYear() === year && new Date(p.paid_at).getMonth() === idx)
      .reduce((s, p) => s + (p.amount ?? 0), 0);
    return { m, r: Math.round(kobo / 100) };
  });

  // Revenue grouped by client (one row per paying client)
  type Prof = { name: string | null; company: string | null; email: string | null };
  const byClient = new Map<string, { name: string; company: string; email: string; active: number; status: string }>();
  for (const p of allProjects) {
    const rel = p.ws_profiles as Prof | Prof[] | null;
    const prof = Array.isArray(rel) ? (rel[0] ?? null) : rel;
    const key = p.client_id ?? 'unknown';
    const existing = byClient.get(key);
    const isActive = p.status === 'active';
    if (existing) {
      existing.active += isActive ? 1 : 0;
      if (isActive) existing.status = 'active';
    } else {
      byClient.set(key, {
        name: prof?.name || 'Unknown client',
        company: prof?.company || '',
        email: prof?.email || '',
        active: isActive ? 1 : 0,
        status: isActive ? 'active' : 'pending',
      });
    }
  }
  const clients = Array.from(byClient.values()).map(c => ({
    name: c.name,
    company: c.company,
    email: c.email,
    mrr: c.active * MONTHLY_FEE_NAIRA,
    status: c.status,
  }));

  const successfulCharges = allPayments.length;
  const totalCollectedKobo = allPayments.reduce((s, p) => s + (p.amount ?? 0), 0);
  const avgValue = successfulCharges > 0 ? Math.round(totalCollectedKobo / 100 / successfulCharges) : 0;

  return NextResponse.json({
    mrr,
    arr,
    ytd,
    activeClients: clients.filter(c => c.mrr > 0).length,
    activeProjects: activeProjects.length,
    successfulCharges,
    avgValue,                 // naira
    monthly,                  // [{ m, r }] naira
    clients,                  // revenue by client
    generatedAt: new Date().toISOString(),
  });
}
