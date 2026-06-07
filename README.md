# Websync Digital — Client Dashboard

A full-stack client portal for **Websync Digital**, a Nigerian web agency. Clients can submit project briefs, activate monthly subscriptions via Paystack, track live website metrics, manage invoices, and raise support tickets — all from a single mobile-first dashboard. Admins manage clients, projects, websites, billing, and email from a separate admin panel.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Environment Variables](#environment-variables)
7. [Local Development](#local-development)
8. [Deployment](#deployment)
9. [User Flows](#user-flows)
10. [Paystack Integration](#paystack-integration)
11. [Admin Workflows](#admin-workflows)
12. [Onboarding Existing Clients](#onboarding-existing-clients)
13. [Security](#security)
14. [Known Limitations & Roadmap](#known-limitations--roadmap)

---

## Overview

Websync Digital offers monthly website maintenance retainers at **₦9,999/month per project**. This dashboard replaces manual WhatsApp/email coordination with a self-service portal where clients can:

- Register and log in (email/password or Google OAuth)
- Submit a project brief with business details, logo, and images
- Pay the first month via Paystack hosted checkout (recurring subscription)
- Watch their project activate automatically once Paystack confirms payment
- View live uptime, SEO score, and visit metrics for their website
- Pay add-on invoices raised by the team (domain renewals, business email, etc.)
- Cancel their subscription at any time from Settings
- Raise and track support tickets
- Receive in-app notifications for all billing and project events

Admins get a separate panel to manage all of the above plus website health monitoring, revenue analytics, and outbound email.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | File-based routing, server components, API routes in one repo |
| Language | TypeScript | End-to-end type safety |
| Styling | Inline styles + CSS-in-JS (no Tailwind) | Zero build overhead, design token system via `src/lib/theme.ts` |
| Database | PostgreSQL via Supabase | Managed Postgres, Row-Level Security, real-time, Storage |
| Auth | Supabase Auth | Email/password + Google OAuth, JWT session management |
| Payments | Paystack | Nigerian payment rails — card, bank transfer, USSD, OPay |
| Email | Resend | Transactional email with React templates |
| Analytics | Vercel Web Analytics | Zero-config page view tracking |
| Hosting | Vercel | Edge-native Next.js deployment |

---

## Architecture

```
Browser (client)
    │
    ├── /client/*     → Client-facing dashboard (auth-gated, role: client)
    ├── /admin/*      → Admin panel (auth-gated, role: admin)
    ├── /login        → Email/password + Google OAuth
    ├── /register     → 3-step registration (account → business → plan)
    └── /api/*        → Next.js API routes (server-only logic)
           │
           ├── /api/paystack/initialize         → Creates Paystack subscription checkout
           ├── /api/paystack/cancel-subscription → Disables Paystack sub + updates DB
           ├── /api/paystack/verify             → Verifies one-off payment references
           ├── /api/webhooks/paystack           → Receives Paystack events (HMAC verified)
           ├── /api/projects/*                  → CRUD for project briefs
           ├── /api/websites/*                  → CRUD for websites (admin)
           ├── /api/clients/*                   → CRUD for client profiles (admin)
           ├── /api/invoices/*                  → Add-on invoice management
           ├── /api/tickets/*                   → Support ticket management
           ├── /api/notifications               → In-app notification feed
           ├── /api/profile                     → Client profile read/update
           ├── /api/send-email                  → Outbound email via Resend
           └── /api/admin/revenue               → Revenue analytics aggregation

Supabase (PostgreSQL + Auth + Storage)
    ├── ws_profiles         → Extended user profiles
    ├── ws_projects         → Project briefs + subscription state
    ├── ws_websites         → Live website records
    ├── ws_payments         → Payment ledger (written by webhook only)
    ├── ws_invoices         → Add-on invoices
    ├── ws_notifications    → In-app notifications
    └── ws-project-files    → Storage bucket for logos and brand images

Paystack
    ├── Hosted checkout     → /transaction/initialize + plan code → recurring subscription
    ├── Webhook             → /api/webhooks/paystack (charge.success, invoice.payment,
    │                         subscription.create, subscription.disable, invoice.payment_failed)
    └── Subscription API    → /api/paystack/cancel-subscription (disable + email_token)
```

---

## Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── clients/        → Client list + add/edit/delete
│   │   ├── email/          → Compose + send outbound email
│   │   ├── portfolio/      → Public portfolio management
│   │   ├── projects/       → All project briefs + status control + raise invoice
│   │   ├── revenue/        → Revenue analytics dashboard
│   │   ├── settings/       → Admin profile
│   │   ├── tickets/        → Support ticket inbox
│   │   ├── websites/       → Website management (add/edit/delete)
│   │   ├── layout.tsx      → Admin shell with sidebar + auth guard
│   │   └── AdminDashboardWrapper.tsx
│   ├── api/                → All API routes (see Architecture above)
│   ├── auth/callback/      → Supabase OAuth redirect handler
│   ├── client/
│   │   ├── billing/        → Active subscription list + self-service cancel
│   │   ├── metrics/        → Live SEO + uptime + visit metrics
│   │   ├── notifications/  → In-app notification feed
│   │   ├── projects/       → Submit brief + pay to activate + invoice payment
│   │   ├── settings/       → Profile edit + subscription management
│   │   ├── websites/       → Client's live websites
│   │   ├── layout.tsx      → Client shell with bottom nav + auth guard
│   │   └── ClientDashboardWrapper.tsx
│   ├── login/              → Login page (email + Google)
│   ├── register/           → 3-step registration
│   ├── preview/            → Website preview iframe
│   └── layout.tsx          → Root layout (fonts, analytics)
├── components/
│   ├── layout/
│   │   ├── BottomNav.tsx   → Mobile bottom navigation (client)
│   │   └── Sidebar.tsx     → Desktop sidebar (admin + client)
│   └── ui/
│       ├── index.tsx       → Design system: Btn, Card, Modal, Input, Sel, StatCard…
│       ├── Icons.tsx       → SVG icon components
│       └── WebsitePreview.tsx → iframe website preview
├── lib/
│   ├── data.ts             → Shared data fetching helpers
│   ├── emailTemplates.ts   → Resend email HTML templates
│   ├── getURL.ts           → Base URL resolution for OAuth redirects
│   ├── supabase/
│   │   ├── client.ts       → Browser Supabase client
│   │   ├── server.ts       → Server Supabase client (cookies)
│   │   └── admin.ts        → Service-role client (bypasses RLS)
│   ├── theme.ts            → Design tokens (colors, spacing)
│   └── ThemeProvider.tsx   → Light/dark theme context
├── middleware.ts            → Auth guard — protects /client/* and /admin/*
└── types/index.ts           → Shared TypeScript types
```

---

## Database Schema

All tables are prefixed `ws_` to avoid conflicts with Supabase internals.

```sql
-- User profile extension (Supabase Auth handles credentials)
ws_profiles (
  id uuid pk,           -- mirrors auth.users.id
  name text,
  company text,
  phone text,
  email text,
  role text             -- 'client' | 'admin'
)

-- Project briefs submitted by clients
ws_projects (
  id uuid pk,
  client_id uuid fk,
  name text,
  business_name text,
  about text,
  extra_info text,
  socials text,
  address text,
  phone text,
  business_email text,
  brand_colors text,
  whatsapp text,
  status text,          -- 'submitted' | 'processing' | 'active' | 'cancelled'
  paystack_subscription_code text,
  paystack_customer_code text,
  created_at timestamptz,
  updated_at timestamptz
)

-- Websites managed by Websync (assigned to clients by admin)
ws_websites (
  id serial pk,
  name text,
  url text,
  client_id uuid fk,
  status text,          -- 'live' | 'maintenance' | 'down'
  domain_expiry text,
  seo_score int,
  monthly_visits int,
  monthly_fee int       -- in kobo
)

-- Payment ledger — written ONLY by webhook handler
ws_payments (
  id uuid pk,
  reference text unique,
  email text,
  amount int,           -- in kobo
  status text,
  plan text,
  project_id uuid,
  paid_at timestamptz,
  event_type text
)

-- Add-on invoices raised by admin for a project
ws_invoices (
  id uuid pk,
  project_id uuid fk,
  client_id uuid fk,
  kind text,            -- 'domain' | 'email' | 'other'
  description text,
  amount int,           -- in kobo
  status text,          -- 'unpaid' | 'paid'
  due_date text,
  paystack_reference text,
  created_at timestamptz
)

-- In-app notifications
ws_notifications (
  id uuid pk,
  client_id uuid fk,
  type text,            -- 'billing' | 'project' | 'support'
  message text,
  read boolean,
  created_at timestamptz
)

-- Support tickets
ws_tickets (
  id uuid pk,
  client_id uuid fk,
  subject text,
  message text,
  status text,          -- 'open' | 'resolved'
  priority text,        -- 'low' | 'medium' | 'high'
  created_at timestamptz
)
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values before running locally.

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, never expose to browser) |
| `PAYSTACK_SECRET_KEY` | Paystack secret key (`sk_live_…` in prod, `sk_test_…` in dev) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key (`pk_live_…` / `pk_test_…`) |
| `NEXT_PUBLIC_PAYSTACK_PLAN_CODE` | Paystack recurring plan code (`PLN_…`) |
| `NEXT_PUBLIC_PAYSTACK_SHOP_LINK` | Paystack shop link (fallback) |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL — used for webhook callback URLs and email links |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `RESEND_FROM_EMAIL` | Sender address (must be a verified Resend domain) |
| `RESEND_FROM_NAME` | Sender display name |
| `WS_TEAM_EMAIL` | Internal team inbox for project brief notifications |
| `PAGESPEED_API_KEY` | Google PageSpeed Insights API key (optional — works without it) |
| `ADMIN_SIGNUP_CODE` | Secret code required to register an admin account at `/admin-register` |

---

## Local Development

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)
- A Paystack account (sandbox or live)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/King-Austin/websyncdigital-dashboard.git
cd websyncdigital-dashboard

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase and Paystack keys

# 4. Run the database schema against your Supabase project
# Go to Supabase → SQL Editor and run the contents of your schema SQL

# 5. Configure Supabase Auth
# Supabase Dashboard → Authentication → URL Configuration
# Site URL: http://localhost:3000
# Redirect URLs: http://localhost:3000/auth/callback

# 6. Enable Google OAuth (optional)
# Supabase Dashboard → Authentication → Providers → Google
# Add your Google OAuth client ID and secret

# 7. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Paystack Webhook (local testing)

Use the [Paystack CLI](https://github.com/PaystackHQ/paystack-cli) or a tunnel like [ngrok](https://ngrok.com) to forward webhooks to your local machine:

```bash
ngrok http 3000
# Then register: https://<your-ngrok-id>.ngrok.io/api/webhooks/paystack
# in Paystack Dashboard → Settings → API Keys & Webhooks
```

---

## Deployment

The app is deployed on **Vercel** with the Supabase database hosted separately.

### Steps

1. **Push to GitHub** — Vercel auto-deploys on every push to `main`
2. **Set environment variables** in Vercel Dashboard → Project → Settings → Environment Variables (copy all from `.env.local`)
3. **Register the production webhook** in Paystack Dashboard:
   - URL: `https://app.websyncdigital.com.ng/api/webhooks/paystack`
   - Events to enable: `charge.success`, `invoice.payment`, `invoice.payment_failed`, `subscription.create`, `subscription.disable`, `subscription.not_renew`
4. **Update Supabase redirect URLs**:
   - Supabase → Authentication → URL Configuration
   - Add `https://app.websyncdigital.com.ng/auth/callback` to Redirect URLs

### Switching from Sandbox to Live Paystack

1. In Paystack Dashboard, go to **Settings → API Keys & Webhooks** and copy the live keys
2. Create your live plan: **Products → Plans → New Plan** (₦9,999/month)
3. Update three env vars in Vercel:
   - `PAYSTACK_SECRET_KEY` → `sk_live_…`
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` → `pk_live_…`
   - `NEXT_PUBLIC_PAYSTACK_PLAN_CODE` → `PLN_…` (the live plan code)
4. Register the production webhook URL under your live account

---

## User Flows

### Client — Full Journey

```
/register (3 steps)
  Step 1: Email + password
  Step 2: Name, company, phone
  Step 3: Plan info screen → "Create Account"
     │
     ▼
Email verification link → /login
     │
     ▼
/client (dashboard home)
  └── /client/projects
        │
        ├── "New Project" → Fill brief (name, business info, logo, images) → Submit
        │
        └── "Pay to activate" → Billing disclosure modal → "Continue to payment"
              │
              ▼
        Paystack hosted checkout (recurring subscription enrollment)
              │
              ▼
        Paystack callback → /client/projects?paid=<id>
              │
              ▼
        Paystack webhook fires → /api/webhooks/paystack
              │
              ▼
        ws_projects.status set to 'active'  ←  single source of truth
              │
              ▼
        Client dashboard shows project as Active
        In-app notification: "Payment of ₦9,999 received. Your project is now active."
```

### Recurring Monthly Billing

```
Paystack auto-debits the card on the same date each month
     │
     ▼
Paystack fires invoice.payment webhook → /api/webhooks/paystack
     │
     ▼
ws_payments row inserted (reference is unique — safe to retry)
ws_projects.status confirmed 'active' (matched by subscription_code)
In-app notification sent to client
```

### Client — Cancel Subscription

```
Settings → Manage subscriptions → Cancel → Confirm (centered modal)
     │
     ▼
/api/paystack/cancel-subscription
  1. Look up paystack_subscription_code on project
  2. If missing: search Paystack by customer_code, then by email
  3. Fetch subscription → get email_token
  4. POST /subscription/disable to Paystack
  5. Update ws_projects.status = 'cancelled'
  6. Send in-app notification
     │
     ▼
Paystack fires subscription.disable webhook (belt-and-suspenders)
     │
     ▼
Webhook handler also sets status = 'cancelled' (idempotent — already cancelled)
```

---

## Paystack Integration

### How Subscriptions Work

This app uses **Paystack's hosted checkout** (`/transaction/initialize` with a `plan` code) to enroll clients in a recurring subscription. The flow:

1. Server calls `/transaction/initialize` with `{ email, amount, plan, callback_url, metadata: { project_id } }`
2. Client is redirected to Paystack's hosted page which shows "Subscribe for ₦9,999/month"
3. Client enters card details — Paystack charges the first month and stores the card
4. Paystack redirects back to `callback_url`
5. **Critically**: the app does NOT trust the callback. It polls the DB and waits for the webhook
6. Paystack fires `charge.success` → webhook activates the project using `metadata.project_id`
7. Every subsequent month Paystack auto-debits without any client action

### Why metadata.project_id matters

The webhook handler at `/api/webhooks/paystack` is the **only** place a project gets activated. It identifies which project to activate using `event.data.metadata.project_id` — sent inside every transaction we initialize. Without it, the webhook cannot match the payment to a project. This is why:

- Every `/api/paystack/initialize` call includes `metadata: { project_id }`
- The `ws_payments` table records `project_id` alongside every payment reference
- The `subscription.create` event also stamps the `paystack_subscription_code` onto the project for future cancellations

### Cancellation Reliability

The cancel flow has a 4-layer fallback to ensure Paystack always receives the disable request even if `paystack_subscription_code` was never stored:

1. Use stored `paystack_subscription_code` (normal path)
2. Query Paystack by `paystack_customer_code` to find the active subscription
3. Search all active Paystack subscriptions by email
4. If no subscription exists on Paystack side: safely mark cancelled in DB only

---

## Admin Workflows

### Manage Clients

Admin → Clients: view all registered clients, add/edit/delete, search by name or company.

### Manage Projects

Admin → Projects: see all submitted briefs with expandable detail view (all form fields + uploaded images). From each project:

- **Mark Active** — activates without requiring payment (use for existing clients)
- **Mark Cancelled** — cancels immediately
- **Reset to Submitted** — puts project back in unpaid state
- **Raise Invoice** — creates an add-on invoice (domain, business email, other) that appears on the client's dashboard with a Pay button

### Manage Websites

Admin → Websites: assign websites to clients with URL, status, domain expiry, SEO score, and monthly visit data. Clients see their assigned websites in the Websites and Metrics tabs.

### Revenue

Admin → Revenue: aggregated monthly payment data from `ws_payments`, broken down by month and status.

### Email

Admin → Email: compose and send one-off emails to clients via Resend.

---

## Onboarding Existing Clients

For clients who are already paying and have live websites before they register on the dashboard:

**Step 1 — Client registers** (2 minutes, they do this)

Send them the registration link: `https://app.websyncdigital.com.ng/register`

They fill in email, password, name, company, and phone. No payment is triggered during registration.

**Step 2 — Admin activates their account** (you do this, no client friction)

1. **Admin → Websites → Add Website**: fill in their site name, URL, assign to their profile (select from the client dropdown), set status to Live, add domain expiry and monthly fee
2. **Admin → Projects → find their project** (if they submitted a brief) → **Mark Active** — this bypasses the payment flow entirely and immediately shows the project as active on their dashboard
   - If they haven't submitted a brief yet, they can do so from their Projects page and you mark it active manually
3. The client refreshes their dashboard and immediately sees:
   - Their project as **Active**
   - Their website in the **Websites** tab with live metrics
   - Their domain expiry and monthly fee in the **Billing** tab

**No double-charging.** The "Mark Active" admin action writes directly to the database — it does not touch Paystack. If you later want recurring billing set up for them, they can click "Complete payment" from their Projects page which will enroll their card in the Paystack subscription plan for future months.

---

## Security

- **Webhook signature verification**: every Paystack webhook is verified with HMAC-SHA512 using `PAYSTACK_SECRET_KEY` before any DB writes
- **Payment state is webhook-only**: no client-side action can flip a project to `active` — only the verified webhook can
- **Idempotent payments**: `ws_payments` has a `UNIQUE` constraint on `reference` — replayed webhooks are safely ignored
- **Service role key is server-only**: `SUPABASE_SERVICE_ROLE_KEY` is used only in API routes and never exposed to the browser
- **Admin route guard**: middleware checks `role = 'admin'` on the session before allowing access to `/admin/*`
- **Admin registration gate**: the `/admin-register` endpoint requires a secret `ADMIN_SIGNUP_CODE` — change this before deploying
- **No floats in money**: all amounts are stored and transmitted in kobo (integer) — never as floating point naira

---

## Known Limitations & Roadmap

| Item | Status |
|---|---|
| Admin "Create project for client" button | Planned — allows admin to create an active project on behalf of any client without them submitting a brief |
| Paystack subscription_code always stored | Improved — `subscription.create` webhook now stamps the code; edge cases handled by 4-layer cancel fallback |
| Google OAuth on mobile | Works — `getURL()` always uses `window.location.origin` in the browser to avoid prod/localhost redirect mismatch |
| SEO scores | Pulled from Google PageSpeed Insights API on demand — requires `PAGESPEED_API_KEY` for high-volume use |
| USSD / offline payments | Not implemented — Paystack bank transfer and OPay are available as payment channels |
| Multi-currency | Not planned — NGN only |
