import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminDashboardWrapper from './AdminDashboardWrapper';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('ws_profiles').select('*').eq('id', user.id).single();

  // Only admins may access the admin dashboard
  if (profile?.role !== 'admin') redirect('/client');

  return (
    <AdminDashboardWrapper user={user} profile={profile}>
      {children}
    </AdminDashboardWrapper>
  );
}
