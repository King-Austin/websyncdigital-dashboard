'use client';

import { useEffect, useState } from 'react';
import { T } from '@/lib/theme';
import { Card, Btn, Input } from '@/components/ui';
import { Avatar } from '@/components/ui';
import { IcCheck, IcAlert, IcShield } from '@/components/ui/Icons';

interface Profile {
  name: string;
  company: string;
  phone: string;
  email: string;
  role: string;
}

const EMPTY: Profile = { name: '', company: '', phone: '', email: '', role: 'client' };

export default function ClientSettings() {
  const [form, setForm]       = useState<Profile>(EMPTY);
  const [original, setOrig]   = useState<Profile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then((d: Profile) => { setForm(d); setOrig(d); setLoading(false); })
      .catch(() => { setMsg({ type: 'err', text: 'Could not load your profile.' }); setLoading(false); });
  }, []);

  const upd = (k: keyof Profile) => (v: string) => { setForm(s => ({ ...s, [k]: v })); setMsg(null); };

  const dirty =
    form.name !== original.name ||
    form.company !== original.company ||
    form.phone !== original.phone ||
    form.email !== original.email;

  async function save() {
    if (!form.name.trim()) { setMsg({ type: 'err', text: 'Name cannot be empty.' }); return; }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, company: form.company, phone: form.phone, email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg({ type: 'err', text: data.error || 'Could not save changes.' }); setSaving(false); return; }

      const next: Profile = { ...form, ...(data.profile || {}) };
      setForm(next);
      setOrig(next);
      setMsg({
        type: 'ok',
        text: data.emailChangePending
          ? 'Saved. Check your new inbox to confirm the email change.'
          : 'Your profile has been updated.',
      });
    } catch {
      setMsg({ type: 'err', text: 'Something went wrong. Please try again.' });
    }
    setSaving(false);
  }

  if (loading) return <div style={{ color: T.textS, fontSize: 13, padding: 24 }}>Loading your settings…</div>;

  return (
    <div className="fade-in settings-page">
      <style>{`
        .settings-page { max-width: 640px; }
        .settings-grid { display: grid; grid-template-columns: 1fr; gap: 0 18px; }
        @media (min-width: 560px) { .settings-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      {/* Identity header */}
      <Card style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Avatar name={form.name || form.email} sz={56} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: T.text, letterSpacing: '-0.3px' }}>{form.name || 'Your profile'}</div>
          <div style={{ fontSize: 13, color: T.textS, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.email}</div>
          <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', background: T.accent + '14', borderRadius: 6 }}>
            <IcShield sz={11} col={T.accent} />
            <span style={{ fontSize: 11, color: T.accent, fontWeight: 600, textTransform: 'capitalize' }}>{form.role} account</span>
          </div>
        </div>
      </Card>

      {/* Banner */}
      {msg && (
        <div style={{
          padding: '11px 14px', borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 9,
          background: msg.type === 'ok' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${msg.type === 'ok' ? '#BBF7D0' : '#FECACA'}`,
        }}>
          {msg.type === 'ok' ? <IcCheck sz={15} col={T.success} /> : <IcAlert sz={15} col={T.danger} />}
          <span style={{ fontSize: 13, color: msg.type === 'ok' ? '#065F46' : '#991B1B', fontWeight: 500 }}>{msg.text}</span>
        </div>
      )}

      {/* Profile form */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Profile details</div>
        <div style={{ fontSize: 12, color: T.textS, marginBottom: 18 }}>Update how Websync reaches and addresses you.</div>

        <div className="settings-grid">
          <Input label="Full name"    value={form.name}    onChange={upd('name')}    placeholder="e.g. Amaka Okonkwo" required />
          <Input label="Company"      value={form.company} onChange={upd('company')} placeholder="e.g. Amaka's Bakery" />
          <Input label="Phone number" value={form.phone}   onChange={upd('phone')}   placeholder="e.g. +234 801 234 5678" type="tel" />
          <Input label="Email address" value={form.email}  onChange={upd('email')}   placeholder="you@example.com" type="email" />
        </div>

        <div style={{ fontSize: 11.5, color: T.textM, marginTop: 2, marginBottom: 18, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <IcAlert sz={13} col={T.textM} />
          <span>Changing your email sends a confirmation link to the new address. It only takes effect after you confirm.</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Btn onClick={save} disabled={saving || !dirty}>
            <IcCheck sz={13} />{saving ? 'Saving…' : 'Save changes'}
          </Btn>
          {dirty && !saving && (
            <Btn variant="ghost" onClick={() => { setForm(original); setMsg(null); }}>Discard</Btn>
          )}
        </div>
      </Card>

      {/* Read-only account info */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>Account</div>
        {[
          { l: 'Account type', v: form.role.charAt(0).toUpperCase() + form.role.slice(1) },
          { l: 'Sign-in email', v: form.email },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i === 0 ? `1px solid ${T.border}` : 'none' }}>
            <span style={{ fontSize: 13, color: T.textS }}>{r.l}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{r.v}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
