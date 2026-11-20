import { useMemo, useState } from 'react';
import { Handshake, Percent, TrendingUp, UserPlus, CheckCircle2, Building, Sparkles } from 'lucide-react';
import { useStore, unitById } from '@/lib/store';
import { Card, Field, StatusBadge, inputCls, SectionTitle, KpiCard } from '@/components/ui';
import { inr, inrCompact, fmtDate } from '@/lib/format';

const PARTNER_ID = 'd0000000-0000-4000-8000-000000000001';

export function PartnerPortal() {
  const { projects, units, partners, bookings, leads, addLead } = useStore();
  const me = partners.find((p) => p.id === PARTNER_ID);
  const myLeads = leads.filter((l) => l.cp_id === PARTNER_ID);
  const myBookings = bookings.filter((b) => b.cp_id === PARTNER_ID);

  const commissionEarned = myBookings.reduce((a, b) => a + (b.agreement_value * ((me?.commission_pct ?? 2) / 100)), 0);

  const availableByProject = useMemo(
    () =>
      projects.map((p) => ({
        project: p,
        units: units.filter((u) => u.project_id === p.id && u.status === 'Available'),
      })),
    [projects, units],
  );

  const [form, setForm] = useState({ name: '', phone: '', email: '', config: '', budget: '', project_id: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!form.name || !form.phone) return;
    setBusy(true);
    try {
      await addLead({
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        source: 'Channel Partner',
        project_id: form.project_id || null,
        interested_config: form.config || undefined,
        budget_max: form.budget ? Number(form.budget) : null,
        cp_id: PARTNER_ID,
        ai_notes: 'CP-submitted lead. Source locked to Channel Partner portal registration.',
      });
      setDone(true);
      setForm({ name: '', phone: '', email: '', config: '', budget: '', project_id: '' });
      setTimeout(() => setDone(false), 4000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-[24px] font-bold tracking-tightest text-slate-900">Channel Partner Portal</h1>
          <span className="rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/50">
            Partner Desk
          </span>
        </div>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {me?.firm ?? 'Skyline Realty Consultants'} · {me?.name ?? 'Rajesh Kumar'} · {me?.city ?? 'Bengaluru'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Contracted Commission"
          value={`${me?.commission_pct ?? 2}%`}
          icon={<Percent className="h-6 w-6" />}
        />
        <KpiCard
          label="Attributed Leads"
          value={String(myLeads.length)}
          tone="blue"
          sub={`${myLeads.filter((l) => l.status === 'Booked').length} successfully converted`}
          icon={<Handshake className="h-6 w-6" />}
        />
        <KpiCard
          label="Earned Commission"
          value={inrCompact(commissionEarned)}
          tone="emerald"
          sub={`${myBookings.length} confirmed booking deal(s)`}
          icon={<TrendingUp className="h-6 w-6" />}
        />
      </div>

      {/* Register Client Card */}
      <Card className="border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/20 to-blue-50/30">
        <div className="px-6 py-5">
          <SectionTitle right={<UserPlus className="h-4 w-4 text-indigo-500" />}>
            Direct Client Registration
          </SectionTitle>
          <p className="mb-4 text-xs font-medium text-slate-500">
            Client source is locked to <span className="font-bold text-amber-700">Channel Partner</span> and attributed permanently to your firm.
          </p>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <Field label="Client full name">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
                placeholder="Full name"
              />
            </Field>
            <Field label="Phone number">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputCls}
                placeholder="+91…"
              />
            </Field>
            <Field label="Email address (optional)">
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
                placeholder="client@email.com"
              />
            </Field>
            <Field label="Project of interest">
              <select
                value={form.project_id}
                onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                className={inputCls}
              >
                <option value="">— Select project —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Configuration preference">
              <input
                value={form.config}
                onChange={(e) => setForm({ ...form, config: e.target.value })}
                className={inputCls}
                placeholder="3 BHK / 4 BHK Villa"
              />
            </Field>
            <Field label="Maximum budget (₹)">
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className={inputCls}
                placeholder="e.g. 18000000"
              />
            </Field>
          </div>
          <div className="mt-4.5 flex items-center gap-4">
            <button
              onClick={submit}
              disabled={busy || !form.name || !form.phone}
              className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-glow-indigo hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all"
            >
              {busy ? 'Registering…' : 'Submit & Attribute Client'}
            </button>
            {done && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-4 w-4" /> Client registered & attributed to {me?.firm}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Available Inventory Grid */}
      <div>
        <SectionTitle>Real-Time Available Inventory</SectionTitle>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {availableByProject.map(({ project, units: au }) => (
            <Card key={project.id} className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">{project.name}</p>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                  {au.length} available
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400 font-medium">
                {project.locality}, {project.city} · Possession {fmtDate(project.possession_date)}
              </p>
              <ul className="mt-3.5 space-y-1.5 max-h-56 overflow-y-auto">
                {au.slice(0, 8).map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3 py-2 text-xs font-medium border border-slate-100"
                  >
                    <span className="font-bold text-slate-800">{u.unit_no}</span>
                    <span className="text-slate-500">{u.config}</span>
                    <span className="tabular-nums font-bold text-slate-800">{inrCompact(u.price)}</span>
                  </li>
                ))}
                {au.length > 8 && (
                  <li className="px-3 py-1 text-center text-xs font-medium text-slate-400">
                    +{au.length - 8} more units in inventory
                  </li>
                )}
                {au.length === 0 && (
                  <li className="px-3 py-3 text-center text-xs text-slate-400 font-medium">
                    Fully booked for now. Contact sales desk for new tower release.
                  </li>
                )}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* Referred Bookings */}
      <Card>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <SectionTitle>My Firm's Referred Bookings</SectionTitle>
          <span className="text-xs font-semibold text-slate-400">Total: {myBookings.length} deals</span>
        </div>
        {myBookings.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm font-medium text-slate-400">No bookings from your referrals yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400 bg-slate-50/40">
                  <th className="px-6 py-3 font-semibold">Buyer Name</th>
                  <th className="px-6 py-3 font-semibold">Unit</th>
                  <th className="px-6 py-3 font-semibold">Agreement Value</th>
                  <th className="px-6 py-3 font-semibold">Attributed Commission</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Booked Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {myBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{b.buyer_name}</td>
                    <td className="px-6 py-3.5 font-bold text-indigo-700">{unitById(units, b.unit_id)?.unit_no ?? '—'}</td>
                    <td className="px-6 py-3.5 tabular-nums font-semibold text-slate-800">{inr(b.agreement_value)}</td>
                    <td className="px-6 py-3.5 tabular-nums font-bold text-emerald-600">
                      {inrCompact(b.agreement_value * ((me?.commission_pct ?? 2) / 100))}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 font-medium">{fmtDate(b.booking_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
