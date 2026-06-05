'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { T, fmt } from '@/lib/theme';
import { StatCard, Card, Grid2, SectionTitle, Row, Btn } from '@/components/ui';
import { IcGlobe, IcBar, IcFile, IcAlert, IcLink, IcCal, IcCog, IcCard } from '@/components/ui/Icons';
import { StatusBadge, Dot } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

interface WebsiteRow { id: number; name: string; url: string; status: 'live'|'maintenance'|'down'; domain_expiry: string; seo_score: number; monthly_visits: number; }
interface InvoiceRow { id: string; amount: number; due_date: string; status: 'paid'|'unpaid'|'overdue'; }
interface NotifRow   { id: number; type: string; message: string; read: boolean; created_at: string; }
interface ProfileRow { name: string; }

export default function ClientOverview() {
  const [profile, setProfile]   = useState<ProfileRow | null>(null);
  const [sites, setSites]       = useState<WebsiteRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [notifs, setNotifs]     = useState<NotifRow[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: prof }, { data: ws }, { data: inv }, { data: n }] = await Promise.all([
        supabase.from('ws_profiles').select('name').eq('id', user.id).single(),
        supabase.from('ws_websites').select('*').eq('client_id', user.id).order('created_at', { ascending: false }),
        supabase.from('ws_invoices').select('*').eq('client_id', user.id).order('created_at', { ascending: false }),
        supabase.from('ws_notifications').select('*').eq('client_id', user.id).order('created_at', { ascending: false }).limit(5),
      ]);

      setProfile(prof);
      setSites(ws || []);
      setInvoices(inv || []);
      setNotifs(n || []);
      setLoading(false);
    })();
  }, []);

  const totalVisits = sites.reduce((sum, s) => sum + s.monthly_visits, 0);
  const unpaid = invoices.find(i => i.status === 'unpaid');

  if (loading) return <div style={{ color: T.textS, fontSize: 13, padding: 24 }}>Loading dashboard…</div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.4px' }}>
          Good morning{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''} ☀️
        </h2>
        <p style={{ color: T.textS, fontSize: 13, marginTop: 4 }}>Here is a snapshot of your web presence</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 22 }}>
        <StatCard label="Active Websites"  value={sites.length}                sub="Managed by Websync"    icon={<IcGlobe/>}  col={T.accent}/>
        <StatCard label="Monthly Visits"   value={totalVisits.toLocaleString()} sub="Across all your sites" icon={<IcBar/>}    col={T.info}   trend={6}/>
        <StatCard label="Monthly Retainer" value="₦9,999"                       sub="Due 10th each month"   icon={<IcFile/>}   col={T.warn}/>
      </div>

      {unpaid && (
        <div style={{ background: T.warn + '0F', border: `1px solid ${T.warn}30`, borderRadius: 10, padding: '12px 16px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
          <Row>
            <IcAlert sz={15} col={T.warn}/>
            <span style={{ fontSize: 13, color: T.text }}>Invoice <strong>{unpaid.id}</strong> of <strong>{fmt(unpaid.amount)}</strong> is due <strong>{unpaid.due_date}</strong></span>
          </Row>
          <Link href="/client/billing"><Btn sz="sm">View Invoice</Btn></Link>
        </div>
      )}

      <Grid2>
        <div>
          <SectionTitle action={<Link href="/client/websites" style={{ fontSize: 12, color: T.accent, cursor: 'pointer', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>}>Your Websites</SectionTitle>
          {sites.length === 0 && <div style={{ color: T.textS, fontSize: 13, padding: '12px 0' }}>No websites assigned yet.</div>}
          {sites.map(site => (
            <Card key={site.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 3 }}>{site.name}</div>
                  {site.url && (
                    <a href={'https://' + site.url} target="_blank" rel="noopener" style={{ fontSize: 12, color: T.textS, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {site.url} <IcLink sz={11} col={T.textS}/>
                    </a>
                  )}
                </div>
                <Row>
                  <StatusBadge s={site.status}/>
                  <Dot color={site.status === 'live' ? T.success : T.warn} pulse={site.status === 'live'}/>
                </Row>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                {[
                  { l: 'Visits (mo)', v: site.monthly_visits.toLocaleString() },
                  { l: 'SEO Score',   v: `${site.seo_score}/100`, c: site.seo_score >= 75 ? T.success : site.seo_score >= 60 ? T.warn : T.danger },
                  { l: 'Domain Exp.', v: site.domain_expiry || '—' },
                ].map((m, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: T.elevated, borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: T.textM, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: (m as any).c || T.text }}>{m.v}</div>
                  </div>
                ))}
              </div>
              <Link href="/client/metrics"><Btn sz="sm" variant="outline"><IcBar sz={12}/>View Metrics</Btn></Link>
            </Card>
          ))}
        </div>

        <div>
          <SectionTitle>Recent Notifications</SectionTitle>
          <Card style={{ marginBottom: 18 }}>
            {notifs.length === 0
              ? <div style={{ fontSize: 13, color: T.textS, padding: '8px 0' }}>No notifications.</div>
              : notifs.map((n, i) => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 0', borderBottom: i < notifs.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: T.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {n.type === 'billing' ? <IcFile sz={14} col={T.warn}/> : n.type === 'domain' ? <IcGlobe sz={14} col={T.accent}/> : <IcCog sz={14} col={T.textS}/>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: T.text }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: T.textM, marginTop: 2 }}>{new Date(n.created_at).toLocaleDateString('en-NG')}</div>
                  </div>
                </div>
              ))
            }
          </Card>

          <SectionTitle>Domain Status</SectionTitle>
          {sites.map(site => (
            <Card key={site.id} style={{ marginBottom: 10, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{site.url || site.name}</div>
                  <div style={{ fontSize: 11, color: T.textM, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <IcCal sz={11} col={T.textM}/> {site.domain_expiry ? `Expires ${site.domain_expiry}` : 'No expiry set'}
                  </div>
                </div>
                <StatusBadge s={site.status}/>
              </div>
            </Card>
          ))}

          <div style={{ marginTop: 8, padding: 20, background: 'linear-gradient(135deg,#EBF2FF 0%,#DBEAFE 100%)', borderRadius: 14, border: `1px solid ${T.accent}20` }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4 }}>Monthly Subscription</div>
            <div style={{ fontSize: 13, color: T.textS, marginBottom: 14, lineHeight: 1.55 }}>₦9,999/month · Domain + Website Management. Pay securely via Paystack.</div>
            <a href={process.env.NEXT_PUBLIC_PAYSTACK_SHOP_LINK || 'https://paystack.shop/pay/qgnem3g4a8'} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: T.accent, color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: 'none', boxShadow: `0 2px 8px ${T.accent}40` }}>
              <IcCard sz={14} col="#fff"/> Subscribe via Paystack
            </a>
          </div>
        </div>
      </Grid2>
    </div>
  );
}
