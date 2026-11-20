/*
# Seed TerraLedger with realistic demo data

1. Plain-English
   Populates 3 projects (Meridian Heights apartments, Oakridge Villas, Apex Trade Hub commercial)
   with ~84 units across towers/floors, 4 channel partners, 12 leads with sources and AI notes,
   8 site visits, 5 bookings with CLP/TLP payment schedules, payments/receipts, demand letters
   with overdue interest, compliance checklists, approvals queue and booking activity events.

2. Strategy
   - Unit ids are deterministic (md5 of a stable key) so lookups stay stable across re-runs.
   - Bookings and approvals are inserted via INSERT..SELECT joined on existing unit_no values.
   - Every insert is guarded (ON CONFLICT DO NOTHING or NOT EXISTS) so the seed is safe to re-apply.

3. Security
   - Data-only migration; no security changes.
*/

INSERT INTO projects (id, name, property_type, city, locality, possession_date, status) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Meridian Heights', 'Apartments', 'Bengaluru', 'Whitefield, ITPL Road', '2027-06-15', 'Under Construction'),
  ('a0000000-0000-4000-8000-000000000002', 'Oakridge Villas', 'Villas', 'Hyderabad', 'Gachibowli, Financial District', '2026-12-01', 'Nearing Possession'),
  ('a0000000-0000-4000-8000-000000000003', 'Apex Trade Hub', 'Commercial', 'Pune', 'Baner, Pune-Mumbai Bypass', '2027-03-31', 'Under Construction')
ON CONFLICT (name) DO NOTHING;

INSERT INTO towers (id, project_id, name, floors) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Tower A', 8),
  ('a1000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Tower B', 8),
  ('a1000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'Villa Block', 2),
  ('a1000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000003', 'Trade Tower 1', 5)
ON CONFLICT DO NOTHING;

-- Meridian Heights: Tower A (4 units/floor) + Tower B (3 units/floor)
DO $$
DECLARE
  f int; u int; uno text; cfg text; area numeric; price numeric; face text; st text; pid uuid;
BEGIN
  pid := 'a0000000-0000-4000-8000-000000000001';
  FOR f IN 1..8 LOOP
    FOR u IN 1..4 LOOP
      uno := 'A-' || f || lpad(u::text, 2, '0');
      cfg := CASE WHEN u <= 2 THEN '2 BHK' ELSE '3 BHK' END;
      area := CASE WHEN u <= 2 THEN 1105.0 ELSE 1540.0 END;
      price := CASE WHEN u <= 2 THEN 11500000 + (f-1)*150000 ELSE 16800000 + (f-1)*200000 END;
      face := (ARRAY['East','West','North','North-East'])[u];
      st := CASE
        WHEN f <= 2 THEN 'Sold'
        WHEN f = 3 AND u = 2 THEN 'Booked'
        WHEN f = 4 AND u = 1 THEN 'Blocked'
        WHEN f = 5 AND u = 4 THEN 'Blocked'
        WHEN f = 6 AND u = 3 THEN 'Booked'
        ELSE 'Available' END;
      INSERT INTO units (id, project_id, tower_id, floor, unit_no, config, area_sqft, facing, price, status, blocked_until)
      VALUES (md5('MH:'||uno)::uuid, pid, 'a1000000-0000-4000-8000-000000000001', f, uno, cfg, area, face, price, st,
        CASE WHEN st = 'Blocked' THEN now() + interval '5 days' ELSE NULL END)
      ON CONFLICT (project_id, unit_no) DO NOTHING;
    END LOOP;
    FOR u IN 1..3 LOOP
      uno := 'B-' || f || lpad(u::text, 2, '0');
      cfg := CASE WHEN u = 1 THEN '2 BHK' ELSE '3 BHK' END;
      area := CASE WHEN u = 1 THEN 1180.0 ELSE 1615.0 END;
      price := CASE WHEN u = 1 THEN 12100000 + (f-1)*150000 ELSE 17400000 + (f-1)*200000 END;
      face := (ARRAY['East','South-West','West'])[u];
      st := CASE
        WHEN f <= 2 THEN 'Sold'
        WHEN f = 3 AND u = 3 THEN 'Sold'
        WHEN f = 5 AND u = 2 THEN 'Booked'
        WHEN f = 7 AND u = 1 THEN 'Blocked'
        ELSE 'Available' END;
      INSERT INTO units (id, project_id, tower_id, floor, unit_no, config, area_sqft, facing, price, status, blocked_until)
      VALUES (md5('MH:'||uno)::uuid, pid, 'a1000000-0000-4000-8000-000000000002', f, uno, cfg, area, face, price, st,
        CASE WHEN st = 'Blocked' THEN now() + interval '4 days' ELSE NULL END)
      ON CONFLICT (project_id, unit_no) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Oakridge Villas: 8 villas
DO $$
DECLARE
  i int; uno text; price numeric; st text; pid uuid;
BEGIN
  pid := 'a0000000-0000-4000-8000-000000000002';
  FOR i IN 1..8 LOOP
    uno := 'V-' || i;
    price := CASE WHEN i <= 4 THEN 38500000 ELSE 44000000 END;
    st := CASE
      WHEN i = 1 OR i = 5 THEN 'Sold'
      WHEN i = 3 THEN 'Booked'
      WHEN i = 7 THEN 'Blocked'
      ELSE 'Available' END;
    INSERT INTO units (id, project_id, tower_id, floor, unit_no, config, area_sqft, facing, price, status, blocked_until)
    VALUES (md5('OV:'||uno)::uuid, pid, 'a1000000-0000-4000-8000-000000000003', 0, uno,
      CASE WHEN i <= 4 THEN '4 BHK Villa' ELSE '5 BHK Villa' END,
      CASE WHEN i <= 4 THEN 3200.0 ELSE 3850.0 END,
      (ARRAY['East','West','North','South'])[1 + (i % 4)], price, st,
      CASE WHEN st = 'Blocked' THEN now() + interval '6 days' ELSE NULL END)
    ON CONFLICT (project_id, unit_no) DO NOTHING;
  END LOOP;
END $$;

-- Apex Trade Hub: 5 floors x 4 commercial units
DO $$
DECLARE
  f int; u int; uno text; cfg text; area numeric; price numeric; st text; pid uuid;
BEGIN
  pid := 'a0000000-0000-4000-8000-000000000003';
  FOR f IN 1..5 LOOP
    FOR u IN 1..4 LOOP
      uno := 'T1-' || f || lpad(u::text, 2, '0');
      cfg := CASE WHEN f = 1 THEN 'Retail Showroom' ELSE 'Office Suite' END;
      area := CASE WHEN f = 1 THEN 1450.0 ELSE 1200.0 END;
      price := CASE WHEN f = 1 THEN 24500000 ELSE 13200000 + u*300000 END;
      st := CASE
        WHEN f = 1 AND u = 2 THEN 'Sold'
        WHEN f = 1 AND u = 1 THEN 'Booked'
        WHEN f = 2 AND u = 3 THEN 'Blocked'
        ELSE 'Available' END;
      INSERT INTO units (id, project_id, tower_id, floor, unit_no, config, area_sqft, facing, price, status, blocked_until)
      VALUES (md5('AT:'||uno)::uuid, pid, 'a1000000-0000-4000-8000-000000000004', f, uno, cfg, area,
        (ARRAY['Main Road','West','Courtyard','East'])[u], price, st,
        CASE WHEN st = 'Blocked' THEN now() + interval '3 days' ELSE NULL END)
      ON CONFLICT (project_id, unit_no) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

INSERT INTO partners (id, name, firm, phone, email, city, commission_pct, status) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'Rajesh Kumar', 'Skyline Realty Consultants', '+91 98450 11223', 'rajesh@skylinerealty.in', 'Bengaluru', 2.00, 'Active'),
  ('d0000000-0000-4000-8000-000000000002', 'Meera Joshi', 'Prime Estates Advisory', '+91 98860 44556', 'meera@primeestates.in', 'Hyderabad', 1.50, 'Active'),
  ('d0000000-0000-4000-8000-000000000003', 'Arun Verma', 'Verma Property Links', '+91 99870 77889', 'arun@vermaplinks.in', 'Pune', 1.25, 'Active'),
  ('d0000000-0000-4000-8000-000000000004', 'Sneha Rao', 'UrbanNest Partners', '+91 97400 33221', 'sneha@urbannest.in', 'Bengaluru', 2.50, 'On Hold')
ON CONFLICT (firm) DO NOTHING;

INSERT INTO leads (id, name, phone, email, source, project_id, interested_config, budget_min, budget_max, status, assigned_to, cp_id, score, ai_notes, next_followup_at, last_contacted_at, created_at) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'Vikram Shah', '+91 98201 33445', 'vikram.shah@gmail.com', 'Property Portal', 'a0000000-0000-4000-8000-000000000001', '3 BHK', 15000000, 17500000, 'Negotiation', 'Kavya (Sales)', NULL, 82, 'Called 12-Nov. Wants corner unit, East facing, 3 BHK in Tower A. Price-sensitive; hinted at 2% discount ask. Ready to close this month if discount approved.', now() + interval '1 day', now() - interval '2 days', now() - interval '18 days'),
  ('c0000000-0000-4000-8000-000000000002', 'Anita Desai', '+91 98455 66778', 'anita.desai@outlook.com', 'Website', 'a0000000-0000-4000-8000-000000000001', '2 BHK', 10500000, 12500000, 'Site Visit Done', 'Arjun (Sales)', NULL, 74, 'Visited Tower A on 14-Nov. Loved floor-6 view. Comparing with Prestigio across road. Send cost sheet + payment plan comparison.', now() + interval '2 days', now() - interval '5 days', now() - interval '25 days'),
  ('c0000000-0000-4000-8000-000000000003', 'Suresh Babu', '+91 90080 99112', 'suresh.babu@yahoo.in', 'Channel Partner', 'a0000000-0000-4000-8000-000000000002', '5 BHK Villa', 40000000, 47000000, 'New', 'Meera (Sales)', 'd0000000-0000-4000-8000-000000000002', 68, 'Referred by Prime Estates. NRI buyer, prefers WhatsApp updates. Needs villa with private pool. Verify home-loan eligibility with HDFC.', now() - interval '1 day', now() - interval '4 days', now() - interval '6 days'),
  ('c0000000-0000-4000-8000-000000000004', 'Priya Menon', '+91 99004 55667', 'priya.menon@gmail.com', 'Meta/Google Ads', 'a0000000-0000-4000-8000-000000000001', '2 BHK', 10000000, 12000000, 'Contacted', 'Kavya (Sales)', NULL, 61, 'Came from Instagram lead ad. First-time buyer, home loan pre-approved up to Rs 90L. Follow up with EMI illustration.', now() + interval '3 days', now() - interval '1 day', now() - interval '9 days'),
  ('c0000000-0000-4000-8000-000000000005', 'Rahul Khanna', '+91 98110 22334', 'rahul.khanna@zenco.in', 'Direct', 'a0000000-0000-4000-8000-000000000003', 'Retail Showroom', 22000000, 26000000, 'Site Visit Done', 'Farhan (Sales)', NULL, 88, 'Wants ground-floor retail for his apparel brand. Visited 10-Nov with architect. Asked for CAM charges and footfall study. Hot lead — escalate to manager if idle 48h.', now() - interval '2 days', now() - interval '9 days', now() - interval '16 days'),
  ('c0000000-0000-4000-8000-000000000006', 'Deepika Rao', '+91 96633 77889', 'deepika.rao@gmail.com', 'Property Portal', 'a0000000-0000-4000-8000-000000000002', '4 BHK Villa', 36000000, 40000000, 'Negotiation', 'Meera (Sales)', NULL, 79, 'Second visit done with family. Kids loved the lawn. Negotiation stage now; wants club membership waived.', now() + interval '1 day', now() - interval '3 days', now() - interval '21 days'),
  ('c0000000-0000-4000-8000-000000000007', 'Imran Shaikh', '+91 99872 11009', 'imran.s@gmail.com', 'Channel Partner', 'a0000000-0000-4000-8000-000000000003', 'Office Suite', 12000000, 14000000, 'Contacted', 'Farhan (Sales)', 'd0000000-0000-4000-8000-000000000003', 55, 'CP-referred IT services firm looking to own office. Needs 30+ seats, prefers west wing. Send floor plans of levels 2-4.', now() + interval '4 days', now() - interval '6 days', now() - interval '11 days'),
  ('c0000000-0000-4000-8000-000000000008', 'Sunita Kapoor', '+91 98200 88991', 'sunita.kapoor@gmail.com', 'Website', 'a0000000-0000-4000-8000-000000000001', '3 BHK', 16000000, 18000000, 'Site Visit Scheduled', 'Arjun (Sales)', NULL, 71, 'Booking form downloaded from website. Visit booked for Saturday morning. Husband prefers higher floor, budget flexible.', now() + interval '2 days', now() - interval '2 days', now() - interval '7 days'),
  ('c0000000-0000-4000-8000-000000000009', 'Naveen Gowda', '+91 95350 66447', 'naveen.gowda@gmail.com', 'Meta/Google Ads', 'a0000000-0000-4000-8000-000000000002', '4 BHK Villa', 35000000, 39000000, 'New', 'Meera (Sales)', NULL, 52, 'Facebook ad enquiry. Budget tight vs villa pricing; consider showing Meridian 3 BHK as alternative. Call after 6pm only.', now() - interval '3 days', now() - interval '8 days', now() - interval '13 days'),
  ('c0000000-0000-4000-8000-000000000010', 'Farida Mistry', '+91 98923 44556', 'farida.m@gmail.com', 'Property Portal', 'a0000000-0000-4000-8000-000000000003', 'Office Suite', 13000000, 15000000, 'Dropped', 'Farhan (Sales)', NULL, 30, 'Chose a competitor project closer to Kharadi. Keep in nurture list; Q1 launches may re-engage. Drip email sequence active.', now() + interval '15 days', now() - interval '20 days', now() - interval '40 days'),
  ('c0000000-0000-4000-8000-000000000011', 'Gaurav Bhatia', '+91 98456 90012', 'gaurav.bhatia@gmail.com', 'Channel Partner', 'a0000000-0000-4000-8000-000000000001', '2 BHK', 11000000, 12500000, 'Booked', 'Kavya (Sales)', 'd0000000-0000-4000-8000-000000000001', 85, 'Booked A-302 via Skyline Realty. Token received, agreement in drafting. CP commission claim logged.', now() + interval '5 days', now() - interval '10 days', now() - interval '30 days'),
  ('c0000000-0000-4000-8000-000000000012', 'Lakshmi Iyer', '+91 97417 22334', 'lakshmi.iyer@gmail.com', 'Website', 'a0000000-0000-4000-8000-000000000001', '2 BHK', 11500000, 13000000, 'Site Visit Scheduled', 'Arjun (Sales)', NULL, 66, 'Self-employed buyer; needs GST-compliant invoice. Visit on Sunday. Send directions + brochure beforehand.', now() + interval '3 days', now() - interval '1 day', now() - interval '5 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO site_visits (id, lead_id, project_id, scheduled_at, status, feedback, picked_by) VALUES
  ('e0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', now() - interval '5 days', 'Completed', 'Impressed by sample flat and amenities deck. Asked for cost sheet by email.', 'Arjun (Sales)'),
  ('e0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000003', now() - interval '9 days', 'Completed', 'Brought architect. Measured showroom frontage. Wants CAM + footfall data.', 'Farhan (Sales)'),
  ('e0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000002', now() - interval '3 days', 'Completed', 'Second visit with family. Kids loved the lawn. Negotiation stage now.', 'Meera (Sales)'),
  ('e0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', now() + interval '2 days', 'Scheduled', NULL, 'Arjun (Sales)'),
  ('e0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000001', now() + interval '3 days', 'Scheduled', NULL, 'Arjun (Sales)'),
  ('e0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', now() - interval '2 days', 'No Show', 'Did not arrive; CP says rescheduling to next weekend.', 'Meera (Sales)'),
  ('e0000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', now() + interval '5 days', 'Scheduled', NULL, 'Kavya (Sales)'),
  ('e0000000-0000-4000-8000-000000000008', 'c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now() - interval '12 days', 'Completed', 'Shortlisted A-603 and A-604. Wants east-facing corner confirmation.', 'Kavya (Sales)')
ON CONFLICT (id) DO NOTHING;

-- Bookings via INSERT..SELECT joined on existing unit_no (no null unit_id possible)
INSERT INTO bookings (id, unit_id, lead_id, buyer_name, buyer_phone, buyer_email, cp_id, plan_type, agreement_value, booking_date, status, registration_no, notes)
SELECT s.id, s.unit_id, s.lead_id, s.buyer_name, s.buyer_phone, s.buyer_email, s.cp_id,
       s.plan_type, s.agreement_value, s.booking_date, s.status, s.registration_no, s.notes
FROM (VALUES
  ('b0000000-0000-4000-8000-000000000001', 'A-302', 'c0000000-0000-4000-8000-000000000011',
   'Gaurav Bhatia', '+91 98456 90012', 'gaurav.bhatia@gmail.com',
   'd0000000-0000-4000-8000-000000000001'::uuid, 'CLP', 17400000::numeric, 45, 'Confirmed',
   NULL::text,
   'CP-referred booking via Skyline Realty. Discount 2% approved by manager.'),
  ('b0000000-0000-4000-8000-000000000002', 'A-103', NULL,
   'Priya Nair', '+91 98867 44556', 'priya.nair@gmail.com',
   NULL, 'TLP', 11800000::numeric, 200, 'Registered', 'REG-BLR-MH-2026-0412',
   'Registered sale. Possession expected Jun 2027.'),
  ('b0000000-0000-4000-8000-000000000003', 'V-3', NULL,
   'Kunal & Ritu Deshpande', '+91 90040 55667', 'kunal.deshpande@gmail.com',
   'd0000000-0000-4000-8000-000000000002'::uuid, 'CLP', 38500000::numeric, 120, 'Confirmed', NULL,
   'Villa with private lawn. Nearing possession; handover checklist active.'),
  ('b0000000-0000-4000-8000-000000000004', 'T1-101', NULL,
   'Zenith Retail Solutions Pvt Ltd', '+91 98203 77889', 'admin@zenithretail.in',
   NULL, 'CLP', 24500000::numeric, 75, 'Confirmed', NULL,
   'Ground-floor retail showroom. GST invoice required on all demands.'),
  ('b0000000-0000-4000-8000-000000000005', 'B-104', NULL,
   'Ananya Iyer', '+91 99022 11334', 'ananya.iyer@gmail.com',
   NULL, 'TLP', 12250000::numeric, 260, 'Registered', 'REG-BLR-MH-2026-0388',
   'Self-funded purchase, no home loan.')
) AS v(id, unit_no, lead_id, buyer_name, buyer_phone, buyer_email, cp_id, plan_type, agreement_value, age_days, status, registration_no, notes)
CROSS JOIN LATERAL (
  SELECT
    v.id::uuid AS id,
    u.id AS unit_id,
    v.lead_id::uuid AS lead_id,
    v.buyer_name, v.buyer_phone, v.buyer_email, v.cp_id,
    v.plan_type, v.agreement_value,
    (CURRENT_DATE - v.age_days) AS booking_date,
    v.status, v.registration_no, v.notes
  FROM units u
  WHERE u.unit_no = v.unit_no
    AND u.project_id IN (
      'a0000000-0000-4000-8000-000000000001',
      'a0000000-0000-4000-8000-000000000002',
      'a0000000-0000-4000-8000-000000000003')
    AND NOT EXISTS (SELECT 1 FROM bookings bk WHERE bk.unit_id = u.id)
) s
ON CONFLICT (id) DO NOTHING;

-- Payment schedules: CLP (8 slabs) and TLP (6 slabs)
DO $$
DECLARE
  b RECORD; val numeric; sd date; slabs int;
  miles text[]; pcts numeric[]; gaps int[];
  i int; amt numeric; ddate date; paid numeric; st text;
BEGIN
  FOR b IN SELECT * FROM bookings LOOP
    val := b.agreement_value;
    sd := b.booking_date;
    IF b.plan_type = 'CLP' THEN
      miles := ARRAY['Booking Amount','Agreement (10%)','Foundation Cast','Plinth Slab','Ground Floor Slab','First Floor Slab','Brickwork & Finishing','On Possession'];
      pcts  := ARRAY[5.0,10.0,10.0,10.0,15.0,15.0,25.0,10.0];
      gaps  := ARRAY[0,7,60,120,190,260,340,430];
      slabs := 8;
    ELSE
      miles := ARRAY['Booking Amount','Agreement (10%)','Q1 Installment','Q2 Installment','Q3 Installment','On Possession'];
      pcts  := ARRAY[10.0,10.0,20.0,20.0,20.0,20.0];
      gaps  := ARRAY[0,7,97,187,277,367];
      slabs := 6;
    END IF;
    FOR i IN 1..slabs LOOP
      amt := round(val * pcts[i] / 100.0, 2);
      ddate := sd + gaps[i];
      IF ddate < CURRENT_DATE THEN
        paid := amt; st := 'Paid';
      ELSIF ddate < CURRENT_DATE + 20 THEN
        paid := 0; st := 'Due Soon';
      ELSE
        paid := 0; st := 'Pending';
      END IF;
      INSERT INTO payment_schedules (booking_id, seq, milestone, pct, amount, due_date, paid_amount, status)
      VALUES (b.id, i, miles[i], pcts[i], amt, ddate, paid, st);
    END LOOP;
  END LOOP;
END $$;

-- Payments / receipts against paid slabs
INSERT INTO payments (id, booking_id, schedule_id, receipt_no, amount, mode, paid_on, notes)
SELECT
  ('f0000000-0000-4000-8000-' || lpad(row_number() OVER (ORDER BY ps.booking_id, ps.seq)::text, 12, '0'))::uuid,
  ps.booking_id, ps.id,
  'RCPT-' || to_char(ps.due_date, 'YYYY') || '-' || lpad(row_number() OVER (ORDER BY ps.booking_id, ps.seq)::text, 4, '0'),
  ps.paid_amount,
  (ARRAY['NEFT','RTGS','Cheque','UPI'])[1 + (row_number() OVER (ORDER BY ps.booking_id, ps.seq) % 4)],
  ps.due_date,
  CASE WHEN ps.seq = 1 THEN 'Booking amount received' ELSE 'Installment against ' || ps.milestone END
FROM payment_schedules ps
WHERE ps.status = 'Paid'
ON CONFLICT DO NOTHING;

-- Demand letters for overdue slabs (past due, unpaid, 18% p.a. interest)
INSERT INTO demand_letters (id, booking_id, schedule_id, letter_no, amount, interest, total_due, due_date, generated_at)
SELECT
  ('f1000000-0000-4000-8000-' || lpad((ROW_NUMBER() OVER (ORDER BY ps.booking_id, ps.seq))::text, 12, '0'))::uuid,
  ps.booking_id, ps.id,
  'DL-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad((ROW_NUMBER() OVER (ORDER BY ps.booking_id, ps.seq))::text, 4, '0'),
  ps.amount - ps.paid_amount,
  round((ps.amount - ps.paid_amount) * 0.18 * GREATEST(CURRENT_DATE - ps.due_date, 0) / 365.0, 2),
  ps.amount - ps.paid_amount + round((ps.amount - ps.paid_amount) * 0.18 * GREATEST(CURRENT_DATE - ps.due_date, 0) / 365.0, 2),
  ps.due_date, now() - interval '2 days'
FROM payment_schedules ps
WHERE ps.due_date < CURRENT_DATE - 10 AND ps.status <> 'Paid'
ON CONFLICT DO NOTHING;

-- Compliance checklists per booking
DO $$
DECLARE
  b RECORD;
BEGIN
  FOR b IN SELECT * FROM bookings LOOP
    INSERT INTO compliance_tasks (booking_id, category, title, done, done_at, note, sort) VALUES
      (b.id, 'Documentation', 'Allotment Letter issued', true, b.booking_date + 1, 'Auto-generated from template AL-MH-01', 1),
      (b.id, 'Documentation', 'Agreement to Sale executed', b.status = 'Registered', CASE WHEN b.status = 'Registered' THEN b.booking_date + 20 END, CASE WHEN b.status = 'Registered' THEN 'Registered at sub-registrar office' ELSE 'Draft with legal team' END, 2),
      (b.id, 'Loan & Registration', 'Bank loan sanction received', b.status = 'Registered', CASE WHEN b.status = 'Registered' THEN b.booking_date + 30 END, NULL, 3),
      (b.id, 'Loan & Registration', 'Buyer stamp duty & registration', b.status = 'Registered', CASE WHEN b.status = 'Registered' THEN b.booking_date + 60 END, NULL, 4),
      (b.id, 'Handover', 'Snag list inspection', false, NULL, 'Scheduled near possession', 5),
      (b.id, 'Handover', 'Final key handover clearance', false, NULL, 'Pending all dues clearance', 6)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- Manager approval queue
INSERT INTO approvals (id, type, unit_id, booking_id, requested_by, reason, discount_pct, status, created_at)
SELECT s.id, s.type, s.unit_id, s.booking_id, s.requested_by, s.reason, s.discount_pct, s.status, s.created_at
FROM (VALUES
  ('f2000000-0000-4000-8000-000000000001'::uuid, 'Block Extension', 'A-401',
   'Kavya (Sales)', 'Client travelling; needs 5 more days on hold before booking', NULL::numeric, 'Pending', 1),
  ('f2000000-0000-4000-8000-000000000002'::uuid, 'Discount Approval', 'A-603',
   'Arjun (Sales)', 'Vikram Shah (hot lead, 82 score) asking for 2.5% on A-603 East-facing corner', 2.50::numeric, 'Pending', 2),
  ('f2000000-0000-4000-8000-000000000003'::uuid, 'Cancellation Review', NULL,
   'Farhan (Sales)', 'Zenith Retail citing funding delay; requests cancellation with 60% refund as per clause 12', NULL::numeric, 'Pending', 3),
  ('f2000000-0000-4000-8000-000000000004'::uuid, 'Discount Approval', NULL,
   'Meera (Sales)', 'Deepika Rao — 1.5% exchange for waiving club membership on V-6', 1.50::numeric, 'Approved', 6)
) AS v(id, type, unit_no, requested_by, reason, discount_pct, status, age_days)
CROSS JOIN LATERAL (
  SELECT v.id, v.type,
    (SELECT u.id FROM units u WHERE v.unit_no IS NOT NULL AND u.unit_no = v.unit_no
       AND u.project_id = 'a0000000-0000-4000-8000-000000000001') AS unit_id,
    CASE WHEN v.type = 'Cancellation Review' THEN 'b0000000-0000-4000-8000-000000000004'::uuid END AS booking_id,
    v.requested_by, v.reason, v.discount_pct, v.status,
    now() - (v.age_days || ' days')::interval AS created_at
  WHERE NOT EXISTS (SELECT 1 FROM approvals a WHERE a.id = v.id)
) s;

-- Booking activity trail
INSERT INTO booking_events (id, booking_id, type, description, created_at) VALUES
  ('f3000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Booking', 'Booking confirmed on unit A-302 with 2% manager-approved discount', now() - interval '45 days'),
  ('f3000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'Payment', 'Booking amount Rs 8,70,000 received via NEFT. Receipt RCPT issued', now() - interval '44 days'),
  ('f3000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'Demand', 'Demand letter generated for Agreement slab with overdue interest', now() - interval '2 days'),
  ('f3000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000002', 'Registration', 'Unit registered. Registration no REG-BLR-MH-2026-0412', now() - interval '140 days'),
  ('f3000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000003', 'Milestone', 'Structure complete. Finishing stage demand raised', now() - interval '15 days'),
  ('f3000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000004', 'Compliance', 'Allotment letter and GST invoice issued to Zenith Retail Solutions', now() - interval '70 days')
ON CONFLICT (id) DO NOTHING;
