'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { T } from '@/lib/theme';
import { createClient } from '@/lib/supabase/client';
import { Card, Btn, StatusBadge } from '@/components/ui';
import { IcCard, IcCheck, IcAlert, IcGlobe, IcFile } from '@/components/ui/Icons';
import type { Project } from '@/types';

export default function BillingPage() {
  const [projects, setProjects]   = useState<Project[]>([]);
  const [loading, setLoading]     = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [done, setDone]             = useState<string[]>([]);
  const [error, setError]           = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('ws_projects')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function cancelSubscription(projectId: string) {
    setCancelling(projectId);
    setError(null);
    try {
      const res = await fetch('/api/paystack/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setDone(prev => [...prev, projectId]);
        setProjects(ps => ps.map(p => p.id === projectId ? { ...p, status: 'cancelled' } : p));
      } else {
        setError(data.error || 'Could not cancel. Please try again or contact support.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    }
    setCancelling(null);
    setConfirmId(null);
  }

  const activeProjects    = projects.filter(p => p.status === 'active');
  const inactiveProjects  = projects.filter(p => p.status !== 'active');

  return (
    <div className="fade-in">
      {/* Header info */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: T.textS, lineHeight: 1.6 }}>
          Manage your active subscriptions. Cancelling a subscription stops all future charges for that project — your project details remain visible but your site will no longer be maintained after the current billing period ends.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 12, background: '#FEF2F2', border: '1px solid #FCA5A5', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <IcAlert sz={15} col={T.danger}/>
          <div style={{ fontSize: 13, color: T.danger }}>{error}</div>
        </div>
      )}

      {/* Card detachment notice */}
      <Card style={{ marginBottom: 24, padding: '14px 18px', background: T.elevated, border: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: T.accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IcCard sz={15} col={T.accent}/>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 3 }}>About stored card details</div>
            <div style={{ fontSize: 12.5, color: T.textS, lineHeight: 1.6 }}>
              Your card details are stored securely by Paystack, not Websync. Cancelling your subscription here stops all future charges from this project immediately. If you want to permanently remove your card from Paystack&apos;s system, you can do so by contacting{' '}
              <a href="mailto:support@websyncdigital.com.ng" style={{ color: T.accent, textDecoration: 'none', fontWeight: 600 }}>support@websyncdigital.com.ng</a>.
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <div style={{ color: T.textS, fontSize: 13, padding: 20 }}>Loading your subscriptions…</div>
      ) : (
        <>
          {/* Active subscriptions */}
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 12, letterSpacing: '-0.2px' }}>
            Active subscriptions {activeProjects.length > 0 && <span style={{ fontSize: 12, fontWeight: 500, color: T.textM }}>({activeProjects.length})</span>}
          </div>

          {activeProjects.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '32px 20px', marginBottom: 24 }}>
              <IcGlobe sz={28} col={T.textM}/>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginTop: 10, marginBottom: 4 }}>No active subscriptions</div>
              <div style={{ fontSize: 12.5, color: T.textS, marginBottom: 16 }}>Activate a project to start a subscription.</div>
              <Link href="/client/projects">
                <Btn sz="sm" variant="outline">Go to Projects</Btn>
              </Link>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {activeProjects.map(p => (
                <Card key={p.id} style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: T.success + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IcGlobe sz={18} col={T.success}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{p.name}</div>
                        <StatusBadge s="active"/>
                        {done.includes(p.id) && (
                          <span style={{ fontSize: 11, color: T.success, display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                            <IcCheck sz={11} col={T.success}/> Cancelled
                          </span>
                        )}
                      </div>
                      {p.business_name && <div style={{ fontSize: 12, color: T.textS, marginBottom: 6 }}>{p.business_name}</div>}

                      {/* Billing summary */}
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
                        <div style={{ fontSize: 12, color: T.textM }}>
                          <span style={{ fontWeight: 600, color: T.text }}>₦9,999</span> / month
                        </div>
                        <div style={{ fontSize: 12, color: T.textM }}>
                          Auto-renews monthly · card charged via Paystack
                        </div>
                      </div>

                      <Btn sz="sm" variant="ghost" onClick={() => setConfirmId(p.id)} disabled={!!cancelling} style={{ color: T.danger, border: `1px solid ${T.danger}30` }}>
                        Cancel subscription
                      </Btn>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Inactive projects */}
          {inactiveProjects.length > 0 && (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 12, letterSpacing: '-0.2px' }}>
                Other projects <span style={{ fontSize: 12, fontWeight: 500, color: T.textM }}>({inactiveProjects.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {inactiveProjects.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.elevated }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: T.elevated, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IcFile sz={14} col={T.textM}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 1 }}>{p.name}</div>
                      {p.business_name && <div style={{ fontSize: 11.5, color: T.textM }}>{p.business_name}</div>}
                    </div>
                    <StatusBadge s={p.status}/>
                    {(p.status === 'submitted' || p.status === 'cancelled') && (
                      <Link href="/client/projects">
                        <Btn sz="sm" variant="outline">Activate</Btn>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Cancel confirmation overlay ─────────────────────────────────────── */}
      {confirmId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,26,46,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget && !cancelling) setConfirmId(null); }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 28, maxWidth: 420, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 16px 48px rgba(12,26,46,0.18)', border: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: T.danger + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IcAlert sz={20} col={T.danger}/>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.text, letterSpacing: '-0.3px' }}>Cancel subscription?</div>
                <div style={{ fontSize: 12, color: T.textS, marginTop: 2 }}>{projects.find(p => p.id === confirmId)?.name}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: T.textS, lineHeight: 1.65, marginBottom: 22, padding: '12px 14px', background: '#FEF2F2', borderRadius: 10, border: '1px solid #FCA5A5' }}>
              Your card will <strong>not</strong> be charged again for this project. This takes effect immediately with Paystack — no further monthly debits will occur.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="outline" onClick={() => setConfirmId(null)} disabled={!!cancelling} style={{ flex: 1, justifyContent: 'center' }}>
                Keep subscription
              </Btn>
              <Btn variant="danger" onClick={() => cancelSubscription(confirmId)} disabled={!!cancelling} style={{ flex: 1, justifyContent: 'center' }}>
                {cancelling ? 'Cancelling…' : 'Yes, cancel it'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
