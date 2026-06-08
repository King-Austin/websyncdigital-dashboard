import React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { T } from '@/lib/theme';
import { IcCard, IcGlobe } from '@/components/ui/Icons';

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { data: invoice, error } = await supabase
    .from('ws_invoices')
    .select('*, ws_profiles(name, company), ws_projects(name)')
    .eq('id', params.id)
    .single();

  if (error || !invoice) return (
    <div style={{ padding: 24, color: T.danger }}>Invoice not found.</div>
  );

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: T.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcCard sz={22} col={T.accent} />
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>{invoice.id}</div>
          <div style={{ fontSize: 13, color: T.textM }}>{invoice.description || 'Invoice'}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div style={{ background: T.card, padding: 16, borderRadius: 12, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 13, color: T.textS, marginBottom: 8 }}>Billing</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>₦{(invoice.amount / 100).toLocaleString()}</div>
          <div style={{ fontSize: 12, color: T.textM }}>Status: <strong style={{ color: invoice.status === 'paid' ? T.success : T.warn }}>{invoice.status}</strong></div>
          <div style={{ marginTop: 12, fontSize: 12, color: T.textM }}>Created: {new Date(invoice.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          {invoice.due_date && <div style={{ marginTop: 6, fontSize: 12, color: T.textM }}>Due: {invoice.due_date}</div>}
          {invoice.paystack_reference && <div style={{ marginTop: 8, fontSize: 12, color: T.textM }}>Paystack ref: {invoice.paystack_reference}</div>}
        </div>

        <div style={{ background: T.card, padding: 16, borderRadius: 12, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 13, color: T.textS, marginBottom: 8 }}>Client</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{invoice.ws_profiles?.name || invoice.client_id}</div>
          {invoice.ws_profiles?.company && <div style={{ fontSize: 12, color: T.textM }}>{invoice.ws_profiles.company}</div>}
          <div style={{ height: 12 }} />
          <div style={{ fontSize: 13, color: T.textS, marginBottom: 8 }}>Project</div>
          {invoice.ws_projects ? (
            <Link href={`/admin/projects`} style={{ textDecoration: 'none', color: T.accent }}>{invoice.ws_projects.name}</Link>
          ) : (
            <div style={{ fontSize: 12, color: T.textM }}>—</div>
          )}
        </div>
      </div>
    </div>
  );
}
