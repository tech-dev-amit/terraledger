import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { getInitialDemoData } from './mockData';
import type {
  Approval,
  Booking,
  BookingEvent,
  ComplianceTask,
  DemandLetter,
  Lead,
  Partner,
  Payment,
  PaymentSchedule,
  Project,
  SiteVisit,
  Tower,
  Unit,
} from './types';
import type { Role, Store, StoreData } from './store';

const STORAGE_KEY = 'terraledger_local_store_v1';

function loadStoredData(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.projects && Array.isArray(parsed.projects)) {
        parsed.projects = parsed.projects.map((p: any) => ({
          publish_status: 'Published',
          amenities: ['24x7 Security', 'Power Backup', 'Clubhouse', 'Gym & Fitness', 'Elevator', 'Covered Parking'],
          gallery_images: [p.image_url || '/projects/meridian-heights.webp'],
          documents: [{ name: `${p.name || 'Project'} Brochure.pdf`, url: '#', size: '4.2 MB' }],
          geo_lat: p.geo_lat || 12.9716,
          geo_lng: p.geo_lng || 77.5946,
          share_slug: p.share_slug || (p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : p.id),
          ...p,
        }));
      }
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse stored data from localStorage', err);
  }
  const initial = getInitialDemoData();
  saveStoredData(initial);
  return initial;
}

function saveStoredData(data: StoreData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save data to localStorage', err);
  }
}

async function fetchFromSupabase(): Promise<StoreData> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const [projects, towers, units, partners, leads, visits, bookings, schedules, payments, letters, tasks, approvals, events] =
    await Promise.all([
      supabase.from('projects').select('*').order('name'),
      supabase.from('towers').select('*').order('name'),
      supabase.from('units').select('*').order('unit_no'),
      supabase.from('partners').select('*').order('firm'),
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('site_visits').select('*').order('scheduled_at', { ascending: false }),
      supabase.from('bookings').select('*').order('booking_date', { ascending: false }),
      supabase.from('payment_schedules').select('*').order('seq'),
      supabase.from('payments').select('*').order('paid_on', { ascending: false }),
      supabase.from('demand_letters').select('*').order('generated_at', { ascending: false }),
      supabase.from('compliance_tasks').select('*').order('sort'),
      supabase.from('approvals').select('*').order('created_at', { ascending: false }),
      supabase.from('booking_events').select('*').order('created_at', { ascending: false }),
    ]);

  const errs = [projects, towers, units, partners, leads, visits, bookings, schedules, payments, letters, tasks, approvals, events]
    .map((r) => r.error)
    .filter(Boolean);
  if (errs.length) throw new Error(errs[0]!.message);

  return {
    projects: (projects.data ?? []) as Project[],
    towers: (towers.data ?? []) as Tower[],
    units: (units.data ?? []) as Unit[],
    partners: (partners.data ?? []) as Partner[],
    leads: (leads.data ?? []) as Lead[],
    siteVisits: (visits.data ?? []) as SiteVisit[],
    bookings: (bookings.data ?? []) as Booking[],
    schedules: (schedules.data ?? []) as PaymentSchedule[],
    payments: (payments.data ?? []) as Payment[],
    letters: (letters.data ?? []) as DemandLetter[],
    tasks: (tasks.data ?? []) as ComplianceTask[],
    approvals: (approvals.data ?? []) as Approval[],
    events: (events.data ?? []) as BookingEvent[],
  };
}

export function useStoreData(): Store {
  const [data, setData] = useState<StoreData>(loadStoredData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<Role>('admin');

  const updateStateAndPersist = useCallback((updater: (prev: StoreData) => StoreData) => {
    setData((prev) => {
      const next = updater(prev);
      saveStoredData(next);
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      // Local/offline store: read from localStorage
      setData(loadStoredData());
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const d = await fetchFromSupabase();
      setData(d);
      saveStoredData(d);
    } catch (e) {
      console.warn('Falling back to local storage due to fetch error:', e);
      setData(loadStoredData());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) {
      refresh();
    }
  }, [refresh]);

  const store = useMemo<Omit<Store, 'loading' | 'error' | 'role' | 'setRole'>>(
    () => ({
      ...data,
      refresh,

      addProject: async (input, towersInput = [], unitsInput = []) => {
        const projectId = `proj-${Date.now()}`;
        const slug = (input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6)).replace(/^-+|-+$/g, '');
        
        const newProject: Project = {
          id: projectId,
          name: input.name,
          property_type: input.property_type,
          city: input.city,
          locality: input.locality,
          possession_date: input.possession_date ?? null,
          status: input.status,
          image_url: input.image_url ?? '/projects/meridian-heights.webp',
          description: input.description ?? null,
          publish_status: input.publish_status ?? 'Draft',
          rera_no: input.rera_no ?? null,
          amenities: input.amenities ?? [],
          gallery_images: input.gallery_images ?? [],
          documents: input.documents ?? [],
          geo_lat: input.geo_lat ?? 12.9716,
          geo_lng: input.geo_lng ?? 77.5946,
          brochure_url: input.brochure_url ?? null,
          share_slug: slug,
          price_range_min: input.price_range_min ?? null,
          price_range_max: input.price_range_max ?? null,
          total_units: unitsInput.length > 0 ? unitsInput.length : (input.total_units ?? 0),
        };

        const createdTowers: Tower[] = towersInput.map((t, i) => ({
          id: `tow-${projectId}-${i + 1}`,
          project_id: projectId,
          name: t.name,
          floors: t.floors,
        }));

        const createdUnits: Unit[] = unitsInput.map((u, i) => {
          const matchedTower = createdTowers.find((t) => t.name === u.tower_name) || createdTowers[0];
          return {
            id: `unit-${projectId}-${i + 1}`,
            project_id: projectId,
            tower_id: matchedTower ? matchedTower.id : null,
            floor: u.floor,
            unit_no: u.unit_no,
            config: u.config,
            area_sqft: u.area_sqft,
            facing: u.facing,
            price: u.price,
            status: u.status ?? 'Available',
            blocked_until: null,
          };
        });

        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from('projects').insert(newProject);
            if (createdTowers.length > 0) {
              await supabase.from('towers').insert(createdTowers);
            }
            if (createdUnits.length > 0) {
              await supabase.from('units').insert(createdUnits);
            }
          } catch (e) {
            console.warn('Supabase insert failed, continuing with local store', e);
          }
        }

        updateStateAndPersist((prev) => ({
          ...prev,
          projects: [newProject, ...prev.projects],
          towers: [...createdTowers, ...prev.towers],
          units: [...createdUnits, ...prev.units],
        }));

        return projectId;
      },

      updateProject: async (id, updates) => {
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from('projects').update(updates).eq('id', id);
          } catch (e) {
            console.warn('Supabase update failed', e);
          }
        }
        updateStateAndPersist((prev) => ({
          ...prev,
          projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      publishProject: async (id) => {
        const proj = data.projects.find((p) => p.id === id);
        const slug = proj?.share_slug || (proj ? proj.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `proj-${id}`);
        
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from('projects').update({ publish_status: 'Published', share_slug: slug }).eq('id', id);
          } catch (e) {
            console.warn('Supabase publish failed', e);
          }
        }
        updateStateAndPersist((prev) => ({
          ...prev,
          projects: prev.projects.map((p) => (p.id === id ? { ...p, publish_status: 'Published', share_slug: slug } : p)),
        }));
      },

      blockUnit: async (unitId, days, needsApproval, reason) => {
        const blockedUntil = new Date(Date.now() + days * 86_400_000).toISOString();

        if (isSupabaseConfigured && supabase) {
          const { error: e } = await supabase.from('units').update({ status: 'Blocked', blocked_until: blockedUntil }).eq('id', unitId);
          if (e) throw e;
          if (needsApproval) {
            await supabase.from('approvals').insert({
              type: 'Block Extension',
              unit_id: unitId,
              requested_by: 'Builder Admin / Sales',
              reason: reason || `Block hold for ${days} days requires manager sign-off`,
              status: 'Pending',
            });
          }
          await refresh();
          return;
        }

        // Local state mutation
        updateStateAndPersist((prev) => {
          const nextUnits = prev.units.map((u) => (u.id === unitId ? { ...u, status: 'Blocked' as const, blocked_until: blockedUntil } : u));
          let nextApprovals = prev.approvals;
          if (needsApproval) {
            const newApproval: Approval = {
              id: `appr-${Date.now()}`,
              type: 'Block Extension',
              unit_id: unitId,
              booking_id: null,
              requested_by: 'Builder Admin / Sales',
              reason: reason || `Block hold for ${days} days requires manager sign-off`,
              discount_pct: null,
              status: 'Pending',
              created_at: new Date().toISOString(),
            };
            nextApprovals = [newApproval, ...prev.approvals];
          }
          return { ...prev, units: nextUnits, approvals: nextApprovals };
        });
      },

      createBooking: async (unitId, input) => {
        const unit = data.units.find((u) => u.id === unitId);
        if (!unit) throw new Error('Unit not found');

        const isCLP = input.plan_type === 'CLP';
        const miles = isCLP
          ? ['Booking Amount', 'Agreement (10%)', 'Foundation Cast', 'Plinth Slab', 'Ground Floor Slab', 'First Floor Slab', 'Brickwork & Finishing', 'On Possession']
          : ['Booking Amount', 'Agreement (10%)', 'Q1 Installment', 'Q2 Installment', 'Q3 Installment', 'On Possession'];
        const pcts = isCLP ? [5, 10, 10, 10, 15, 15, 25, 10] : [10, 10, 20, 20, 20, 20];
        const gaps = isCLP ? [0, 7, 60, 120, 190, 260, 340, 430] : [0, 7, 97, 187, 277, 367];
        const start = new Date();

        if (isSupabaseConfigured && supabase) {
          const { data: booking, error: e } = await supabase
            .from('bookings')
            .insert({
              unit_id: unitId,
              lead_id: input.lead_id ?? null,
              buyer_name: input.buyer_name,
              buyer_phone: input.buyer_phone,
              buyer_email: input.buyer_email ?? null,
              cp_id: input.cp_id ?? null,
              plan_type: input.plan_type,
              agreement_value: unit.price,
              status: 'Confirmed',
            })
            .select()
            .single();
          if (e) throw e;

          await supabase.from('units').update({ status: 'Booked', blocked_until: null }).eq('id', unitId);

          const rows = miles.map((m, i) => ({
            booking_id: booking.id,
            seq: i + 1,
            milestone: m,
            pct: pcts[i],
            amount: Math.round((unit.price * pcts[i]) / 100),
            due_date: new Date(start.getTime() + gaps[i] * 86_400_000).toISOString().slice(0, 10),
            paid_amount: 0,
            status: 'Pending',
          }));
          await supabase.from('payment_schedules').insert(rows);
          await supabase.from('booking_events').insert({
            booking_id: booking.id,
            type: 'Booking',
            description: `Booking confirmed on unit ${unit.unit_no}. Payment plan: ${input.plan_type}.`,
          });
          await refresh();
          return;
        }

        // Local state
        const newBookingId = `b0000000-0000-4000-8000-${String(Date.now()).slice(-12)}`;
        const newBooking: Booking = {
          id: newBookingId,
          unit_id: unitId,
          lead_id: input.lead_id ?? null,
          buyer_name: input.buyer_name,
          buyer_phone: input.buyer_phone,
          buyer_email: input.buyer_email ?? null,
          cp_id: input.cp_id ?? null,
          plan_type: input.plan_type,
          agreement_value: unit.price,
          booking_date: start.toISOString().slice(0, 10),
          status: 'Confirmed',
          registration_no: null,
          notes: null,
        };

        const newSchedules: PaymentSchedule[] = miles.map((m, i) => ({
          id: `sched-${newBookingId.slice(0, 8)}-${i + 1}`,
          booking_id: newBookingId,
          seq: i + 1,
          milestone: m,
          pct: pcts[i],
          amount: Math.round((unit.price * pcts[i]) / 100),
          due_date: new Date(start.getTime() + gaps[i] * 86_400_000).toISOString().slice(0, 10),
          paid_amount: 0,
          status: 'Pending',
        }));

        const newEvent: BookingEvent = {
          id: `ev-${Date.now()}`,
          booking_id: newBookingId,
          type: 'Booking',
          description: `Booking confirmed on unit ${unit.unit_no}. Payment plan: ${input.plan_type}.`,
          created_at: new Date().toISOString(),
        };

        const newTasks: ComplianceTask[] = [
          {
            id: `task-${newBookingId}-1`,
            booking_id: newBookingId,
            category: 'Documentation',
            title: 'Allotment Letter issued',
            done: true,
            done_at: new Date().toISOString(),
            note: 'Auto-generated upon booking confirmation',
            sort: 1,
          },
          {
            id: `task-${newBookingId}-2`,
            booking_id: newBookingId,
            category: 'Documentation',
            title: 'Agreement to Sale executed',
            done: false,
            done_at: null,
            note: 'Draft with legal team',
            sort: 2,
          },
        ];

        updateStateAndPersist((prev) => ({
          ...prev,
          bookings: [newBooking, ...prev.bookings],
          units: prev.units.map((u) => (u.id === unitId ? { ...u, status: 'Booked' as const, blocked_until: null } : u)),
          schedules: [...prev.schedules, ...newSchedules],
          events: [newEvent, ...prev.events],
          tasks: [...prev.tasks, ...newTasks],
        }));
      },

      recordPayment: async (bookingId, scheduleId, amount, mode) => {
        const sched = data.schedules.find((s) => s.id === scheduleId);
        if (!sched) throw new Error('Slab not found');

        const receiptNo = `RCPT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;

        if (isSupabaseConfigured && supabase) {
          await supabase.from('payments').insert({
            booking_id: bookingId,
            schedule_id: scheduleId,
            receipt_no: receiptNo,
            amount,
            mode,
            notes: `Against ${sched.milestone}`,
          });

          const newPaid = (sched.paid_amount ?? 0) + amount;
          const status = newPaid >= sched.amount ? 'Paid' : newPaid > 0 ? 'Part-Paid' : sched.status;
          await supabase.from('payment_schedules').update({ paid_amount: newPaid, status }).eq('id', scheduleId);
          await supabase.from('booking_events').insert({
            booking_id: bookingId,
            type: 'Payment',
            description: `Payment of ₹${amount.toLocaleString('en-IN')} received via ${mode}. Receipt ${receiptNo} issued.`,
          });
          await refresh();
          return;
        }

        // Local state
        const newPaid = (sched.paid_amount ?? 0) + amount;
        const newStatus = newPaid >= sched.amount ? 'Paid' : newPaid > 0 ? 'Part-Paid' : sched.status;

        const newPayment: Payment = {
          id: `pay-${Date.now()}`,
          booking_id: bookingId,
          schedule_id: scheduleId,
          receipt_no: receiptNo,
          amount,
          mode,
          paid_on: new Date().toISOString().slice(0, 10),
          notes: `Against ${sched.milestone}`,
        };

        const newEvent: BookingEvent = {
          id: `ev-${Date.now()}`,
          booking_id: bookingId,
          type: 'Payment',
          description: `Payment of ₹${amount.toLocaleString('en-IN')} received via ${mode}. Receipt ${receiptNo} issued.`,
          created_at: new Date().toISOString(),
        };

        updateStateAndPersist((prev) => ({
          ...prev,
          payments: [newPayment, ...prev.payments],
          schedules: prev.schedules.map((s) => (s.id === scheduleId ? { ...s, paid_amount: newPaid, status: newStatus } : s)),
          events: [newEvent, ...prev.events],
        }));
      },

      generateDemandLetter: async (scheduleId) => {
        const sched = data.schedules.find((s) => s.id === scheduleId);
        if (!sched) throw new Error('Slab not found');

        const outstanding = sched.amount - (sched.paid_amount ?? 0);
        const overdueDays = Math.max(0, Math.ceil((Date.now() - new Date(sched.due_date).getTime()) / 86_400_000));
        const interest = Math.round(outstanding * 0.18 * (overdueDays / 365));
        const letterNo = `DL-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;

        if (isSupabaseConfigured && supabase) {
          await supabase.from('demand_letters').insert({
            booking_id: sched.booking_id,
            schedule_id: scheduleId,
            letter_no: letterNo,
            amount: outstanding,
            interest,
            total_due: outstanding + interest,
            due_date: sched.due_date,
          });
          if (overdueDays > 0 && sched.status === 'Pending') {
            await supabase.from('payment_schedules').update({ status: 'Overdue' }).eq('id', scheduleId);
          }
          await refresh();
          return;
        }

        // Local state
        const newLetter: DemandLetter = {
          id: `dl-${Date.now()}`,
          booking_id: sched.booking_id,
          schedule_id: scheduleId,
          letter_no: letterNo,
          amount: outstanding,
          interest,
          total_due: outstanding + interest,
          due_date: sched.due_date,
          generated_at: new Date().toISOString(),
        };

        updateStateAndPersist((prev) => ({
          ...prev,
          letters: [newLetter, ...prev.letters],
          schedules: prev.schedules.map((s) => (s.id === scheduleId && overdueDays > 0 && s.status === 'Pending' ? { ...s, status: 'Overdue' } : s)),
        }));
      },

      toggleTask: async (taskId, done) => {
        if (isSupabaseConfigured && supabase) {
          await supabase.from('compliance_tasks').update({ done, done_at: done ? new Date().toISOString() : null }).eq('id', taskId);
          await refresh();
          return;
        }

        updateStateAndPersist((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, done, done_at: done ? new Date().toISOString() : null } : t)),
        }));
      },

      addLead: async (input) => {
        if (isSupabaseConfigured && supabase) {
          await supabase.from('leads').insert({
            name: input.name,
            phone: input.phone,
            email: input.email ?? null,
            source: input.source,
            project_id: input.project_id,
            interested_config: input.interested_config ?? null,
            budget_max: input.budget_max ?? null,
            cp_id: input.cp_id ?? null,
            status: 'New',
            score: 50,
            ai_notes: input.ai_notes ?? 'New registration awaiting first call. AI summary will be generated after the call.',
            next_followup_at: new Date(Date.now() + 86_400_000).toISOString(),
          });
          await refresh();
          return;
        }

        const newLead: Lead = {
          id: `c0000000-0000-4000-8000-${String(Date.now()).slice(-12)}`,
          name: input.name,
          phone: input.phone,
          email: input.email ?? null,
          source: input.source,
          project_id: input.project_id,
          interested_config: input.interested_config ?? null,
          budget_min: null,
          budget_max: input.budget_max ?? null,
          status: 'New',
          assigned_to: 'Sales Team',
          cp_id: input.cp_id ?? null,
          score: 65,
          ai_notes: input.ai_notes ?? 'New registration awaiting first call. AI summary generated.',
          next_followup_at: new Date(Date.now() + 86_400_000).toISOString(),
          last_contacted_at: null,
          created_at: new Date().toISOString(),
        };

        updateStateAndPersist((prev) => ({
          ...prev,
          leads: [newLead, ...prev.leads],
        }));
      },

      updateLeadStatus: async (leadId, status) => {
        if (isSupabaseConfigured && supabase) {
          await supabase.from('leads').update({ status }).eq('id', leadId);
          await refresh();
          return;
        }

        updateStateAndPersist((prev) => ({
          ...prev,
          leads: prev.leads.map((l) => (l.id === leadId ? { ...l, status } : l)),
        }));
      },

      scheduleVisit: async (leadId, projectId, when) => {
        if (isSupabaseConfigured && supabase) {
          await supabase.from('site_visits').insert({
            lead_id: leadId,
            project_id: projectId,
            scheduled_at: when,
            status: 'Scheduled',
            picked_by: 'Builder Admin / Sales',
          });
          await supabase.from('leads').update({ status: 'Site Visit Scheduled' }).eq('id', leadId);
          await refresh();
          return;
        }

        const newVisit: SiteVisit = {
          id: `visit-${Date.now()}`,
          lead_id: leadId,
          project_id: projectId,
          scheduled_at: when,
          status: 'Scheduled',
          feedback: null,
          picked_by: 'Builder Admin / Sales',
        };

        updateStateAndPersist((prev) => ({
          ...prev,
          siteVisits: [newVisit, ...prev.siteVisits],
          leads: prev.leads.map((l) => (l.id === leadId ? { ...l, status: 'Site Visit Scheduled' } : l)),
        }));
      },

      decideApproval: async (id, status) => {
        if (isSupabaseConfigured && supabase) {
          await supabase.from('approvals').update({ status, decided_at: new Date().toISOString() }).eq('id', id);
          await refresh();
          return;
        }

        updateStateAndPersist((prev) => ({
          ...prev,
          approvals: prev.approvals.map((a) => (a.id === id ? { ...a, status } : a)),
        }));
      },
    }),
    [data, refresh, updateStateAndPersist],
  );

  return { ...store, loading, error, role, setRole };
}
