'use client';

import { T } from '@/lib/theme';

export const LineChart = ({ data, w = 280, h = 64, col = '#2563EB', id = 'c' }: { data: number[]; w?: number; h?: number; col?: string; id?: string }) => {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - mn) / rng) * (h - 10) - 5] as [number, number]);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
  const area = `M0,${h} L${pts.map(([x, y]) => `${x},${y}`).join(' L ')} L${w},${h} Z`;
  const gid = `g_${id}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: h }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity="0.18" />
          <stop offset="100%" stopColor={col} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} stroke={col} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const BarChart = ({ data, h = 120 }: { data: Array<{ m: string; r: number }>; h?: number }) => {
  const w = 440;
  const mx = Math.max(...data.map(d => d.r));
  const bw = (w / data.length) * 0.55;
  const gap = (w / data.length) * 0.45 / 2;
  return (
    <svg width="100%" height={h + 22} viewBox={`0 0 ${w} ${h + 22}`} style={{ display: 'block' }}>
      {data.map((d, i) => {
        const bh = (d.r / mx) * (h - 10);
        const x = i * (w / data.length) + gap;
        const y = h - bh;
        const isCur = i === data.length - 1;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx={5} fill={T.accent} fillOpacity={isCur ? 1 : 0.25} />
            <text x={x + bw / 2} y={h + 16} textAnchor="middle" fill={T.textM} fontSize="11">{d.m}</text>
          </g>
        );
      })}
    </svg>
  );
};
