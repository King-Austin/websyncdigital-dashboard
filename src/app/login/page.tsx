'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getURL } from '@/lib/getURL';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/'), 1500);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${getURL()}/auth/callback` },
    });
    if (err) { setError(err.message); setLoading(false); }
    // on success the browser redirects — loading stays true intentionally
  }

  return (
    <div className="login-root" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <style>{`
        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr !important; }
          .login-brand { display: none !important; }
          .login-form-panel { padding: 32px 24px !important; }
        }
      `}</style>
      {/* Brand panel */}
      <div className="login-brand" style={{ background: 'linear-gradient(155deg, #13160F 0%, #1F4A35 55%, #2A6347 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 48, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(31,74,53,0.3) 0%, transparent 60%)' }} />
        {[{w:600,h:600,t:-200,l:-200},{w:400,h:400,b:-150,r:-150},{w:200,h:200,t:'40%',r:'10%'}].map((c,i) => (
          <div key={i} style={{ position:'absolute', width:c.w, height:c.h, top:c.t as any, left:c.l as any, bottom:c.b as any, right:c.r as any, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.1)' }}/>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'float 3s ease-in-out infinite' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 12L7.5 20L12 9L16.5 20L21 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '-0.3px' }}>Websync Digital</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>Client Portal</div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 0 32px' }}>
          <div style={{ fontSize: 38, fontWeight: 900, color: '#fff', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 18 }}>Your web presence,<br />always in view.</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, maxWidth: 360 }}>Monitor your websites, track performance metrics, manage invoices, and get instant support — all in one clean dashboard.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 36 }}>
            {[['99.9%','Uptime SLA'],['24h','Response time'],['50+','Sites managed']].map(([v,l]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{v}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>© 2026 Websync Digital · websyncdigital.com.ng</div>
      </div>

      {/* Form panel */}
      <div className="login-form-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 56px', background: '#fff' }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'fadeInUp 0.4s ease both' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ECFDF5', border: '2px solid #16A34A30', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#141310', marginBottom: 8 }}>You&apos;re in!</div>
              <div style={{ fontSize: 14, color: '#2E2C26', marginBottom: 24 }}>Redirecting to your dashboard…</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 20, height: 20, border: '2px solid rgba(0,0,0,0.16)', borderTopColor: '#1F4A35', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#141310', letterSpacing: '-0.5px', marginBottom: 6 }}>Welcome back</div>
              <div style={{ fontSize: 14, color: '#2E2C26', marginBottom: 32, lineHeight: 1.5 }}>Sign in to your Websync client portal to manage your websites and more.</div>

              {error && (
                <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>{error}</div>
              )}

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2E2C26', marginBottom: 6 }}>Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com.ng" autoComplete="email"
                  style={{ width: '100%', padding: '11px 14px', background: '#E4E2DC', border: '1.5px solid rgba(0,0,0,0.16)', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-app)', color: '#141310', outline: 'none', transition: 'all 0.15s' }} />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2E2C26', marginBottom: 6 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password"
                    style={{ width: '100%', padding: '11px 44px 11px 14px', background: '#E4E2DC', border: '1.5px solid rgba(0,0,0,0.16)', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-app)', color: '#141310', outline: 'none', transition: 'all 0.15s' }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555049', padding: 4 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      {showPw
                        ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      }
                    </svg>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#2E2C26', cursor: 'pointer' }}>
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#1F4A35' }} /> Remember me
                </label>
                <a href="#" style={{ fontSize: 13, color: '#1F4A35', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</a>
              </div>

              <button type="submit" disabled={loading || !email || !password} style={{ width: '100%', padding: 13, background: '#1F4A35', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-app)', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(31,74,53,0.28)', transition: 'all 0.15s', marginBottom: 16, opacity: loading ? 0.7 : 1 }}>
                {loading ? <><div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Signing in…</> : 'Sign in'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 16px', color: '#555049', fontSize: 12 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.16)' }} />or<div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.16)' }} />
              </div>

              <button type="button" onClick={handleGoogle} disabled={loading} style={{ width: '100%', padding: 12, background: '#fff', color: '#141310', border: '1.5px solid rgba(0,0,0,0.16)', borderRadius: 10, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-app)', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.15s', opacity: loading ? 0.6 : 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
                </svg>
                Continue with Google
              </button>

              <div style={{ textAlign: 'center', fontSize: 13, color: '#2E2C26', marginTop: 20 }}>
                New to Websync? <Link href="/register" style={{ color: '#1F4A35', fontWeight: 700, textDecoration: 'none' }}>Create an account →</Link>
              </div>
              <div style={{ textAlign: 'center', fontSize: 12, color: '#555049', marginTop: 8 }}>
                <Link href="/admin-register" style={{ color: '#555049', fontWeight: 600, textDecoration: 'none' }}>Admin sign-up</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
