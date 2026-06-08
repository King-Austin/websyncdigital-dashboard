import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/admin/reminders/domain-expiry
// Scans ws_websites for domain_expiry dates and enqueues ws_notifications for matching thresholds.
export async function POST(request: Request) {
  const admin = createAdminClient();

  // thresholds (days before expiry) to notify for
  const thresholds = [30, 14, 7, 3, 1];

  const { data: sites, error } = await admin
    .from('ws_websites')
    .select('id, client_id, url, name, domain_expiry')
    .not('domain_expiry', 'is', null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const today = new Date();
  today.setHours(0,0,0,0);
  const msDay = 24 * 60 * 60 * 1000;

  const toInsert: any[] = [];

  for (const s of sites || []) {
    if (!s.domain_expiry) continue;
    const exp = new Date(s.domain_expiry);
    if (isNaN(+exp)) continue;
    exp.setHours(0,0,0,0);
    const diff = Math.ceil((+exp - +today) / msDay);
    if (diff < 0) continue; // already expired
    if (thresholds.includes(diff)) {
      const pretty = exp.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
      const message = `Domain ${s.url || s.name || ''} expires in ${diff} day${diff === 1 ? '' : 's'} on ${pretty}.`;
      toInsert.push({ client_id: s.client_id, type: 'domain', message });
    }
  }

  if (toInsert.length > 0) {
    const { error: insErr } = await admin.from('ws_notifications').insert(toInsert);
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, queued: toInsert.length });
}
