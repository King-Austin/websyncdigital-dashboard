'use client';

import { useState } from 'react';
import { T } from '@/lib/theme';
import { CLIENTS_DATA, EMAIL_TEMPLATES } from '@/lib/data';
import { Card, Grid2, Row, Btn, Sel, Input, Textarea, SectionTitle } from '@/components/ui';
import { Badge } from '@/components/ui';
import { IcZap, IcSend, IcEdit, IcCheck } from '@/components/ui/Icons';

type Tab = 'compose' | 'templates' | 'history';

const HISTORY = [
  { id: 1, to: 'All Clients',   subj: 'June Newsletter — Website Performance Tips', date: 'May 28, 2026', opens: 3 },
  { id: 2, to: 'Amaka Okonkwo', subj: 'Reminder: Invoice INV-005 Payment Due',      date: 'Jun 01, 2026', opens: 1 },
  { id: 3, to: 'Adaobi Bright', subj: 'Welcome to Websync Digital!',                date: 'Nov 12, 2024', opens: 2 },
];

export default function AdminEmail() {
  const [to, setTo]     = useState('all');
  const [subj, setSubj] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);
  const [tab, setTab]   = useState<Tab>('compose');
  const [loading, setLoading] = useState(false);

  const applyTemplate = (tmpl: typeof EMAIL_TEMPLATES[0]) => { setSubj(tmpl.subj); setBody(tmpl.body); setSent(false); setTab('compose'); };
  const recipientName = to === 'all' ? 'all clients' : (CLIENTS_DATA.find(c => String(c.id) === String(to))?.name || '');

  async function handleSend() {
    if (!subj || !body) return;
    setLoading(true);
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject: subj, body, recipientName }),
      });
      setSent(true);
    } catch {}
    setLoading(false);
  }

  return (
    <div className="fade-in">
      <div style={{ background: 'linear-gradient(135deg,#FFF7F0 0%,#FFF0E6 100%)', border: `1px solid ${T.warn}25`, borderRadius: 14, padding: '16px 20px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: T.warn + '14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcZap sz={22} col={T.warn}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Email powered by Resend</div>
          <div style={{ fontSize: 12, color: T.textS }}>All transactional and manual emails are sent via Resend — welcome, invoices, ticket updates, and campaigns.</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: T.success, fontWeight: 600 }}>● Connected</div>
          <div style={{ fontSize: 11, color: T.textM }}>94% delivery rate</div>
        </div>
      </div>

      <Row style={{ marginBottom: 20, gap: 0, background: T.elevated, borderRadius: 10, padding: 4, display: 'inline-flex', border: `1px solid ${T.border}` }}>
        {(['compose', 'templates', 'history'] as const).map(v => {
          const labels: Record<Tab, string> = { compose: 'Compose', templates: 'Auto Templates', history: 'Send History' };
          return (
            <button key={v} onClick={() => setTab(v)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: tab === v ? T.card : 'transparent', color: tab === v ? T.text : T.textS, fontSize: 12, fontWeight: tab === v ? 600 : 400, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans', boxShadow: tab === v ? '0 1px 3px rgba(12,26,46,0.08)' : 'none', transition: 'all 0.15s' }}>
              {labels[v]}
            </button>
          );
        })}
      </Row>

      {tab === 'compose' && (
        <Grid2>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 16 }}>Compose Email</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: T.textS, marginBottom: 6, fontWeight: 600 }}>Quick Templates</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {EMAIL_TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => applyTemplate(t)} style={{ padding: '5px 12px', border: `1px solid ${T.border}`, borderRadius: 20, background: T.elevated, color: T.textS, fontSize: 12, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans', fontWeight: 500 }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <Sel label="Send To" value={to} onChange={v => { setTo(v); setSent(false); }} opts={[{v:'all',l:'All Clients'}, ...CLIENTS_DATA.map(c => ({v:String(c.id),l:`${c.name} — ${c.company}`}))]}/>
            <Input label="Subject" value={subj} onChange={v => { setSubj(v); setSent(false); }} placeholder="Email subject line" required/>
            <Textarea label="Message" value={body} onChange={v => { setBody(v); setSent(false); }} placeholder="Write your message… Use {name} for personalisation." rows={7}/>
            <Row style={{ justifyContent: 'flex-end' }}>
              <Btn variant="outline" onClick={() => { setSubj(''); setBody(''); setSent(false); }}>Clear</Btn>
              <Btn disabled={!subj || !body || loading} onClick={handleSend}><IcSend sz={13}/>{loading ? 'Sending…' : 'Send via Resend'}</Btn>
            </Row>
            {sent && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: T.success + '12', border: `1px solid ${T.success}30`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <IcCheck sz={14} col={T.success}/>
                <span style={{ fontSize: 13, color: T.success }}>Email sent to <strong>{recipientName}</strong> via Resend</span>
              </div>
            )}
          </Card>
          <Card>
            <SectionTitle>Send History</SectionTitle>
            {HISTORY.map((h, i) => (
              <div key={h.id} style={{ padding: '12px 0', borderBottom: i < HISTORY.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, flex: 1, paddingRight: 8 }}>{h.subj}</div>
                  <Badge col={T.success}>Delivered</Badge>
                </div>
                <div style={{ fontSize: 12, color: T.textS }}>To: {h.to} · {h.date} · {h.opens} opens</div>
              </div>
            ))}
          </Card>
        </Grid2>
      )}

      {tab === 'templates' && (
        <div>
          <p style={{ fontSize: 13, color: T.textS, marginBottom: 18 }}>These emails are sent automatically by Resend when certain events occur in Websync.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {EMAIL_TEMPLATES.map(t => (
              <Card key={t.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{t.label}</div>
                  <Badge col={t.auto ? T.success : T.textS}>{t.auto ? 'Auto' : 'Manual'}</Badge>
                </div>
                <div style={{ fontSize: 12, color: T.textS, marginBottom: 8 }}>Trigger: <strong style={{ color: T.text }}>{t.trigger}</strong></div>
                <div style={{ fontSize: 12, color: T.textS, marginBottom: 12 }}>Subject: <em>{t.subj}</em></div>
                <Btn sz="sm" variant="outline" onClick={() => applyTemplate(t)}><IcEdit sz={12}/>Edit Template</Btn>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <Card style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Subject', 'Recipient', 'Date', 'Opens', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '11px 16px', fontSize: 11, color: T.textM, fontWeight: 600, borderBottom: `1px solid ${T.border}`, textTransform: 'uppercase', letterSpacing: '0.5px', background: T.elevated }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HISTORY.map((h, i) => (
                <tr key={h.id} style={{ borderBottom: i < HISTORY.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: T.text }}>{h.subj}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: T.textS }}>{h.to}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: T.textS }}>{h.date}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: T.accent }}>{h.opens}</td>
                  <td style={{ padding: '13px 16px' }}><Badge col={T.success}>Delivered</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
