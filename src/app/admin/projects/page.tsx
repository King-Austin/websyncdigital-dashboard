'use client';

import { useEffect, useState } from 'react';
import { T } from '@/lib/theme';
import { Card, StatusBadge, Btn } from '@/components/ui';
import { IcBriefcase, IcGlobe } from '@/components/ui/Icons';
import type { Project, ProjectFile } from '@/types';

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [open, setOpen]         = useState<string | null>(null);
  const [files, setFiles]       = useState<Record<string, ProjectFile[]>>({});

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.ok ? r.json() : [])
      .then(d => { setProjects(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const [updating, setUpdating] = useState<string | null>(null);

  async function toggle(id: string) {
    if (open === id) { setOpen(null); return; }
    setOpen(id);
    if (!files[id]) {
      const res = await fetch(`/api/projects/${id}/files`);
      if (res.ok) {
        const data = await res.json();
        setFiles(f => ({ ...f, [id]: data }));
      }
    }
  }

  async function setStatus(id: string, status: 'active' | 'cancelled' | 'submitted') {
    setUpdating(id);
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setProjects(ps => ps.map(p => p.id === id ? { ...p, status } : p));
    } else {
      alert('Could not update status.');
    }
    setUpdating(null);
  }

  const counts = {
    active:    projects.filter(p => p.status === 'active').length,
    submitted: projects.filter(p => p.status === 'submitted').length,
    cancelled: projects.filter(p => p.status === 'cancelled').length,
  };

  return (
    <div className="fade-in">
      <div className="grid4-resp" style={{ marginBottom: 22 }}>
        <StatBox label="Active Subscriptions" value={counts.active}    col={T.success} />
        <StatBox label="Awaiting Payment"     value={counts.submitted} col={T.warn} />
        <StatBox label="Cancelled"            value={counts.cancelled} col={T.danger} />
        <StatBox label="Total Projects"       value={projects.length}  col={T.accent} />
      </div>

      {loading ? (
        <div style={{ color: T.textS, fontSize: 14, padding: 20 }}>Loading projects…</div>
      ) : projects.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '40px 20px', color: T.textS }}>
          No project briefs submitted yet.
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {projects.map(p => (
            <Card key={p.id} style={{ padding: 0, overflow: 'hidden' }}>
              <div onClick={() => toggle(p.id)} style={{ padding: 18, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: T.accent + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IcBriefcase sz={18} col={T.accent}/>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: T.textS }}>{p.business_name || '—'} · {new Date(p.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StatusBadge s={p.status} />
                  <span style={{ color: T.textM, fontSize: 18, transform: open === p.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</span>
                </div>
              </div>

              {open === p.id && (
                <div style={{ padding: '0 18px 18px', borderTop: `1px solid ${T.border}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0, marginTop: 14 }}>
                    <Field label="Business name"  value={p.business_name} />
                    <Field label="About"          value={p.about} />
                    <Field label="Extra info"     value={p.extra_info} />
                    <Field label="Socials"        value={p.socials} />
                    <Field label="Address"        value={p.address} />
                    <Field label="Phone"          value={p.phone} />
                    <Field label="Business email" value={p.business_email} />
                    <Field label="Brand colors"   value={p.brand_colors} />
                    <Field label="WhatsApp"       value={p.whatsapp} />
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>Uploaded files</div>
                    {!files[p.id] ? (
                      <div style={{ fontSize: 12, color: T.textM }}>Loading files…</div>
                    ) : files[p.id].length === 0 ? (
                      <div style={{ fontSize: 12, color: T.textM }}>No files uploaded.</div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {files[p.id].map(file => (
                          <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'block', width: 90, height: 90, borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.border}`, position: 'relative' }}>
                            {file.url
                              ? <img src={file.url} alt={file.kind} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><IcGlobe sz={20} col={T.textM}/></div>}
                            <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 9, padding: '2px 4px', textAlign: 'center' }}>{file.kind}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Admin manual status controls */}
                  <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: T.textS, fontWeight: 600, marginRight: 4 }}>Set status:</span>
                    {p.status !== 'active' && (
                      <Btn sz="sm" variant="success" onClick={() => setStatus(p.id, 'active')} disabled={updating === p.id}>
                        {updating === p.id ? '…' : 'Mark Active'}
                      </Btn>
                    )}
                    {p.status !== 'cancelled' && (
                      <Btn sz="sm" variant="danger" onClick={() => setStatus(p.id, 'cancelled')} disabled={updating === p.id}>
                        {updating === p.id ? '…' : 'Mark Cancelled'}
                      </Btn>
                    )}
                    {p.status !== 'submitted' && (
                      <Btn sz="sm" variant="subtle" onClick={() => setStatus(p.id, 'submitted')} disabled={updating === p.id}>
                        Reset to Submitted
                      </Btn>
                    )}
                    <span style={{ fontSize: 11, color: T.textM, marginLeft: 'auto' }}>
                      Use for clients already paying outside the app.
                    </span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, col }: { label: string; value: number; col: string }) {
  return (
    <Card>
      <div style={{ fontSize: 11, color: T.textM, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: col }}>{value}</div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
      <div style={{ color: T.textS, fontWeight: 600, width: 130, flexShrink: 0 }}>{label}</div>
      <div style={{ color: T.text, whiteSpace: 'pre-wrap', minWidth: 0 }}>{value}</div>
    </div>
  );
}
