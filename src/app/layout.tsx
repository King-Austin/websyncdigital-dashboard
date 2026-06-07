import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Websync Digital — Dashboard',
  description: 'Client & Admin dashboard for Websync Digital web agency',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.className}>
      <body style={{ minHeight: '100vh', background: '#F4F7FB' }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
