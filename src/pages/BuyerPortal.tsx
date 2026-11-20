import { Home, FileText, Receipt, FolderOpen, CheckCircle2, Circle, Sparkles, Download } from 'lucide-react';
import { useStore, unitById } from '@/lib/store';
import { Card, StatusBadge, SectionTitle, EmptyState } from '@/components/ui';
import { inr, inrCompact, fmtDate } from '@/lib/format';

const BUYER_BOOKING_ID = 'b0000000-0000-4000-8000-000000000003';

const progressStages = ['Foundation & Plinth', 'Structural Superstructure', 'Internal Masonry', 'Finishing & MEP', 'Handover Clearance'];

export function BuyerPortal() {
  const { bookings, units, projects, schedules, payments, letters, tasks } = useStore();
  const booking = bookings.find((b) => b.id === BUYER_BOOKING_ID);

  if (!booking) return <EmptyState message="No active booking found for the demo buyer." />;

  const unit = unitById(units, booking.unit_id);
  const project = projects.find((p) => p.id === unit?.project_id);
  const slabs = schedules.filter((s) => s.booking_id === booking.id).sort((a, b) => a.seq - b.seq);
  const myPayments = payments.filter((p) => p.booking_id === booking.id);
  const myLetters = letters.filter((l) => l.booking_id === booking.id);
  const myTasks = tasks.filter((t) => t.booking_id === booking.id);
  const received = slabs.reduce((a, s) => a + s.paid_amount, 0);
  const balance = booking.agreement_value - received;

  // Map paid slabs to construction progress
  const paidPct = received / booking.agreement_value;
  const stageIdx = Math.min(progressStages.length - 1, Math.floor(paidPct * progressStages.length + 0.35));

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-[24px] font-bold tracking-tightest text-slate-900">
            Welcome, {booking.buyer_name.split('&')[0].trim()}
          </h1>
          <span className="rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/50">
            Buyer Dashboard
          </span>
        </div>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Your home with {project?.name ?? 'the developer'}, at a glance
        </p>
      </div>

      {/* Hero Banner with Gradient Overlay */}
      <Card className="overflow-hidden shadow-lg border-0">
        <div className="relative flex flex-wrap items-end justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 px-8 py-8 text-white min-h-[180px]">
          {project?.image_url && (
            <>
              <img
                src={project.image_url}
                alt={project.name}
                className="absolute inset-0 h-full w-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-indigo-950/75 to-slate-950/60" />
            </>
          )}
          <div className="relative z-10">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
              <Home className="h-4 w-4" /> {project?.name} · {project?.locality}
            </p>
            <p className="mt-2 text-3xl font-extrabold tracking-tightest text-white">
              Unit {unit?.unit_no} · {unit?.config}
            </p>
            <p className="mt-1 text-sm text-slate-300 font-medium">
              {unit?.area_sqft} sq.ft · {unit?.facing} facing · Target Possession: {fmtDate(project?.possession_date)}
            </p>
          </div>
          <div className="relative z-10 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15 shadow-xl">
            <p className="text-xs font-medium text-slate-300 uppercase tracking-wider">Agreement Value</p>
            <p className="text-2xl font-bold tabular-nums text-white">{inr(booking.agreement_value)}</p>
            <p className="mt-0.5 text-xs font-semibold text-emerald-300">{booking.plan_type} plan · {booking.status}</p>
          </div>
        </div>

        {/* Milestone Stepper */}
        <div className="px-8 py-6 bg-white border-t border-slate-100">
          <SectionTitle>Site Construction & Milestone Progress</SectionTitle>
          <ol className="mt-4 flex items-center justify-between">
            {progressStages.map((s, i) => (
              <li key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center text-center">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-sm transition-all ${
                      i <= stageIdx
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-glow-emerald'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {i < stageIdx ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </span>
                  <span
                    className={`mt-2 hidden text-[11px] font-bold sm:block ${
                      i <= stageIdx ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {s}
                  </span>
                </div>
                {i < progressStages.length - 1 && (
                  <div
                    className={`mx-3 h-1 flex-1 rounded-full ${
                      i < stageIdx ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-slate-100'
                    }`}
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </Card>

      {/* Payment Ledger & Vault */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <SectionTitle>Payment Ledger & Slabs</SectionTitle>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
              {inrCompact(received)} Paid
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400 bg-slate-50/50">
                <th className="px-6 py-3 font-semibold">Milestone</th>
                <th className="px-6 py-3 font-semibold">Due Date</th>
                <th className="px-6 py-3 font-semibold text-right">Amount</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {slabs.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-3 font-bold text-slate-800">{s.milestone}</td>
                  <td className="px-6 py-3 text-xs font-medium text-slate-500">{fmtDate(s.due_date)}</td>
                  <td className="px-6 py-3 text-right tabular-nums font-semibold text-slate-800">{inr(s.amount)}</td>
                  <td className="px-6 py-3">
                    <StatusBadge
                      status={s.status === 'Pending' && new Date(s.due_date) < new Date() ? 'Overdue' : s.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50/80">
                <td className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500" colSpan={2}>
                  Total Balance Payable
                </td>
                <td className="px-6 py-3 text-right font-extrabold tabular-nums text-amber-600" colSpan={2}>
                  {inr(balance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </Card>

        {/* Right side documents */}
        <div className="space-y-6">
          {/* Demand Notices */}
          <Card>
            <div className="px-6 py-5 border-b border-slate-100">
              <SectionTitle right={<FileText className="h-4 w-4 text-indigo-500" />}>Demand Notices</SectionTitle>
            </div>
            {myLetters.length === 0 ? (
              <EmptyState message="No outstanding demand notices." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {myLetters.map((l) => (
                  <li key={l.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{l.letter_no}</p>
                      <p className="text-xs text-slate-400 font-medium">
                        Due {fmtDate(l.due_date)}
                        {l.interest > 0 && ` · Interest ${inrCompact(l.interest)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold tabular-nums text-rose-600">{inr(l.total_due)}</span>
                      <button className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50/50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors">
                        <Download className="h-3 w-3" /> PDF
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Payment Receipts */}
          <Card>
            <div className="px-6 py-5 border-b border-slate-100">
              <SectionTitle right={<Receipt className="h-4 w-4 text-emerald-500" />}>Official Receipts</SectionTitle>
            </div>
            {myPayments.length === 0 ? (
              <EmptyState message="No payment receipts on file." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {myPayments.slice(0, 6).map((p) => (
                  <li key={p.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{p.receipt_no}</p>
                      <p className="text-xs text-slate-400 font-medium">
                        {p.mode} · Paid on {fmtDate(p.paid_on)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold tabular-nums text-emerald-600">{inr(p.amount)}</span>
                      <button className="rounded-xl border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                        Receipt
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Document Vault */}
          <Card>
            <div className="px-6 py-5 border-b border-slate-100">
              <SectionTitle right={<FolderOpen className="h-4 w-4 text-indigo-500" />}>
                Legal & Document Vault
              </SectionTitle>
            </div>
            <ul className="divide-y divide-slate-100">
              <li className="flex items-center justify-between px-6 py-3.5 text-sm font-semibold">
                <span className="text-slate-800">Allotment Letter</span>
                <StatusBadge
                  status={myTasks.find((t) => t.title.includes('Allotment'))?.done ? 'Completed' : 'Pending'}
                />
              </li>
              <li className="flex items-center justify-between px-6 py-3.5 text-sm font-semibold">
                <span className="text-slate-800">Agreement to Sale</span>
                <StatusBadge
                  status={myTasks.find((t) => t.title.includes('Agreement'))?.done ? 'Completed' : 'Pending'}
                />
              </li>
              <li className="flex items-center justify-between px-6 py-3.5 text-sm font-semibold">
                <span className="text-slate-800">Bank Loan Sanction</span>
                <StatusBadge status={myTasks.find((t) => t.title.includes('loan'))?.done ? 'Completed' : 'Pending'} />
              </li>
              <li className="flex items-center justify-between px-6 py-3.5 text-sm font-semibold">
                <span className="text-slate-800">Registration Certificate</span>
                <StatusBadge status={booking.registration_no ? 'Completed' : 'Pending'} />
              </li>
            </ul>
          </Card>

          {/* Handover Checklist */}
          <Card>
            <div className="px-6 py-5 border-b border-slate-100">
              <SectionTitle>Handover Checklist</SectionTitle>
            </div>
            <ul className="space-y-2.5 px-6 pb-5">
              {myTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2.5 text-sm">
                  {t.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                  )}
                  <span className={`font-medium ${t.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {t.title}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
