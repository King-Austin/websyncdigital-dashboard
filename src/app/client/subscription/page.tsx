'use client';

import { T } from '@/lib/theme';
import { Card } from '@/components/ui';
import { IcGlobe, IcBar, IcCog, IcMail, IcCard, IcLock, IcCheck } from '@/components/ui/Icons';

const PAYSTACK_LINK = process.env.NEXT_PUBLIC_PAYSTACK_SHOP_LINK || 'https://paystack.shop/pay/qgnem3g4a8';

export default function ClientSubscription() {
  return (
    <div className="fade-in" style={{ maxWidth: 580 }}>
      {/* Plan card */}
      <div style={{ background: 'linear-gradient(135deg,#1E3A8A 0%,#2563EB 60%,#3B82F6 100%)', borderRadius: 20, padding: '30px 32px', marginBottom: 24, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>
        <div style={{ position: 'absolute', bottom: -60, right: 30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}/>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Current Plan</div>
          <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', marginBottom: 4 }}>₦9,999<span style={{ fontSize: 16, fontWeight: 500, opacity: 0.7 }}>/month</span></div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 20 }}>Domain management + website maintenance</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
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

      {/* Pay button */}
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
        <a href={PAYSTACK_LINK} target="_blank" rel="noopener"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: 13, background: T.accent, color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: `0 4px 14px ${T.accent}35` }}>
          <IcCard sz={17} col="#fff"/>
          Subscribe — ₦9,999/month
        </a>
        <div style={{ fontSize: 11, color: T.textM, textAlign: 'center', marginTop: 10 }}>
          🔒 Your payment is processed securely by Paystack. Websync never stores your card details.
        </div>
      </Card>

      {/* What&apos;s included */}
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
