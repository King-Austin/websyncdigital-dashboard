'use client';

import { useEffect, useState } from 'react';
import { T } from '@/lib/theme';
import { Card, Btn, Row } from '@/components/ui';
import { IcFile, IcCal, IcBell, IcCheck } from '@/components/ui/Icons';
import { createClient } from '@/lib/supabase/client';

interface Notif {
  id: number;
  type: string | null;
  message: string | null;
  read: boolean;
  created_at: string;
}

export default function ClientNotifications() {
  const [notifs, setNotifs]   = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // RLS scopes this to the signed-in client's own notifications.
      const { data } = await supabase
        .from('ws_notifications')
        .select('id, type, message, read, created_at')
        .order('created_at', { ascending: false });

      setNotifs(data ?? []);
      setLoading(false);
    })();
  }, []);

  const typeIcon = (type: string | null) => {
    if (type === 'billing') return <IcFile sz={14} col={T.warn}/>;
    if (type === 'domain')  return <IcCal sz={14} col={T.info}/>;
    return <IcBell sz={14} col={T.textS}/>;
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const markOne = async (id: number) => {
    setNotifs(ns => ns.map(x => x.id === id ? { ...x, read: true } : x));
    const supabase = createClient();
    await supabase.from('ws_notifications').update({ read: true }).eq('id', id);
  };

  const markAll = async () => {
    const ids = notifs.filter(n => !n.read).map(n => n.id);
    if (ids.length === 0) return;
    setNotifs(ns => ns.map(n => ({ ...n, read: true })));
    const supabase = createClient();
    await supabase.from('ws_notifications').update({ read: true }).in('id', ids);
  };

  if (loading) return <div style={{ color: T.textS, fontSize: 13, padding: 24 }}>Loading notifications…</div>;

  return (
    <div className="fade-in">
      <Row style={{ justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: T.textS }}>{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        {unread > 0 && (
          <Btn sz="sm" variant="ghost" onClick={markAll}>
            <IcCheck sz={13}/>Mark all read
          </Btn>
        )}
      </Row>

      {notifs.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: T.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <IcBell sz={22} col={T.textM}/>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>No notifications yet</div>
          <div style={{ fontSize: 13, color: T.textS }}>You&apos;ll see payment confirmations, invoices and updates here.</div>
        </Card>
      ) : (
        <Card>
          {notifs.map((n, i) => (
            <div key={n.id}
              onClick={() => !n.read && markOne(n.id)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 0', borderBottom: i < notifs.length - 1 ? `1px solid ${T.border}` : 'none', cursor: n.read ? 'default' : 'pointer', opacity: n.read ? 0.5 : 1, transition: 'opacity 0.2s' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: T.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', border: `1px solid ${T.border}` }}>
                {typeIcon(n.type)}
                {!n.read && <span style={{ position: 'absolute', top: 3, right: 3, width: 6, height: 6, borderRadius: '50%', background: T.accent, border: `1.5px solid ${T.card}` }}/>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: T.text, fontWeight: n.read ? 400 : 500 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: T.textM, marginTop: 3 }}>{timeAgo(n.created_at)}</div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
