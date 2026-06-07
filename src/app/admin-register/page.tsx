'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ code: '', name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const upd = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code || !form.email || !form.password) return;
    setLoading(true);
    setError('');

    // 1. Create the admin account server-side (gated by the secret code)
    const res = await fetch('/api/admin/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Could not create admin account.'); setLoading(false); return; }

    // 2. Sign them in and send to the admin dashboard
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    if (err) { setError(err.message); setLoading(false); return; }
    router.push('/admin');
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', background: '#E4E2DC', border: '1.5px solid rgba(0,0,0,0.16)',
    borderRadius: 10, fontSize: 14, fontFamily: "'DM Mono', monospace", color: '#141310', outline: 'none',
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#2E2C26', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ECEAE4', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, padding: '40px 36px', border: '1px solid rgba(0,0,0,0.12)', animation: 'fadeInUp 0.4s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#1F4A35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#141310', fontFamily: "'Cormorant Garamond', serif" }}>Admin Sign-up</div>
            <div style={{ fontSize: 11, color: '#555049', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Websync Digital</div>
          </div>
        </div>

        <div style={{ fontSize: 13, color: '#2E2C26', marginBottom: 24, lineHeight: 1.5 }}>
          Restricted. You need a valid admin signup code from the Websync team.
        </div>

        {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Admin signup code *</label>
            <input type="text" value={form.code} onChange={e => upd('code')(e.target.value)} placeholder="Enter your team code" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Full name</label>
            <input type="text" value={form.name} onChange={e => upd('name')(e.target.value)} placeholder="Your name" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email address *</label>
            <input type="email" value={form.email} onChange={e => upd('email')(e.target.value)} placeholder="you@websyncdigital.com.ng" autoComplete="email" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Password *</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => upd('password')(e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password" style={{ ...inputStyle, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555049' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading || !form.code || !form.email || !form.password} style={{ width: '100%', padding: 13, background: '#1F4A35', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono', monospace", cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (loading || !form.code || !form.email || !form.password) ? 0.6 : 1 }}>
            {loading ? <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Creating…</> : 'Create admin account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 13, color: '#2E2C26', marginTop: 22 }}>
          Not an admin? <Link href="/register" style={{ color: '#1F4A35', fontWeight: 700, textDecoration: 'none' }}>Client sign-up →</Link>
        </div>
      </div>
    </div>
  );
}
