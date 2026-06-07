'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { T } from '@/lib/theme';
import { Avatar } from '@/components/ui';
import { IcShield } from '@/components/ui/Icons';
import { useTheme } from '@/lib/ThemeProvider';
import { createClient } from '@/lib/supabase/client';

const LogoutButton = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button onClick={logout} disabled={loading} aria-label="Log out" style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
      borderRadius: 9, background: 'transparent', border: `1px solid ${T.border}`,
      cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 500,
      color: T.danger, fontFamily: 'var(--font-app)', marginTop: 8, transition: 'all 0.12s',
      opacity: loading ? 0.6 : 1,
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.danger} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      <span style={{ flex: 1, textAlign: 'left' }}>{loading ? 'Signing out…' : 'Log out'}</span>
    </button>
  );
};

const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button onClick={toggle} aria-label="Toggle theme" style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
      borderRadius: 9, background: 'transparent', border: `1px solid ${T.border}`,
      cursor: 'pointer', fontSize: 13, fontWeight: 500, color: T.textS,
      fontFamily: 'var(--font-app)', marginBottom: 8, transition: 'all 0.12s',
    }}>
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B728E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
      <span style={{ flex: 1, textAlign: 'left' }}>{dark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
};

export const WsLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size brand mark from /public, no optimization needed */}
    <img src="/websync-logo.png" alt="Websync Digital" width={36} height={36} style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, objectFit: 'cover', display: 'block' }} />
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
  open?: boolean;
}

export const Sidebar = ({ items, active, onSelect, role, userName, userEmail, open }: SidebarProps) => (
  <aside className={`ws-sidebar${open ? ' open' : ''}`} style={{ width: 240, background: T.sidebar, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0, overflowY: 'auto', zIndex: 200 }}>
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
            fontFamily: 'var(--font-app)', marginBottom: 2, transition: 'all 0.12s',
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
      <ThemeToggle />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: T.elevated }}>
        <Avatar name={userName || (role === 'admin' ? 'Websync Admin' : 'Client')} sz={32} />
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName || (role === 'admin' ? 'Super Admin' : 'Client')}</div>
          <div style={{ fontSize: 10, color: T.textM, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail || (role === 'admin' ? 'admin@websync.ng' : '')}</div>
        </div>
      </div>
      <LogoutButton />
    </div>
  </aside>
);

export const PageHeader = ({ title, sub, actions, onMenuClick }: { title: string; sub?: string; actions?: React.ReactNode; onMenuClick?: () => void }) => (
  <header style={{ padding: '0 20px', height: 62, borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.sidebar, position: 'sticky', top: 0, zIndex: 100, flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {onMenuClick && (
        <button onClick={onMenuClick} className="ws-menu-btn" style={{ display: 'none', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 8px', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textS} strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}
      <div>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: '-0.3px' }}>{title}</h1>
        {sub && <div style={{ fontSize: 12, color: T.textS, marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{actions}</div>
  </header>
);
