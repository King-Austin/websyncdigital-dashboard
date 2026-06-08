import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — Websync Digital',
  description: 'The terms governing your use of the Websync Digital client portal and services.',
  robots: { index: true, follow: true },
};

const LAST_UPDATED = '8 June 2026';
const SUPPORT_EMAIL = 'support@websyncdigital.com.ng';

const C = {
  bg: '#E4E2DC',
  card: '#fff',
  accent: '#1F4A35',
  text: '#141310',
  body: '#2E2C26',
  muted: '#555049',
};

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 19, fontWeight: 700, color: C.text, letterSpacing: '-0.3px', margin: '32px 0 12px' }}>
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, lineHeight: 1.7, color: C.body, margin: '0 0 14px' }}>{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul style={{ margin: '0 0 14px', paddingLeft: 22, fontSize: 15, lineHeight: 1.7, color: C.body }}>{children}</ul>;
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} style={{ color: C.accent, fontWeight: 600 }}>
      {children}
    </a>
  );
}

export default function TermsOfServicePage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* Header bar */}
      <header style={{ maxWidth: 760, margin: '0 auto', padding: '28px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 12L7.5 20L12 9L16.5 20L21 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Websync Digital</span>
        </div>
        <Link href="/login" style={{ fontSize: 13.5, fontWeight: 600, color: C.accent, textDecoration: 'none' }}>
          Back to login →
        </Link>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '24px 24px 80px' }}>
        <div style={{ background: C.card, borderRadius: 18, padding: 'clamp(24px, 5vw, 44px)', boxShadow: '0 4px 24px rgba(12,26,46,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: C.text, letterSpacing: '-0.6px', margin: '0 0 6px' }}>
            Terms of Service
          </h1>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Last updated: {LAST_UPDATED}</div>

          <P>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the Websync
            Digital client portal at <strong>app.websyncdigital.com.ng</strong> and the related services
            we provide (together, the &ldquo;Service&rdquo;). By creating an account or using the Service,
            you agree to these Terms.
          </P>

          <H2>1. Acceptance of terms</H2>
          <P>
            By accessing or using the Service, you confirm that you have read, understood, and agree to be
            bound by these Terms and by our <Link href="/privacy" style={{ color: C.accent, fontWeight: 600 }}>Privacy Policy</Link>.
            If you do not agree, do not use the Service.
          </P>

          <H2>2. Description of the service</H2>
          <P>
            Websync Digital is a Nigeria-based web agency. We build, host, and maintain websites for
            businesses and provide a dashboard where clients can monitor their websites, view performance
            and SEO metrics, manage invoices, and request support.
          </P>

          <H2>3. Accounts</H2>
          <UL>
            <li>You must provide accurate and complete information when creating an account.</li>
            <li>You are responsible for keeping your login credentials secure and for all activity under your account.</li>
            <li>You must notify us promptly of any unauthorised use of your account.</li>
          </UL>

          <H2>4. Plans, payment, and billing</H2>
          <UL>
            <li>Our standard offering is a monthly retainer of <strong>₦9,999/month</strong>.</li>
            <li>
              The retainer covers domain registration and renewal, website hosting (with a target of
              99.9% uptime), monthly maintenance and updates, and email and phone support.
            </li>
            <li>Payments are processed securely by <strong>Paystack</strong>. We do not store your card or bank details.</li>
            <li>The subscription recurs until cancelled. Non-payment may result in suspension or termination of the Service, including hosting of your website(s).</li>
            <li>
              Fees already paid are generally non-refundable except where required by law. To cancel,
              contact us at <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>.
            </li>
          </UL>

          <H2>5. Acceptable use</H2>
          <P>You agree not to use the Service to:</P>
          <UL>
            <li>publish or distribute unlawful, infringing, or harmful content;</li>
            <li>attempt to gain unauthorised access to the Service or other users&rsquo; data;</li>
            <li>interfere with or disrupt the integrity or performance of the Service; or</li>
            <li>reverse engineer, copy, or resell the Service except as permitted by law.</li>
          </UL>

          <H2>6. Intellectual property</H2>
          <P>
            Websync Digital owns the platform, software, and all related intellectual property. You retain
            ownership of the content and materials you provide for your website. You grant us the licence
            necessary to host, display, and maintain your content in order to deliver the Service.
          </P>

          <H2>7. Third-party services</H2>
          <P>
            The Service relies on third-party providers, including Supabase (authentication and database),
            Paystack (payments), Resend (transactional email), and Google (sign-in and PageSpeed
            Insights). Your use of those features is also subject to the respective providers&rsquo; terms.
          </P>

          <H2>8. Disclaimers</H2>
          <P>
            The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. While
            we target high availability, uptime figures are goals and not guarantees. To the fullest
            extent permitted by law, we disclaim all warranties not expressly stated in these Terms.
          </P>

          <H2>9. Limitation of liability</H2>
          <P>
            To the fullest extent permitted by law, Websync Digital will not be liable for any indirect,
            incidental, or consequential damages. Our total liability for any claim arising out of or
            relating to the Service is limited to the amount you paid us for the Service in the three
            months preceding the event giving rise to the claim.
          </P>

          <H2>10. Termination</H2>
          <P>
            You may stop using the Service and cancel your subscription at any time. We may suspend or
            terminate access for breach of these Terms or non-payment. Upon termination, hosting of your
            website(s) may cease; on request within a reasonable period, we will provide a copy of your
            content where practicable.
          </P>

          <H2>11. Governing law</H2>
          <P>
            These Terms are governed by the laws of the Federal Republic of Nigeria, and any disputes will
            be subject to the jurisdiction of the Nigerian courts.
          </P>

          <H2>12. Changes to these terms</H2>
          <P>
            We may update these Terms from time to time. When we do, we will revise the &ldquo;Last
            updated&rdquo; date above. Your continued use of the Service after changes take effect
            constitutes acceptance of the updated Terms.
          </P>

          <H2>13. Contact us</H2>
          <P>
            Websync Digital<br />
            Nigeria<br />
            Email: <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>
          </P>

          <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', marginTop: 32, paddingTop: 18, fontSize: 12.5, color: C.muted, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span>© 2026 Websync Digital · websyncdigital.com.ng</span>
            <Link href="/privacy" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>
              Privacy Policy →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
