'use client';

import { useState, useEffect } from 'react';
import { T, fmt } from '@/lib/theme';
import { Card, Row, Btn, SearchBar, Modal, Input, Sel } from '@/components/ui';
import { StatusBadge, Dot } from '@/components/ui';
import { IcPlus, IcEdit, IcTrash, IcLink, IcCheck } from '@/components/ui/Icons';
import { WebsitePreview } from '@/components/ui/WebsitePreview';

interface WebsiteRow {
  id: number;
  name: string;
  url: string;
  client_id: string;
  status: 'live' | 'maintenance' | 'down';
  domain_expiry: string;
  seo_score: number;
  monthly_visits: number;
  monthly_fee: number;
  ws_profiles: { name: string; company: string } | null;
}

interface ClientOption { id: string; name: string; company: string; }

const blank = { name: '', url: '', client_id: '', status: 'live', domain_expiry: '', monthly_fee: '9999' };

export default function AdminWebsites() {
  const [sites, setSites]     = useState<WebsiteRow[]>([]);
  const [clientOpts, setClientOpts] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editId, setEditId]   = useState<number | null>(null);
  const [search, setSearch]   = useState('');
  const [form, setForm]       = useState(blank);
  const upd = (k: keyof typeof blank) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    Promise.all([
      fetch('/api/websites').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
    ]).then(([w, c]) => { setSites(w); setClientOpts(c); setLoading(false); });
  }, []);

  const filtered = sites.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.url || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setEditId(null); setForm(blank); setModal(true); };
  const openEdit = (s: WebsiteRow) => { setEditId(s.id); setForm({ name: s.name, url: s.url || '', client_id: s.client_id, status: s.status, domain_expiry: s.domain_expiry || '', monthly_fee: String(s.monthly_fee) }); setModal(true); };

  const handleDel = async (id: number) => {
    await fetch(`/api/websites/${id}`, { method: 'DELETE' });
    setSites(ss => ss.filter(s => s.id !== id));
  };

  const handleSave = async () => {
    const payload = { ...form, monthly_fee: Number(form.monthly_fee) };
    if (editId) {
      const res = await fetch(`/api/websites/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const updated = await res.json();
      setSites(ss => ss.map(s => s.id === editId ? { ...s, ...updated } : s));
    } else {
      const res = await fetch('/api/websites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const created = await res.json();
      setSites(ss => [created, ...ss]);
    }
    setModal(false);
  };

  if (loading) return <div style={{ color: T.textS, fontSize: 13, padding: 24 }}>Loading websites…</div>;

  return (
    <div className="fade-in">
      <Row style={{ marginBottom: 18 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search websites…"/>
        <Btn onClick={openAdd}><IcPlus sz={14}/>Add Website</Btn>
      </Row>
      <Card style={{ padding: 0 }}>
        <div className="card-table-wrap">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Website', 'Client', 'Status', 'SEO', 'Visits', 'Domain Expires', 'Monthly Fee', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '11px 14px', fontSize: 11, color: T.textM, fontWeight: 600, borderBottom: `1px solid ${T.border}`, textTransform: 'uppercase', letterSpacing: '0.5px', background: T.elevated }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{s.name}</div>
                  {s.url && <a href={'https://' + s.url} target="_blank" rel="noopener" style={{ fontSize: 11, color: T.accent, textDecoration: 'none' }}>{s.url}</a>}
                </td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: T.textS }}>{s.ws_profiles?.company || '—'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <Row><StatusBadge s={s.status}/><Dot color={s.status==='live'?T.success:s.status==='maintenance'?T.warn:T.danger} pulse={s.status==='live'}/></Row>
                </td>
                <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: s.seo_score>=75?T.success:s.seo_score>=60?T.warn:T.danger }}>{s.seo_score}</td>
                <td style={{ padding: '12px 14px', fontSize: 13, color: T.text }}>{s.monthly_visits.toLocaleString()}</td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: T.textS }}>{s.domain_expiry || '—'}</td>
                <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: s.monthly_fee>0?T.success:T.textM }}>{s.monthly_fee > 0 ? fmt(s.monthly_fee) : '—'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <Row>
                    <Btn sz="sm" variant="ghost" onClick={() => openEdit(s)}><IcEdit sz={12}/></Btn>
                    <Btn sz="sm" variant="ghost" style={{ color: T.danger }} onClick={() => handleDel(s.id)}><IcTrash sz={12}/></Btn>
                    {s.url && <a href={'https://' + s.url} target="_blank" rel="noopener"><Btn sz="sm" variant="ghost"><IcLink sz={12}/></Btn></a>}
                  </Row>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: 28, textAlign: 'center', color: T.textS, fontSize: 13 }}>No websites found.</div>}
        </div>
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Website' : 'Add Website'}>
        <div className="modal-form-grid" style={{ gap: 0 }}>
          <Input label="Website Name" value={form.name} onChange={upd('name')} placeholder="e.g. Amaka's Bakery" required/>
          <Input label="URL" value={form.url} onChange={upd('url')} placeholder="e.g. amakasbakery.com.ng"/>
          <Sel label="Client" value={form.client_id} onChange={upd('client_id')} opts={[{v:'',l:'Select client…'}, ...clientOpts.map(c => ({v:c.id,l:c.company || c.name}))]}/>
          <Sel label="Status" value={form.status} onChange={upd('status')} opts={[{v:'live',l:'Live'},{v:'maintenance',l:'Maintenance'},{v:'down',l:'Down'}]}/>
          <Input label="Domain Expiry"    value={form.domain_expiry} onChange={upd('domain_expiry')} placeholder="e.g. Aug 12, 2026"/>
          <Input label="Monthly Fee (₦)" value={form.monthly_fee}   onChange={upd('monthly_fee')}   placeholder="9999" type="number"/>
        </div>
        {form.url && <WebsitePreview url={form.url} height={160}/>}
        <Row style={{ justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn variant="outline" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn disabled={!form.name} onClick={handleSave}><IcCheck sz={13}/>{editId ? 'Update' : 'Add Website'}</Btn>
        </Row>
      </Modal>
    </div>
  );
}
