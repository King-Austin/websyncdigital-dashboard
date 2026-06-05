'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/theme';
import { Card, Row, Btn, Modal, Textarea } from '@/components/ui';
import { StatusBadge, Avatar } from '@/components/ui';
import { IcZap, IcMsg, IcSend, IcCheck } from '@/components/ui/Icons';

interface TicketMessage {
  id: number;
  from_role: 'client' | 'admin';
  message: string;
  created_at: string;
}

interface TicketRow {
  id: string;
  subject: string;
  site: string;
  status: 'open' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  client_id: string;
  ws_profiles: { name: string; company: string } | null;
  ws_ticket_messages: TicketMessage[];
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive]   = useState<TicketRow | null>(null);
  const [reply, setReply]     = useState('');
  const [filter, setFilter]   = useState<'all' | 'open' | 'resolved'>('all');

  useEffect(() => {
    fetch('/api/tickets').then(r => r.json()).then(d => { setTickets(d); setLoading(false); });
  }, []);

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);
  const counts   = { all: tickets.length, open: tickets.filter(t => t.status === 'open').length, resolved: tickets.filter(t => t.status === 'resolved').length };

  const sendReply = async (t: TicketRow) => {
    await fetch(`/api/tickets/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved', reply, from_role: 'admin' }),
    });
    const now = new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
    const newMsg: TicketMessage = { id: Date.now(), from_role: 'admin', message: reply, created_at: now };
    setTickets(ts => ts.map(tk => tk.id === t.id ? { ...tk, status: 'resolved', ws_ticket_messages: [...tk.ws_ticket_messages, newMsg] } : tk));
    setReply(''); setActive(null);
  };

  const markResolved = async (t: TicketRow) => {
    await fetch(`/api/tickets/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'resolved' }) });
    setTickets(ts => ts.map(tk => tk.id === t.id ? { ...tk, status: 'resolved' } : tk));
    setActive(null);
  };

  if (loading) return <div style={{ color: T.textS, fontSize: 13, padding: 24 }}>Loading tickets…</div>;

  return (
    <div className="fade-in">
      <div style={{ background: 'linear-gradient(135deg,#FFF7ED 0%,#FFEDD5 100%)', border: `1px solid ${T.warn}25`, borderRadius: 10, padding: '11px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
        <IcZap sz={15} col={T.warn}/>
        <span style={{ fontSize: 12, color: T.text }}>
          <strong>Resend is active</strong> — when you reply to a ticket, the client receives an email notification automatically via Resend.
        </span>
      </div>

      <Row style={{ marginBottom: 18 }}>
        {(['all', 'open', 'resolved'] as const).map(v => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${filter===v?T.accent:T.border}`, background: filter===v ? T.accent+'12' : 'transparent', color: filter===v ? T.accent : T.textS, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans' }}>
            {v.charAt(0).toUpperCase() + v.slice(1)} ({counts[v]})
          </button>
        ))}
      </Row>

      {filtered.map(t => (
        <Card key={t.id} style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => { setActive(t); setReply(''); }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Row style={{ marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: T.accent, fontWeight: 700 }}>{t.id}</span>
                <StatusBadge s={t.status}/>
                <StatusBadge s={t.priority}/>
              </Row>
              <div style={{ fontWeight: 600, fontSize: 14, color: T.text, marginBottom: 4 }}>{t.subject}</div>
              <Row>
                <Avatar name={t.ws_profiles?.name || '?'} sz={18}/>
                <span style={{ fontSize: 12, color: T.textS }}>{t.ws_profiles?.name} · {t.site} · {new Date(t.created_at).toLocaleDateString('en-NG')}</span>
              </Row>
            </div>
            <Row style={{ color: T.textM, fontSize: 12 }}>
              <IcMsg sz={13} col={T.textM}/>{t.ws_ticket_messages.length}
            </Row>
          </div>
        </Card>
      ))}

      {tickets.length === 0 && <div style={{ padding: 28, textAlign: 'center', color: T.textS, fontSize: 13 }}>No tickets yet.</div>}

      <Modal open={!!active} onClose={() => setActive(null)} title={active ? `${active.id} — ${active.subject}` : ''} w={580}>
        {active && (
          <>
            <Row style={{ marginBottom: 16 }}>
              <StatusBadge s={active.status}/>
              <StatusBadge s={active.priority}/>
              <Row style={{ marginLeft: 'auto' }}>
                <Avatar name={active.ws_profiles?.name || '?'} sz={22}/>
                <span style={{ fontSize: 12, color: T.textS }}>{active.ws_profiles?.name}</span>
              </Row>
            </Row>
            <div style={{ marginBottom: 16 }}>
              {active.ws_ticket_messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, flexDirection: m.from_role === 'admin' ? 'row-reverse' : 'row' }}>
                  <Avatar name={m.from_role === 'admin' ? 'Websync Admin' : (active.ws_profiles?.name || '?')} sz={32}/>
                  <div style={{ maxWidth: '76%' }}>
                    <div style={{ background: m.from_role === 'admin' ? T.accent + '12' : T.elevated, borderRadius: 10, padding: '10px 14px', border: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 13, color: T.text }}>{m.message}</div>
                    </div>
                    <div style={{ fontSize: 11, color: T.textM, marginTop: 3, textAlign: m.from_role === 'admin' ? 'right' : 'left' }}>
                      {m.from_role === 'admin' ? 'Websync Support' : active.ws_profiles?.name} · {new Date(m.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {active.status === 'open' && (
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
                <Textarea value={reply} onChange={setReply} placeholder="Type your reply to the client…" rows={3}/>
                <Row>
                  <Btn disabled={!reply} onClick={() => sendReply(active)}><IcSend sz={13}/>Send &amp; Resolve</Btn>
                  <Btn variant="outline" onClick={() => markResolved(active)}><IcCheck sz={13}/>Mark Resolved</Btn>
                  <span style={{ fontSize: 11, color: T.textM, marginLeft: 'auto' }}>Email sent via Resend</span>
                </Row>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
