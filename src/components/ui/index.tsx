'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { T, ini } from '@/lib/theme';

// ── COUNT-UP HOOK ─────────────────────────────────────────────────────────────
function useCountUp(end: string | number, duration = 900): string {
  const numeric = typeof end === 'number' ? end : parseFloat(String(end).replace(/[^0-9.]/g, ''));
  const isNumeric = !isNaN(numeric) && numeric > 0;
  const [display, setDisplay] = React.useState<string>(isNumeric ? '0' : String(end));
  const prefix = typeof end === 'string' ? end.match(/^[^0-9]*/)?.[0] ?? '' : '';
  const suffix = typeof end === 'string' ? end.match(/[^0-9.]+$/)?.[0] ?? '' : '';

  React.useEffect(() => {
    if (!isNumeric) { setDisplay(String(end)); return; }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = Math.round(eased * numeric);
      const formatted = typeof end === 'string' && String(end).includes(',')
        ? cur.toLocaleString()
        : String(cur);
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end]); // eslint-disable-line react-hooks/exhaustive-deps

  return display;
}

// ── DOT ──────────────────────────────────────────────────────────────────────
export const Dot = ({ color = '#16A34A', pulse = false }: { color?: string; pulse?: boolean }) => (
  <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 10, height: 10 }}>
    {pulse && <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.4, animation: 'ping 1.5s infinite' }} />}
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'block' }} />
  </span>
);

// ── BUTTON ────────────────────────────────────────────────────────────────────
interface BtnProps {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'success' | 'subtle';
  sz?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

export const Btn = ({ children, variant = 'primary', sz = 'md', onClick, disabled, style: xtra = {}, type = 'button' }: BtnProps) => {
  const vs: Record<string, React.CSSProperties> = {
    primary: { background: T.accent, color: '#fff', border: 'none', boxShadow: `0 1px 3px ${T.accent}40` },
    outline: { background: 'transparent', color: T.text, border: `1px solid ${T.border}` },
    ghost:   { background: 'transparent', color: T.textS, border: 'none' },
    danger:  { background: T.danger, color: '#fff', border: 'none' },
    success: { background: T.success, color: '#fff', border: 'none' },
    subtle:  { background: T.elevated, color: T.text, border: `1px solid ${T.border}` },
  };
  const ss: Record<string, React.CSSProperties> = {
    sm: { padding: '5px 11px', fontSize: 12 },
    md: { padding: '8px 16px', fontSize: 13 },
    lg: { padding: '11px 22px', fontSize: 15 },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...vs[variant], ...ss[sz],
      borderRadius: 8, fontFamily: 'var(--font-app)', fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
      transition: 'all 0.15s', ...xtra,
    }}>{children}</button>
  );
};

// ── BADGE ─────────────────────────────────────────────────────────────────────
export const Badge = ({ children, col = '#2563EB' }: { children: React.ReactNode; col?: string }) => (
  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: col + '18', color: col, border: `1px solid ${col}25` }}>{children}</span>
);

// ── STATUS BADGE ──────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, [string, string]> = {
  live:        [T.success, 'Live'],
  maintenance: [T.warn,    'Maintenance'],
  down:        [T.danger,  'Down'],
  active:      [T.success, 'Active'],
  pending:     [T.warn,    'Pending'],
  processing:  [T.info,    'Processing'],
  submitted:   [T.warn,    'Submitted'],
  cancelled:   [T.danger,  'Cancelled'],
  inactive:    [T.textS,   'Inactive'],
  open:        [T.danger,  'Open'],
  resolved:    [T.success, 'Resolved'],
  paid:        [T.success, 'Paid'],
  unpaid:      [T.warn,    'Unpaid'],
  overdue:     [T.danger,  'Overdue'],
  high:        [T.danger,  'High'],
  medium:      [T.warn,    'Medium'],
  low:         [T.info,    'Low'],
  public:      [T.info,    'Public'],
  internal:    [T.textS,   'Internal'],
};

export const StatusBadge = ({ s }: { s: string }) => {
  const [c, l] = STATUS_MAP[s] || [T.textS, s];
  return <Badge col={c}>{l}</Badge>;
};

// ── CARD ──────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card = ({ children, style: xtra = {}, onClick }: CardProps) => (
  <div onClick={onClick} style={{
    background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20,
    boxShadow: '0 1px 4px rgba(12,26,46,0.06)',
    ...(onClick ? { cursor: 'pointer', transition: 'box-shadow 0.15s' } : {}),
    ...xtra,
  }}>{children}</div>
);

// ── STAT CARD ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactElement;
  trend?: number;
  col?: string;
}

export const StatCard = ({ label, value, sub, icon, trend, col = '#2563EB' }: StatCardProps) => {
  const animated = useCountUp(value);
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: T.textM, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: T.text, lineHeight: 1, letterSpacing: '-0.5px' }}>{animated}</div>
          {sub && <div style={{ fontSize: 12, color: T.textS, marginTop: 7 }}>{sub}</div>}
          {trend !== undefined && (
            <div style={{ fontSize: 12, color: trend > 0 ? T.success : T.danger, marginTop: 5, fontWeight: 600 }}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
            </div>
          )}
        </div>
        {icon && (
          <div style={{ width: 44, height: 44, borderRadius: 12, background: col + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 10 }}>
            {React.cloneElement(icon, { sz: 19, col } as any)}
          </div>
        )}
      </div>
    </Card>
  );
};

// ── INPUT ─────────────────────────────────────────────────────────────────────
interface InputProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

export const Input = ({ label, value, onChange, placeholder, type = 'text', required }: InputProps) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 12, color: T.textS, marginBottom: 5, fontWeight: 600 }}>{label}{required && <span style={{ color: T.danger }}> *</span>}</div>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', padding: '9px 12px', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, fontFamily: 'var(--font-app)', outline: 'none', transition: 'border-color 0.15s' }} />
  </div>
);

// ── TEXTAREA ──────────────────────────────────────────────────────────────────
export const Textarea = ({ label, value, onChange, placeholder, rows = 4 }: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 12, color: T.textS, marginBottom: 5, fontWeight: 600 }}>{label}</div>}
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: '100%', padding: '9px 12px', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, fontFamily: 'var(--font-app)', outline: 'none', resize: 'vertical', transition: 'border-color 0.15s' }} />
  </div>
);

// ── SELECT ────────────────────────────────────────────────────────────────────
export const Sel = ({ label, value, onChange, opts }: { label?: string; value: string; onChange: (v: string) => void; opts: Array<{ v: string; l: string } | string> }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 12, color: T.textS, marginBottom: 5, fontWeight: 600 }}>{label}</div>}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '9px 12px', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, fontFamily: 'var(--font-app)', outline: 'none', cursor: 'pointer' }}>
      {opts.map(o => {
        const v = typeof o === 'string' ? o : o.v;
        const l = typeof o === 'string' ? o : o.l;
        return <option key={v} value={v}>{l}</option>;
      })}
    </select>
  </div>
);

// ── MODAL ─────────────────────────────────────────────────────────────────────
import { IcX } from './Icons';

export const Modal = ({ open, onClose, title, children, w = 760 }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; w?: number }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,26,46,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}
      className="modal-backdrop"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{`
        @media (min-width: 640px) {
          .modal-backdrop { padding: 24px !important; }
          .modal-sheet { width: var(--modal-w) !important; }
          .modal-form-grid { grid-template-columns: 1fr 1fr !important; }
        }
        .modal-sheet { overflow-y: auto; }
        .modal-form-grid { display: grid; grid-template-columns: 1fr; gap: 0; }
      `}</style>
      <div className="modal-sheet" style={{ '--modal-w': `${w}px`, background: '#FFFFFF', border: `1px solid ${T.border}`, borderRadius: 18, width: '100%', maxWidth: '100%', maxHeight: '90vh', padding: 28, boxShadow: '0 12px 40px rgba(12,26,46,0.18)' } as React.CSSProperties}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: T.elevated, border: `1px solid ${T.border}`, cursor: 'pointer', color: T.textS, padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center' }}><IcX sz={16} /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

// ── AVATAR ────────────────────────────────────────────────────────────────────
export const Avatar = ({ name, sz = 36 }: { name: string; sz?: number }) => {
  const palette = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2', '#BE185D'];
  const col = palette[(name || '').charCodeAt(0) % palette.length];
  return (
    <div style={{ width: sz, height: sz, borderRadius: '50%', background: col + '18', border: `1.5px solid ${col}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: sz * 0.36, fontWeight: 700, color: col, flexShrink: 0 }}>
      {ini(name)}
    </div>
  );
};

// ── GRID HELPERS ──────────────────────────────────────────────────────────────
export const Grid4 = ({ children }: { children: React.ReactNode }) => (
  <div className="grid4-resp">{children}</div>
);
export const Grid2 = ({ children, style: xtra = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div className="grid2-resp" style={xtra}>{children}</div>
);
export const Row = ({ children, style: xtra = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...xtra }}>{children}</div>
);

// ── SECTION TITLE ─────────────────────────────────────────────────────────────
export const SectionTitle = ({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
    <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-0.2px' }}>{children}</h2>
    {action}
  </div>
);

// ── SEARCH BAR ────────────────────────────────────────────────────────────────
import { IcSearch } from './Icons';

export const SearchBar = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 12px' }}>
    <IcSearch sz={15} col={T.textM} />
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'Search...'}
      style={{ background: 'none', border: 'none', color: T.text, fontSize: 13, fontFamily: 'var(--font-app)', outline: 'none', flex: 1 }} />
  </div>
);
