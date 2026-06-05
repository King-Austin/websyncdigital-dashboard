'use client';

import { useEffect, useState, useRef } from 'react';
import { T } from '@/lib/theme';
import { IcGlobe } from '@/components/ui/Icons';

interface Props {
  url: string;
  height?: number;
}

function normalize(url: string) {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
}

export function WebsitePreview({ url, height = 140 }: Props) {
  const [src, setSrc]         = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(false);
  const debounce              = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!url || url.length < 4) { setSrc(null); setError(false); return; }

    setLoading(true);
    setError(false);
    setSrc(null);

    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (data.screenshot) setSrc(data.screenshot);
        else setError(true);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }, 800);

    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [url]);

  if (!url || url.length < 4) return null;

  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.border}`, background: T.elevated, height, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
      {loading && (
        <div style={{ fontSize: 12, color: T.textM, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 14, height: 14, border: `2px solid ${T.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
          Loading preview…
        </div>
      )}
      {!loading && error && (
        <div style={{ fontSize: 12, color: T.textM, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <IcGlobe sz={24} col={T.textM}/>
          <span>Preview unavailable</span>
        </div>
      )}
      {!loading && src && (
        <img
          src={src}
          alt={`Preview of ${normalize(url)}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
          onError={() => setError(true)}
        />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
