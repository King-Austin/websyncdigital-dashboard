'use client';

import { useState } from 'react';
import { T } from '@/lib/theme';
import { Card, Btn, Row } from '@/components/ui';
import { IcFile, IcCal, IcBell, IcCheck } from '@/components/ui/Icons';

interface Notif { id: number; type: string; text: string; time: string; read: boolean; }

const INITIAL: Notif[] = [
  { id:1, type:'billing', text:'Invoice INV-005 (₦9,999) is due in 7 days',        time:'2 hours ago', read:false },
  { id:2, type:'domain',  text:'Domain amakasbakery.com.ng expires in 73 days',     time:'1 day ago',   read:false },
  { id:3, type:'system',  text:'Your website was updated successfully by our team', time:'3 days ago',  read:true  },
  { id:4, type:'system',  text:'Scheduled maintenance completed — all sites live',  time:'5 days ago',  read:true  },
];

export default function ClientNotifications() {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL);
  const unread = notifs.filter(n => !n.read).length;

  const typeIcon = (type: string) => {
    if (type === 'billing') return <IcFile sz={14} col={T.warn}/>;
    if (type === 'domain')  return <IcCal sz={14} col={T.info}/>;
    return <IcBell sz={14} col={T.textS}/>;
  };

  return (
    <div className="fade-in">
      <Row style={{ justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: T.textS }}>{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        {unread > 0 && (
          <Btn sz="sm" variant="ghost" onClick={() => setNotifs(ns => ns.map(n => ({ ...n, read: true })))}>
            <IcCheck sz={13}/>Mark all read
          </Btn>
        )}
      </Row>
      <Card>
        {notifs.map((n, i) => (
          <div key={n.id}
            onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 0', borderBottom: i < notifs.length - 1 ? `1px solid ${T.border}` : 'none', cursor: 'pointer', opacity: n.read ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', border: `1px solid ${T.border}` }}>
              {typeIcon(n.type)}
              {!n.read && <span style={{ position: 'absolute', top: 3, right: 3, width: 6, height: 6, borderRadius: '50%', background: T.accent, border: `1.5px solid ${T.card}` }}/>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: T.text, fontWeight: n.read ? 400 : 500 }}>{n.text}</div>
              <div style={{ fontSize: 11, color: T.textM, marginTop: 3 }}>{n.time}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
