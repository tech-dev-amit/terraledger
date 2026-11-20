import { Building2, IndianRupee, Wallet, AlertCircle, CalendarCheck, ClipboardCheck, TrendingUp, Sparkles, ArrowUpRight } from 'lucide-react';
import { useStore, projectNameById } from '@/lib/store';
import { Card, KpiCard, StatusBadge, SectionTitle, EmptyState } from '@/components/ui';
import { inr, inrCompact, fmtDate, fmtDateTime, relativeDue } from '@/lib/format';

export function Dashboard() {
  const { units, bookings, schedules, payments, siteVisits, leads, approvals, projects } = useStore();

  const totalUnits = units.length;
  const byStatus = (s: string) => units.filter((u) => u.status === s).length;
  const available = byStatus('Available');
  const blocked = byStatus('Blocked');
  const booked = byStatus('Booked');
  const sold = byStatus('Sold');

  const revenueBooked = bookings.reduce((a, b) => a + b.agreement_value, 0);
  const collected = payments.reduce((a, p) => a + p.amount, 0);
  const pending = schedules.reduce((a, s) => a + (s.amount - s.paid_amount), 0);
  const overdue = schedules.filter((s) => s.status === 'Overdue' || (s.status !== 'Paid' && new Date(s.due_date) < new Date()));

  const upcomingVisits = siteVisits
    .filter((v) => v.status === 'Scheduled')
    .sort((a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at));
  const pendingApprovals = approvals.filter((a) => a.status === 'Pending');
  const overdueFollowups = leads.filter(
    (l) => l.next_followup_at && new Date(l.next_followup_at) < new Date() && !['Booked', 'Dropped'].includes(l.status),
  );

  const collectionPct = collected + pending > 0 ? Math.round((collected / (collected + pending)) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-bold tracking-tightest text-slate-900">Portfolio Overview</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200/50">
              <Sparkles className="h-3 w-3 text-indigo-500" /> Executive Pulse
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {projects.length} development projects · {totalUnits} live units · real-time inventory and financial telemetry
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Inventory"
          value={String(totalUnits)}
          sub={`${available} available · ${blocked} on hold`}
          icon={<Building2 className="h-6 w-6" />}
        />
        <KpiCard
          label="Booked / Sold"
          value={`${booked + sold}`}
          tone="blue"
          sub={`${booked} in escrow · ${sold} registered`}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <KpiCard
          label="Total Booked Value"
          value={inrCompact(revenueBooked)}
          tone="emerald"
          sub="Agreement value, all active sales"
          icon={<IndianRupee className="h-6 w-6" />}
        />
        <KpiCard
          label="Realized vs Pending"
          value={inrCompact(collected)}
          tone="amber"
          sub={`${inrCompact(pending)} balance (${collectionPct}% realized)`}
          icon={<Wallet className="h-6 w-6" />}
        />
      </div>

      {/* Overdue Alert with Gradient Accent */}
      {overdue.length > 0 && (
        <Card className="relative border-rose-200/80 bg-gradient-to-r from-rose-50/90 via-red-50/60 to-rose-50/40 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-rose-500/15 p-2 text-rose-600 border border-rose-500/20">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-900">
                {overdue.length} payment installment{overdue.length > 1 ? 's' : ''} overdue across {new Set(overdue.map((s) => s.booking_id)).size} booking{overdue.length > 1 ? 's' : ''}
              </p>
              <p className="mt-0.5 text-xs font-medium text-rose-700">
                {inr(overdue.reduce((a, s) => a + (s.amount - s.paid_amount), 0))} outstanding receivables · 18% p.a. standard late interest actively calculated · Issue demand letters from the Bookings page.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Visual Unit Status Mix and Project Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="border-b border-slate-100 px-6 py-5">
            <SectionTitle>Live Inventory Allocation Mix</SectionTitle>
            <div className="mt-2 flex h-3.5 overflow-hidden rounded-full bg-slate-100 p-0.5 shadow-inner">
              {[
                ['Available', available, 'bg-gradient-to-r from-emerald-400 to-teal-500'],
                ['Blocked', blocked, 'bg-gradient-to-r from-amber-400 to-orange-400'],
                ['Booked', booked, 'bg-gradient-to-r from-blue-500 to-indigo-500'],
                ['Sold', sold, 'bg-gradient-to-r from-slate-400 to-slate-500'],
              ].map(([label, n, cls]) => (
                (n as number) > 0 && (
                  <div
                    key={label as string}
                    className={`${cls as string} rounded-full transition-all duration-300 first:rounded-l-full last:rounded-r-full`}
                    style={{ width: `${((n as number) / totalUnits) * 100}%` }}
                    title={`${label}: ${n}`}
                  />
                )
              ))}
            </div>
            <div className="mt-3.5 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
              {[
                ['Available', available, 'bg-emerald-500'],
                ['Blocked', blocked, 'bg-amber-400'],
                ['Booked', booked, 'bg-blue-500'],
                ['Sold', sold, 'bg-slate-400'],
              ].map(([l, n, c]) => (
                <span key={l as string} className="inline-flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${c} shadow-sm`} /> {l}: <strong className="font-bold tabular-nums text-slate-800">{n}</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {projects.map((p) => {
              const pu = units.filter((u) => u.project_id === p.id);
              const soldCount = pu.filter((u) => u.status === 'Sold' || u.status === 'Booked').length;
              const soldPct = pu.length ? Math.round((soldCount / pu.length) * 100) : 0;
              return (
                <div key={p.id} className="px-6 py-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {p.image_url && (
                      <img src={p.image_url} alt={p.name} className="h-11 w-11 shrink-0 rounded-xl object-cover shadow-sm border border-slate-200" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{p.name}</p>
                      <p className="truncate text-xs font-medium text-slate-400">{p.property_type} · {p.city}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <p className="text-2xl font-bold tabular-nums text-slate-900">{soldPct}%</p>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {soldCount}/{pu.length} absorbed
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{pu.filter((u) => u.status === 'Available').length} units available for sale</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Site Visits */}
        <Card>
          <div className="px-6 py-5 border-b border-slate-100">
            <SectionTitle right={<CalendarCheck className="h-4 w-4 text-indigo-500" />}>Upcoming Site Visits</SectionTitle>
          </div>
          {upcomingVisits.length === 0 ? (
            <EmptyState message="No scheduled site visits." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcomingVisits.slice(0, 5).map((v) => (
                <li key={v.id} className="px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{leads.find((l) => l.id === v.lead_id)?.name ?? 'Lead'}</p>
                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{relativeDue(v.scheduled_at)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {projectNameById(projects, v.project_id)} · {fmtDateTime(v.scheduled_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Second row: Approvals and Overdue Follow-ups */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="px-6 py-5 border-b border-slate-100">
            <SectionTitle right={<ClipboardCheck className="h-4 w-4 text-indigo-500" />}>Pending Manager Approvals</SectionTitle>
          </div>
          {pendingApprovals.length === 0 ? (
            <EmptyState message="All approval requests decided." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {pendingApprovals.map((a) => (
                <li key={a.id} className="px-6 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800">{a.type}</p>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{a.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="px-6 py-5 border-b border-slate-100">
            <SectionTitle right={<AlertCircle className="h-4 w-4 text-rose-500" />}>Overdue Lead Follow-Ups</SectionTitle>
          </div>
          {overdueFollowups.length === 0 ? (
            <EmptyState message="No overdue leads requiring action." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {overdueFollowups.slice(0, 5).map((l) => (
                <li key={l.id} className="px-6 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800">{l.name}</p>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{relativeDue(l.next_followup_at)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{l.interested_config ?? 'Unit'} · {projectNameById(projects, l.project_id)} · Rep: {l.assigned_to ?? 'Sales Desk'}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Recent Bookings Table */}
      <Card>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <SectionTitle>Recent Confirmed Bookings</SectionTitle>
          <span className="text-xs font-semibold text-slate-400">Total: {bookings.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400 bg-slate-50/40">
                <th className="px-6 py-3 font-semibold">Buyer Name</th>
                <th className="px-6 py-3 font-semibold">Unit</th>
                <th className="px-6 py-3 font-semibold">Agreement Value</th>
                <th className="px-6 py-3 font-semibold">Received</th>
                <th className="px-6 py-3 font-semibold">Balance</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Booking Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings.map((b) => {
                const u = units.find((x) => x.id === b.unit_id);
                const bs = schedules.filter((s) => s.booking_id === b.id);
                const rec = bs.reduce((a, s) => a + s.paid_amount, 0);
                return (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-800">{b.buyer_name}</td>
                    <td className="px-6 py-3.5 font-semibold text-indigo-700">{u?.unit_no ?? '—'}</td>
                    <td className="px-6 py-3.5 tabular-nums font-semibold text-slate-800">{inr(b.agreement_value)}</td>
                    <td className="px-6 py-3.5 tabular-nums font-semibold text-emerald-600">{inr(rec)}</td>
                    <td className="px-6 py-3.5 tabular-nums font-semibold text-amber-600">{inr(b.agreement_value - rec)}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={b.status} /></td>
                    <td className="px-6 py-3.5 text-slate-500 font-medium">{fmtDate(b.booking_date)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
