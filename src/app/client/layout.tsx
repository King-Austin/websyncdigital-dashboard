import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ClientDashboardWrapper from './ClientDashboardWrapper';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return (
    <ClientDashboardWrapper user={user} profile={profile}>
      {children}
    </ClientDashboardWrapper>
  );
}
