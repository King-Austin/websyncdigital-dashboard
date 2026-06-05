export const T = {
  bg:       '#F4F7FB',
  sidebar:  '#FFFFFF',
  card:     '#FFFFFF',
  elevated: '#EDF2F8',
  border:   '#DDE5F0',
  borderHi: '#C5D4E8',
  accent:   '#2563EB',
  accentD:  '#1D4ED8',
  success:  '#16A34A',
  warn:     '#D97706',
  danger:   '#DC2626',
  info:     '#0284C7',
  purple:   '#7C3AED',
  text:     '#0C1A2E',
  textS:    '#5B728E',
  textM:    '#8FA9C4',
} as const;

export const fmt = (n: number | string) => '₦' + Number(n).toLocaleString();
export const ini = (name: string) => (name || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
