'use client';

import { useEffect, useState } from 'react';
import { T, fmt } from '@/lib/theme';
import { CLIENTS_DATA, REV_DATA } from '@/lib/data';
import { Card, Grid2, SectionTitle } from '@/components/ui';
import { Avatar, Badge } from '@/components/ui';
import { StatusBadge } from '@/components/ui';
import { Dot } from '@/components/ui';
import { BarChart } from '@/components/charts';

interface PaystackStats {
  activeSubs: number;
  successfulCharges: number;
  failedPayments: number;
  avgValue: number;
  totalCharged: number;
  month: string;
}

export default function AdminRevenue() {
  const MRR = CLIENTS_DATA.filter(c => c.status === 'active').reduce((s, c) => s + c.mrr, 0);
  const ARR = MRR * 12;
  const ytd = REV_DATA.reduce((s, d) => s + d.r, 0);

  const [stats, setStats]     = useState<PaystackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    fetch('/api/paystack/stats')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const statRows = stats ? [
    { l: 'Active Subscriptions', v: String(stats.activeSubs),         col: T.success },
    { l: 'Successful Charges',   v: String(stats.successfulCharges),  col: T.accent  },
    { l: 'Failed Payments',      v: String(stats.failedPayments),      col: T.danger  },
    { l: 'Avg. Payment Value',   v: fmt(Math.round(stats.avgValue / 100)), col: T.info },
  ] : [
    { l: 'Active Subscriptions', v: '—', col: T.success },
    { l: 'Successful Charges',   v: '—', col: T.accent  },
    { l: 'Failed Payments',      v: '—', col: T.danger  },
    { l: 'Avg. Payment Value',   v: '—', col: T.info    },
  ];

  return (
    <div className="fade-in">
      <Grid2 style={{ marginBottom: 22 }}>
        <Card style={{ background: 'linear-gradient(135deg,#EBF2FF 0%,#DBEAFE 100%)', border: `1px solid ${T.accent}25` }}>
          <div style={{ fontSize: 11, color: T.textS, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Monthly Recurring Revenue</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: T.accent, letterSpacing: '-1.5px', lineHeight: 1 }}>{fmt(MRR)}</div>
          <div style={{ fontSize: 13, color: T.textS, marginTop: 8, marginBottom: 14 }}>From {CLIENTS_DATA.filter(c => c.status === 'active').length} active clients</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CLIENTS_DATA.filter(c => c.status === 'active').map(c => (
              <div key={c.id} style={{ fontSize: 11, padding: '3px 9px', background: T.accent + '14', color: T.accent, borderRadius: 6, fontWeight: 600, border: `1px solid ${T.accent}20` }}>
                +{fmt(c.mrr)}/mo
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ background: 'linear-gradient(135deg,#ECFDF5 0%,#D1FAE5 100%)', border: `1px solid ${T.success}25` }}>
          <div style={{ fontSize: 11, color: T.textS, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Annual Recurring Revenue</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: T.success, letterSpacing: '-1.5px', lineHeight: 1 }}>{fmt(ARR)}</div>
          <div style={{ fontSize: 13, color: T.textS, marginTop: 8, marginBottom: 14 }}>Projected annual income</div>
          <div style={{ fontSize: 12, color: T.textS, marginBottom: 8 }}>YTD collected: <strong style={{ color: T.text }}>{fmt(ytd)}</strong></div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 3, background: T.success, width: `${Math.min((ytd / ARR) * 100, 100).toFixed(0)}%`, transition: 'width 0.8s' }}/>
          </div>
          <div style={{ fontSize: 11, color: T.textM, marginTop: 4 }}>{((ytd / ARR) * 100).toFixed(0)}% of annual target</div>
        </Card>
      </Grid2>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>
              Paystack Analytics {stats && <span style={{ fontSize: 12, fontWeight: 500, color: T.textS }}>— {stats.month}</span>}
            </div>
            <div style={{ fontSize: 12, color: T.textS }}>Live payment data from Paystack</div>
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
            <strong style={{ color: T.text }}>Could not reach Paystack API.</strong> Check that your secret key is set in <code>.env.local</code> and is a live key (not a test key starting with <code>pk_test_</code>).
          </div>
        )}
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <SectionTitle>Monthly Revenue — 2026</SectionTitle>
        <BarChart data={REV_DATA} h={130}/>
      </Card>

      <Card style={{ padding: 0, overflowX: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
          <SectionTitle>Revenue by Client</SectionTitle>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr>
              {['Client', 'Plan', 'Monthly', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, color: T.textM, fontWeight: 600, borderBottom: `1px solid ${T.border}`, textTransform: 'uppercase', letterSpacing: '0.5px', background: T.elevated }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CLIENTS_DATA.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < CLIENTS_DATA.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={c.name} sz={30}/>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: T.textS }}>{c.company}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '13px 16px' }}><Badge col={T.info}>Monthly</Badge></td>
                <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: T.success }}>{fmt(c.mrr)}/mo</td>
                <td style={{ padding: '13px 16px' }}><StatusBadge s={c.status}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
