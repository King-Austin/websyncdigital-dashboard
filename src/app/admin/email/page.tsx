'use client';

import { useState, useEffect, useCallback } from 'react';
import { T } from '@/lib/theme';
import { EMAIL_TEMPLATES, type EmailTemplate } from '@/lib/emailTemplates';
import { Card, Grid2, Row, Btn, Sel, Input, Textarea, SectionTitle } from '@/components/ui';
import { Badge } from '@/components/ui';
import { IcZap, IcSend, IcEdit, IcCheck } from '@/components/ui/Icons';

type Tab = 'compose' | 'templates' | 'history';

interface ClientRow { id: string; name: string; company: string | null; email: string | null; }

interface EmailLogRow {
  id: string;
  subject: string;
  recipient: string;
  recipients: number;
  sent: number;
  failed: number;
  status: 'sent' | 'partial' | 'failed';
  kind: string;
  created_at: string;
}

const STATUS_COL: Record<string, string> = { sent: T.success, partial: T.warn, failed: T.danger };

export default function AdminEmail() {
  const [to, setTo]     = useState('all');
  const [subj, setSubj] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState<{ sent: number; recipients: number } | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab]   = useState<Tab>('compose');
  const [loading, setLoading] = useState(false);

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [history, setHistory] = useState<EmailLogRow[]>([]);

  const loadHistory = useCallback(() => {
    fetch('/api/email/history').then(r => r.ok ? r.json() : []).then(d => setHistory(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/clients').then(r => r.ok ? r.json() : []).then(d => setClients(Array.isArray(d) ? d : [])).catch(() => {});
    loadHistory();
  }, [loadHistory]);

  const applyTemplate = (tmpl: EmailTemplate) => { setSubj(tmpl.subject); setBody(tmpl.body); setSent(null); setError(''); setTab('compose'); };
  const recipientName = to === 'all' ? 'all clients' : (clients.find(c => c.id === to)?.name || '');

  async function handleSend() {
    if (!subj || !body) return;
    setLoading(true);
    setError('');
    setSent(null);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject: subj, body, recipientName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not send the email.');
      } else {
        setSent({ sent: data.sent, recipients: data.recipients });
        loadHistory();
      }
    } catch {
      setError('Something went wrong while sending.');
    }
    setLoading(false);
  }

  const fmtDate = (s: string) => new Date(s).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

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
          <div style={{ fontSize: 11, color: T.textM }}>{clients.length} client{clients.length === 1 ? '' : 's'}</div>
          <div style={{ fontSize: 11, color: T.textM }}>{history.length} send{history.length === 1 ? '' : 's'} logged</div>
        </div>
      </div>

      <Row style={{ marginBottom: 20, gap: 0, background: T.elevated, borderRadius: 10, padding: 4, display: 'inline-flex', border: `1px solid ${T.border}` }}>
        {(['compose', 'templates', 'history'] as const).map(v => {
          const labels: Record<Tab, string> = { compose: 'Compose', templates: 'Auto Templates', history: 'Send History' };
          return (
            <button key={v} onClick={() => setTab(v)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: tab === v ? T.card : 'transparent', color: tab === v ? T.text : T.textS, fontSize: 12, fontWeight: tab === v ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font-app)', boxShadow: tab === v ? '0 1px 3px rgba(12,26,46,0.08)' : 'none', transition: 'all 0.15s' }}>
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
                  <button key={t.id} onClick={() => applyTemplate(t)} style={{ padding: '5px 12px', border: `1px solid ${T.border}`, borderRadius: 20, background: T.elevated, color: T.textS, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-app)', fontWeight: 500 }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <Sel label="Send To" value={to} onChange={v => { setTo(v); setSent(null); setError(''); }}
              opts={[{ v: 'all', l: `All Clients (${clients.length})` }, ...clients.map(c => ({ v: c.id, l: `${c.name}${c.company ? ' — ' + c.company : ''}` }))]} />
            <Input label="Subject" value={subj} onChange={v => { setSubj(v); setSent(null); }} placeholder="Email subject line" required/>
            <Textarea label="Message" value={body} onChange={v => { setBody(v); setSent(null); }} placeholder="Write your message… Use {name} for personalisation." rows={7}/>
            <Row style={{ justifyContent: 'flex-end' }}>
              <Btn variant="outline" onClick={() => { setSubj(''); setBody(''); setSent(null); setError(''); }}>Clear</Btn>
              <Btn disabled={!subj || !body || loading} onClick={handleSend}><IcSend sz={13}/>{loading ? 'Sending…' : 'Send via Resend'}</Btn>
            </Row>
            {sent && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: T.success + '12', border: `1px solid ${T.success}30`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <IcCheck sz={14} col={T.success}/>
                <span style={{ fontSize: 13, color: T.success }}>Sent to <strong>{sent.sent}</strong> of {sent.recipients} recipient{sent.recipients === 1 ? '' : 's'} via Resend</span>
              </div>
            )}
            {error && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: T.danger + '10', border: `1px solid ${T.danger}30`, borderRadius: 8, fontSize: 13, color: T.danger }}>{error}</div>
            )}
          </Card>
          <Card>
            <SectionTitle>Recent Sends</SectionTitle>
            {history.length === 0
              ? <div style={{ fontSize: 13, color: T.textS, padding: '12px 0' }}>No emails sent yet.</div>
              : history.slice(0, 6).map((h, i) => (
                <div key={h.id} style={{ padding: '12px 0', borderBottom: i < Math.min(history.length, 6) - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text, flex: 1 }}>{h.subject}</div>
                    <Badge col={STATUS_COL[h.status] || T.textS}>{h.status === 'sent' ? 'Delivered' : h.status === 'partial' ? 'Partial' : 'Failed'}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: T.textS }}>To: {h.recipient} · {fmtDate(h.created_at)} · {h.sent}/{h.recipients} sent</div>
                </div>
              ))
            }
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
                <div style={{ fontSize: 12, color: T.textS, marginBottom: 12 }}>Subject: <em>{t.subject}</em></div>
                <Btn sz="sm" variant="outline" onClick={() => applyTemplate(t)}><IcEdit sz={12}/>Use Template</Btn>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <Card style={{ padding: 0 }}>
          {history.length === 0
            ? <div style={{ padding: 28, textAlign: 'center', color: T.textS, fontSize: 13 }}>No emails have been sent yet.</div>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Subject', 'Recipient', 'Date', 'Sent', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '11px 16px', fontSize: 11, color: T.textM, fontWeight: 600, borderBottom: `1px solid ${T.border}`, textTransform: 'uppercase', letterSpacing: '0.5px', background: T.elevated }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={h.id} style={{ borderBottom: i < history.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: T.text }}>{h.subject}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: T.textS }}>{h.recipient}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: T.textS }}>{fmtDate(h.created_at)}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: T.accent }}>{h.sent}/{h.recipients}</td>
                      <td style={{ padding: '13px 16px' }}><Badge col={STATUS_COL[h.status] || T.textS}>{h.status === 'sent' ? 'Delivered' : h.status === 'partial' ? 'Partial' : 'Failed'}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </Card>
      )}
    </div>
  );
}
