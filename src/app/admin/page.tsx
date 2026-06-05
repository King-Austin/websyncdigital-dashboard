'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { T, fmt } from '@/lib/theme';
import { Grid4, Grid2, Card, StatCard, SectionTitle } from '@/components/ui';
import { StatusBadge, Avatar } from '@/components/ui';
import { IcUsers, IcGlobe, IcDollar, IcTrend } from '@/components/ui/Icons';
import { BarChart } from '@/components/charts';

interface ClientRow { id: string; name: string; company: string; created_at: string; }
interface WebsiteRow { id: number; status: string; monthly_fee: number; }
interface TicketRow { id: string; subject: string; priority: string; status: string; created_at: string; ws_profiles: { name: string } | null; }

export default function AdminOverview() {
  const [clients, setClients]   = useState<ClientRow[]>([]);
  const [websites, setWebsites] = useState<WebsiteRow[]>([]);
  const [tickets, setTickets]   = useState<TicketRow[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then(r => r.json()),
      fetch('/api/websites').then(r => r.json()),
      fetch('/api/tickets').then(r => r.json()),
    ]).then(([c, w, t]) => { setClients(c); setWebsites(w); setTickets(t); setLoading(false); });
  }, []);

  const activeSites  = websites.filter(s => s.status === 'live').length;
  const openTickets  = tickets.filter(t => t.status === 'open');
  const MRR = websites.filter(s => s.status === 'live').reduce((sum, s) => sum + (s.monthly_fee || 0), 0);
  const ARR = MRR * 12;

  const revData = [
    { m: 'Jan', r: 285000 }, { m: 'Feb', r: 320000 }, { m: 'Mar', r: 415000 },
    { m: 'Apr', r: 375000 }, { m: 'May', r: 442000 }, { m: 'Jun', r: MRR || 390000 },
  ];

  if (loading) return <div style={{ color: T.textS, fontSize: 13, padding: 24 }}>Loading dashboard…</div>;

  return (
    <div className="fade-in">
      <Grid4>
        <StatCard label="Total Clients"   value={clients.length}  sub={`${clients.length} registered`}   icon={<IcUsers/>}  col={T.accent}  trend={12}/>
        <StatCard label="Active Websites" value={activeSites}     sub={`${websites.length} total`}        icon={<IcGlobe/>}  col={T.info}    trend={8}/>
        <StatCard label="MRR"             value={fmt(MRR)}        sub="Monthly Recurring Revenue"         icon={<IcDollar/>} col={T.success} trend={15}/>
        <StatCard label="ARR (Projected)" value={fmt(ARR)}        sub="Annual Recurring Revenue"          icon={<IcTrend/>}  col={T.purple}/>
      </Grid4>

      <Grid2>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>Revenue Overview</div>
              <div style={{ fontSize: 12, color: T.textS }}>Monthly revenue — 2026</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: T.success }}>{fmt(442000)}</div>
              <div style={{ fontSize: 11, color: T.textS }}>Peak: May 2026</div>
            </div>
          </div>
          <BarChart data={revData} h={120}/>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ flex: 1 }}>
            <SectionTitle action={
              <Link href="/admin/tickets" style={{ fontSize: 12, color: T.accent, cursor: 'pointer', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
            }>Open Tickets ({openTickets.length})</SectionTitle>
            {openTickets.length === 0
              ? <div style={{ fontSize: 13, color: T.textS, padding: '12px 0', textAlign: 'center' }}>No open tickets</div>
              : openTickets.slice(0, 3).map((t, i) => (
                <Link key={t.id} href="/admin/tickets" style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: i < Math.min(openTickets.length, 3) - 1 ? `1px solid ${T.border}` : 'none', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{t.subject}</div>
                      <div style={{ fontSize: 11, color: T.textS }}>{t.ws_profiles?.name} · {new Date(t.created_at).toLocaleDateString('en-NG')}</div>
                    </div>
                    <StatusBadge s={t.priority}/>
                  </div>
                </Link>
              ))
            }
          </Card>

          <Card>
            <SectionTitle action={
              <Link href="/admin/clients" style={{ fontSize: 12, color: T.accent, cursor: 'pointer', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
            }>Recent Clients</SectionTitle>
            {clients.slice(0, 3).map((c, i) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? `1px solid ${T.border}` : 'none' }}>
                <Avatar name={c.name || '?'} sz={32}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: T.textS }}>{c.company} · {new Date(c.created_at).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
            ))}
            {clients.length === 0 && <div style={{ fontSize: 13, color: T.textS, padding: '8px 0' }}>No clients yet.</div>}
          </Card>
        </div>
      </Grid2>
    </div>
  );
}
