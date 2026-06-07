'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { T } from '@/lib/theme';
import { createClient } from '@/lib/supabase/client';
import { Card, Btn, Input, Textarea, StatusBadge } from '@/components/ui';
import { IcPlus, IcCard, IcCheck, IcGlobe, IcEdit, IcTrash, IcBar, IcCog, IcMail, IcAlert, IcFile } from '@/components/ui/Icons';
import Link from 'next/link';
import type { Project, WsInvoice } from '@/types';

const BUCKET = 'ws-project-files';

export default function ClientProjects() {
  return (
    <Suspense fallback={<div style={{ color: '#5B728E', fontSize: 14, padding: 20 }}>Loading…</div>}>
      <ProjectsInner />
    </Suspense>
  );
}

function ProjectsInner() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [paying, setPaying]         = useState<string | null>(null);
  const [confirmProject, setConfirmProject] = useState<Project | null>(null);
  const [justPaid, setJustPaid] = useState<string | null>(null);
  const [editing, setEditing]   = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<WsInvoice[]>([]);
  const [payingInv, setPayingInv] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [pRes, iRes] = await Promise.all([
      fetch('/api/projects'),
      fetch('/api/invoices'),
    ]);
    if (pRes.ok) setProjects(await pRes.json());
    if (iRes.ok) setInvoices(await iRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function payInvoice(invoiceId: string) {
    setPayingInv(invoiceId);
    const res = await fetch('/api/paystack/initialize-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id: invoiceId }),
    });
    const data = await res.json();
    if (data.authorization_url) {
      window.location.href = data.authorization_url;
    } else {
      alert(data.error || 'Could not start payment. Please try again.');
      setPayingInv(null);
    }
  }

  // After returning from Paystack (?paid=<project_id> or ?invoice_paid=<id>), refresh
  useEffect(() => {
    const paid = searchParams.get('paid');
    const invoicePaid = searchParams.get('invoice_paid');
    if (paid || invoicePaid) {
      if (paid) setJustPaid(paid);
      // webhook may take a moment; poll a couple times
      const t1 = setTimeout(load, 1500);
      const t2 = setTimeout(load, 4000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [searchParams, load]);

  // Bottom-nav FAB (+) routes here with ?new=1 — open the New Project form.
  useEffect(() => {
    if (searchParams.get('new')) setShowForm(true);
  }, [searchParams]);

  async function startPayment(projectId: string) {
    setPaying(projectId);
    const res = await fetch('/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId }),
    });
    const data = await res.json();
    if (data.authorization_url) {
      window.location.href = data.authorization_url;
    } else {
      alert(data.error || 'Could not start payment. Please try again.');
      setPaying(null);
    }
  }

  async function deleteProject(projectId: string) {
    if (!confirm('Delete this project and its brief? This cannot be undone.')) return;
    setDeleting(projectId);
    const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
    if (res.ok) {
      setProjects(ps => ps.filter(p => p.id !== projectId));
    } else {
      const d = await res.json();
      alert(d.error || 'Could not delete project.');
    }
    setDeleting(null);
  }

  return (
    <div className="fade-in">
      {justPaid && (
        <div style={{ padding: '12px 16px', borderRadius: 12, background: '#ECFDF5', border: '1px solid #BBF7D0', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <IcCheck sz={16} col={T.success} />
          <div style={{ fontSize: 13, color: T.text }}>
            Payment received — we&apos;re confirming with Paystack. Your project will switch to <strong>Active</strong> in a moment.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 14, color: T.textS }}>
          Create a project, fill in your brief, and our team will get to work. You can pay anytime to activate it.
        </div>
        {!showForm && <Btn onClick={() => setShowForm(true)}><IcPlus sz={14}/>New Project</Btn>}
      </div>

      {showForm && <ProjectForm onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); load(); }} />}

      {!showForm && <ValuePanel />}

      {loading ? (
        <div style={{ color: T.textS, fontSize: 14, padding: 20 }}>Loading your projects…</div>
      ) : projects.length === 0 && !showForm ? (
        <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: T.accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <IcGlobe sz={24} col={T.accent}/>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>No projects yet</div>
          <div style={{ fontSize: 13, color: T.textS, marginBottom: 18 }}>Start by creating your first website project.</div>
          <Btn onClick={() => setShowForm(true)}><IcPlus sz={14}/>Create your first project</Btn>
        </Card>
      ) : (
        <div className="projects-grid">
          <style>{`
            .projects-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
            @media (min-width: 900px)  { .projects-grid { grid-template-columns: repeat(2, 1fr); } }
            @media (min-width: 1400px) { .projects-grid { grid-template-columns: repeat(3, 1fr); } }

            .glass-card {
              position: relative;
              display: flex;
              flex-direction: column;
              border-radius: 18px;
              padding: 20px;
              background: var(--ws-card);
              border: 1px solid var(--ws-border);
              overflow: hidden;
              transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
              box-shadow: 0 1px 3px rgba(12,26,46,0.05);
            }
            .glass-card::before {
              content: '';
              position: absolute;
              inset: 0;
              background: var(--glass-tint);
              -webkit-backdrop-filter: blur(8px);
              backdrop-filter: blur(8px);
              pointer-events: none;
            }
            .glass-card > * { position: relative; z-index: 1; }
            .glass-card:hover {
              transform: translateY(-3px);
              box-shadow: 0 12px 28px rgba(12,26,46,0.12);
              border-color: var(--ws-borderHi);
            }
            .icon-btn {
              width: 34px; height: 34px;
              display: inline-flex; align-items: center; justify-content: center;
              border-radius: 10px;
              background: rgba(255,255,255,0.45);
              -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
              border: 1px solid var(--ws-border);
              cursor: pointer; transition: all 0.15s ease;
            }
            [data-theme="dark"] .icon-btn { background: rgba(255,255,255,0.06); }
            .icon-btn:hover { transform: translateY(-1px); }
            .icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            .icon-btn.edit:hover   { border-color: ${T.accent}; background: ${T.accent}14; }
            .icon-btn.delete:hover { border-color: ${T.danger}; background: ${T.danger}14; }
          `}</style>
          {projects.map(p => {
            const canModify = p.status === 'submitted' || p.status === 'processing' || p.status === 'cancelled';
            const tint =
              p.status === 'active'     ? `linear-gradient(135deg, ${T.success}0E, ${T.success}03)` :
              p.status === 'processing' ? `linear-gradient(135deg, ${T.info}12, ${T.info}03)` :
              p.status === 'cancelled'  ? `linear-gradient(135deg, ${T.danger}0E, ${T.danger}03)` :
                                          `linear-gradient(135deg, ${T.accent}0E, ${T.purple}06)`;
            return (
              <div key={p.id} className="glass-card" style={{ '--glass-tint': tint } as React.CSSProperties}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.text, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>{p.name}</div>
                  <StatusBadge s={p.status} />
                </div>
                {p.business_name && <div style={{ fontSize: 12, color: T.textS }}>{p.business_name}</div>}
                <div style={{ fontSize: 11.5, color: T.textM, marginTop: 8, marginBottom: 16, flex: 1, lineHeight: 1.5 }}>
                  {p.status === 'submitted'  && 'Brief submitted · awaiting payment to activate'}
                  {p.status === 'processing' && 'Payment in progress · confirming with Paystack'}
                  {p.status === 'active'     && 'Active subscription · our team is building / maintaining your site'}
                  {p.status === 'cancelled'  && 'Subscription cancelled'}
                </div>

                {/* Add-on invoices raised by the team for this project */}
                {invoices.filter(inv => inv.project_id === p.id && inv.status === 'unpaid').map(inv => (
                  <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 10, borderRadius: 12, background: T.warn + '10', border: `1px solid ${T.warn}30` }}>
                    <IcAlert sz={16} col={T.warn} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text }}>{inv.description || 'Add-on'} · ₦{(inv.amount / 100).toLocaleString()}</div>
                      <div style={{ fontSize: 10.5, color: T.textM }}>Invoice {inv.id}{inv.due_date ? ` · due ${inv.due_date}` : ''}</div>
                    </div>
                    <Btn sz="sm" onClick={() => payInvoice(inv.id)} disabled={payingInv === inv.id}>
                      <IcCard sz={12}/>{payingInv === inv.id ? '…' : 'Pay'}
                    </Btn>
                  </div>
                ))}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {p.status === 'submitted' && (
                    <Btn sz="sm" onClick={() => setConfirmProject(p)} disabled={paying === p.id} style={{ flex: 1, justifyContent: 'center' }}>
                      <IcCard sz={13}/>{paying === p.id ? 'Starting…' : 'Pay to activate'}
                    </Btn>
                  )}
                  {p.status === 'processing' && (
                    <Btn sz="sm" variant="subtle" onClick={() => setConfirmProject(p)} disabled={paying === p.id} style={{ flex: 1, justifyContent: 'center' }}>
                      <IcCard sz={13}/>{paying === p.id ? 'Starting…' : 'Complete payment'}
                    </Btn>
                  )}
                  {p.status === 'cancelled' && (
                    <Btn sz="sm" variant="outline" onClick={() => setConfirmProject(p)} disabled={paying === p.id} style={{ flex: 1, justifyContent: 'center' }}>
                      <IcCard sz={13}/>{paying === p.id ? 'Starting…' : 'Re-subscribe'}
                    </Btn>
                  )}
                  {p.status === 'active' && (
                    <Link href="/client/billing" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '5px 11px', fontSize: 12, fontWeight: 600, color: T.textS, border: `1px solid ${T.border}`, borderRadius: 8, textDecoration: 'none', background: 'transparent', fontFamily: 'var(--font-app)' }}>
                      <IcFile sz={12} col={T.textS}/> Manage subscription
                    </Link>
                  )}

                  {/* CRUD — icon-only, only while payment is not completed */}
                  {canModify && (
                    <>
                      <button className="icon-btn edit" onClick={() => setEditing(p)} title="Edit brief" aria-label="Edit brief">
                        <IcEdit sz={15} col={T.textS} />
                      </button>
                      <button className="icon-btn delete" onClick={() => deleteProject(p.id)} disabled={deleting === p.id} title="Delete project" aria-label="Delete project">
                        <IcTrash sz={15} col={deleting === p.id ? T.textM : T.danger} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <ProjectForm
          existing={editing}
          onClose={() => setEditing(null)}
          onCreated={() => { setEditing(null); load(); }}
        />
      )}

      {/* ── Pre-checkout billing disclosure modal ────────────────────────────── */}
      {confirmProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,26,46,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmProject(null); }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 28, maxWidth: 420, width: '100%', boxShadow: '0 16px 48px rgba(12,26,46,0.18)', border: `1px solid ${T.border}` }}>
            {/* Icon + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: T.accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IcCard sz={20} col={T.accent}/>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.text, letterSpacing: '-0.3px' }}>Confirm your subscription</div>
                <div style={{ fontSize: 12, color: T.textS, marginTop: 2 }}>{confirmProject.name}</div>
              </div>
            </div>

            {/* Billing breakdown */}
            <div style={{ background: T.elevated, borderRadius: 12, padding: '16px 18px', marginBottom: 18, border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: `1px solid ${T.border}`, marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>Due today</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.accent, letterSpacing: '-0.5px' }}>₦9,999</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>Then monthly</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>₦9,999/mo</div>
              </div>
              <div style={{ fontSize: 11.5, color: T.textM, marginTop: 8, lineHeight: 1.55 }}>
                Billed on the same date each month. Your card will be charged automatically until you cancel.
              </div>
            </div>

            {/* What's included note */}
            <div style={{ fontSize: 12.5, color: T.textS, marginBottom: 18, lineHeight: 1.6, padding: '10px 14px', background: T.accent + '08', borderRadius: 10, borderLeft: `3px solid ${T.accent}` }}>
              Includes domain management, hosting, monthly maintenance, and priority support. You can cancel anytime from the <strong>Billing</strong> section of your dashboard — no penalties.
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="outline" onClick={() => setConfirmProject(null)} style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </Btn>
              <Btn onClick={() => { const p = confirmProject; setConfirmProject(null); startPayment(p.id); }} disabled={paying === confirmProject.id} style={{ flex: 2, justifyContent: 'center' }}>
                <IcCard sz={14}/>{paying === confirmProject.id ? 'Starting…' : 'Continue to payment'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Brief form (create + edit) ────────────────────────────────────────────────
function ProjectForm({ existing, onClose, onCreated }: { existing?: Project; onClose: () => void; onCreated: () => void }) {
  const isEdit = !!existing;
  const [f, setF] = useState({
    name:           existing?.name           ?? '',
    business_name:  existing?.business_name  ?? '',
    about:          existing?.about          ?? '',
    extra_info:     existing?.extra_info     ?? '',
    socials:        existing?.socials        ?? '',
    address:        existing?.address        ?? '',
    phone:          existing?.phone          ?? '',
    business_email: existing?.business_email ?? '',
    brand_colors:   existing?.brand_colors   ?? '',
    whatsapp:       existing?.whatsapp        ?? '',
  });
  const [logo, setLogo]       = useState<File | null>(null);
  const [images, setImages]   = useState<File[]>([]);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const upd = (k: keyof typeof f) => (v: string) => setF(s => ({ ...s, [k]: v }));

  async function submit() {
    if (!f.name) { setError('Please give your project a name.'); return; }
    setSaving(true);
    setError('');

    try {
      if (isEdit) {
        // Edit only updates the text brief (file changes not handled here)
        const res = await fetch(`/api/projects/${existing!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(f),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Could not update your project.');
        }
        onCreated();
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('You are not signed in.'); setSaving(false); return; }

      // Upload files to Storage under <user_id>/<timestamp>/
      const folder = `${user.id}/${Date.now()}`;
      const uploaded: { kind: 'logo' | 'image'; path: string }[] = [];

      if (logo) {
        const path = `${folder}/logo-${logo.name}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, logo, { upsert: true });
        if (upErr) throw upErr;
        uploaded.push({ kind: 'logo', path });
      }
      for (const img of images.slice(0, 5)) {
        const path = `${folder}/img-${img.name}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, img, { upsert: true });
        if (upErr) throw upErr;
        uploaded.push({ kind: 'image', path });
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, files: uploaded }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Could not submit your brief.');
      }
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setSaving(false);
    }
  }

  return (
    <Card style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
      <style>{`
        .pf-grid { display: grid; grid-template-columns: 1fr; gap: 0 20px; }
        .pf-col-2 { grid-column: span 1; }
        @media (min-width: 720px) {
          .pf-grid { grid-template-columns: 1fr 1fr; }
          .pf-col-2 { grid-column: span 2; }
        }
        .pf-section { padding: 22px 24px; border-top: 1px solid ${T.border}; }
        .pf-section:first-of-type { border-top: none; }
      `}</style>

      {/* Header banner */}
      <div style={{ padding: '22px 24px', background: `linear-gradient(135deg, ${T.accent}0E, ${T.purple}0A)`, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: T.accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IcGlobe sz={20} col={T.accent} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.text, letterSpacing: '-0.3px' }}>{isEdit ? 'Edit project brief' : 'New project brief'}</div>
            <div style={{ fontSize: 12.5, color: T.textS, marginTop: 2 }}>
              {isEdit
                ? 'Update your brief details. To change uploaded images, contact us on WhatsApp.'
                : 'Only the project name is required — fill in what you can, send the rest over WhatsApp anytime.'}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ margin: '16px 24px 0', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, fontSize: 13, color: T.danger }}>{error}</div>
      )}

      {/* The basics */}
      <div className="pf-section">
        <FormSection n="01" title="The basics" hint="Name your project and tell us who you are." />
        <div className="pf-grid">
          <div><Input label="Project / website name" value={f.name} onChange={upd('name')} placeholder="e.g. Amaka's Bakery website" required /></div>
          <div><Input label="Business / brand name" value={f.business_name} onChange={upd('business_name')} placeholder="What is your business called?" /></div>
          <div className="pf-col-2"><Textarea label="Tell us about your business" value={f.about} onChange={upd('about')} placeholder="What you do, the services you offer, and who your customers are." /></div>
          <div className="pf-col-2"><Textarea label="Anything extra to add to the website?" value={f.extra_info} onChange={upd('extra_info')} rows={3} /></div>
        </div>
      </div>

      {/* Contact & links */}
      <div className="pf-section">
        <FormSection n="02" title="Contact & links" hint="How customers reach you, and where you already live online." />
        <div className="pf-grid">
          <div><Input label="Business phone number" value={f.phone} onChange={upd('phone')} /></div>
          <div><Input label="WhatsApp for customer inquiries" value={f.whatsapp} onChange={upd('whatsapp')} placeholder="The number to connect to your website" /></div>
          <div><Input label="Official business email" value={f.business_email} onChange={upd('business_email')} type="email" /></div>
          <div><Input label="Business address" value={f.address} onChange={upd('address')} /></div>
          <div className="pf-col-2"><Input label="Social media links / usernames" value={f.socials} onChange={upd('socials')} placeholder="Instagram, Facebook, LinkedIn…" /></div>
        </div>
      </div>

      {/* Brand & media */}
      <div className="pf-section">
        <FormSection n="03" title="Brand & media" hint="Colors and images help us match your look — optional." />
        <div className="pf-grid">
          <div className="pf-col-2"><Input label="Brand colors (optional)" value={f.brand_colors} onChange={upd('brand_colors')} placeholder="e.g. navy blue & gold — or leave blank and we'll make it professional" /></div>
          {!isEdit && <div><FileField label="Business logo (if you have one)" multiple={false} onChange={files => setLogo(files[0] ?? null)} /></div>}
          {!isEdit && <div><FileField label="3–5 images of you or your business" multiple onChange={setImages} /></div>}
        </div>
      </div>

      {/* Footer actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '16px 24px', borderTop: `1px solid ${T.border}`, background: T.elevated }}>
        <Btn variant="outline" onClick={onClose} disabled={saving}>Cancel</Btn>
        <Btn onClick={submit} disabled={saving}>{saving ? (isEdit ? 'Saving…' : 'Submitting…') : (isEdit ? 'Save changes' : 'Submit brief')}</Btn>
      </div>
    </Card>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function FormSection({ n, title, hint }: { n: string; title: string; hint: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.accent, background: T.accent + '14', borderRadius: 8, padding: '4px 8px', letterSpacing: '0.5px', flexShrink: 0, marginTop: 1 }}>{n}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-0.2px' }}>{title}</div>
        <div style={{ fontSize: 12, color: T.textS, marginTop: 2 }}>{hint}</div>
      </div>
    </div>
  );
}

// ── File input (dropzone) ─────────────────────────────────────────────────────
function FileField({ label, multiple, onChange }: { label: string; multiple: boolean; onChange: (files: File[]) => void }) {
  const [names, setNames] = useState<string[]>([]);
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const take = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (!files.length) return;
    setNames(files.map(f => f.name));
    onChange(files);
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: T.textS, marginBottom: 5, fontWeight: 600 }}>{label}</div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setHover(true); }}
        onDragLeave={() => setHover(false)}
        onDrop={e => { e.preventDefault(); setHover(false); take(e.dataTransfer.files); }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
          padding: '18px 12px', textAlign: 'center', cursor: 'pointer',
          background: hover ? T.accent + '0C' : T.elevated,
          border: `1.5px dashed ${hover ? T.accent : T.border}`,
          borderRadius: 10, transition: 'all 0.15s',
        }}>
        <IcPlus sz={16} col={hover ? T.accent : T.textM} />
        <div style={{ fontSize: 12.5, color: T.textS }}>
          <span style={{ color: T.accent, fontWeight: 600 }}>Click to upload</span> or drag & drop
        </div>
        <div style={{ fontSize: 10.5, color: T.textM }}>PNG, JPG{multiple ? ' · up to 5 images' : ''}</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={e => take(e.target.files)}
        style={{ display: 'none' }}
      />
      {names.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {names.map((n, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.text, background: T.accent + '12', border: `1px solid ${T.accent}25`, borderRadius: 20, padding: '3px 10px', maxWidth: 180, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              <IcCheck sz={11} col={T.success} />{n}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── What's included / plan value (folded in from the old Subscription page) ────
function ValuePanel() {
  const [open, setOpen] = useState(false);

  const features = [
    { icon: <IcGlobe sz={15} col={T.accent}/>,  t: 'Domain Registration & Renewal', d: 'We manage your domain — no surprises, no lapses.' },
    { icon: <IcBar sz={15}   col={T.info}/>,    t: 'Website Hosting',               d: 'Fast, reliable hosting with 99.9% uptime SLA.' },
    { icon: <IcCog sz={15}   col={T.success}/>, t: 'Monthly Maintenance',           d: 'Content updates, security patches, performance monitoring.' },
    { icon: <IcMail sz={15}  col={T.warn}/>,    t: 'Priority Support',              d: 'Direct email and phone access to the Websync team.' },
  ];

  return (
    <Card style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
      {/* Plan header — gradient strip */}
      <div style={{ background: 'linear-gradient(135deg,#1E3A8A 0%,#2563EB 60%,#3B82F6 100%)', padding: '16px 20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>Your plan — per project</div>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px', marginTop: 2 }}>₦9,999<span style={{ fontSize: 13, fontWeight: 500, opacity: 0.7 }}>/month</span></div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.78)', marginTop: 2 }}>Domain management + website maintenance, billed monthly on each active project.</div>
        </div>
        <button onClick={() => setOpen(o => !o)}
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 8, padding: '7px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-app)', whiteSpace: 'nowrap' }}>
          {open ? 'Hide details' : "What's included"}
        </button>
      </div>

      {/* Expandable feature list */}
      {open && (
        <div style={{ padding: '6px 20px 14px' }}>
          {features.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < features.length - 1 ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: T.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{item.t}</div>
                <div style={{ fontSize: 12, color: T.textS }}>{item.d}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
