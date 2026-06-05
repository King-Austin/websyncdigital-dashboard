'use client';

import { useState, useEffect } from 'react';
import { T, fmt } from '@/lib/theme';
import { Card, Row, Btn, SearchBar, Modal, Input, Sel } from '@/components/ui';
import { StatusBadge, Avatar, Badge } from '@/components/ui';
import { IcPlus, IcEdit, IcTrash, IcMail, IcCheck } from '@/components/ui/Icons';

interface ClientRow {
  id: string;
  name: string;
  company: string;
  phone: string;
  role: string;
  created_at: string;
  ws_websites: { count: number }[];
}

const blank = { name: '', company: '', phone: '', status: 'active' };

export default function AdminClients() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editId, setEditId]   = useState<string | null>(null);
  const [search, setSearch]   = useState('');
  const [form, setForm]       = useState(blank);
  const upd = (k: keyof typeof blank) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => { setClients(d); setLoading(false); });
  }, []);

  const filtered = clients.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.company || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setEditId(null); setForm(blank); setModal(true); };
  const openEdit = (c: ClientRow) => { setEditId(c.id); setForm({ name: c.name || '', company: c.company || '', phone: c.phone || '', status: 'active' }); setModal(true); };

  const handleDel = async (id: string) => {
    await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    setClients(cs => cs.filter(c => c.id !== id));
  };

  const handleSave = async () => {
    if (editId) {
      const res = await fetch(`/api/clients/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const updated = await res.json();
      setClients(cs => cs.map(c => c.id === editId ? { ...c, ...updated } : c));
    } else {
      const res = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const created = await res.json();
      setClients(cs => [created, ...cs]);
    }
    setModal(false);
  };

  if (loading) return <div style={{ color: T.textS, fontSize: 13, padding: 24 }}>Loading clients…</div>;

  return (
    <div className="fade-in">
      <Row style={{ marginBottom: 18 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or company…"/>
        <Btn onClick={openAdd}><IcPlus sz={14}/>Add Client</Btn>
      </Row>

      <Card style={{ padding: 0 }}>
        <div className="card-table-wrap">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Client', 'Phone', 'Websites', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '11px 16px', fontSize: 11, color: T.textM, fontWeight: 600, borderBottom: `1px solid ${T.border}`, textTransform: 'uppercase', letterSpacing: '0.5px', background: T.elevated }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                <td style={{ padding: '13px 16px' }}>
                  <Row><Avatar name={c.name || '?'} sz={34}/><div><div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{c.name}</div><div style={{ fontSize: 11, color: T.textS }}>{c.company}</div></div></Row>
                </td>
                <td style={{ padding: '13px 16px', fontSize: 12, color: T.textS }}>{c.phone}</td>
                <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 700, color: T.text, textAlign: 'center' }}>{c.ws_websites?.[0]?.count ?? 0}</td>
                <td style={{ padding: '13px 16px' }}>
                  <Row>
                    <Btn sz="sm" variant="ghost" onClick={() => openEdit(c)}><IcEdit sz={12}/></Btn>
                    <Btn sz="sm" variant="ghost" style={{ color: T.danger }} onClick={() => handleDel(c.id)}><IcTrash sz={12}/></Btn>
                    <Btn sz="sm" variant="ghost"><IcMail sz={12}/></Btn>
                  </Row>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: 28, textAlign: 'center', color: T.textS, fontSize: 13 }}>No clients found.</div>}
        </div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Client' : 'Add New Client'}>
        <div className="modal-form-grid" style={{ gap: 0 }}>
          <Input label="Full Name"    value={form.name}    onChange={upd('name')}    placeholder="e.g. Amaka Okonkwo" required/>
          <Input label="Company Name" value={form.company} onChange={upd('company')} placeholder="e.g. Lagos Bakery"/>
          <Input label="Phone Number" value={form.phone}   onChange={upd('phone')}   placeholder="+234 801 234 5678"/>
        </div>
        <Row style={{ justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn variant="outline" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn disabled={!form.name} onClick={handleSave}><IcCheck sz={13}/>{editId ? 'Update Client' : 'Add Client'}</Btn>
        </Row>
      </Modal>
    </div>
  );
}
