'use client';

import React from 'react';
import { T } from '@/lib/theme';
import { Avatar } from '@/components/ui';
import { IcShield } from '@/components/ui/Icons';

export const WsLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 2px 8px ${T.accent}50` }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 12L7.5 20L12 9L16.5 20L21 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <div>
      <div style={{ fontWeight: 800, fontSize: 15, color: T.text, letterSpacing: '-0.3px', lineHeight: 1.2 }}>Websync</div>
      <div style={{ fontWeight: 500, fontSize: 10, color: T.textM, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Digital</div>
    </div>
  </div>
);

export interface NavItem {
  k: string;
  label?: string;
  icon?: React.ReactElement;
  badge?: number;
  divider?: boolean;
}

interface SidebarProps {
  items: NavItem[];
  active: string;
  onSelect: (k: string) => void;
  role: 'client' | 'admin';
  userName?: string;
  userEmail?: string;
}

export const Sidebar = ({ items, active, onSelect, role, userName, userEmail }: SidebarProps) => (
  <aside style={{ width: 240, background: T.sidebar, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0, overflowY: 'auto' }}>
    <div style={{ padding: '22px 20px 16px', borderBottom: `1px solid ${T.border}` }}>
      <WsLogo />
      {role === 'admin' && (
        <div style={{ marginTop: 10, padding: '4px 9px', background: T.accent + '15', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <IcShield sz={11} col={T.accent} />
          <span style={{ fontSize: 11, color: T.accent, fontWeight: 600, letterSpacing: '0.3px' }}>Admin Panel</span>
        </div>
      )}
    </div>
    <nav style={{ flex: 1, padding: '10px 10px' }}>
      {items.map(item => item.divider
        ? <div key={item.k} style={{ height: 1, background: T.border, margin: '6px 8px' }} />
        : (
          <button key={item.k} onClick={() => onSelect(item.k)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9,
            background: active === item.k ? T.accent + '12' : 'transparent',
            color: active === item.k ? T.accent : T.textS,
            border: active === item.k ? `1px solid ${T.accent}25` : '1px solid transparent',
            cursor: 'pointer', fontSize: 13, fontWeight: active === item.k ? 600 : 400, textAlign: 'left',
            fontFamily: 'Plus Jakarta Sans', marginBottom: 2, transition: 'all 0.12s',
          }}>
            {item.icon && React.cloneElement(item.icon, { sz: 16, col: active === item.k ? T.accent : T.textM } as any)}
            <span style={{ flex: 1 }}>{item.label}</span>
            {(item.badge || 0) > 0 && (
              <span style={{ background: T.danger, color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20, minWidth: 18, textAlign: 'center' }}>{item.badge}</span>
            )}
          </button>
        )
      )}
    </nav>
    <div style={{ padding: '12px 10px', borderTop: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: T.elevated }}>
        <Avatar name={userName || (role === 'admin' ? 'Websync Admin' : 'Client')} sz={32} />
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName || (role === 'admin' ? 'Super Admin' : 'Client')}</div>
          <div style={{ fontSize: 10, color: T.textM, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail || (role === 'admin' ? 'admin@websync.ng' : '')}</div>
        </div>
      </div>
    </div>
  </aside>
);

export const PageHeader = ({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) => (
  <header style={{ padding: '0 28px', height: 62, borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.sidebar, position: 'sticky', top: 0, zIndex: 100, flexShrink: 0 }}>
    <div>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: '-0.3px' }}>{title}</h1>
      {sub && <div style={{ fontSize: 12, color: T.textS, marginTop: 1 }}>{sub}</div>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{actions}</div>
  </header>
);
