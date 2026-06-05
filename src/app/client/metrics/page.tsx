'use client';

import { useState } from 'react';
import { T } from '@/lib/theme';
import { SITES_DATA } from '@/lib/data';
import { Card, StatCard, Grid2, Row } from '@/components/ui';
import { StatusBadge } from '@/components/ui';
import { IcBar, IcTrend, IcMsg, IcCal, IcLink } from '@/components/ui/Icons';
import { LineChart } from '@/components/charts';

export default function ClientMetrics() {
  const myWebsites = SITES_DATA.filter(s => s.cid === 1);
  const [selId, setSelId] = useState(myWebsites[0]?.id || 1);
  const site = myWebsites.find(s => s.id === selId) || myWebsites[0];
  const weeks = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7'];

  if (!site) return null;

  return (
    <div className="fade-in">
      <Row style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: T.textS }}>Viewing:</span>
        <select value={selId} onChange={e => setSelId(Number(e.target.value))}
          style={{ padding: '7px 12px', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, fontFamily: 'Plus Jakarta Sans', outline: 'none' }}>
          {myWebsites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <a href={'https://' + site.url} target="_blank" rel="noopener" style={{ fontSize: 12, color: T.accent, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {site.url} <IcLink sz={11} col={T.accent}/>
        </a>
        <StatusBadge s={site.status}/>
      </Row>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        <StatCard label="Visits This Month" value={site.visits[site.visits.length-1].toLocaleString()} trend={4} icon={<IcBar/>} col={T.accent}/>
        <StatCard label="SEO Score" value={`${site.seo}/100`} sub={site.seo >= 75 ? 'Healthy' : 'Needs work'} icon={<IcTrend/>} col={site.seo >= 75 ? T.success : T.warn}/>
        <StatCard label="Form Submissions" value={site.forms} sub="This month" icon={<IcMsg/>} col={T.info}/>
        <StatCard label="Domain Expires" value={site.domExp} sub="Plan ahead" icon={<IcCal/>} col={T.warn}/>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: T.text }}>Traffic Overview</div>
            <div style={{ fontSize: 12, color: T.textS }}>Weekly page visits — last 7 weeks</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.accent }}>{site.visits[site.visits.length-1].toLocaleString()}</div>
            <div style={{ fontSize: 11, color: T.textS }}>visits this week</div>
          </div>
        </div>
        <LineChart data={site.visits} h={110} col={T.accent} id={`met${site.id}`}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
          {weeks.map((w, i) => <div key={i} style={{ fontSize: 11, color: T.textM, textAlign: 'center', flex: 1 }}>{w}</div>)}
        </div>
      </Card>

      <Grid2>
        <Card>
          <div style={{ fontWeight: 600, fontSize: 14, color: T.text, marginBottom: 14 }}>Domain Info</div>
          {[
            { l: 'Domain Name',   v: site.url },
            { l: 'Domain Expiry', v: site.domExp },
            { l: 'Service Plan',  v: 'Monthly Retainer — ₦9,999/mo' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 2 ? `1px solid ${T.border}` : 'none' }}>
              <span style={{ fontSize: 13, color: T.textS }}>{r.l}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text, textAlign: 'right', maxWidth: '55%' }}>{r.v}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontWeight: 600, fontSize: 14, color: T.text, marginBottom: 14 }}>Site Health</div>
          {[
            { l: 'Status',           v: <StatusBadge s={site.status}/> },
            { l: 'SEO Score',        v: <span style={{ fontWeight: 700, color: site.seo >= 75 ? T.success : site.seo >= 60 ? T.warn : T.danger }}>{site.seo}/100</span> },
            { l: 'Form Submissions', v: site.forms },
            { l: 'Monthly Visits',   v: site.visits[site.visits.length-1].toLocaleString() },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none' }}>
              <span style={{ fontSize: 13, color: T.textS }}>{r.l}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{r.v as any}</span>
            </div>
          ))}
        </Card>
      </Grid2>
    </div>
  );
}
