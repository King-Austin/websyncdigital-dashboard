'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { T } from '@/lib/theme';
import { createClient } from '@/lib/supabase/client';
import { Card, Btn, Input, Textarea, StatusBadge } from '@/components/ui';
import { IcPlus, IcCard, IcCheck, IcGlobe } from '@/components/ui/Icons';
import type { Project } from '@/types';

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
  const [paying, setPaying]     = useState<string | null>(null);
  const [justPaid, setJustPaid] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/projects');
    if (res.ok) setProjects(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // After returning from Paystack (?paid=<project_id>), show a confirmation + refresh
  useEffect(() => {
    const paid = searchParams.get('paid');
    if (paid) {
      setJustPaid(paid);
      // webhook may take a moment; poll a couple times
      const t1 = setTimeout(load, 1500);
      const t2 = setTimeout(load, 4000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [searchParams, load]);

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
        <div style={{ display: 'grid', gap: 14 }}>
          {projects.map(p => (
            <Card key={p.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{p.name}</div>
                    <StatusBadge s={p.status} />
                  </div>
                  {p.business_name && <div style={{ fontSize: 12, color: T.textS }}>{p.business_name}</div>}
                  <div style={{ fontSize: 11, color: T.textM, marginTop: 6 }}>
                    {p.status === 'submitted' && 'Brief submitted · awaiting payment to activate'}
                    {p.status === 'active' && 'Active subscription · our team is building / maintaining your site'}
                    {p.status === 'cancelled' && 'Subscription cancelled'}
                  </div>
                </div>
                {p.status === 'submitted' && (
                  <Btn onClick={() => startPayment(p.id)} disabled={paying === p.id}>
                    <IcCard sz={14}/>{paying === p.id ? 'Starting…' : 'Pay to activate'}
                  </Btn>
                )}
                {p.status === 'cancelled' && (
                  <Btn variant="outline" onClick={() => startPayment(p.id)} disabled={paying === p.id}>
                    <IcCard sz={14}/>{paying === p.id ? 'Starting…' : 'Re-subscribe'}
                  </Btn>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Brief form ────────────────────────────────────────────────────────────────
function ProjectForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [f, setF] = useState({
    name: '', business_name: '', about: '', extra_info: '', socials: '',
    address: '', phone: '', business_email: '', brand_colors: '', whatsapp: '',
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
            <div style={{ fontSize: 17, fontWeight: 800, color: T.text, letterSpacing: '-0.3px' }}>New project brief</div>
            <div style={{ fontSize: 12.5, color: T.textS, marginTop: 2 }}>
              Only the project name is required — fill in what you can, send the rest over WhatsApp anytime.
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
          <div><FileField label="Business logo (if you have one)" multiple={false} onChange={files => setLogo(files[0] ?? null)} /></div>
          <div><FileField label="3–5 images of you or your business" multiple onChange={setImages} /></div>
        </div>
      </div>

      {/* Footer actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '16px 24px', borderTop: `1px solid ${T.border}`, background: T.elevated }}>
        <Btn variant="outline" onClick={onClose} disabled={saving}>Cancel</Btn>
        <Btn onClick={submit} disabled={saving}>{saving ? 'Submitting…' : 'Submit brief'}</Btn>
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
