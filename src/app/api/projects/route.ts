import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/projects  → list projects (own if client, all if admin)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  // RLS already scopes this: clients see their own, admins see all
  const { data, error } = await supabase
    .from('ws_projects')
    .select('*, ws_project_files(*)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/projects  → create a project + its brief; notify the team
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const body = await request.json();
  const {
    name, business_name, about, extra_info, socials,
    address, phone, business_email, brand_colors, whatsapp,
    files,  // [{ kind: 'logo'|'image', path: '<storage path>' }]
  } = body;

  if (!name) return NextResponse.json({ error: 'Project name is required' }, { status: 400 });

  const admin = createAdminClient();

  // Insert the project (status defaults to 'submitted')
  const { data: project, error } = await admin
    .from('ws_projects')
    .insert({
      client_id: user.id,
      name,
      business_name, about, extra_info, socials,
      address, phone, business_email, brand_colors, whatsapp,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach uploaded file paths, if any
  if (Array.isArray(files) && files.length > 0) {
    const rows = files
      .filter((f: { kind: string; path: string }) => f.path)
      .map((f: { kind: string; path: string }) => ({
        project_id: project.id,
        kind: f.kind === 'logo' ? 'logo' : 'image',
        path: f.path,
      }));
    if (rows.length) await admin.from('ws_project_files').insert(rows);
  }

  // Notify our team via Resend (best-effort, never blocks the response)
  notifyTeam(project, user.email ?? '').catch(() => {});

  return NextResponse.json(project, { status: 201 });
}

async function notifyTeam(project: Record<string, unknown>, clientEmail: string) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'support@websyncdigital.com.ng';
  const fromName  = process.env.RESEND_FROM_NAME  || 'Websync Digital';
  const teamEmail = process.env.WS_TEAM_EMAIL || fromEmail;

  const rows = [
    ['Project name',   project.name],
    ['Business name',  project.business_name],
    ['About',          project.about],
    ['Extra info',     project.extra_info],
    ['Socials',        project.socials],
    ['Address',        project.address],
    ['Phone',          project.phone],
    ['Business email', project.business_email],
    ['Brand colors',   project.brand_colors],
    ['WhatsApp',       project.whatsapp],
    ['Submitted by',   clientEmail],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: teamEmail,
    subject: `New project brief: ${project.name}`,
    text: `A client just submitted a new project brief.\n\n${rows}\n\nReview it in the admin dashboard → Projects.`,
  });
}
