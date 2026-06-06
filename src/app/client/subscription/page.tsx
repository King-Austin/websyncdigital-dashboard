'use client';

import { useEffect, useState } from 'react';
import { T } from '@/lib/theme';
import { Card } from '@/components/ui';
import { IcGlobe, IcBar, IcCog, IcMail, IcCard, IcLock, IcCheck, IcAlert } from '@/components/ui/Icons';

const PAYSTACK_LINK = process.env.NEXT_PUBLIC_PAYSTACK_SHOP_LINK || 'https://paystack.shop/pay/t8gzuzcoct';

type SubStatus = 'loading' | 'active' | 'overdue' | 'inactive' | 'unknown';

interface LastPayment {
  reference: string;
  amount: number;
  plan: string;
  paid_at: string;
}

export default function ClientSubscription() {
  const [status, setStatus]           = useState<SubStatus>('loading');
  const [lastPayment, setLastPayment] = useState<LastPayment | null>(null);

  useEffect(() => {
    fetch('/api/paystack/verify')
      .then(r => r.json())
      .then(d => {
        setStatus(d.status ?? 'unknown');
        if (d.lastPayment) setLastPayment(d.lastPayment);
      })
      .catch(() => setStatus('unknown'));
  }, []);

  const statusConfig = {
    active:   { col: T.success, bg: '#ECFDF5', border: '#BBF7D0', label: 'Active', text: 'Your subscription is active and up to date.' },
    overdue:  { col: T.warn,    bg: '#FFFBEB', border: '#FDE68A', label: 'Overdue', text: 'Your last payment was over 35 days ago. Please renew to avoid interruption.' },
    inactive: { col: T.danger,  bg: '#FEF2F2', border: '#FECACA', label: 'Inactive', text: 'No active subscription found. Subscribe below to get started.' },
    unknown:  { col: T.textS,   bg: T.elevated, border: T.border, label: 'Unknown', text: 'Could not determine subscription status.' },
    loading:  { col: T.textS,   bg: T.elevated, border: T.border, label: '…', text: 'Checking your subscription status…' },
  };

  const cfg = statusConfig[status];

  return (
    <div className="fade-in sub-page">
      <style>{`
        .sub-page { max-width: 580px; }
        @media (max-width: 640px) {
          .sub-page { max-width: 100%; }
          .plan-features { flex-direction: column !important; }
        }
      `}</style>

      {/* Status banner */}
      {status !== 'loading' && (
        <div style={{ padding: '12px 16px', borderRadius: 12, background: cfg.bg, border: `1px solid ${cfg.border}`, marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          {status === 'active'
            ? <IcCheck sz={16} col={cfg.col} />
            : <IcAlert sz={16} col={cfg.col} />}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: cfg.col }}>{cfg.label}</div>
            <div style={{ fontSize: 12, color: T.textS, marginTop: 2 }}>{cfg.text}</div>
            {lastPayment && (
              <div style={{ fontSize: 11, color: T.textM, marginTop: 4 }}>
                Last payment: ₦{(lastPayment.amount / 100).toLocaleString()} on {new Date(lastPayment.paid_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })} · Ref: {lastPayment.reference}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plan card */}
      <div style={{ background: 'linear-gradient(135deg,#1E3A8A 0%,#2563EB 60%,#3B82F6 100%)', borderRadius: 20, padding: '30px 32px', marginBottom: 24, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>
        <div style={{ position: 'absolute', bottom: -60, right: 30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}/>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Current Plan</div>
          <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', marginBottom: 4 }}>₦9,999<span style={{ fontSize: 16, fontWeight: 500, opacity: 0.7 }}>/month</span></div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 20 }}>Domain management + website maintenance</div>
          <div className="plan-features" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['Domain registration & renewal', 'Website hosting', 'Monthly maintenance', 'Email & phone support'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IcCheck sz={9} col="#fff"/>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pay / Renew button — always shown so client can subscribe or renew */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: '#00C3F714', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #00C3F725' }}>
            <IcLock sz={22} col="#00A8D6"/>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Pay with Paystack</div>
            <div style={{ fontSize: 12, color: T.textS }}>Secure · Instant · PCI-DSS compliant</div>
          </div>
        </div>
        <a href={PAYSTACK_LINK} target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: 13, background: T.accent, color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: `0 4px 14px ${T.accent}35`, boxSizing: 'border-box' }}>
          <IcCard sz={17} col="#fff"/>
          {status === 'active' ? 'Renew / Manage Plan' : 'Subscribe — ₦9,999/month'}
        </a>
        <div style={{ fontSize: 11, color: T.textM, textAlign: 'center', marginTop: 10 }}>
          🔒 Payments processed securely by Paystack. Websync never stores your card details.
        </div>
      </Card>

      {/* What's included */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 14 }}>What&apos;s included</div>
        {[
          { icon: <IcGlobe sz={15} col={T.accent}/>, t: 'Domain Registration & Renewal',  d: 'We manage your domain — no surprises, no lapses.' },
          { icon: <IcBar sz={15}   col={T.info}/>,   t: 'Website Hosting',                 d: 'Fast, reliable hosting with 99.9% uptime SLA.' },
          { icon: <IcCog sz={15}   col={T.success}/>, t: 'Monthly Maintenance',            d: 'Content updates, security patches, performance monitoring.' },
          { icon: <IcMail sz={15}  col={T.warn}/>,   t: 'Priority Support',                d: 'Direct email and phone access to the Websync team.' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: T.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{item.t}</div>
              <div style={{ fontSize: 12, color: T.textS }}>{item.d}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
