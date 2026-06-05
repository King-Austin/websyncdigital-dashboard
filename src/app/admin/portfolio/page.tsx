'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/theme';
import { Card, Row, Btn, Modal, Input, Sel, Textarea, Badge } from '@/components/ui';
import { StatusBadge } from '@/components/ui';
import { IcGlobe, IcPlus, IcEdit, IcTrash, IcCheck } from '@/components/ui/Icons';

interface PortfolioRow {
  id: number;
  name: string;
  url: string | null;
  category: string;
  year: number;
  visibility: 'public' | 'internal';
  description: string;
}

const CAT_COLS: Record<string, string> = { 'Food & Restaurant': T.warn, Technology: T.info, Education: T.success, 'Fashion & Retail': T.purple, Internal: T.textS };
const blank = { name: '', url: '', category: 'Food & Restaurant', year: '2026', visibility: 'public', description: '' };

export default function AdminPortfolio() {
  const [items, setItems]   = useState<PortfolioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');
  const [form, setForm]     = useState(blank);
  const upd = (k: keyof typeof blank) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch('/api/portfolio').then(r => r.json()).then(d => { setItems(d); setLoading(false); });
  }, []);

  const cats = ['all', ...new Set(items.map(i => i.category))];
  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

  const openEdit   = (item: PortfolioRow) => { setEditId(item.id); setForm({ name: item.name, url: item.url || '', category: item.category, year: String(item.year), visibility: item.visibility, description: item.description }); setModal(true); };
  const handleDel  = async (id: number) => {
    await fetch(`/api/portfolio/${id}`, { method: 'DELETE' });
    setItems(is => is.filter(i => i.id !== id));
  };
  const handleSave = async () => {
    const payload = { ...form, year: Number(form.year) };
    if (editId) {
      const res = await fetch(`/api/portfolio/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const updated = await res.json();
      setItems(is => is.map(i => i.id === editId ? updated : i));
    } else {
      const res = await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const created = await res.json();
      setItems(is => [created, ...is]);
    }
    setModal(false);
  };

  if (loading) return <div style={{ color: T.textS, fontSize: 13, padding: 24 }}>Loading portfolio…</div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${filter===c?T.accent:T.border}`, background: filter===c ? T.accent+'12' : 'transparent', color: filter===c ? T.accent : T.textS, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans', transition: 'all 0.12s' }}>
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
        <Btn onClick={() => { setEditId(null); setForm(blank); setModal(true); }}><IcPlus sz={14}/>Add Project</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {filtered.map(item => {
          const col = CAT_COLS[item.category] || T.accent;
          return (
            <Card key={item.id}>
              <div style={{ height: 88, borderRadius: 10, background: col + '10', border: `1px solid ${col}20`, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IcGlobe sz={32} col={col}/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.text, flex: 1 }}>{item.name}</div>
                <StatusBadge s={item.visibility}/>
              </div>
              <Row style={{ marginBottom: 8 }}>
                <Badge col={col}>{item.category}</Badge>
                <span style={{ fontSize: 11, color: T.textM }}>{item.year}</span>
              </Row>
              <p style={{ fontSize: 12, color: T.textS, marginBottom: 12, lineHeight: 1.55 }}>{item.description}</p>
              {item.url && <div style={{ fontSize: 12, color: T.accent, marginBottom: 12 }}>{item.url}</div>}
              <Row>
                <Btn sz="sm" variant="ghost" onClick={() => openEdit(item)}><IcEdit sz={12}/>Edit</Btn>
                <Btn sz="sm" variant="ghost" style={{ color: T.danger }} onClick={() => handleDel(item.id)}><IcTrash sz={12}/>Delete</Btn>
              </Row>
            </Card>
          );
        })}
      </div>

      {items.length === 0 && <div style={{ padding: 28, textAlign: 'center', color: T.textS, fontSize: 13 }}>No portfolio items yet.</div>}

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Portfolio Item' : 'Add Portfolio Item'}>
        <Input label="Project Name" value={form.name} onChange={upd('name')} placeholder="e.g. Amaka's Bakery" required/>
        <Input label="URL (optional)" value={form.url} onChange={upd('url')} placeholder="e.g. amakasbakery.com.ng"/>
        <div className="modal-form-grid" style={{ gap: 0 }}>
          <Sel label="Category" value={form.category} onChange={upd('category')} opts={['Food & Restaurant','Technology','Education','Fashion & Retail','Healthcare','Finance','Internal','Other'].map(c => ({v:c,l:c}))}/>
          <Input label="Year" value={form.year} onChange={upd('year')} type="number"/>
        </div>
        <Sel label="Visibility" value={form.visibility} onChange={upd('visibility')} opts={[{v:'public',l:'Public — appears in portfolio'},{v:'internal',l:'Internal — admin only'}]}/>
        <Textarea label="Description" value={form.description} onChange={upd('description')} placeholder="Brief description…" rows={3}/>
        <Row style={{ justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn variant="outline" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn disabled={!form.name} onClick={handleSave}><IcCheck sz={13}/>{editId ? 'Update' : 'Add to Portfolio'}</Btn>
        </Row>
      </Modal>
    </div>
  );
}
