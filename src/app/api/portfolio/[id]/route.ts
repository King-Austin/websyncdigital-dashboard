import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('ws_portfolio')
    .update({
      name: body.name,
      url: body.url || null,
      category: body.category,
      year: body.year,
      visibility: body.visibility,
      description: body.description,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase.from('ws_portfolio').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
