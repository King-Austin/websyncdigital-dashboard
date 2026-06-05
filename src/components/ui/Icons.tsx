'use client';

interface IcProps {
  d: string;
  sz?: number;
  col?: string;
  fill?: string;
  sw?: number;
  style?: React.CSSProperties;
}

export const Ic = ({ d, sz = 18, col = 'currentColor', fill = 'none', sw = 1.75, style }: IcProps) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill={fill} stroke={col} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
    {d.split('||').map((p, i) => <path key={i} d={p} />)}
  </svg>
);

type IconProps = { sz?: number; col?: string };

export const IcHome      = (p: IconProps) => <Ic {...p} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z||M9 22V12h6v10"/>;
export const IcGlobe     = (p: IconProps) => <Ic {...p} d="M12 2a10 10 0 100 20A10 10 0 0012 2z||M2 12h20||M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>;
export const IcBar       = (p: IconProps) => <Ic {...p} d="M18 20V10||M12 20V4||M6 20v-6"/>;
export const IcFile      = (p: IconProps) => <Ic {...p} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z||M14 2v6h6||M16 13H8||M16 17H8"/>;
export const IcCard      = (p: IconProps) => <Ic {...p} d="M1 4h22v16H1z||M1 10h22"/>;
export const IcMsg       = (p: IconProps) => <Ic {...p} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>;
export const IcBell      = (p: IconProps) => <Ic {...p} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9||M13.73 21a2 2 0 01-3.46 0"/>;
export const IcUsers     = (p: IconProps) => <Ic {...p} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2||M9 7a4 4 0 100 8 4 4 0 000-8z||M23 21v-2a4 4 0 00-3-3.87||M16 3.13a4 4 0 010 7.75"/>;
export const IcBriefcase = (p: IconProps) => <Ic {...p} d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z||M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>;
export const IcTrend     = (p: IconProps) => <Ic {...p} d="M23 6l-9.5 9.5-5-5L1 18||M17 6h6v6"/>;
export const IcMail      = (p: IconProps) => <Ic {...p} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z||M22 6l-10 7L2 6"/>;
export const IcCog       = (p: IconProps) => <Ic {...p} d="M12 15a3 3 0 100-6 3 3 0 000 6z||M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>;
export const IcPlus      = (p: IconProps) => <Ic {...p} d="M12 5v14||M5 12h14"/>;
export const IcEdit      = (p: IconProps) => <Ic {...p} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7||M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>;
export const IcTrash     = (p: IconProps) => <Ic {...p} d="M3 6h18||M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6||M8 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>;
export const IcX         = (p: IconProps) => <Ic {...p} d="M18 6L6 18||M6 6l12 12"/>;
export const IcCheck     = (p: IconProps) => <Ic {...p} d="M20 6L9 17l-5-5"/>;
export const IcChevD     = (p: IconProps) => <Ic {...p} d="M6 9l6 6 6-6"/>;
export const IcSearch    = (p: IconProps) => <Ic {...p} d="M11 19a8 8 0 100-16 8 8 0 000 16z||M21 21l-4.35-4.35"/>;
export const IcLink      = (p: IconProps) => <Ic {...p} d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6||M15 3h6v6||M10 14L21 3"/>;
export const IcAlert     = (p: IconProps) => <Ic {...p} d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z||M12 9v4||M12 17h.01"/>;
export const IcCal       = (p: IconProps) => <Ic {...p} d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z||M16 2v4||M8 2v4||M3 10h18"/>;
export const IcSend      = (p: IconProps) => <Ic {...p} d="M22 2L11 13||M22 2l-7 20-4-9-9-4 20-7z"/>;
export const IcEye       = (p: IconProps) => <Ic {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z||M12 9a3 3 0 100 6 3 3 0 000-6z"/>;
export const IcShield    = (p: IconProps) => <Ic {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>;
export const IcDollar    = (p: IconProps) => <Ic {...p} d="M12 1v22||M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>;
export const IcZap       = (p: IconProps) => <Ic {...p} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>;
export const IcLock      = (p: IconProps) => <Ic {...p} d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z||M7 11V7a5 5 0 0110 0v4"/>;
