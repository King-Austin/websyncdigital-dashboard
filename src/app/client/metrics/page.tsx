'use client';

import { useEffect, useState } from 'react';
import { T } from '@/lib/theme';
import { formatDomainExpiry, normalizeWebsiteUrl } from '@/lib/format';
import { Card, StatCard, Grid2, Row, Btn } from '@/components/ui';
import { StatusBadge } from '@/components/ui';
import { IcBar, IcTrend, IcMsg, IcCal, IcLink, IcGlobe, IcZap } from '@/components/ui/Icons';
import { LineChart } from '@/components/charts';

interface Website {
  id: number;
  name: string;
  url: string | null;
  status: 'live' | 'maintenance' | 'down';
  domain_expiry: string | null;
  seo_score: number | null;
  monthly_visits: number | null;
  form_submissions: number | null;
  monthly_fee: number | null;
}

export default function ClientMetrics() {
  const [sites, setSites]   = useState<Website[]>([]);
  const [selId, setSelId]   = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/my-websites')
      .then(r => r.ok ? r.json() : [])
      .then((d: Website[]) => {
        setSites(d);
        if (d.length) setSelId(d[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState('');

  const site = sites.find(s => s.id === selId) ?? sites[0];

  async function refreshSeo() {
    if (!site) return;
    setRefreshing(true);
    setRefreshMsg('');
    const res = await fetch('/api/seo/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ website_id: site.id }),
    });
    const data = await res.json();
    if (res.ok) {
      setSites(prev => prev.map(s => s.id === site.id ? { ...s, seo_score: data.seo_score } : s));
      setRefreshMsg(`Updated — SEO ${data.seo_score}/100${data.performance != null ? `, performance ${data.performance}/100` : ''}`);
    } else {
      setRefreshMsg(data.error || 'Could not refresh score.');
    }
    setRefreshing(false);
  }

  if (loading) {
    return <div style={{ color: T.textS, fontSize: 14, padding: 20 }}>Loading your sites…</div>;
  }

  if (!site) {
    return (
      <Card style={{ textAlign: 'center', padding: '44px 20px' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: T.accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <IcGlobe sz={24} col={T.accent}/>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>No websites yet</div>
        <div style={{ fontSize: 13, color: T.textS }}>Once we build and launch your site, its metrics will appear here.</div>
      </Card>
    );
  }

  const visits = site.monthly_visits ?? 0;
  const seo    = site.seo_score ?? 0;
  // Synthesise a gentle 7-point trend around the stored visits for the chart
  const series = Array.from({ length: 7 }, (_, i) => Math.round(visits * (0.7 + (i * 0.05))));
  const weeks  = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7'];

  return (
    <div className="fade-in">
      <Row style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: T.textS }}>Viewing:</span>
        <select value={site.id} onChange={e => setSelId(Number(e.target.value))}
          style={{ padding: '7px 12px', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, outline: 'none' }}>
          {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {site.url && (
          <a href={normalizeWebsiteUrl(site.url)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: T.accent, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {site.url} <IcLink sz={11} col={T.accent}/>
          </a>
        )}
        <StatusBadge s={site.status}/>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {refreshMsg && <span style={{ fontSize: 11, color: T.textS }}>{refreshMsg}</span>}
          <Btn sz="sm" variant="outline" onClick={refreshSeo} disabled={refreshing}>
            <IcZap sz={13}/>{refreshing ? 'Checking…' : 'Refresh SEO'}
          </Btn>
        </div>
      </Row>

      <div className="grid4-resp" style={{ marginBottom: 22 }}>
        <StatCard label="Visits This Month" value={visits.toLocaleString()} icon={<IcBar/>} col={T.accent}/>
        <StatCard label="SEO Score" value={`${seo}/100`} sub={seo >= 75 ? 'Healthy' : seo > 0 ? 'Needs work' : 'Not measured'} icon={<IcTrend/>} col={seo >= 75 ? T.success : T.warn}/>
        <StatCard label="Form Submissions" value={site.form_submissions ?? 0} sub="This month" icon={<IcMsg/>} col={T.info}/>
        <StatCard label="Domain Expires" value={formatDomainExpiry(site.domain_expiry)} sub="Plan ahead" icon={<IcCal/>} col={T.warn}/>
      </div>

      <Grid2>
        <Card>
          <div style={{ fontWeight: 600, fontSize: 14, color: T.text, marginBottom: 14 }}>Domain Info</div>
          {[
            { l: 'Domain Name',   v: site.url ?? '—' },
            { l: 'Domain Expiry', v: formatDomainExpiry(site.domain_expiry) },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 1 ? `1px solid ${T.border}` : 'none' }}>
              <span style={{ fontSize: 13, color: T.textS }}>{r.l}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text, textAlign: 'right', maxWidth: '55%' }}>{r.v}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontWeight: 600, fontSize: 14, color: T.text, marginBottom: 14 }}>Site Health</div>
          {[
            { l: 'Status',           v: <StatusBadge s={site.status}/> },
            { l: 'SEO Score',        v: <span style={{ fontWeight: 700, color: seo >= 75 ? T.success : seo >= 60 ? T.warn : T.danger }}>{seo}/100</span> },
            { l: 'Form Submissions', v: site.form_submissions ?? 0 },
            { l: 'Monthly Visits',   v: visits.toLocaleString() },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none' }}>
              <span style={{ fontSize: 13, color: T.textS }}>{r.l}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{r.v as React.ReactNode}</span>
            </div>
          ))}
        </Card>
      </Grid2>

      <Card style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: T.text }}>Traffic Overview</div>
            <div style={{ fontSize: 12, color: T.textS }}>Estimated weekly page visits</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.accent }}>{visits.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: T.textS }}>visits this month</div>
          </div>
        </div>
        <LineChart data={series} h={110} col={T.accent} id={`met${site.id}`}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
          {weeks.map((w, i) => <div key={i} style={{ fontSize: 11, color: T.textM, textAlign: 'center', flex: 1 }}>{w}</div>)}
        </div>
      </Card>
    </div>
  );
}
