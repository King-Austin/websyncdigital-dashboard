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
  INSERT INTO public.ws_profiles (id, name, company, phone, role)
  VALUES (
    NEW.id,
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
ALTER TABLE ws_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_websites       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_invoices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_tickets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_portfolio      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ws_notifications  ENABLE ROW LEVEL SECURITY;

-- ws_profiles
CREATE POLICY "ws_users_see_own_profile" ON ws_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "ws_admins_see_all_profiles" ON ws_profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM ws_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "ws_users_update_own_profile" ON ws_profiles FOR UPDATE USING (auth.uid() = id);

-- ws_websites
CREATE POLICY "ws_clients_see_own_websites" ON ws_websites FOR SELECT
  USING (client_id = auth.uid() OR EXISTS (SELECT 1 FROM ws_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "ws_admins_manage_websites" ON ws_websites FOR ALL
  USING (EXISTS (SELECT 1 FROM ws_profiles WHERE id = auth.uid() AND role = 'admin'));

-- ws_invoices
CREATE POLICY "ws_clients_see_own_invoices" ON ws_invoices FOR SELECT
  USING (client_id = auth.uid() OR EXISTS (SELECT 1 FROM ws_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "ws_admins_manage_invoices" ON ws_invoices FOR ALL
  USING (EXISTS (SELECT 1 FROM ws_profiles WHERE id = auth.uid() AND role = 'admin'));

-- ws_tickets
CREATE POLICY "ws_clients_see_own_tickets" ON ws_tickets FOR SELECT
  USING (client_id = auth.uid() OR EXISTS (SELECT 1 FROM ws_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "ws_admins_manage_tickets" ON ws_tickets FOR ALL
  USING (EXISTS (SELECT 1 FROM ws_profiles WHERE id = auth.uid() AND role = 'admin'));

-- ws_ticket_messages
CREATE POLICY "ws_ticket_msg_access" ON ws_ticket_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ws_tickets t
    WHERE t.id = ticket_id
    AND (t.client_id = auth.uid() OR EXISTS (SELECT 1 FROM ws_profiles WHERE id = auth.uid() AND role = 'admin'))
  ));
CREATE POLICY "ws_admins_manage_ticket_messages" ON ws_ticket_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM ws_profiles WHERE id = auth.uid() AND role = 'admin'));

-- ws_notifications
CREATE POLICY "ws_clients_see_own_notifications" ON ws_notifications FOR SELECT
  USING (client_id = auth.uid());
CREATE POLICY "ws_admins_manage_notifications" ON ws_notifications FOR ALL
  USING (EXISTS (SELECT 1 FROM ws_profiles WHERE id = auth.uid() AND role = 'admin'));

-- ws_portfolio
CREATE POLICY "ws_public_portfolio_visible" ON ws_portfolio FOR SELECT
  USING (visibility = 'public' OR EXISTS (SELECT 1 FROM ws_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "ws_admins_manage_portfolio" ON ws_portfolio FOR ALL
  USING (EXISTS (SELECT 1 FROM ws_profiles WHERE id = auth.uid() AND role = 'admin'));
