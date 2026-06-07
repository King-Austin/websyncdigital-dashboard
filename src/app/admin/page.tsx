'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { T, fmt } from '@/lib/theme';
import { Grid4, Grid2, Card, StatCard, SectionTitle } from '@/components/ui';
import { StatusBadge, Avatar } from '@/components/ui';
import { IcUsers, IcGlobe, IcDollar, IcTrend, IcBriefcase, IcMsg } from '@/components/ui/Icons';
import { BarChart } from '@/components/charts';

interface ClientRow { id: string; name: string; company: string; created_at: string; }
interface WebsiteRow { id: number; status: string; monthly_fee: number; }
interface TicketRow { id: string; subject: string; priority: string; status: string; created_at: string; ws_profiles: { name: string } | null; }
interface ProjectRow { id: string; status: string; }
interface RevClient { name: string; company: string; mrr: number; status: string; }
interface RevenuePayload {
  mrr: number; arr: number; ytd: number;
  activeProjects: number; successfulCharges: number; avgValue: number;
  monthly: { m: string; r: number }[]; clients: RevClient[];
}

type Tab = 'summary' | 'revenue' | 'clients' | 'support';
const TABS: { k: Tab; label: string }[] = [
  { k: 'summary', label: 'Summary' },
  { k: 'revenue', label: 'Revenue' },
  { k: 'clients', label: 'Clients' },
  { k: 'support', label: 'Support' },
];

export default function AdminOverview() {
  const [clients, setClients]   = useState<ClientRow[]>([]);
  const [websites, setWebsites] = useState<WebsiteRow[]>([]);
  const [tickets, setTickets]   = useState<TicketRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [revenue, setRevenue]   = useState<RevenuePayload | null>(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<Tab>('summary');

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then(r => r.json()),
      fetch('/api/websites').then(r => r.json()),
      fetch('/api/tickets').then(r => r.json()),
      fetch('/api/projects').then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/admin/revenue').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([c, w, t, p, rev]) => {
      setClients(Array.isArray(c) ? c : []);
      setWebsites(Array.isArray(w) ? w : []);
      setTickets(Array.isArray(t) ? t : []);
      setProjects(Array.isArray(p) ? p : []);
      setRevenue(rev);
      setLoading(false);
    });
  }, []);

  const activeSites  = websites.filter(s => s.status === 'live').length;
  const openTickets  = tickets.filter(t => t.status === 'open');
  const MRR = revenue?.mrr ?? 0;
  const ARR = revenue?.arr ?? 0;
  const revData = revenue?.monthly ?? [];
  const peak = revData.reduce((mx, d) => (d.r > mx.r ? d : mx), { m: '', r: 0 });

  const proj = {
    active:    projects.filter(p => p.status === 'active').length,
    submitted: projects.filter(p => p.status === 'submitted').length,
    processing:projects.filter(p => p.status === 'processing').length,
    cancelled: projects.filter(p => p.status === 'cancelled').length,
  };

  if (loading) return <div style={{ color: T.textS, fontSize: 13, padding: 24 }}>Loading dashboard…</div>;

  return (
    <div className="fade-in">
      {/* Tab bar */}
      <div className="admin-tabs" style={{ display: 'flex', gap: 4, marginBottom: 22, overflowX: 'auto', borderBottom: `1px solid ${T.border}`, paddingBottom: 0 }}>
        <style>{`.admin-tabs::-webkit-scrollbar { display: none; }`}</style>
        {TABS.map(t => {
          const on = tab === t.k;
          return (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap',
              color: on ? T.accent : T.textS, borderBottom: `2px solid ${on ? T.accent : 'transparent'}`,
              marginBottom: -1, transition: 'all 0.15s',
            }}>{t.label}</button>
          );
        })}
      </div>

      {/* ── SUMMARY ── */}
      {tab === 'summary' && (
        <>
          <Grid4>
            <StatCard label="Total Clients"   value={clients.length}  sub={`${clients.length} registered`} icon={<IcUsers/>}  col={T.accent}/>
            <StatCard label="Active Websites" value={activeSites}     sub={`${websites.length} total`}      icon={<IcGlobe/>}  col={T.info}/>
            <StatCard label="MRR"             value={fmt(MRR)}        sub="Monthly Recurring Revenue"       icon={<IcDollar/>} col={T.success}/>
            <StatCard label="ARR (Projected)" value={fmt(ARR)}        sub="Annual Recurring Revenue"        icon={<IcTrend/>}  col={T.purple}/>
          </Grid4>

          <SectionTitle action={<Link href="/admin/projects" style={{ fontSize: 12, color: T.accent, fontWeight: 600, textDecoration: 'none' }}>Manage →</Link>}>Projects & Subscriptions</SectionTitle>
          <div className="grid4-resp" style={{ marginBottom: 8 }}>
            <MiniStat label="Active"     value={proj.active}     col={T.success} icon={<IcBriefcase/>}/>
            <MiniStat label="Submitted"  value={proj.submitted}  col={T.warn}    icon={<IcBriefcase/>}/>
            <MiniStat label="Processing" value={proj.processing} col={T.info}    icon={<IcBriefcase/>}/>
            <MiniStat label="Cancelled"  value={proj.cancelled}  col={T.danger}  icon={<IcBriefcase/>}/>
          </div>
        </>
      )}

      {/* ── REVENUE ── */}
      {tab === 'revenue' && (
        <>
          <div className="grid4-resp" style={{ marginBottom: 22 }}>
            <MiniStat label="MRR"               value={fmt(MRR)}                       col={T.success} icon={<IcDollar/>}/>
            <MiniStat label="YTD Collected"     value={fmt(revenue?.ytd ?? 0)}         col={T.accent}  icon={<IcTrend/>}/>
            <MiniStat label="Successful Charges" value={String(revenue?.successfulCharges ?? 0)} col={T.info} icon={<IcDollar/>}/>
            <MiniStat label="Avg. Charge"       value={fmt(revenue?.avgValue ?? 0)}    col={T.warn}    icon={<IcDollar/>}/>
          </div>

          <Card style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>Revenue Overview</div>
                <div style={{ fontSize: 12, color: T.textS }}>Monthly revenue — {new Date().getFullYear()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.success }}>{fmt(peak.r)}</div>
                <div style={{ fontSize: 11, color: T.textS }}>{peak.m ? `Peak: ${peak.m}` : 'No revenue yet'}</div>
              </div>
            </div>
            {revData.length === 0 || revData.every(d => d.r === 0)
              ? <div style={{ color: T.textS, fontSize: 13, padding: '24px 0', textAlign: 'center' }}>No revenue recorded yet this year.</div>
              : <BarChart data={revData} h={130}/>}
          </Card>

          <Card style={{ padding: 0 }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}` }}>
              <SectionTitle>Revenue by Client</SectionTitle>
            </div>
            {(revenue?.clients ?? []).length === 0
              ? <div style={{ padding: 20, color: T.textS, fontSize: 13 }}>No paying clients yet.</div>
              : (revenue?.clients ?? []).map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: i < (revenue?.clients.length ?? 0) - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <Avatar name={c.name} sz={32}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: T.textS }}>{c.company || '—'}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c.mrr > 0 ? T.success : T.textM }}>{c.mrr > 0 ? `${fmt(c.mrr)}/mo` : '—'}</div>
                  <StatusBadge s={c.status}/>
                </div>
              ))
            }
          </Card>
        </>
      )}

      {/* ── CLIENTS ── */}
      {tab === 'clients' && (
        <>
          <div className="grid4-resp" style={{ marginBottom: 22 }}>
            <MiniStat label="Total Clients"  value={clients.length}                          col={T.accent}  icon={<IcUsers/>}/>
            <MiniStat label="Paying Clients" value={(revenue?.clients ?? []).filter(c => c.mrr > 0).length} col={T.success} icon={<IcUsers/>}/>
            <MiniStat label="Active Sites"   value={activeSites}                             col={T.info}    icon={<IcGlobe/>}/>
            <MiniStat label="Total Sites"    value={websites.length}                         col={T.warn}    icon={<IcGlobe/>}/>
          </div>

          <Card style={{ padding: 0 }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}` }}>
              <SectionTitle action={<Link href="/admin/clients" style={{ fontSize: 12, color: T.accent, fontWeight: 600, textDecoration: 'none' }}>View all →</Link>}>Recent Clients</SectionTitle>
            </div>
            {clients.length === 0
              ? <div style={{ padding: 20, color: T.textS, fontSize: 13 }}>No clients yet.</div>
              : clients.slice(0, 8).map((c, i) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: i < Math.min(clients.length, 8) - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <Avatar name={c.name || '?'} sz={32}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: T.textS }}>{c.company}</div>
                  </div>
                  <div style={{ fontSize: 11, color: T.textM }}>{new Date(c.created_at).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}</div>
                </div>
              ))
            }
          </Card>
        </>
      )}

      {/* ── SUPPORT ── */}
      {tab === 'support' && (
        <>
          <div className="grid4-resp" style={{ marginBottom: 22 }}>
            <MiniStat label="Open Tickets"     value={openTickets.length}                       col={T.danger}  icon={<IcMsg/>}/>
            <MiniStat label="High Priority"    value={openTickets.filter(t => t.priority === 'high').length} col={T.warn} icon={<IcMsg/>}/>
            <MiniStat label="Resolved"         value={tickets.filter(t => t.status === 'resolved').length}   col={T.success} icon={<IcMsg/>}/>
            <MiniStat label="Total Tickets"    value={tickets.length}                           col={T.accent}  icon={<IcMsg/>}/>
          </div>

          <Card style={{ padding: 0 }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}` }}>
              <SectionTitle action={<Link href="/admin/tickets" style={{ fontSize: 12, color: T.accent, fontWeight: 600, textDecoration: 'none' }}>View all →</Link>}>Open Tickets</SectionTitle>
            </div>
            {openTickets.length === 0
              ? <div style={{ padding: 20, color: T.textS, fontSize: 13, textAlign: 'center' }}>No open tickets 🎉</div>
              : openTickets.map((t, i) => (
                <Link key={t.id} href="/admin/tickets" style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 18px', borderBottom: i < openTickets.length - 1 ? `1px solid ${T.border}` : 'none', cursor: 'pointer' }}>
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
        </>
      )}
    </div>
  );
}

function MiniStat({ label, value, col, icon }: { label: string; value: number | string; col: string; icon: React.ReactElement }) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10.5, color: T.textM, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: col, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)' }}>{value}</div>
        </div>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: col + '16', border: `1px solid ${col}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {React.cloneElement(icon as React.ReactElement<any>, { sz: 15, col })}
        </div>
      </div>
    </Card>
  );
}

import React from 'react';
