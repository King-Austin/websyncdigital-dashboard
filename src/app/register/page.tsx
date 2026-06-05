'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const steps = ['Account', 'Business', 'Plan'];

function PasswordStrength({ pw }: { pw: string }) {
  const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw), pw.length >= 12];
  const score = checks.filter(Boolean).length;
  const colors = ['#DC2626', '#D97706', '#D97706', '#16A34A', '#16A34A'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  if (!pw) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
        {[1,2,3,4,5].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? colors[score-1] : '#DDE5F0', transition: 'background 0.3s' }}/>)}
      </div>
      <div style={{ fontSize: 11, color: score > 0 ? colors[score-1] : '#8FA9C4', fontWeight: 600 }}>{score > 0 ? labels[score-1] : ''}</div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    name: '', company: '', phone: '',
  });
  const upd = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name, company: form.company, phone: form.phone } },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id, name: form.name, company: form.company, phone: form.phone, role: 'client',
      });
    }
    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F7FB' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 24px', animation: 'fadeInUp 0.4s ease both' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ECFDF5', border: '2px solid #16A34A30', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0C1A2E', marginBottom: 10 }}>Account created!</div>
          <div style={{ fontSize: 14, color: '#5B728E', lineHeight: 1.6, marginBottom: 24 }}>We&apos;ve sent a verification email to <strong>{form.email}</strong>. Click the link to activate your account and access your dashboard.</div>
          <Link href="/login" style={{ display: 'inline-flex', padding: '11px 24px', background: '#2563EB', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1.4fr' }}>
      {/* Brand */}
      <div style={{ background: 'linear-gradient(155deg, #1E3A8A 0%, #2563EB 60%, #60A5FA 100%)', padding: 48, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 65%)' }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1, marginBottom: 'auto' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'float 3s ease-in-out infinite' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12L7.5 20L12 9L16.5 20L21 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:17 }}>Websync Digital</div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:500, letterSpacing:'0.8px', textTransform:'uppercase' }}>Client Portal</div>
          </div>
        </div>
        <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
          <div style={{ fontSize:34, fontWeight:900, color:'#fff', lineHeight:1.2, letterSpacing:'-0.8px', marginBottom:14 }}>Launch your business online.</div>
          <div style={{ fontSize:14, color:'rgba(255,255,255,0.68)', lineHeight:1.7, marginBottom:32 }}>Join other Nigerian businesses who trust Websync to build, host, and maintain their web presence.</div>
          {[['One-time setup','We build and launch your website.'],['Monthly retainer','₦9,999/mo — domain, hosting, maintenance.'],['Direct support','Email and phone access to our team.']].map(([t,d])=>(
            <div key={t} style={{ display:'flex', gap:12, marginBottom:16 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <div><div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{t}</div><div style={{ fontSize:13, color:'rgba(255,255,255,0.65)' }}>{d}</div></div>
            </div>
          ))}
        </div>
        <div style={{ position:'relative', zIndex:1, fontSize:12, color:'rgba(255,255,255,0.4)' }}>© 2026 Websync Digital</div>
      </div>

      {/* Form */}
      <div style={{ padding:'48px 56px', background:'#fff', overflowY:'auto' }}>
        <div style={{ maxWidth:480, margin:'0 auto', animation:'fadeInUp 0.4s ease both' }}>
          {/* Step indicator */}
          <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:36 }}>
            {steps.map((s,i)=>(
              <div key={s} style={{ display:'flex', alignItems:'center', flex: i < steps.length-1 ? 1 : 'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:i<step?'#16A34A':i===step?'#2563EB':'#EDF2F8', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.3s' }}>
                    {i<step ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    : <span style={{ fontSize:12, fontWeight:700, color:i===step?'#fff':'#8FA9C4' }}>{i+1}</span>}
                  </div>
                  <span style={{ fontSize:13, fontWeight:i===step?700:400, color:i===step?'#0C1A2E':i<step?'#16A34A':'#8FA9C4' }}>{s}</span>
                </div>
                {i<steps.length-1 && <div style={{ flex:1, height:1, background:i<step?'#16A34A':'#DDE5F0', margin:'0 12px', transition:'background 0.3s' }}/>}
              </div>
            ))}
          </div>

          {error && <div style={{ marginBottom:16, padding:'10px 14px', background:'#FEF2F2', border:'1px solid #FCA5A5', borderRadius:8, fontSize:13, color:'#DC2626' }}>{error}</div>}

          {/* Step 0 — Account */}
          {step === 0 && (
            <div>
              <div style={{ fontSize:24, fontWeight:800, color:'#0C1A2E', marginBottom:6 }}>Create your account</div>
              <div style={{ fontSize:14, color:'#5B728E', marginBottom:28 }}>Enter your email and set a strong password.</div>

              <div style={{ marginBottom:18 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#5B728E', marginBottom:6 }}>Email address <span style={{color:'#DC2626'}}>*</span></label>
                <input type="email" value={form.email} onChange={e=>upd('email')(e.target.value)} placeholder="you@company.com.ng"
                  style={{ width:'100%', padding:'11px 14px', background:'#F4F7FB', border:'1.5px solid #DDE5F0', borderRadius:10, fontSize:14, fontFamily:'Plus Jakarta Sans', color:'#0C1A2E', outline:'none' }}/>
              </div>

              <div style={{ marginBottom:18 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#5B728E', marginBottom:6 }}>Password <span style={{color:'#DC2626'}}>*</span></label>
                <div style={{ position:'relative' }}>
                  <input type={showPw?'text':'password'} value={form.password} onChange={e=>upd('password')(e.target.value)} placeholder="Min. 8 characters"
                    style={{ width:'100%', padding:'11px 44px 11px 14px', background:'#F4F7FB', border:'1.5px solid #DDE5F0', borderRadius:10, fontSize:14, fontFamily:'Plus Jakarta Sans', color:'#0C1A2E', outline:'none' }}/>
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#8FA9C4' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
                <PasswordStrength pw={form.password}/>
              </div>

              <div style={{ marginBottom:24 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#5B728E', marginBottom:6 }}>Confirm password <span style={{color:'#DC2626'}}>*</span></label>
                <input type="password" value={form.confirmPassword} onChange={e=>upd('confirmPassword')(e.target.value)} placeholder="Repeat your password"
                  style={{ width:'100%', padding:'11px 14px', background:'#F4F7FB', border:'1.5px solid #DDE5F0', borderRadius:10, fontSize:14, fontFamily:'Plus Jakarta Sans', color:'#0C1A2E', outline:'none' }}/>
              </div>

              <button onClick={()=>{setError('');setStep(1)}} disabled={!form.email||!form.password||form.password!==form.confirmPassword} style={{ width:'100%', padding:13, background:'#2563EB', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, fontFamily:'Plus Jakarta Sans', cursor:'pointer', opacity:(!form.email||!form.password||form.password!==form.confirmPassword)?0.5:1 }}>
                Continue →
              </button>
            </div>
          )}

          {/* Step 1 — Business */}
          {step === 1 && (
            <div>
              <div style={{ fontSize:24, fontWeight:800, color:'#0C1A2E', marginBottom:6 }}>Your business details</div>
              <div style={{ fontSize:14, color:'#5B728E', marginBottom:28 }}>Help us personalise your dashboard.</div>

              {[{k:'name' as const, l:'Full name', p:'e.g. Amaka Okonkwo', r:true},{k:'company' as const, l:'Business name', p:'e.g. Lagos Bakery'},{k:'phone' as const, l:'Phone number', p:'+234 801 234 5678'}].map(({k,l,p,r})=>(
                <div key={k} style={{ marginBottom:18 }}>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#5B728E', marginBottom:6 }}>{l}{r&&<span style={{color:'#DC2626'}}> *</span>}</label>
                  <input value={form[k]} onChange={e=>upd(k)(e.target.value)} placeholder={p}
                    style={{ width:'100%', padding:'11px 14px', background:'#F4F7FB', border:'1.5px solid #DDE5F0', borderRadius:10, fontSize:14, fontFamily:'Plus Jakarta Sans', color:'#0C1A2E', outline:'none' }}/>
                </div>
              ))}

              <div style={{ display:'flex', gap:12, marginTop:8 }}>
                <button onClick={()=>setStep(0)} style={{ flex:1, padding:13, background:'#F4F7FB', color:'#5B728E', border:'1px solid #DDE5F0', borderRadius:10, fontSize:15, fontWeight:600, fontFamily:'Plus Jakarta Sans', cursor:'pointer' }}>← Back</button>
                <button onClick={()=>setStep(2)} disabled={!form.name} style={{ flex:2, padding:13, background:'#2563EB', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, fontFamily:'Plus Jakarta Sans', cursor:'pointer', opacity:!form.name?0.5:1 }}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 2 — Plan */}
          {step === 2 && (
            <div>
              <div style={{ fontSize:24, fontWeight:800, color:'#0C1A2E', marginBottom:6 }}>Choose your plan</div>
              <div style={{ fontSize:14, color:'#5B728E', marginBottom:28 }}>One flat monthly rate. No hidden fees.</div>

              <div style={{ background:'linear-gradient(135deg,#1E3A8A 0%,#2563EB 60%,#3B82F6 100%)', borderRadius:16, padding:'24px 26px', marginBottom:24, color:'#fff', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }}/>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.65)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:6 }}>Monthly Retainer</div>
                    <div style={{ fontSize:38, fontWeight:900, letterSpacing:'-1px' }}>₦9,999<span style={{ fontSize:16, fontWeight:500, opacity:0.7 }}>/mo</span></div>
                  </div>
                  <div style={{ background:'rgba(255,255,255,0.2)', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700 }}>Only plan</div>
                </div>
                {['Domain registration & renewal','Website hosting (99.9% uptime)','Monthly maintenance & updates','Email & phone support'].map(f=>(
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, fontSize:13, color:'rgba(255,255,255,0.85)' }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <div style={{ fontSize:12, color:'#8FA9C4', textAlign:'center', marginBottom:24 }}>Payment is processed securely by Paystack after account setup.</div>

              <div style={{ display:'flex', gap:12 }}>
                <button onClick={()=>setStep(1)} style={{ flex:1, padding:13, background:'#F4F7FB', color:'#5B728E', border:'1px solid #DDE5F0', borderRadius:10, fontSize:15, fontWeight:600, fontFamily:'Plus Jakarta Sans', cursor:'pointer' }}>← Back</button>
                <button onClick={handleSubmit} disabled={loading} style={{ flex:2, padding:13, background:'#2563EB', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, fontFamily:'Plus Jakarta Sans', cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:loading?0.7:1 }}>
                  {loading ? <><div style={{ width:20, height:20, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/> Creating account…</> : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          <div style={{ textAlign:'center', fontSize:13, color:'#5B728E', marginTop:28 }}>
            Already have an account? <Link href="/login" style={{ color:'#2563EB', fontWeight:700, textDecoration:'none' }}>Sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
