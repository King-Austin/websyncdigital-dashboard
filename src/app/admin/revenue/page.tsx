'use client';

import { T, fmt } from '@/lib/theme';
import { CLIENTS_DATA, REV_DATA } from '@/lib/data';
import { Card, Grid2, SectionTitle } from '@/components/ui';
import { Avatar, Badge } from '@/components/ui';
import { StatusBadge } from '@/components/ui';
import { Dot } from '@/components/ui';
import { BarChart } from '@/components/charts';

export default function AdminRevenue() {
  const MRR = CLIENTS_DATA.filter(c => c.status === 'active').reduce((s, c) => s + c.mrr, 0);
  const ARR = MRR * 12;
  const ytd = REV_DATA.reduce((s, d) => s + d.r, 0);

  const paystackStats = [
    { l: 'Active Subscriptions', v: '4',       col: T.success },
    { l: 'Successful Charges',   v: '23',      col: T.accent  },
    { l: 'Failed Payments',      v: '1',       col: T.danger  },
    { l: 'Avg. Payment Value',   v: '₦20,750', col: T.info    },
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>Paystack Analytics</div>
            <div style={{ fontSize: 12, color: T.textS }}>Live payment data from your Paystack dashboard</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: '#00C3F712', borderRadius: 8, border: '1px solid #00C3F725' }}>
            <Dot color="#00C3F7" pulse/>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0099BF' }}>Connected</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {paystackStats.map((s, i) => (
            <div key={i} style={{ padding: '14px 16px', background: T.elevated, borderRadius: 10, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 10, color: T.textM, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.col }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: '10px 14px', background: T.elevated, borderRadius: 8, fontSize: 12, color: T.textS }}>
          <strong style={{ color: T.text }}>Integration note:</strong> Connect your Paystack secret key in Settings → Integrations to pull live subscription counts, failed charges and payout history directly here.
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <SectionTitle>Monthly Revenue — 2026</SectionTitle>
        <BarChart data={REV_DATA} h={130}/>
      </Card>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
          <SectionTitle>Revenue by Client</SectionTitle>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Client', 'Plan', 'Contract Value', 'Monthly Contribution', 'Status'].map(h => (
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
                    <div><div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.name}</div><div style={{ fontSize: 11, color: T.textS }}>{c.company}</div></div>
                  </div>
                </td>
                <td style={{ padding: '13px 16px' }}><Badge col={T.info}>Monthly</Badge></td>
                <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: T.text }}>{fmt(c.mrr)}/mo</td>
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
