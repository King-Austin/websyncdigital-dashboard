'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { T } from '@/lib/theme';
import { ThemeProvider } from '@/lib/ThemeProvider';
import { Sidebar, PageHeader, NavItem } from '@/components/layout/Sidebar';
import { BottomNav, BottomTab } from '@/components/layout/BottomNav';
import { IcHome, IcGlobe, IcBar, IcBell, IcBriefcase, IcCog, IcPlus } from '@/components/ui/Icons';

const CLIENT_TABS: BottomTab[] = [
  { k: '/client',          label: 'Home',     icon: <IcHome /> },
  { k: '/client/projects', label: 'Projects', icon: <IcBriefcase /> },
  { k: '/client/websites', label: 'Sites',    icon: <IcGlobe /> },
  { k: '/client/notifications', label: 'Alerts', icon: <IcBell />, badge: true },
];

const CLIENT_NAV: NavItem[] = [
  { k: '/client',              label: 'Overview',           icon: <IcHome /> },
  { k: '/client/projects',     label: 'My Projects',        icon: <IcBriefcase /> },
  { k: '/client/websites',     label: 'My Websites',        icon: <IcGlobe /> },
  { k: '/client/metrics',      label: 'Metrics',            icon: <IcBar /> },
  { k: 'd1', divider: true },
  { k: '/client/notifications', label: 'Notifications',     icon: <IcBell /> },
  { k: '/client/settings',      label: 'Settings',          icon: <IcCog /> },
];

const PAGE_META: Record<string, { title: string; sub: string }> = {
  '/client':               { title: 'Dashboard',          sub: 'Welcome back' },
  '/client/projects':      { title: 'My Projects',        sub: 'Create a project and submit your brief' },
  '/client/websites':      { title: 'My Websites',        sub: 'Your active sites' },
  '/client/metrics':       { title: 'Website Metrics',    sub: 'Traffic, SEO and performance' },
  '/client/billing':       { title: 'Billing',            sub: 'Manage your subscriptions and payments' },
  '/client/notifications': { title: 'Notifications',      sub: 'Your recent alerts' },
  '/client/settings':      { title: 'Settings',           sub: 'Manage your profile and account' },
};

interface Props {
  children: React.ReactNode;
  user: { id: string; email?: string };
  profile: { name?: string; role?: string } | null;
}

export default function ClientDashboardWrapper({ children, user, profile }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const meta     = PAGE_META[pathname] || { title: 'Dashboard', sub: '' };
  const [open, setOpen] = useState(false);

  const handleSelect = (k: string) => { router.push(k); setOpen(false); };

  return (
    <ThemeProvider>
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
      <style>{`
        @media (max-width: 768px) {
          .ws-sidebar { transform: translateX(-100%); transition: transform 0.25s; }
          .ws-sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(12,26,46,0.15); }
          .ws-main { margin-left: 0 !important; }
          .ws-overlay { display: block !important; }
          .ws-menu-btn { display: flex !important; }
          /* clear the fixed bottom nav so content isn't hidden behind it */
          .ws-main-content { padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)) !important; }
        }
      `}</style>

      {open && (
        <div className="ws-overlay" onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(12,26,46,0.4)', zIndex: 199, backdropFilter: 'blur(2px)' }}/>
      )}

      <Sidebar
        items={CLIENT_NAV}
        active={pathname}
        onSelect={handleSelect}
        role="client"
        userName={profile?.name || user.email}
        userEmail={user.email}
        open={open}
      />

      <div className="ws-main" style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>
        <PageHeader title={meta.title} sub={meta.sub} onMenuClick={() => setOpen(o => !o)} actions={
          <>
            <Link href="/client/notifications" style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: T.elevated, border: `1px solid ${T.border}`, cursor: 'pointer', textDecoration: 'none', flexShrink: 0 }}>
              <IcBell sz={16} col={T.textS} />
              <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: T.accent }} />
            </Link>
            {/* Only admins (browsing the client view) see the way back. Real clients never do. */}
            {profile?.role === 'admin' && (
              <Link href="/admin" style={{ padding: '6px 14px', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textS, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-app)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Admin View →
              </Link>
            )}
          </>
        }/>
        <main className="ws-main-content" style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <BottomNav
        tabs={CLIENT_TABS}
        root="/client"
        fab={{ label: 'New project', icon: <IcPlus />, href: '/client/projects?new=1' }}
      />
    </div>
    </ThemeProvider>
  );
}
