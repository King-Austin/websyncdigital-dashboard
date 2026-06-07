import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const PSI = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

// POST /api/seo/refresh  { website_id }
// Fetches a live Lighthouse SEO score from Google PageSpeed Insights for the
// site's URL and writes it to ws_websites.seo_score.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { website_id } = await request.json();
  if (!website_id) return NextResponse.json({ error: 'website_id required' }, { status: 400 });

  const admin = createAdminClient();

  // Confirm the site belongs to this user (or caller is admin)
  const { data: site } = await admin
    .from('ws_websites')
    .select('id, url, client_id')
    .eq('id', website_id)
    .single();
  if (!site) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { data: profile } = await admin.from('ws_profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';
  if (site.client_id !== user.id && !isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (!site.url) return NextResponse.json({ error: 'site has no URL' }, { status: 400 });

  const target = site.url.startsWith('http') ? site.url : `https://${site.url}`;
  const key = process.env.PAGESPEED_API_KEY;
  const apiUrl = `${PSI}?url=${encodeURIComponent(target)}&category=seo&category=performance${key ? `&key=${key}` : ''}`;

  const res = await fetch(apiUrl, { next: { revalidate: 0 } });
  if (!res.ok) {
    return NextResponse.json({ error: 'PageSpeed request failed' }, { status: 502 });
  }
  const json = await res.json();
  const seoScore = json?.lighthouseResult?.categories?.seo?.score;
  const perfScore = json?.lighthouseResult?.categories?.performance?.score;

  if (typeof seoScore !== 'number') {
    return NextResponse.json({ error: 'could not read score' }, { status: 502 });
  }

  const seo = Math.round(seoScore * 100);
  await admin
    .from('ws_websites')
    .update({ seo_score: seo })
    .eq('id', website_id);

  return NextResponse.json({
    seo_score: seo,
    performance: typeof perfScore === 'number' ? Math.round(perfScore * 100) : null,
  });
}
