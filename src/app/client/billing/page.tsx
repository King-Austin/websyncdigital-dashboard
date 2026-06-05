'use client';

import { useEffect, useState } from 'react';
import { T, fmt } from '@/lib/theme';
import { Card, Grid2, SectionTitle } from '@/components/ui';
import { StatusBadge } from '@/components/ui';
import { IcCard, IcCheck } from '@/components/ui/Icons';
import { createClient } from '@/lib/supabase/client';

interface InvoiceRow {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'unpaid' | 'overdue';
}

const PAYSTACK_LINK = process.env.NEXT_PUBLIC_PAYSTACK_SHOP_LINK || 'https://paystack.shop/pay/qgnem3g4a8';

export default function ClientBilling() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const res = await fetch(`/api/invoices?client_id=${user.id}`);
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const totalPaid   = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + i.amount, 0);

  if (loading) return <div style={{ color: T.textS, fontSize: 13, padding: 24 }}>Loading billing…</div>;

  return (
    <div className="fade-in">
      <Grid2 style={{ marginBottom: 22 }}>
        <Card>
          <div style={{ fontSize: 11, color: T.textM, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Total Paid — 2026</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: T.success, letterSpacing: '-0.5px' }}>{fmt(totalPaid)}</div>
          <div style={{ fontSize: 12, color: T.textS, marginTop: 5 }}>{invoices.filter(i => i.status === 'paid').length} invoices settled</div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: T.textM, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Outstanding Balance</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: outstanding ? T.warn : T.success, letterSpacing: '-0.5px' }}>{outstanding ? fmt(outstanding) : '₦0'}</div>
          <div style={{ fontSize: 12, color: T.textS, marginTop: 5 }}>{outstanding ? 'Payment due' : 'All invoices settled'}</div>
          {outstanding > 0 && (
            <div style={{ marginTop: 12 }}>
              <a href={PAYSTACK_LINK} target="_blank" rel="noopener"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: T.accent, color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: 'none', boxShadow: `0 2px 8px ${T.accent}40` }}>
                <IcCard sz={14} col="#fff"/> Pay via Paystack
              </a>
            </div>
          )}
        </Card>
      </Grid2>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
          <SectionTitle>Invoice History</SectionTitle>
        </div>
        {invoices.length === 0
          ? <div style={{ padding: 28, textAlign: 'center', color: T.textS, fontSize: 13 }}>No invoices yet.</div>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Invoice #', 'Description', 'Amount', 'Due Date', 'Status', ''].map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, color: T.textM, fontWeight: 600, borderBottom: `1px solid ${T.border}`, textTransform: 'uppercase', letterSpacing: '0.5px', background: T.elevated }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={inv.id} style={{ borderBottom: i < invoices.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                    <td style={{ padding: '13px 16px', fontSize: 13, color: T.accent, fontWeight: 700 }}>{inv.id}</td>
                    <td style={{ padding: '13px 16px', fontSize: 13, color: T.text }}>{inv.description}</td>
                    <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: T.text }}>{fmt(inv.amount)}</td>
                    <td style={{ padding: '13px 16px', fontSize: 13, color: T.textS }}>{inv.due_date}</td>
                    <td style={{ padding: '13px 16px' }}><StatusBadge s={inv.status}/></td>
                    <td style={{ padding: '13px 16px' }}>
                      {inv.status === 'unpaid'
                        ? <a href={PAYSTACK_LINK} target="_blank" rel="noopener"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: T.accent, color: '#fff', borderRadius: 7, fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                            <IcCard sz={12} col="#fff"/>Pay
                          </a>
                        : <span style={{ fontSize: 12, color: T.textM, display: 'inline-flex', alignItems: 'center', gap: 4 }}><IcCheck sz={12} col={T.success}/>Paid</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </Card>
    </div>
  );
}
