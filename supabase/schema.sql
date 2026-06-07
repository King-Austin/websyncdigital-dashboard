-- Websync Digital — Supabase Schema (ws_ prefixed tables)
-- Run this in your Supabase SQL Editor

-- ── PROFILES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ws_profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name        TEXT,
  company     TEXT,
  phone       TEXT,
  role        TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.ws_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ws_profiles (id, email, name, company, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'company',
    NEW.raw_user_meta_data->>'phone',
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ws_on_auth_user_created ON auth.users;
CREATE TRIGGER ws_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ws_handle_new_user();

-- ── WEBSITES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ws_websites (
  id               SERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  url              TEXT,
  client_id        UUID REFERENCES ws_profiles(id) ON DELETE CASCADE,
  status           TEXT DEFAULT 'live' CHECK (status IN ('live', 'maintenance', 'down')),
  domain_expiry    TEXT,
  seo_score        INTEGER DEFAULT 0,
  monthly_visits   INTEGER DEFAULT 0,
  form_submissions INTEGER DEFAULT 0,
  monthly_fee      INTEGER DEFAULT 9999,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── INVOICES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ws_invoices (
  id          TEXT PRIMARY KEY,
  description TEXT,
  amount      INTEGER NOT NULL,
  due_date    TEXT,
  status      TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue')),
  client_id   UUID REFERENCES ws_profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── TICKETS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ws_tickets (
  id          TEXT PRIMARY KEY,
  subject     TEXT NOT NULL,
  site        TEXT,
  status      TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  priority    TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  client_id   UUID REFERENCES ws_profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ws_ticket_messages (
  id          SERIAL PRIMARY KEY,
  ticket_id   TEXT REFERENCES ws_tickets(id) ON DELETE CASCADE,
  from_role   TEXT NOT NULL CHECK (from_role IN ('client', 'admin')),
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── PORTFOLIO ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ws_portfolio (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  url         TEXT,
  category    TEXT,
  year        INTEGER,
  visibility  TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'internal')),
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROJECTS (one per website a client asks us to build) ─────────────────────
CREATE TABLE IF NOT EXISTS ws_projects (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                  UUID REFERENCES ws_profiles(id) ON DELETE CASCADE,
  name                       TEXT NOT NULL,
  status                     TEXT NOT NULL DEFAULT 'submitted'
                               CHECK (status IN ('submitted', 'active', 'cancelled')),
  business_name              TEXT,
  about                      TEXT,
  extra_info                 TEXT,
  socials                    TEXT,
  address                    TEXT,
  phone                      TEXT,
  business_email             TEXT,
  brand_colors               TEXT,
  whatsapp                   TEXT,
  paystack_subscription_code TEXT,
  paystack_customer_code     TEXT,
  created_at                 TIMESTAMPTZ DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROJECT FILES (logo + business images in Supabase Storage) ───────────────
CREATE TABLE IF NOT EXISTS ws_project_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES ws_projects(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('logo', 'image')),
  path        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── PAYMENTS (Paystack webhook records) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS ws_payments (
  reference       TEXT PRIMARY KEY,
  email           TEXT NOT NULL,
  amount          INTEGER NOT NULL,         -- in kobo
  status          TEXT DEFAULT 'success',
  plan            TEXT,
  project_id      UUID REFERENCES ws_projects(id) ON DELETE SET NULL,
  paid_at         TIMESTAMPTZ,
  event_type      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ws_notifications (
  id          SERIAL PRIMARY KEY,
  client_id   UUID REFERENCES ws_profiles(id) ON DELETE CASCADE,
  type        TEXT,
  message     TEXT,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────
-- ws_payments and ws_invoices.paystack_reference
-- Add email column to ws_profiles so webhook can look up by email
ALTER TABLE ws_profiles ADD COLUMN IF NOT EXISTS email TEXT;
-- Add paystack_reference to ws_invoices for reconciliation
ALTER TABLE ws_invoices ADD COLUMN IF NOT EXISTS paystack_reference TEXT;
-- Link add-on invoices (domain / business email) to a project + tag the kind
ALTER TABLE ws_invoices ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES ws_projects(id) ON DELETE SET NULL;
ALTER TABLE ws_invoices ADD COLUMN IF NOT EXISTS kind TEXT;

ALTER TABLE ws_payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_project_files  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_websites       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_invoices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_tickets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_portfolio      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_notifications  ENABLE ROW LEVEL SECURITY;

-- Admin check helper: SECURITY DEFINER so it reads ws_profiles WITHOUT triggering
-- RLS. This is what prevents infinite recursion — a policy ON ws_profiles must never
-- itself run a query that re-evaluates ws_profiles' policies. Use this everywhere
-- instead of an inline `EXISTS (SELECT 1 FROM ws_profiles ...)`.
CREATE OR REPLACE FUNCTION public.ws_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ws_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;
REVOKE ALL ON FUNCTION public.ws_is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.ws_is_admin() TO authenticated;

-- ws_profiles
CREATE POLICY "ws_users_see_own_profile" ON ws_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "ws_admins_see_all_profiles" ON ws_profiles FOR SELECT
  USING (public.ws_is_admin());
CREATE POLICY "ws_users_update_own_profile" ON ws_profiles FOR UPDATE USING (auth.uid() = id);

-- ws_websites
CREATE POLICY "ws_clients_see_own_websites" ON ws_websites FOR SELECT
  USING (client_id = auth.uid() OR public.ws_is_admin());
CREATE POLICY "ws_admins_manage_websites" ON ws_websites FOR ALL
  USING (public.ws_is_admin());

-- ws_invoices
CREATE POLICY "ws_clients_see_own_invoices" ON ws_invoices FOR SELECT
  USING (client_id = auth.uid() OR public.ws_is_admin());
CREATE POLICY "ws_admins_manage_invoices" ON ws_invoices FOR ALL
  USING (public.ws_is_admin());

-- ws_tickets
CREATE POLICY "ws_clients_see_own_tickets" ON ws_tickets FOR SELECT
  USING (client_id = auth.uid() OR public.ws_is_admin());
CREATE POLICY "ws_admins_manage_tickets" ON ws_tickets FOR ALL
  USING (public.ws_is_admin());

-- ws_ticket_messages
CREATE POLICY "ws_ticket_msg_access" ON ws_ticket_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ws_tickets t
    WHERE t.id = ticket_id
    AND (t.client_id = auth.uid() OR public.ws_is_admin())
  ));
CREATE POLICY "ws_admins_manage_ticket_messages" ON ws_ticket_messages FOR ALL
  USING (public.ws_is_admin());

-- ws_notifications
CREATE POLICY "ws_clients_see_own_notifications" ON ws_notifications FOR SELECT
  USING (client_id = auth.uid());
CREATE POLICY "ws_clients_update_own_notifications" ON ws_notifications FOR UPDATE
  USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
CREATE POLICY "ws_admins_manage_notifications" ON ws_notifications FOR ALL
  USING (public.ws_is_admin());

-- ws_portfolio
CREATE POLICY "ws_public_portfolio_visible" ON ws_portfolio FOR SELECT
  USING (visibility = 'public' OR public.ws_is_admin());
CREATE POLICY "ws_admins_manage_portfolio" ON ws_portfolio FOR ALL
  USING (public.ws_is_admin());

-- ws_payments (service role writes; admin can view)
CREATE POLICY "ws_admins_see_payments" ON ws_payments FOR SELECT
  USING (public.ws_is_admin());

-- ws_projects (clients manage their own; admins see all)
CREATE POLICY "ws_clients_see_own_projects" ON ws_projects FOR SELECT
  USING (client_id = auth.uid() OR public.ws_is_admin());
CREATE POLICY "ws_clients_insert_own_projects" ON ws_projects FOR INSERT
  WITH CHECK (client_id = auth.uid());
CREATE POLICY "ws_clients_update_own_projects" ON ws_projects FOR UPDATE
  USING (client_id = auth.uid() OR public.ws_is_admin());

-- ws_project_files (same visibility as parent project)
CREATE POLICY "ws_project_files_access" ON ws_project_files FOR SELECT
  USING (EXISTS (SELECT 1 FROM ws_projects p WHERE p.id = project_id
    AND (p.client_id = auth.uid() OR public.ws_is_admin())));
CREATE POLICY "ws_project_files_insert" ON ws_project_files FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM ws_projects p WHERE p.id = project_id AND p.client_id = auth.uid()));
