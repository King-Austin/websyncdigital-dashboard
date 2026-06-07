'use client';

import React, { useEffect, useState } from 'react';
import { T } from '@/lib/theme';
import { Btn, StatusBadge, Modal, Input, Sel, Row } from '@/components/ui';
import { IcBriefcase, IcGlobe, IcCheck, IcAlert, IcX, IcChevD, IcCard } from '@/components/ui/Icons';
import type { Project, ProjectFile } from '@/types';

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [open, setOpen]         = useState<string | null>(null);
  const [files, setFiles]       = useState<Record<string, ProjectFile[]>>({});
  const [updating, setUpdating] = useState<string | null>(null);
  const [invoiceFor, setInvoiceFor] = useState<Project | null>(null);

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.ok ? r.json() : [])
      .then(d => { setProjects(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
      setProjects(ps => ps.map(p => p.id === id ? { ...p, status: status as Project['status'] } : p));
    } else {
      alert('Could not update status.');
    }
    setUpdating(null);
  }

  const counts = {
    active:     projects.filter(p => p.status === 'active').length,
    submitted:  projects.filter(p => p.status === 'submitted').length,
    processing: projects.filter(p => p.status === 'processing').length,
    cancelled:  projects.filter(p => p.status === 'cancelled').length,
  };

  return (
    <div className="fade-in">
      <style>{`
        .glass-tile {
          position: relative; overflow: hidden;
          border-radius: 16px; padding: 18px 18px 16px;
          background: var(--ws-card); border: 1px solid var(--ws-border);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .glass-tile::before {
          content: ''; position: absolute; inset: 0;
          background: var(--tile-tint);
          -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
          pointer-events: none;
        }
        .glass-tile > * { position: relative; z-index: 1; }
        .glass-tile:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(20,19,16,0.10); }

        .proj-card {
          position: relative; overflow: hidden; border-radius: 16px;
          background: var(--ws-card); border: 1px solid var(--ws-border);
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .proj-card::before {
          content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 3px;
          background: var(--accent-bar); z-index: 1;
        }
        .proj-card:hover { border-color: var(--ws-borderHi); box-shadow: 0 8px 22px rgba(20,19,16,0.08); }
        .proj-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 18px; cursor: pointer; }

        .field-grid { display: grid; grid-template-columns: 1fr; gap: 0 24px; }
        @media (min-width: 760px) { .field-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      {/* Stat tiles */}
      <div className="grid4-resp" style={{ marginBottom: 22 }}>
        <StatTile label="Active Subscriptions" value={counts.active}      col={T.success} tint={`linear-gradient(135deg, ${T.success}12, ${T.success}03)`} icon={<IcCheck />} />
        <StatTile label="Awaiting Payment"     value={counts.submitted}   col={T.warn}    tint={`linear-gradient(135deg, ${T.warn}12, ${T.warn}03)`}    icon={<IcAlert />} />
        <StatTile label="Cancelled"            value={counts.cancelled}   col={T.danger}  tint={`linear-gradient(135deg, ${T.danger}12, ${T.danger}03)`}  icon={<IcX />} />
        <StatTile label="Total Projects"       value={projects.length}    col={T.accent}  tint={`linear-gradient(135deg, ${T.accent}12, ${T.accent}03)`}  icon={<IcBriefcase />} />
      </div>

      {loading ? (
        <div style={{ color: T.textS, fontSize: 14, padding: 20 }}>Loading projects…</div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: T.textS, background: T.card, border: `1px solid ${T.border}`, borderRadius: 16 }}>
          No project briefs submitted yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {projects.map(p => {
            const bar =
              p.status === 'active'     ? T.success :
              p.status === 'processing' ? T.info :
              p.status === 'cancelled'  ? T.danger : T.warn;
            return (
              <div key={p.id} className="proj-card" style={{ '--accent-bar': bar } as React.CSSProperties}>
                <div className="proj-head" onClick={() => toggle(p.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13, minWidth: 0 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: bar + '14', border: `1px solid ${bar}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IcBriefcase sz={18} col={bar}/>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: '-0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: T.textS, marginTop: 1 }}>{p.business_name || '—'} · {new Date(p.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <StatusBadge s={p.status} />
                    <span style={{ display: 'inline-flex', transform: open === p.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <IcChevD sz={16} col={T.textM} />
                    </span>
                  </div>
                </div>

                {open === p.id && (
                  <div style={{ padding: '4px 18px 18px', borderTop: `1px solid ${T.border}` }}>
                    <div className="field-grid" style={{ marginTop: 14 }}>
                      <Field label="Business name"  value={p.business_name} />
                      <Field label="Phone"          value={p.phone} />
                      <Field label="Business email" value={p.business_email} />
                      <Field label="WhatsApp"       value={p.whatsapp} />
                      <Field label="Address"        value={p.address} />
                      <Field label="Brand colors"   value={p.brand_colors} />
                      <Field label="Socials"        value={p.socials} full />
                      <Field label="About"          value={p.about} full />
                      <Field label="Extra info"     value={p.extra_info} full />
                    </div>

                    <div style={{ marginTop: 18 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.textS, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Uploaded files</div>
                      {!files[p.id] ? (
                        <div style={{ fontSize: 12, color: T.textM }}>Loading files…</div>
                      ) : files[p.id].length === 0 ? (
                        <div style={{ fontSize: 12, color: T.textM }}>No files uploaded.</div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          {files[p.id].map(file => (
                            <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'block', width: 92, height: 92, borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.border}`, position: 'relative' }}>
                              {file.url
                                ? <img src={file.url} alt={file.kind} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><IcGlobe sz={20} col={T.textM}/></div>}
                              <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 9, padding: '2px 4px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{file.kind}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Admin manual status controls */}
                    <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: T.textS, fontWeight: 700, marginRight: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Set status</span>
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
                      <Btn sz="sm" variant="outline" onClick={() => setInvoiceFor(p)} style={{ marginLeft: 'auto' }}>
                        <IcCard sz={13}/>Raise invoice
                      </Btn>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {invoiceFor && (
        <RaiseInvoiceModal
          project={invoiceFor}
          onClose={() => setInvoiceFor(null)}
        />
      )}
    </div>
  );
}

// ── Raise invoice modal ───────────────────────────────────────────────────────
function RaiseInvoiceModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [kind, setKind]         = useState('domain');
  const [description, setDesc]  = useState('');
  const [naira, setNaira]       = useState('');   // amount entered in naira, sent as kobo
  const [dueDate, setDueDate]   = useState('');
  const [saving, setSaving]     = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState('');

  async function submit() {
    const amountNaira = Number(naira);
    if (!amountNaira || amountNaira <= 0) { setError('Enter a valid amount in naira.'); return; }
    setSaving(true);
    setError('');
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: project.id,
        kind,
        description: description || (kind === 'domain' ? 'New domain registration' : kind === 'email' ? 'Business email setup' : 'Add-on'),
        amount: Math.round(amountNaira * 100),  // kobo
        due_date: dueDate || null,
      }),
    });
    if (res.ok) {
      setDone(true);
      setTimeout(onClose, 1200);
    } else {
      const d = await res.json();
      setError(d.error || 'Could not raise invoice.');
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Raise invoice — ${project.name}`}>
      {done ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: T.success + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <IcCheck sz={22} col={T.success} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Invoice sent</div>
          <div style={{ fontSize: 12, color: T.textS, marginTop: 4 }}>The client has been notified and can pay it from their project.</div>
        </div>
      ) : (
        <>
          {error && <div style={{ marginBottom: 14, padding: '10px 14px', background: T.danger + '12', border: `1px solid ${T.danger}40`, borderRadius: 8, fontSize: 13, color: T.danger }}>{error}</div>}
          <Sel label="Add-on type" value={kind} onChange={setKind} opts={[
            { v: 'domain', l: 'New domain registration' },
            { v: 'email',  l: 'Business email' },
            { v: 'other',  l: 'Other' },
          ]} />
          <Input label="Description" value={description} onChange={setDesc} placeholder="e.g. amakasbakery.com.ng — 1 year" />
          <Input label="Amount (₦)" value={naira} onChange={setNaira} placeholder="e.g. 16000" type="number" />
          <Input label="Due date (optional)" value={dueDate} onChange={setDueDate} placeholder="e.g. 30 Jun 2026" />
          <Row style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="outline" onClick={onClose} disabled={saving}>Cancel</Btn>
            <Btn onClick={submit} disabled={saving}><IcCard sz={13}/>{saving ? 'Sending…' : 'Send invoice'}</Btn>
          </Row>
        </>
      )}
    </Modal>
  );
}

function StatTile({ label, value, col, tint, icon }: { label: string; value: number; col: string; tint: string; icon: React.ReactElement }) {
  return (
    <div className="glass-tile" style={{ '--tile-tint': tint } as React.CSSProperties}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10.5, color: T.textM, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{label}</div>
          <div style={{ fontSize: 34, fontWeight: 600, color: col, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)' }}>{value}</div>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: col + '16', border: `1px solid ${col}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {React.cloneElement(icon as React.ReactElement<any>, { sz: 17, col })}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, full }: { label: string; value?: string; full?: boolean }) {
  if (!value) return null;
  return (
    <div style={{ padding: '8px 0', borderBottom: `1px solid ${T.border}`, gridColumn: full ? '1 / -1' : undefined }}>
      <div style={{ fontSize: 10.5, color: T.textM, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3, fontFamily: 'var(--font-mono)' }}>{label}</div>
      <div style={{ fontSize: 13.5, color: T.text, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}
