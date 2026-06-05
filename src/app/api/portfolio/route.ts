import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('ws_portfolio')
    .select('*')
    .order('year', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('ws_portfolio')
    .insert({
      name: body.name,
      url: body.url || null,
      category: body.category,
      year: body.year,
      visibility: body.visibility || 'public',
      description: body.description,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
