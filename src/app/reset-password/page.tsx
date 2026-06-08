'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import LegalLinks from '@/components/ui/LegalLinks';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState('');
  const [ready, setReady]         = useState(false);

  useEffect(() => {
    // Supabase fires SIGNED_IN with type === 'RECOVERY' when the reset link is clicked.
    // We wait for that event before showing the form so we know the session is live.
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
      }
    });
    // Also check if already in a recovery session (page was refreshed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => router.push('/client/dashboard'), 3000);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E4E2DC', padding: 24 }}>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
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
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ECFDF5', border: '2px solid #16A34A30', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#141310', marginBottom: 10 }}>Password updated</div>
              <div style={{ fontSize: 14, color: '#2E2C26', lineHeight: 1.6, marginBottom: 20 }}>
                Your new password is set. Redirecting you to your dashboard…
              </div>
              <div style={{ width: 28, height: 28, border: '3px solid #D1FAE5', borderTopColor: '#1F4A35', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}/>
            </div>
          ) : !ready ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: 32, height: 32, border: '3px solid #D1FAE5', borderTopColor: '#1F4A35', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}/>
              <div style={{ fontSize: 14, color: '#2E2C26' }}>Verifying your reset link…</div>
              <div style={{ fontSize: 12.5, color: '#555049', marginTop: 8 }}>
                If this takes too long, your link may have expired.{' '}
                <Link href="/forgot-password" style={{ color: '#1F4A35', fontWeight: 700, textDecoration: 'none' }}>Request a new one →</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#141310', letterSpacing: '-0.4px', marginBottom: 6 }}>Set a new password</div>
              <div style={{ fontSize: 14, color: '#2E2C26', marginBottom: 28, lineHeight: 1.55 }}>
                Choose a strong password — at least 8 characters.
              </div>

              {error && (
                <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>{error}</div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2E2C26', marginBottom: 6 }}>New password</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters" autoComplete="new-password" required
                  style={{ width: '100%', padding: '11px 14px', background: '#E4E2DC', border: '1.5px solid rgba(0,0,0,0.16)', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-app)', color: '#141310', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2E2C26', marginBottom: 6 }}>Confirm password</label>
                <input
                  type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Same password again" autoComplete="new-password" required
                  style={{ width: '100%', padding: '11px 14px', background: '#E4E2DC', border: `1.5px solid ${confirm && confirm !== password ? '#EF4444' : 'rgba(0,0,0,0.16)'}`, borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-app)', color: '#141310', outline: 'none' }}
                />
                {confirm && confirm !== password && (
                  <div style={{ fontSize: 12, color: '#EF4444', marginTop: 5 }}>Passwords don&apos;t match</div>
                )}
              </div>

              <button type="submit" disabled={loading || !password || !confirm}
                style={{ width: '100%', padding: 13, background: '#1F4A35', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-app)', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading || !password || !confirm ? 0.7 : 1, marginBottom: 16 }}>
                {loading
                  ? <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/> Updating…</>
                  : 'Update password'}
              </button>

              <div style={{ textAlign: 'center', fontSize: 13, color: '#2E2C26' }}>
                <Link href="/login" style={{ color: '#1F4A35', fontWeight: 700, textDecoration: 'none' }}>← Back to login</Link>
              </div>
            </form>
          )}
        </div>

        <LegalLinks />
      </div>
    </div>
  );
}
