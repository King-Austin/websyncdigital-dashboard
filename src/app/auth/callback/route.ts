import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure a ws_profiles row exists with the email set (first-time Google
      // sign-in, or a row the trigger created before email was captured).
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const admin = createAdminClient();
        const { data: profile } = await admin
          .from('ws_profiles')
          .select('id, email')
          .eq('id', user.id)
          .single();
        if (!profile) {
          await admin.from('ws_profiles').insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
            role: 'client',
          });
        } else if (!profile.email && user.email) {
          // Self-heal: backfill a missing email on an existing profile
          await admin.from('ws_profiles').update({ email: user.email }).eq('id', user.id);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
