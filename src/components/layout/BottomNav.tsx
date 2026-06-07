'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { T } from '@/lib/theme';

export interface BottomTab {
  k: string;                 // route to navigate to
  label: string;
  icon: React.ReactElement;
  badge?: boolean;
}

export interface BottomFab {
  label: string;
  icon: React.ReactElement;
  href: string;
}

interface BottomNavProps {
  tabs: BottomTab[];
  /** Route treated as an exact-match root (e.g. '/client' or '/admin'). */
  root: string;
  /** Optional center floating action button (placed between left/right halves). */
  fab?: BottomFab;
}

function isActive(pathname: string, k: string, root: string) {
  return k === root ? pathname === root : pathname.startsWith(k);
}

export const BottomNav = ({ tabs, root, fab }: BottomNavProps) => {
  const pathname = usePathname();
  const router   = useRouter();

  const TabBtn = ({ tab }: { tab: BottomTab }) => {
    const active = isActive(pathname, tab.k, root);
    const col = active ? T.accent : T.textM;
    return (
      <button onClick={() => router.push(tab.k)} aria-label={tab.label} style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', position: 'relative',
        fontFamily: 'inherit', minWidth: 0,
      }}>
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          {React.cloneElement(tab.icon, { sz: 21, col } as { sz: number; col: string })}
          {tab.badge && (
            <span style={{ position: 'absolute', top: -1, right: -3, width: 7, height: 7, borderRadius: '50%', background: T.danger, border: `1.5px solid ${T.sidebar}` }} />
          )}
        </span>
        <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500, color: col, letterSpacing: '0.2px', whiteSpace: 'nowrap' }}>{tab.label}</span>
      </button>
    );
  };

  // With a FAB, split the tabs into two halves around the center button.
  const mid   = fab ? Math.ceil(tabs.length / 2) : tabs.length;
  const left  = tabs.slice(0, mid);
  const right = fab ? tabs.slice(mid) : [];

  return (
    <nav className="ws-bottomnav" aria-label="Primary">
      <style>{`
        .ws-bottomnav { display: none; }
        @media (max-width: 768px) {
          .ws-bottomnav {
            display: flex;
            position: fixed; left: 0; right: 0; bottom: 0; z-index: 180;
            height: calc(62px + env(safe-area-inset-bottom, 0px));
            padding-bottom: env(safe-area-inset-bottom, 0px);
            background: var(--ws-sidebar);
            border-top: 1px solid var(--ws-border);
            box-shadow: 0 -4px 18px rgba(20,19,16,0.06);
            align-items: stretch;
          }
        }
        .ws-fab-wrap { flex: 0 0 64px; display: flex; align-items: flex-start; justify-content: center; }
        .ws-fab {
          margin-top: -22px;
          width: 56px; height: 56px; border-radius: 50%;
          background: ${T.accent}; border: 4px solid var(--ws-sidebar);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; box-shadow: 0 6px 16px ${T.accent}55;
          transition: transform 0.15s ease;
        }
        .ws-fab:active { transform: scale(0.92); }
      `}</style>

      {left.map(t => <TabBtn key={t.k} tab={t} />)}

      {fab && (
        <div className="ws-fab-wrap">
          <button className="ws-fab" aria-label={fab.label} onClick={() => router.push(fab.href)}>
            {React.cloneElement(fab.icon, { sz: 24, col: '#fff' } as { sz: number; col: string })}
          </button>
        </div>
      )}

      {right.map(t => <TabBtn key={t.k} tab={t} />)}
    </nav>
  );
};
