/*
# TerraLedger core schema

1. Plain-English
   Creates the database backbone for a real-estate CRM / inventory / post-sales ERP:
   projects, towers, units, channel partners, leads, site visits, bookings,
   payment schedules, payments/receipts, demand letters, compliance checklists,
   manager approvals, and a booking activity log.

2. New Tables
   - projects: id, name, property_type, city, locality, possession_date, status, created_at
   - towers: id, project_id (FK), name, floors
   - units: id, project_id (FK), tower_id (FK nullable), floor, unit_no, config, area_sqft,
     facing, price numeric, status (available|blocked|booked|sold), blocked_until, created_at
   - partners: channel partner firms: id, name, firm, phone, email, city, commission_pct, status
   - leads: id, name, phone, email, source, project_id, interested_config, budget_min, budget_max,
     status, assigned_to, cp_id (FK nullable), score, ai_notes, next_followup_at, last_contacted_at, created_at
   - site_visits: id, lead_id, project_id, scheduled_at, status, feedback, picked_by
   - bookings: id, unit_id (FK), lead_id (FK nullable), buyer_name, buyer_phone, buyer_email,
     cp_id, plan_type (CLP|TLP), agreement_value, booking_date, status, registration_no, notes
   - payment_schedules: id, booking_id, seq, milestone, pct, amount, due_date, paid_amount, status
   - payments: id, booking_id, schedule_id (nullable), receipt_no, amount, mode, paid_on, notes
   - demand_letters: id, booking_id, schedule_id, letter_no, amount, interest, total_due, generated_at, due_date
   - compliance_tasks: id, booking_id, category, title, done, done_at, note, sort
   - approvals: id, type, unit_id, booking_id, requested_by, reason, discount_pct, status, created_at, decided_at
   - booking_events: id, booking_id, type, description, created_at

3. Security
   - RLS enabled on every table.
   - The app is a single-tenant preview (no sign-in): SELECT/INSERT/UPDATE/DELETE
     granted to anon + authenticated with open policies (intentionally public data).
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  property_type text NOT NULL,
  city text NOT NULL,
  locality text NOT NULL,
  possession_date date,
  status text NOT NULL DEFAULT 'Under Construction',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS towers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  floors int NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tower_id uuid REFERENCES towers(id) ON DELETE CASCADE,
  floor int NOT NULL,
  unit_no text NOT NULL,
  config text NOT NULL,
  area_sqft numeric(10,1) NOT NULL,
  facing text NOT NULL,
  price numeric(14,2) NOT NULL,
  status text NOT NULL DEFAULT 'Available',
  blocked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, unit_no)
);

CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  firm text NOT NULL UNIQUE,
  phone text NOT NULL,
  email text NOT NULL,
  city text NOT NULL,
  commission_pct numeric(5,2) NOT NULL DEFAULT 1.00,
  status text NOT NULL DEFAULT 'Active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  source text NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  interested_config text,
  budget_min numeric(14,2),
  budget_max numeric(14,2),
  status text NOT NULL DEFAULT 'New',
  assigned_to text,
  cp_id uuid REFERENCES partners(id) ON DELETE SET NULL,
  score int NOT NULL DEFAULT 50,
  ai_notes text,
  next_followup_at timestamptz,
  last_contacted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'Scheduled',
  feedback text,
  picked_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  buyer_name text NOT NULL,
  buyer_phone text NOT NULL,
  buyer_email text,
  cp_id uuid REFERENCES partners(id) ON DELETE SET NULL,
  plan_type text NOT NULL DEFAULT 'CLP',
  agreement_value numeric(14,2) NOT NULL,
  booking_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'Confirmed',
  registration_no text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (unit_id)
);

CREATE TABLE IF NOT EXISTS payment_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  seq int NOT NULL,
  milestone text NOT NULL,
  pct numeric(5,2) NOT NULL,
  amount numeric(14,2) NOT NULL,
  due_date date NOT NULL,
  paid_amount numeric(14,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  schedule_id uuid REFERENCES payment_schedules(id) ON DELETE SET NULL,
  receipt_no text NOT NULL,
  amount numeric(14,2) NOT NULL,
  mode text NOT NULL DEFAULT 'NEFT',
  paid_on date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demand_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  schedule_id uuid REFERENCES payment_schedules(id) ON DELETE SET NULL,
  letter_no text NOT NULL,
  amount numeric(14,2) NOT NULL,
  interest numeric(14,2) NOT NULL DEFAULT 0,
  total_due numeric(14,2) NOT NULL,
  due_date date,
  generated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  done_at timestamptz,
  note text,
  sort int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  unit_id uuid REFERENCES units(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  requested_by text NOT NULL,
  reason text,
  discount_pct numeric(5,2),
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz
);

CREATE TABLE IF NOT EXISTS booking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  type text NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_units_project ON units(project_id);
CREATE INDEX IF NOT EXISTS idx_units_tower ON units(tower_id);
CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_project ON leads(project_id);
CREATE INDEX IF NOT EXISTS idx_bookings_unit ON bookings(unit_id);
CREATE INDEX IF NOT EXISTS idx_schedules_booking ON payment_schedules(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_compliance_booking ON compliance_tasks(booking_id);
CREATE INDEX IF NOT EXISTS idx_visits_lead ON site_visits(lead_id);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE towers ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_events ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON projects, towers, units, partners, leads, site_visits,
  bookings, payment_schedules, payments, demand_letters, compliance_tasks, approvals, booking_events
  TO anon, authenticated;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['projects','towers','units','partners','leads','site_visits','bookings','payment_schedules','payments','demand_letters','compliance_tasks','approvals','booking_events']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "open_select" ON %I', t);
    EXECUTE format('CREATE POLICY "open_select" ON %I FOR SELECT TO anon, authenticated USING (true)', t);
    EXECUTE format('DROP POLICY IF EXISTS "open_insert" ON %I', t);
    EXECUTE format('CREATE POLICY "open_insert" ON %I FOR INSERT TO anon, authenticated WITH CHECK (true)', t);
    EXECUTE format('DROP POLICY IF EXISTS "open_update" ON %I', t);
    EXECUTE format('CREATE POLICY "open_update" ON %I FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)', t);
    EXECUTE format('DROP POLICY IF EXISTS "open_delete" ON %I', t);
    EXECUTE format('CREATE POLICY "open_delete" ON %I FOR DELETE TO anon, authenticated USING (true)', t);
  END LOOP;
END $$;
