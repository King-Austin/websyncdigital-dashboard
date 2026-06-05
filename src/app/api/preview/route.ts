import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });

  // Normalize URL
  const normalized = url.startsWith('http') ? url : `https://${url}`;

  try {
    new URL(normalized);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  // Use microlink.io free screenshot API
  const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(normalized)}&screenshot=true&meta=false&embed=screenshot.url`;

  return NextResponse.json({ screenshot: screenshotUrl, url: normalized });
}
