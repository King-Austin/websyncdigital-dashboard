import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Websync Digital',
  description:
    'How Websync Digital collects, uses, stores, and protects your information, including data accessed through Google Sign-In.',
  robots: { index: true, follow: true },
};

const LAST_UPDATED = '8 June 2026';
const SUPPORT_EMAIL = 'support@websyncdigital.com.ng';

// ── Document layout primitives (inline, matching the app's styling convention) ──
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
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: C.accent, fontWeight: 600 }}>
      {children}
    </a>
  );
}

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Last updated: {LAST_UPDATED}</div>

          <P>
            This Privacy Policy explains how Websync Digital (&ldquo;Websync Digital&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) collects, uses, stores, shares,
            and protects information when you use our client portal at{' '}
            <strong>app.websyncdigital.com.ng</strong> (the &ldquo;Service&rdquo;). Our public website
            is at <strong>www.websyncdigital.com.ng</strong>. By using the Service, you agree to the
            practices described here.
          </P>

          <H2>1. Who we are</H2>
          <P>
            Websync Digital is a Nigeria-based web agency that builds, hosts, and maintains websites for
            businesses and provides a dashboard for clients to monitor their websites, track performance
            metrics, manage invoices, and request support. If you have any questions about this policy,
            contact us at <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>.
          </P>

          <H2>2. Information we collect</H2>
          <UL>
            <li>
              <strong>Account information you provide:</strong> your name, email address, business
              (company) name, and phone number when you register or update your profile.
            </li>
            <li>
              <strong>Information from Google Sign-In:</strong> if you choose &ldquo;Continue with
              Google&rdquo;, we receive certain data from your Google Account — see Section 3 for the
              full disclosure.
            </li>
            <li>
              <strong>Website data:</strong> the website addresses (URLs) you add to your account and the
              SEO and performance scores we compute for them.
            </li>
            <li>
              <strong>Billing information:</strong> subscription and payment records. Payments are
              processed by Paystack; we do not collect or store your card or bank details.
            </li>
            <li>
              <strong>Technical and session data:</strong> authentication session cookies and basic
              technical information needed to operate and secure the Service.
            </li>
          </UL>

          <H2>3. How we access and use Google user data</H2>
          <P>
            When you sign in with the &ldquo;Continue with Google&rdquo; option, we use Google OAuth 2.0
            through our authentication provider (Supabase). During this process we request the following
            Google OAuth scopes: <strong>openid</strong>, <strong>email</strong>, and{' '}
            <strong>profile</strong>.
          </P>
          <P>
            <strong>Google data we access:</strong>
          </P>
          <UL>
            <li>your <strong>email address</strong>;</li>
            <li>your <strong>full (display) name</strong>; and</li>
            <li>your <strong>Google Account unique user ID</strong> (an identifier Google assigns to your account).</li>
          </UL>
          <P>
            <strong>Google data we do NOT access:</strong> we do not request or store your Google profile
            picture, and we do not access Google Drive, Gmail, Google Calendar, Google Contacts, or any
            other Google product or service.
          </P>
          <P>
            <strong>How we use this Google data:</strong>
          </P>
          <UL>
            <li><strong>Email address</strong> — to identify your account, send password-reset links, and deliver billing and transactional notifications.</li>
            <li><strong>Full name</strong> — to display your name in your profile and in your account dashboard.</li>
            <li><strong>Google unique user ID</strong> — to manage your sign-in session and control access to your data.</li>
          </UL>
          <P>
            <strong>Where this Google data is stored:</strong> your email address and name are stored in
            our database (Supabase PostgreSQL) in a profile record associated with your account. Your
            Google unique user ID is used as your account identifier within our authentication provider
            (Supabase Auth).
          </P>
          <P>
            <strong>Limited Use:</strong> Websync Digital&rsquo;s use and transfer of information received
            from Google APIs to any other app will adhere to the{' '}
            <A href="https://developers.google.com/terms/api-services-user-data-policy">
              Google API Services User Data Policy
            </A>
            , including the Limited Use requirements.
          </P>
          <P>
            <strong>A note on Google PageSpeed Insights:</strong> separately from sign-in, our Service
            uses the Google PageSpeed Insights API (server-side) to measure the SEO and performance of
            the websites you add to your account. This feature sends only the website&rsquo;s URL to
            Google and stores a numeric score; it does not involve any Google user data or your Google
            Account.
          </P>

          <H2>4. How we use your information</H2>
          <UL>
            <li>to create and operate your account and provide the Service;</li>
            <li>to build, host, maintain, and monitor your website(s);</li>
            <li>to process billing and send invoices, receipts, and service notifications;</li>
            <li>to provide customer support;</li>
            <li>to secure the Service and detect or prevent fraud and abuse; and</li>
            <li>to comply with our legal obligations.</li>
          </UL>
          <P>We do not sell your personal information, and we do not use it for third-party advertising.</P>

          <H2>5. Storage and retention</H2>
          <P>
            Your information is stored using Supabase (PostgreSQL). We retain your personal information for
            as long as your account is active and for a reasonable period afterward as needed to meet
            legal, accounting, or operational requirements. You may request deletion of your account and
            associated personal data by contacting us at <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>.
          </P>

          <H2>6. How we share information</H2>
          <P>
            We share information only with service providers that help us run the Service, and only as
            needed for them to perform their function:
          </P>
          <UL>
            <li><strong>Supabase</strong> — authentication and database hosting;</li>
            <li><strong>Paystack</strong> — payment processing;</li>
            <li><strong>Resend</strong> — sending transactional emails;</li>
            <li><strong>legal disclosures</strong> — where required by applicable law or to protect our rights.</li>
          </UL>
          <P>
            We do not share data received from Google with any third party except these processors acting
            on our behalf to deliver the Service to you, and never for advertising.
          </P>

          <H2>7. Security</H2>
          <P>
            We protect your information using industry-standard measures, including encryption in transit
            (HTTPS), access controls, and database row-level security. No method of transmission or
            storage is completely secure, but we work to safeguard your data.
          </P>

          <H2>8. Your rights and choices</H2>
          <UL>
            <li>access, correct, or update your profile information from within the dashboard;</li>
            <li>request deletion of your account and personal data;</li>
            <li>withdraw consent at any time by signing out and discontinuing use of the Service; and</li>
            <li>
              revoke Websync Digital&rsquo;s access to your Google data at any time via your{' '}
              <A href="https://myaccount.google.com/permissions">Google Account permissions page</A>.
            </li>
          </UL>

          <H2>9. Children</H2>
          <P>
            The Service is intended for businesses and is not directed to individuals under 18. We do not
            knowingly collect personal information from children.
          </P>

          <H2>10. Cookies and sessions</H2>
          <P>
            We use cookies only as necessary to keep you signed in and to operate the Service securely. We
            do not use advertising or third-party tracking cookies.
          </P>

          <H2>11. International transfers</H2>
          <P>
            Our service providers may process and store data on servers located outside Nigeria. Where
            this occurs, we rely on these providers&rsquo; safeguards to protect your information.
          </P>

          <H2>12. Changes to this policy</H2>
          <P>
            We may update this Privacy Policy from time to time. When we do, we will revise the &ldquo;Last
            updated&rdquo; date above. Significant changes may also be communicated through the Service.
          </P>

          <H2>13. Contact us</H2>
          <P>
            Websync Digital<br />
            Nigeria<br />
            Email: <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>
          </P>

          <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', marginTop: 32, paddingTop: 18, fontSize: 12.5, color: C.muted, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span>© 2026 Websync Digital · websyncdigital.com.ng</span>
            <Link href="/terms" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>
              Terms of Service →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
