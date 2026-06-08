'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { T } from '@/lib/theme';
import { formatDomainExpiry, normalizeWebsiteUrl } from '@/lib/format';
import { Card, Row, Btn } from '@/components/ui';
import { StatusBadge, Dot } from '@/components/ui';
import { IcGlobe, IcLink, IcBar, IcCheck, IcCog, IcPlus, IcBriefcase, IcZap } from '@/components/ui/Icons';
import { createClient } from '@/lib/supabase/client';

interface WebsiteRow {
  id: number;
  name: string;
  url: string;
  status: 'live' | 'maintenance' | 'down';
  domain_expiry: string;
  seo_score: number;
  monthly_visits: number;
  form_submissions: number;
}

interface ProjectRow {
  id: string;
  name: string;
  business_name?: string;
  status: 'submitted' | 'processing' | 'active' | 'cancelled';
}

// Map a project status → a position in the build pipeline (0..3)
const STAGES = ['Brief Submitted', 'In Production', 'Quality Check', 'Live'];
function stageOf(status: ProjectRow['status']): number {
  switch (status) {
    case 'submitted':  return 0;
    case 'processing': return 1;
    case 'active':     return 2; // building toward Live; flips to a real website row when published
    default:           return 0;
  }
}

export default function ClientWebsites() {
  const [sites, setSites]       = useState<WebsiteRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [{ data: ws }, projRes] = await Promise.all([
        supabase.from('ws_websites').select('*').eq('client_id', user.id).order('created_at', { ascending: false }),
        fetch('/api/projects').then(r => r.ok ? r.json() : []).catch(() => []),
      ]);

      setSites(ws || []);
      const active = (Array.isArray(projRes) ? projRes : []).filter((p: ProjectRow) => p.status !== 'cancelled');
      setProjects(active);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  // ── Empty state: no live websites yet ───────────────────────────────────────
  if (sites.length === 0) {
    return <EmptyWebsites projects={projects} />;
  }

  // ── Normal state: live websites ─────────────────────────────────────────────
  return (
    <div className="fade-in">
      <p style={{ color: T.textS, fontSize: 13, marginBottom: 20 }}>
        You have <strong>{sites.length}</strong> website{sites.length !== 1 ? 's' : ''} managed by Websync Digital.
      </p>
      {sites.map(site => (
        <Card key={site.id} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Row>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: T.accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IcGlobe sz={22} col={T.accent}/>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{site.name}</div>
                {site.url && (
                  <a href={normalizeWebsiteUrl(site.url)} target="_blank" rel="noopener" style={{ fontSize: 12, color: T.accent, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {site.url} <IcLink sz={10} col={T.accent}/>
                  </a>
                )}
              </div>
            </Row>
            <Row>
              <StatusBadge s={site.status}/>
              <Dot color={site.status === 'live' ? T.success : T.warn} pulse={site.status === 'live'}/>
            </Row>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, padding: '14px 0', borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, marginBottom: 14 }}>
            {[
              { l: 'Monthly Visits',   v: site.monthly_visits.toLocaleString() },
              { l: 'SEO Score',        v: `${site.seo_score}/100`, c: site.seo_score >= 75 ? T.success : site.seo_score >= 60 ? T.warn : T.danger },
              { l: 'Form Submissions', v: site.form_submissions },
              { l: 'Domain Expires',   v: formatDomainExpiry(site.domain_expiry) },
            ].map((m, i) => (
              <div key={i}>
                <div style={{ fontSize: 10, color: T.textM, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.l}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: (m as { c?: string }).c || T.text }}>{m.v}</div>
              </div>
            ))}
          </div>

          <Row>
            <Link href="/client/metrics"><Btn sz="sm"><IcBar sz={12}/>Full Metrics</Btn></Link>
            {site.url && (
              <a href={normalizeWebsiteUrl(site.url)} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: T.textS, textDecoration: 'none' }}>
                <IcLink sz={12}/>Visit Site
              </a>
            )}
          </Row>
        </Card>
      ))}
    </div>
  );
}

// ── Empty / in-progress state ─────────────────────────────────────────────────
function EmptyWebsites({ projects }: { projects: ProjectRow[] }) {
  const hasProjects = projects.length > 0;

  return (
    <div className="fade-in">
      <style>{keyframes}</style>

      {/* Hero — animated build graphic */}
      <Card style={{ marginBottom: 16, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg,#0F2A4A 0%,#1E3A8A 55%,#2563EB 100%)', border: 'none' }}>
        {/* drifting orbs */}
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div className="build-badge">
            <IcCog sz={30} col="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
              {hasProjects ? 'Work in progress' : 'No sites yet'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px', marginTop: 3 }}>
              {hasProjects ? 'Your website is being built' : 'Let’s get your first site online'}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 5, lineHeight: 1.5 }}>
              {hasProjects
                ? `Our team is actively working on ${projects.length} project${projects.length !== 1 ? 's' : ''}. It will appear here the moment it goes live.`
                : 'Submit a brief and our team will design, build and launch a site managed end-to-end by Websync.'}
            </div>
          </div>
        </div>

        {/* animated indeterminate progress bar */}
        <div style={{ position: 'relative', marginTop: 18, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
          <div className="progress-sweep" />
        </div>
      </Card>

      {/* Per-project pipeline trackers */}
      {hasProjects ? (
        projects.map(p => <PipelineCard key={p.id} project={p} />)
      ) : (
        <Card style={{ textAlign: 'center', padding: '36px 20px' }}>
          <div className="float-icon" style={{ width: 64, height: 64, borderRadius: 18, background: T.accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <IcGlobe sz={30} col={T.accent} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>No websites assigned yet</div>
          <div style={{ fontSize: 13, color: T.textS, marginBottom: 20, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.55 }}>
            When you start a project, you’ll be able to track its build progress right here — from brief to live site.
          </div>
          <Link href="/client/projects" style={{ textDecoration: 'none' }}>
            <Btn><IcPlus sz={14}/>Start a Project</Btn>
          </Link>
        </Card>
      )}

      {/* What happens next — reassurance / info */}
      <Card style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IcZap sz={15} col={T.warn} /> What happens next
        </div>
        {[
          { icon: <IcBriefcase sz={15} col={T.accent}/>,  t: 'We review your brief',    d: 'Our team studies your goals, brand and content within 24 hours.' },
          { icon: <IcCog sz={15}       col={T.info}/>,    t: 'We design & build',        d: 'Your site is crafted, reviewed internally and tuned for speed + SEO.' },
          { icon: <IcGlobe sz={15}     col={T.success}/>, t: 'We launch & manage',       d: 'It goes live here with hosting, domain and ongoing maintenance.' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '11px 0', borderBottom: i < 2 ? `1px solid ${T.border}` : 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: T.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{s.t}</div>
              <div style={{ fontSize: 12, color: T.textS, marginTop: 1 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── A single project's build pipeline ─────────────────────────────────────────
function PipelineCard({ project }: { project: ProjectRow }) {
  const current = stageOf(project.status);
  const pct = ((current + 0.5) / STAGES.length) * 100; // sit between current and next stage

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 10 }}>
        <Row>
          <div className="build-spin" style={{ width: 42, height: 42, borderRadius: 11, background: T.accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IcCog sz={20} col={T.accent} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</div>
            {project.business_name && <div style={{ fontSize: 12, color: T.textS }}>{project.business_name}</div>}
          </div>
        </Row>
        <StatusBadge s={project.status} />
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
        {/* track line */}
        <div style={{ position: 'absolute', top: 13, left: 14, right: 14, height: 3, borderRadius: 2, background: T.border }} />
        <div style={{ position: 'absolute', top: 13, left: 14, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${T.accent}, ${T.success})`, width: `calc(${pct}% - 14px)`, transition: 'width 0.9s ease', maxWidth: 'calc(100% - 28px)' }} />
        {STAGES.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <div className={active ? 'step-active' : ''}
                style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? T.success : active ? T.accent : T.elevated,
                  border: `2px solid ${done ? T.success : active ? T.accent : T.border}`,
                  color: '#fff', transition: 'all 0.3s',
                }}>
                {done ? <IcCheck sz={13} col="#fff" /> : <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#fff' : T.textM }}>{i + 1}</span>}
              </div>
              <div style={{ fontSize: 10.5, fontWeight: active ? 700 : 500, color: active ? T.text : T.textM, marginTop: 7, textAlign: 'center', lineHeight: 1.25 }}>{label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 9, background: T.elevated, fontSize: 12, color: T.textS, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Dot color={T.accent} pulse />
        {project.status === 'submitted'  && 'Brief received — your project is queued for our team.'}
        {project.status === 'processing' && 'Actively in production — design and build underway.'}
        {project.status === 'active'     && 'Subscription active — final build and pre-launch checks in progress.'}
      </div>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <style>{keyframes}</style>
      <div className="shimmer" style={{ height: 18, width: '40%', borderRadius: 6, marginBottom: 14 }} />
      <div className="shimmer" style={{ height: 60, borderRadius: 10 }} />
    </Card>
  );
}

const keyframes = `
  @keyframes ws-sweep {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(350%); }
  }
  @keyframes ws-spin { to { transform: rotate(360deg); } }
  @keyframes ws-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
  @keyframes ws-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.45); } 70% { box-shadow: 0 0 0 10px rgba(37,99,235,0); } 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); } }
  @keyframes ws-drift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-14px); } }
  @keyframes ws-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }

  .progress-sweep {
    position: absolute; top: 0; left: 0; height: 100%; width: 28%;
    border-radius: 3px;
    background: linear-gradient(90deg, transparent, #7DD3FC, #ffffff, #7DD3FC, transparent);
    animation: ws-sweep 1.6s ease-in-out infinite;
  }
  .build-spin { animation: ws-spin 4s linear infinite; }
  .build-badge {
    width: 64px; height: 64px; border-radius: 18px; flex-shrink: 0;
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
  }
  .build-badge svg { animation: ws-spin 5s linear infinite; }
  .float-icon { animation: ws-float 3s ease-in-out infinite; }
  .step-active { animation: ws-pulse-ring 1.8s infinite; }
  .orb { position: absolute; border-radius: 50%; filter: blur(2px); pointer-events: none; }
  .orb-a { width: 150px; height: 150px; top: -60px; right: -30px; background: rgba(255,255,255,0.06); animation: ws-drift 9s ease-in-out infinite; }
  .orb-b { width: 110px; height: 110px; bottom: -50px; left: 30%; background: rgba(125,211,252,0.08); animation: ws-drift 11s ease-in-out infinite reverse; }
  .shimmer {
    background: linear-gradient(90deg, var(--ws-elevated,#eef1f5) 25%, rgba(0,0,0,0.04) 37%, var(--ws-elevated,#eef1f5) 63%);
    background-size: 800px 100%;
    animation: ws-shimmer 1.4s linear infinite;
  }
`;
