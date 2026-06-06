'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { T } from '@/lib/theme';
import { ThemeProvider } from '@/lib/ThemeProvider';
import { Sidebar, PageHeader, NavItem } from '@/components/layout/Sidebar';
import { IcHome, IcGlobe, IcBar, IcFile, IcCard, IcBell, IcBriefcase } from '@/components/ui/Icons';

const CLIENT_NAV: NavItem[] = [
  { k: '/client',              label: 'Overview',           icon: <IcHome /> },
  { k: '/client/projects',     label: 'My Projects',        icon: <IcBriefcase /> },
  { k: '/client/websites',     label: 'My Websites',        icon: <IcGlobe /> },
  { k: '/client/metrics',      label: 'Metrics',            icon: <IcBar /> },
  { k: 'd1', divider: true },
  { k: '/client/billing',      label: 'Billing & Invoices', icon: <IcFile /> },
  { k: '/client/subscription', label: 'Subscription',       icon: <IcCard /> },
  { k: 'd2', divider: true },
  { k: '/client/notifications', label: 'Notifications',     icon: <IcBell />, badge: 2 },
];

const PAGE_META: Record<string, { title: string; sub: string }> = {
  '/client':               { title: 'Dashboard',          sub: 'Welcome back' },
  '/client/projects':      { title: 'My Projects',        sub: 'Create a project and submit your brief' },
  '/client/websites':      { title: 'My Websites',        sub: 'Your active sites' },
  '/client/metrics':       { title: 'Website Metrics',    sub: 'Traffic, SEO and performance' },
  '/client/billing':       { title: 'Billing & Invoices', sub: '₦9,999/month retainer' },
  '/client/subscription':  { title: 'Subscription',       sub: 'Manage your Websync plan' },
  '/client/notifications': { title: 'Notifications',      sub: 'Your recent alerts' },
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
            <Link href="/admin" style={{ padding: '6px 14px', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textS, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Admin View →
            </Link>
          </>
        }/>
        <main style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
    </ThemeProvider>
  );
}
