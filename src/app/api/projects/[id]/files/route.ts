import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'ws-project-files';

// GET /api/projects/[id]/files  → signed URLs for the project's files
// Visible to the owning client or any admin.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const admin = createAdminClient();

  const { data: project } = await admin
    .from('ws_projects')
    .select('client_id')
    .eq('id', id)
    .single();
  if (!project) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { data: profile } = await admin
    .from('ws_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  const isAdmin = profile?.role === 'admin';

  if (project.client_id !== user.id && !isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { data: files } = await admin
    .from('ws_project_files')
    .select('id, kind, path')
    .eq('project_id', id);

  const withUrls = await Promise.all(
    (files ?? []).map(async f => {
      const { data: signed } = await admin.storage
        .from(BUCKET)
        .createSignedUrl(f.path, 60 * 60); // 1 hour
      return { ...f, url: signed?.signedUrl ?? null };
    })
  );

  return NextResponse.json(withUrls);
}
