'use client';

import { useState } from 'react';
import { T, fmt } from '@/lib/theme';
import { Card, Grid2, Row, Btn, Input } from '@/components/ui';
import { Badge } from '@/components/ui';
import { IcCheck, IcPlus, IcCard, IcZap } from '@/components/ui/Icons';

export default function AdminSettings() {
  const [agency, setAgency] = useState({ name: 'Websync Digital', email: 'hello@websyncdigital.com.ng', phone: '+234 800 WEBSYNC', address: 'Lagos, Nigeria', website: 'websyncdigital.com.ng' });
  const [saved, setSaved]   = useState(false);
  const [paystackKey, setPaystackKey] = useState('sk_live_••••••••••••••••••••••••');
  const [resendKey, setResendKey]     = useState('re_••••••••••••••••••••••••');

  const plans = [
    { id: 1, name: 'Starter',  price: 9999, desc: 'Domain management + hosting + monthly maintenance' },
    { id: 2, name: 'Standard', price: 9999, desc: 'Includes all Starter features + priority support' },
    { id: 3, name: 'Premium',  price: 9999, desc: 'Includes all Standard features + unlimited revisions' },
  ];

  const upd = (k: keyof typeof agency) => (v: string) => setAgency(a => ({ ...a, [k]: v }));

  return (
    <div className="fade-in">
      <Grid2>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 16 }}>Agency Information</div>
            <Input label="Agency Name"   value={agency.name}    onChange={upd('name')}/>
            <Input label="Contact Email" value={agency.email}   onChange={upd('email')} type="email"/>
            <Input label="Phone Number"  value={agency.phone}   onChange={upd('phone')}/>
            <Input label="Website"       value={agency.website} onChange={upd('website')}/>
            <Input label="Address"       value={agency.address} onChange={upd('address')}/>
            <Row>
              <Btn onClick={() => setSaved(true)}><IcCheck sz={13}/>Save Changes</Btn>
              {saved && <span style={{ fontSize: 12, color: T.success }}>Saved!</span>}
            </Row>
          </Card>

          <Card>
            <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 4 }}>Integrations</div>
            <div style={{ fontSize: 12, color: T.textS, marginBottom: 16 }}>API keys for third-party services. Store these securely in environment variables.</div>

            <div style={{ marginBottom: 16, padding: 14, background: T.elevated, borderRadius: 10, border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <IcCard sz={16} col="#00C3F7"/>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.text }}>Paystack</div>
                <Badge col={T.success}>Connected</Badge>
              </div>
              <Input label="Secret Key" value={paystackKey} onChange={setPaystackKey} type="password"/>
              <div style={{ fontSize: 11, color: T.textM }}>Used for: payment processing, subscription management, transaction analytics</div>
            </div>

            <div style={{ padding: 14, background: T.elevated, borderRadius: 10, border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <IcZap sz={16} col={T.warn}/>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.text }}>Resend</div>
                <Badge col={T.success}>Connected</Badge>
              </div>
              <Input label="API Key" value={resendKey} onChange={setResendKey} type="password"/>
              <div style={{ fontSize: 11, color: T.textM }}>Used for: welcome emails, invoice notifications, ticket replies, campaigns</div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 16 }}>Service Plans</div>
            {plans.map(p => (
              <div key={p.id} style={{ padding: 14, borderRadius: 10, background: T.elevated, marginBottom: 10, border: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: T.text }}>{p.name}</div>
                  <Row>
                    <Badge col={T.info}>Monthly</Badge>
                    <span style={{ fontWeight: 700, fontSize: 14, color: T.success }}>{fmt(p.price)}/mo</span>
                  </Row>
                </div>
                <div style={{ fontSize: 12, color: T.textS }}>{p.desc}</div>
              </div>
            ))}
            <Btn sz="sm" variant="outline"><IcPlus sz={13}/>Add Plan</Btn>
          </Card>
        </div>
      </Grid2>
    </div>
  );
}
