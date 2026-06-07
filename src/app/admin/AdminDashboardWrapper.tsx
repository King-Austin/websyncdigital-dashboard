'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { T } from '@/lib/theme';
import { ThemeProvider } from '@/lib/ThemeProvider';
import { Sidebar, PageHeader, NavItem } from '@/components/layout/Sidebar';
import { BottomNav, BottomTab } from '@/components/layout/BottomNav';
import { IcHome, IcGlobe, IcBar, IcUsers, IcBriefcase, IcDollar, IcMsg, IcMail, IcCog, IcBell } from '@/components/ui/Icons';

const ADMIN_TABS: BottomTab[] = [
  { k: '/admin',          label: 'Overview', icon: <IcHome /> },
  { k: '/admin/clients',  label: 'Clients',  icon: <IcUsers /> },
  { k: '/admin/projects', label: 'Projects', icon: <IcBriefcase /> },
  { k: '/admin/revenue',  label: 'Revenue',  icon: <IcDollar /> },
  { k: '/admin/tickets',  label: 'Tickets',  icon: <IcMsg /> },
];

const ADMIN_NAV: NavItem[] = [
  { k: '/admin',           label: 'Overview',        icon: <IcHome /> },
  { k: '/admin/clients',   label: 'Clients',         icon: <IcUsers /> },
  { k: '/admin/projects',  label: 'Projects',        icon: <IcBriefcase /> },
  { k: '/admin/websites',  label: 'Websites',        icon: <IcGlobe /> },
  { k: '/admin/portfolio', label: 'Portfolio',       icon: <IcBriefcase /> },
  { k: 'd1', divider: true },
  { k: '/admin/revenue',   label: 'Revenue',         icon: <IcDollar /> },
  { k: '/admin/tickets',   label: 'Support Tickets', icon: <IcMsg />, badge: 2 },
  { k: '/admin/email',     label: 'Email Outreach',  icon: <IcMail /> },
  { k: 'd2', divider: true },
  { k: '/admin/settings',  label: 'Settings',        icon: <IcCog /> },
];

const PAGE_META: Record<string, { title: string; sub: string }> = {
  '/admin':           { title: 'Admin Overview',       sub: 'Websync Digital — Jun 2026' },
  '/admin/clients':   { title: 'Client Management',    sub: 'Add, edit and manage all clients' },
  '/admin/projects':  { title: 'Projects & Briefs',    sub: 'Submitted briefs, active subscriptions' },
  '/admin/websites':  { title: 'Website Management',   sub: 'All client websites and projects' },
  '/admin/portfolio': { title: 'Portfolio',            sub: 'Public and internal project showcase' },
  '/admin/revenue':   { title: 'Revenue Tracker',      sub: 'MRR, ARR and Paystack analytics' },
  '/admin/tickets':   { title: 'Support Tickets',      sub: 'Respond to client support requests' },
  '/admin/email':     { title: 'Email Outreach',       sub: 'Send emails via Resend' },
  '/admin/settings':  { title: 'Settings',             sub: 'Agency info, service plans, integrations' },
};

interface Props {
  children: React.ReactNode;
  user: { id: string; email?: string };
  profile: { name?: string; role?: string } | null;
}

export default function AdminDashboardWrapper({ children, user, profile }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const meta     = PAGE_META[pathname] || { title: 'Admin', sub: '' };
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

      {/* Mobile overlay */}
      {open && (
        <div className="ws-overlay" onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(12,26,46,0.4)', zIndex: 199, backdropFilter: 'blur(2px)' }}/>
      )}

      <Sidebar
        items={ADMIN_NAV}
        active={pathname}
        onSelect={handleSelect}
        role="admin"
        userName={profile?.name || 'Super Admin'}
        userEmail={user.email || 'admin@websync.ng'}
        open={open}
      />

      <div className="ws-main" style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>
        <PageHeader title={meta.title} sub={meta.sub} onMenuClick={() => setOpen(o => !o)} actions={
          <>
            <div style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: T.elevated, border: `1px solid ${T.border}`, cursor: 'pointer', flexShrink: 0 }}>
              <IcBell sz={16} col={T.textS}/>
              <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: T.danger }}/>
            </div>
            <Link href="/client" style={{ padding: '6px 14px', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textS, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Client View →
            </Link>
          </>
        }/>
        <main className="ws-main-content" style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <BottomNav tabs={ADMIN_TABS} root="/admin" />
    </div>
    </ThemeProvider>
  );
}
