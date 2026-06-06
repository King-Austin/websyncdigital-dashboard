// Surface colors are CSS variables so a `data-theme="dark"` attribute on a
// parent swaps the whole dashboard light/dark. Components keep using T.bg,
// T.card, etc. unchanged — they now resolve to var(--ws-*) at render time.
//
// Accent + status colors stay as real hex because the codebase concatenates
// opacity onto them (e.g. `T.accent + '14'`, `${T.danger}25`), which only
// works on literal hex strings. They read fine on both light and dark.
export const T = {
  // themeable surfaces (never concatenated with opacity)
  bg:       'var(--ws-bg)',
  sidebar:  'var(--ws-sidebar)',
  card:     'var(--ws-card)',
  elevated: 'var(--ws-elevated)',
  border:   'var(--ws-border)',
  borderHi: 'var(--ws-borderHi)',
  text:     'var(--ws-text)',
  textS:    'var(--ws-textS)',
  textM:    'var(--ws-textM)',
  // fixed accent + status hex (safe to concatenate opacity)
  accent:   '#2563EB',
  accentD:  '#1D4ED8',
  success:  '#16A34A',
  warn:     '#D97706',
  danger:   '#DC2626',
  info:     '#0284C7',
  purple:   '#7C3AED',
} as const;

export const fmt = (n: number | string) => '₦' + Number(n).toLocaleString();
export const ini = (name: string) => (name || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
