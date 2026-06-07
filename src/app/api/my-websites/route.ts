import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/my-websites → only the logged-in user's websites.
// RLS on ws_websites already scopes a client to their own rows, but we also
// filter explicitly by client_id for clarity and defence in depth.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { data, error } = await supabase
    .from('ws_websites')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
