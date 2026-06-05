'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { T } from '@/lib/theme';
import { Card, Row, Btn } from '@/components/ui';
import { StatusBadge, Dot } from '@/components/ui';
import { IcGlobe, IcLink, IcBar } from '@/components/ui/Icons';
import { LineChart } from '@/components/charts';
import { createClient } from '@/lib/supabase/client';

interface WebsiteRow {
  id: number;
  name: string;
  url: string;
  status: 'live' | 'maintenance' | 'down';
  domain_expiry: string;
  seo_score: number;
  monthly_visits: number;
  form_submissions: number;
}

export default function ClientWebsites() {
  const [sites, setSites]   = useState<WebsiteRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('ws_websites')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });
      setSites(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={{ color: T.textS, fontSize: 13, padding: 24 }}>Loading websites…</div>;

  return (
    <div className="fade-in">
      <p style={{ color: T.textS, fontSize: 13, marginBottom: 20 }}>
        You have <strong>{sites.length}</strong> website{sites.length !== 1 ? 's' : ''} managed by Websync Digital.
      </p>
      {sites.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: T.textS, fontSize: 13 }}>No websites assigned yet. Contact your Websync admin.</div>
      )}
      {sites.map(site => (
        <Card key={site.id} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Row>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: T.accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IcGlobe sz={22} col={T.accent}/>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{site.name}</div>
                {site.url && (
                  <a href={'https://' + site.url} target="_blank" rel="noopener" style={{ fontSize: 12, color: T.accent, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {site.url} <IcLink sz={10} col={T.accent}/>
                  </a>
                )}
              </div>
            </Row>
            <Row>
              <StatusBadge s={site.status}/>
              <Dot color={site.status === 'live' ? T.success : T.warn} pulse={site.status === 'live'}/>
            </Row>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, padding: '14px 0', borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, marginBottom: 14 }}>
            {[
              { l: 'Monthly Visits',   v: site.monthly_visits.toLocaleString() },
              { l: 'SEO Score',        v: `${site.seo_score}/100`, c: site.seo_score >= 75 ? T.success : site.seo_score >= 60 ? T.warn : T.danger },
              { l: 'Form Submissions', v: site.form_submissions },
              { l: 'Domain Expires',   v: site.domain_expiry || '—' },
            ].map((m, i) => (
              <div key={i}>
                <div style={{ fontSize: 10, color: T.textM, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.l}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: (m as any).c || T.text }}>{m.v}</div>
              </div>
            ))}
          </div>

          <Row>
            <Link href="/client/metrics"><Btn sz="sm"><IcBar sz={12}/>Full Metrics</Btn></Link>
            {site.url && (
              <a href={'https://' + site.url} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: T.textS, textDecoration: 'none' }}>
                <IcLink sz={12}/>Visit Site
              </a>
            )}
          </Row>
        </Card>
      ))}
    </div>
  );
}
