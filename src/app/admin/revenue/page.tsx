'use client';

import { useEffect, useState } from 'react';
import { T, fmt } from '@/lib/theme';
import { Card, Grid2, SectionTitle } from '@/components/ui';
import { Avatar, Badge } from '@/components/ui';
import { StatusBadge } from '@/components/ui';
import { Dot } from '@/components/ui';
import { BarChart } from '@/components/charts';

interface ClientRev {
  name: string;
  company: string;
  email: string;
  mrr: number;
  status: string;
}

interface RevenueData {
  mrr: number;
  arr: number;
  ytd: number;
  activeClients: number;
  activeProjects: number;
  successfulCharges: number;
  avgValue: number;
  monthly: { m: string; r: number }[];
  clients: ClientRev[];
  generatedAt: string;
}

export default function AdminRevenue() {
  const [data, setData]       = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    fetch('/api/admin/revenue')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: RevenueData) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const mrr = data?.mrr ?? 0;
  const arr = data?.arr ?? 0;
  const ytd = data?.ytd ?? 0;
  const activeClients = data?.activeClients ?? 0;
  const clients = data?.clients ?? [];
  const monthly = data?.monthly ?? [];

  const statRows = data ? [
    { l: 'Active Projects',     v: String(data.activeProjects),    col: T.success },
    { l: 'Successful Charges',  v: String(data.successfulCharges), col: T.accent  },
    { l: 'Active Clients',      v: String(data.activeClients),     col: T.info    },
    { l: 'Avg. Payment Value',  v: fmt(data.avgValue),             col: T.warn    },
  ] : [
    { l: 'Active Projects',     v: '—', col: T.success },
    { l: 'Successful Charges',  v: '—', col: T.accent  },
    { l: 'Active Clients',      v: '—', col: T.info    },
    { l: 'Avg. Payment Value',  v: '—', col: T.warn    },
  ];

  return (
    <div className="fade-in">
      <Grid2 style={{ marginBottom: 22 }}>
        <Card style={{ background: 'linear-gradient(135deg,#EBF2FF 0%,#DBEAFE 100%)', border: `1px solid ${T.accent}25` }}>
          <div style={{ fontSize: 11, color: T.textS, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Monthly Recurring Revenue</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: T.accent, letterSpacing: '-1.5px', lineHeight: 1 }}>{loading ? '—' : fmt(mrr)}</div>
          <div style={{ fontSize: 13, color: T.textS, marginTop: 8, marginBottom: 14 }}>From {activeClients} active client{activeClients === 1 ? '' : 's'}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {clients.filter(c => c.mrr > 0).map((c, i) => (
              <div key={i} style={{ fontSize: 11, padding: '3px 9px', background: T.accent + '14', color: T.accent, borderRadius: 6, fontWeight: 600, border: `1px solid ${T.accent}20` }}>
                +{fmt(c.mrr)}/mo
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ background: 'linear-gradient(135deg,#ECFDF5 0%,#D1FAE5 100%)', border: `1px solid ${T.success}25` }}>
          <div style={{ fontSize: 11, color: T.textS, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Annual Recurring Revenue</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: T.success, letterSpacing: '-1.5px', lineHeight: 1 }}>{loading ? '—' : fmt(arr)}</div>
          <div style={{ fontSize: 13, color: T.textS, marginTop: 8, marginBottom: 14 }}>Projected annual income</div>
          <div style={{ fontSize: 12, color: T.textS, marginBottom: 8 }}>YTD collected: <strong style={{ color: T.text }}>{loading ? '—' : fmt(ytd)}</strong></div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 3, background: T.success, width: arr > 0 ? `${Math.min((ytd / arr) * 100, 100).toFixed(0)}%` : '0%', transition: 'width 0.8s' }}/>
          </div>
          <div style={{ fontSize: 11, color: T.textM, marginTop: 4 }}>{arr > 0 ? ((ytd / arr) * 100).toFixed(0) : '0'}% of annual target</div>
        </Card>
      </Grid2>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>Payment Analytics</div>
            <div style={{ fontSize: 12, color: T.textS }}>Live data from your database (ws_payments · ws_projects)</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: error ? T.danger + '12' : '#00C3F712', borderRadius: 8, border: `1px solid ${error ? T.danger + '25' : '#00C3F725'}` }}>
            {loading
              ? <span style={{ fontSize: 12, color: T.textS }}>Loading…</span>
              : error
                ? <><Dot color={T.danger}/><span style={{ fontSize: 12, fontWeight: 600, color: T.danger }}>Error</span></>
                : <><Dot color="#00C3F7" pulse/><span style={{ fontSize: 12, fontWeight: 600, color: '#0099BF' }}>Live</span></>
            }
          </div>
        </div>

        <div className="grid4-resp">
          {statRows.map((s, i) => (
            <div key={i} style={{ padding: '14px 16px', background: T.elevated, borderRadius: 10, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 10, color: T.textM, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: loading ? T.textM : s.col }}>{s.v}</div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: T.elevated, borderRadius: 8, fontSize: 12, color: T.textS }}>
            <strong style={{ color: T.text }}>Could not load revenue data.</strong> Make sure you are signed in as an admin.
          </div>
        )}
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <SectionTitle>Monthly Revenue — {new Date().getFullYear()}</SectionTitle>
        {loading ? (
          <div style={{ color: T.textS, fontSize: 13, padding: '20px 0' }}>Loading…</div>
        ) : monthly.every(m => m.r === 0) ? (
          <div style={{ color: T.textS, fontSize: 13, padding: '20px 0' }}>No payments recorded yet this year.</div>
        ) : (
          <BarChart data={monthly} h={130}/>
        )}
      </Card>

      <Card style={{ padding: 0, overflowX: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
          <SectionTitle>Revenue by Client</SectionTitle>
        </div>
        {loading ? (
          <div style={{ padding: 24, color: T.textS, fontSize: 13 }}>Loading…</div>
        ) : clients.length === 0 ? (
          <div style={{ padding: 24, color: T.textS, fontSize: 13 }}>No clients with projects yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr>
                {['Client', 'Plan', 'Monthly', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, color: T.textM, fontWeight: 600, borderBottom: `1px solid ${T.border}`, textTransform: 'uppercase', letterSpacing: '0.5px', background: T.elevated }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => (
                <tr key={i} style={{ borderBottom: i < clients.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={c.name} sz={30}/>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: T.textS }}>{c.company || c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px' }}><Badge col={T.info}>Monthly</Badge></td>
                  <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: c.mrr > 0 ? T.success : T.textM }}>{fmt(c.mrr)}/mo</td>
                  <td style={{ padding: '13px 16px' }}><StatusBadge s={c.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
