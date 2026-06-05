'use client';

// Temporary preview page — renders admin dashboard with mock data, no auth required
import { usePathname } from 'next/navigation';
import { T, fmt } from '@/lib/theme';
import { CLIENTS_DATA, SITES_DATA, TICKET_DATA, REV_DATA } from '@/lib/data';
import { Grid4, Grid2, Card, StatCard, SectionTitle } from '@/components/ui';
import { StatusBadge, Avatar } from '@/components/ui';
import { IcUsers, IcGlobe, IcDollar, IcTrend, IcHome, IcBar, IcBriefcase, IcMsg, IcMail, IcCog, IcBell } from '@/components/ui/Icons';
import { BarChart } from '@/components/charts';
import { Sidebar, PageHeader } from '@/components/layout/Sidebar';
import type { NavItem } from '@/components/layout/Sidebar';
import Link from 'next/link';

const ADMIN_NAV: NavItem[] = [
  { k: '/preview', label: 'Overview', icon: <IcHome /> },
  { k: '/admin/clients', label: 'Clients', icon: <IcUsers /> },
  { k: '/admin/websites', label: 'Websites', icon: <IcGlobe /> },
  { k: '/admin/portfolio', label: 'Portfolio', icon: <IcBriefcase /> },
  { k: 'd1', divider: true },
  { k: '/admin/revenue', label: 'Revenue', icon: <IcDollar /> },
  { k: '/admin/tickets', label: 'Support Tickets', icon: <IcMsg />, badge: 2 },
  { k: '/admin/email', label: 'Email Outreach', icon: <IcMail /> },
  { k: 'd2', divider: true },
  { k: '/admin/settings', label: 'Settings', icon: <IcCog /> },
];

export default function PreviewPage() {
  const activeClients = CLIENTS_DATA.filter(c => c.status === 'active').length;
  const activeSites   = SITES_DATA.filter(s => s.status === 'live').length;
  const openTickets   = TICKET_DATA.filter(t => t.status === 'open');
  const MRR = CLIENTS_DATA.filter(c => c.status === 'active').reduce((s, c) => s + c.mrr, 0);
  const ARR = MRR * 12;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
      <Sidebar
        items={ADMIN_NAV}
        active="/preview"
        onSelect={() => {}}
        role="admin"
        userName="Super Admin"
        userEmail="admin@websyncdigital.com.ng"
      />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <PageHeader title="Admin Overview" sub="Websync Digital — Jun 2026" actions={
          <>
            <div style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: T.elevated, border: `1px solid ${T.border}`, cursor: 'pointer' }}>
              <IcBell sz={16} col={T.textS}/>
              <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: T.danger }}/>
            </div>
          </>
        }/>
        <main style={{ flex: 1, padding: 28 }}>
          <div className="fade-in">
            <Grid4>
              <StatCard label="Total Clients"   value={CLIENTS_DATA.length} sub={`${activeClients} active`}    icon={<IcUsers/>}  col={T.accent}  trend={12}/>
              <StatCard label="Active Websites" value={activeSites}          sub={`${SITES_DATA.length} total`} icon={<IcGlobe/>}  col={T.info}    trend={8}/>
              <StatCard label="MRR"             value={fmt(MRR)}             sub="Monthly Recurring Revenue"    icon={<IcDollar/>} col={T.success} trend={15}/>
              <StatCard label="ARR (Projected)" value={fmt(ARR)}             sub="Annual Recurring Revenue"     icon={<IcTrend/>}  col={T.purple}/>
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
                <BarChart data={REV_DATA} h={120}/>
              </Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Card style={{ flex: 1 }}>
                  <SectionTitle>Open Tickets ({openTickets.length})</SectionTitle>
                  {openTickets.map((t, i) => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: i < openTickets.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{t.subj}</div>
                        <div style={{ fontSize: 11, color: T.textS }}>{t.cname} · {t.date}</div>
                      </div>
                      <StatusBadge s={t.pri}/>
                    </div>
                  ))}
                </Card>
                <Card>
                  <SectionTitle>Recent Clients</SectionTitle>
                  {CLIENTS_DATA.slice(0, 3).map((c, i) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? `1px solid ${T.border}` : 'none' }}>
                      <Avatar name={c.name} sz={32}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: T.textS }}>{c.company} · since {c.since}</div>
                      </div>
                      <StatusBadge s={c.status}/>
                    </div>
                  ))}
                </Card>
              </div>
            </Grid2>
          </div>
        </main>
      </div>
    </div>
  );
}
