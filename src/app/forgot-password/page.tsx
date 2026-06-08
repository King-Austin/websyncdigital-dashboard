'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getURL } from '@/lib/getURL';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getURL()}/auth/reset-password`,
    });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E4E2DC', padding: 24 }}>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={{ width: '100%', maxWidth: 400, animation: 'fadeInUp 0.4s ease both' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#1F4A35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 12L7.5 20L12 9L16.5 20L21 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#141310' }}>Websync Digital</span>
        </div>

        <div style={{ background: '#fff', borderRadius: 18, padding: 32, boxShadow: '0 4px 24px rgba(12,26,46,0.10)', border: '1px solid rgba(0,0,0,0.08)' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ECFDF5', border: '2px solid #16A34A30', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#141310', marginBottom: 10 }}>Check your inbox</div>
              <div style={{ fontSize: 14, color: '#2E2C26', lineHeight: 1.6, marginBottom: 24 }}>
                We sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
              </div>
              <div style={{ fontSize: 12.5, color: '#555049', marginBottom: 24 }}>
                Didn&apos;t get it? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} style={{ background: 'none', border: 'none', color: '#1F4A35', fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'var(--font-app)', fontSize: 12.5 }}>
                  try again
                </button>.
              </div>
              <Link href="/login" style={{ display: 'inline-flex', padding: '10px 24px', background: '#1F4A35', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#141310', letterSpacing: '-0.4px', marginBottom: 6 }}>Forgot your password?</div>
              <div style={{ fontSize: 14, color: '#2E2C26', marginBottom: 28, lineHeight: 1.55 }}>
                Enter your email and we&apos;ll send you a link to reset it.
              </div>

              {error && (
                <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>{error}</div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2E2C26', marginBottom: 6 }}>Email address</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com.ng" autoComplete="email" required
                  style={{ width: '100%', padding: '11px 14px', background: '#E4E2DC', border: '1.5px solid rgba(0,0,0,0.16)', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-app)', color: '#141310', outline: 'none' }}
                />
              </div>

              <button type="submit" disabled={loading || !email}
                style={{ width: '100%', padding: 13, background: '#1F4A35', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-app)', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading || !email ? 0.7 : 1, marginBottom: 16 }}>
                {loading
                  ? <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/> Sending…</>
                  : 'Send reset link'}
              </button>

              <div style={{ textAlign: 'center', fontSize: 13, color: '#2E2C26' }}>
                Remembered it? <Link href="/login" style={{ color: '#1F4A35', fontWeight: 700, textDecoration: 'none' }}>Back to login →</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
