import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

// Inter is a variable font, so no explicit weight array is needed. It is exposed
// as the --font-sans CSS variable and consumed everywhere via globals.css.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Websync Digital — Dashboard',
  description: 'Client & Admin dashboard for Websync Digital web agency',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${inter.className}`}>
      <body style={{ minHeight: '100vh', background: '#F4F7FB' }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
