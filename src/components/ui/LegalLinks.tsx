'use client';

import Link from 'next/link';

/**
 * Small footer row linking to the public Privacy Policy and Terms of Service.
 * Dropped into the auth pages (login, register, forgot/reset password) so the
 * Google OAuth flow always exposes a clear privacy disclosure during sign-in.
 */
export default function LegalLinks({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ textAlign: 'center', fontSize: 12.5, color: '#555049', marginTop: 16, ...style }}>
      <Link href="/privacy" style={{ color: '#1F4A35', fontWeight: 600, textDecoration: 'none' }}>
        Privacy Policy
      </Link>
      <span style={{ margin: '0 8px', color: 'rgba(0,0,0,0.28)' }}>·</span>
      <Link href="/terms" style={{ color: '#1F4A35', fontWeight: 600, textDecoration: 'none' }}>
        Terms of Service
      </Link>
    </div>
  );
}
