import { useMemo, useState } from 'react';
import { FileText, IndianRupee, CheckCircle2, Circle, ClipboardCheck, History, Sparkles } from 'lucide-react';
import { useStore, cpFirmById } from '@/lib/store';
import type { Booking } from '@/lib/types';
import { Card, Drawer, StatusBadge, SectionTitle, EmptyState } from '@/components/ui';
import { inr, inrCompact, fmtDate, fmtDateTime } from '@/lib/format';

export function BookingsPage() {
  const {
    bookings,
    units,
    schedules,
    payments,
    letters,
    tasks,
    partners,
    events,
    recordPayment,
    generateDemandLetter,
    toggleTask,
  } = useStore();
  const [selected, setSelected] = useState<Booking | null>(null);
  const [tab, setTab] = useState<'billing' | 'compliance'>('billing');
  const [paySlab, setPaySlab] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('NEFT');
  const [previewLetter, setPreviewLetter] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const summary = useMemo(() => {
    return bookings.map((b) => {
      const bs = schedules.filter((s) => s.booking_id === b.id).sort((a, x) => a.seq - x.seq);
      const received = bs.reduce((a, s) => a + s.paid_amount, 0);
      const due = bs.reduce((a, s) => a + (s.amount - s.paid_amount), 0);
      const overdue = bs.some((s) => s.status === 'Overdue' || (s.status !== 'Paid' && new Date(s.due_date) < new Date()));
      return { booking: b, slabs: bs, received, due, overdue, unit: units.find((u) => u.id === b.unit_id) };
    });
  }, [bookings, schedules, units]);

  const sel = summary.find((s) => s.booking.id === selected?.id);
  const selPayments = selected ? payments.filter((p) => p.booking_id === selected.id) : [];
  const selLetters = selected ? letters.filter((l) => l.booking_id === selected.id) : [];
  const selTasks = selected ? tasks.filter((t) => t.booking_id === selected.id) : [];
  const selEvents = selected ? events.filter((e) => e.booking_id === selected.id) : [];

  async function submitPayment() {
    if (!selected || !paySlab || !payAmount) return;
    setBusy(true);
    setErr(null);
    try {
      await recordPayment(selected.id, paySlab, Number(payAmount), payMode);
      setPaySlab(null);
      setPayAmount('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to record payment');
    } finally {
      setBusy(false);
    }
  }

  async function raiseDemand(scheduleId: string) {
    setErr(null);
    try {
      await generateDemandLetter(scheduleId);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to generate demand letter');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-[24px] font-bold tracking-tightest text-slate-900">Bookings & Post-Sales Lifecycle</h1>
          <span className="rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/50">
            ERP Financials
          </span>
        </div>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Payment schedules, statutory demand notices, collections and handover compliance
        </p>
      </div>

      {/* Bookings Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400 bg-slate-50/40">
                <th className="px-6 py-3 font-semibold">Buyer Name</th>
                <th className="px-6 py-3 font-semibold">Unit</th>
                <th className="px-6 py-3 font-semibold">Plan</th>
                <th className="px-6 py-3 font-semibold">Agreement Value</th>
                <th className="px-6 py-3 font-semibold">Received</th>
                <th className="px-6 py-3 font-semibold">Balance Due</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {summary.map((s) => (
                <tr key={s.booking.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5">
                    <p className="font-bold text-slate-900">{s.booking.buyer_name}</p>
                    <p className="text-xs font-medium text-slate-400">
                      {cpFirmById(partners, s.booking.cp_id) !== '—'
                        ? `CP: ${cpFirmById(partners, s.booking.cp_id)}`
                        : 'Direct Sale'}
                    </p>
                  </td>
                  <td className="px-6 py-3.5 font-bold text-indigo-700">{s.unit?.unit_no ?? '—'}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        s.booking.plan_type === 'CLP'
                          ? 'bg-blue-500/10 text-blue-700 border border-blue-200'
                          : 'bg-teal-500/10 text-teal-700 border border-teal-200'
                      }`}
                    >
                      {s.booking.plan_type}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 tabular-nums font-semibold text-slate-800">{inr(s.booking.agreement_value)}</td>
                  <td className="px-6 py-3.5 tabular-nums font-semibold text-emerald-600">{inr(s.received)}</td>
                  <td className="px-6 py-3.5 tabular-nums">
                    <span className={`font-semibold ${s.overdue ? 'text-rose-600' : 'text-amber-600'}`}>
                      {inr(s.due)}
                    </span>
                    {s.overdue && (
                      <span className="ml-2 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold text-rose-600 border border-rose-200">
                        OVERDUE
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={s.booking.status} />
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelected(s.booking);
                        setTab('billing');
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 shadow-sm transition-all"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Booking Drawer */}
      <Drawer
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setPaySlab(null);
          setPreviewLetter(null);
          setErr(null);
        }}
        title={selected?.buyer_name ?? ''}
        subtitle={
          sel
            ? `Unit ${sel.unit?.unit_no} · ${selected?.plan_type} plan · Agreement: ${inrCompact(
                selected?.agreement_value ?? 0,
              )}`
            : ''
        }
      >
        {sel && selected && (
          <div className="space-y-6">
            <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1.5">
              {(['billing', 'compliance'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold capitalize transition-all ${
                    tab === t
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t === 'billing' ? 'Billing & Slabs' : 'Compliance & Handover'}
                </button>
              ))}
            </div>

            {err && (
              <p className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-sm font-medium text-rose-700">
                {err}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-center">
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase">Agreement</p>
                <p className="text-sm font-bold tabular-nums text-slate-900">{inr(selected.agreement_value)}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase">Received</p>
                <p className="text-sm font-bold tabular-nums text-emerald-600">{inr(sel.received)}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase">Balance Due</p>
                <p className={`text-sm font-bold tabular-nums ${sel.overdue ? 'text-rose-600' : 'text-amber-600'}`}>
                  {inr(sel.due)}
                </p>
              </div>
            </div>

            {tab === 'billing' && (
              <>
                <div>
                  <SectionTitle>Payment Schedule Milestones ({selected.plan_type})</SectionTitle>
                  <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50/70 text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          <th className="px-3.5 py-2.5 font-semibold">#</th>
                          <th className="px-3.5 py-2.5 font-semibold">Milestone</th>
                          <th className="px-3.5 py-2.5 font-semibold">Due Date</th>
                          <th className="px-3.5 py-2.5 font-semibold text-right">Amount</th>
                          <th className="px-3.5 py-2.5 font-semibold text-right">Paid</th>
                          <th className="px-3.5 py-2.5 font-semibold">Status</th>
                          <th className="px-3.5 py-2.5 font-semibold"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sel.slabs.map((s) => {
                          const overdue = s.status !== 'Paid' && new Date(s.due_date) < new Date();
                          return (
                            <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-3.5 py-2.5 text-slate-400 font-semibold">{s.seq}</td>
                              <td className="px-3.5 py-2.5 font-bold text-slate-800">
                                {s.milestone}
                                <span className="ml-1 text-xs font-normal text-slate-400">({s.pct}%)</span>
                              </td>
                              <td className="px-3.5 py-2.5 text-xs font-medium text-slate-500">{fmtDate(s.due_date)}</td>
                              <td className="px-3.5 py-2.5 text-right tabular-nums font-semibold text-slate-800">
                                {inr(s.amount)}
                              </td>
                              <td className="px-3.5 py-2.5 text-right tabular-nums font-semibold text-emerald-600">
                                {s.paid_amount > 0 ? inr(s.paid_amount) : '—'}
                              </td>
                              <td className="px-3.5 py-2.5">
                                <StatusBadge status={overdue && s.status === 'Pending' ? 'Overdue' : s.status} />
                              </td>
                              <td className="px-3.5 py-2.5 text-right">
                                <div className="flex justify-end gap-1.5">
                                  {s.status !== 'Paid' && (
                                    <>
                                      <button
                                        onClick={() => raiseDemand(s.id)}
                                        title="Generate statutory demand notice"
                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                      >
                                        <FileText className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setPaySlab(s.id);
                                          setPayAmount(String(s.amount - s.paid_amount));
                                        }}
                                        title="Record payment & receipt"
                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                      >
                                        <IndianRupee className="h-4 w-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {paySlab && (
                  <div className="space-y-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4.5 shadow-sm">
                    <SectionTitle>Record Payment & Issue Official Receipt</SectionTitle>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="mb-1 block text-xs font-semibold text-slate-700">Amount (₹)</span>
                        <input
                          type="number"
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-semibold text-slate-700">Payment Mode</span>
                        <select
                          value={payMode}
                          onChange={(e) => setPayMode(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none"
                        >
                          {['NEFT', 'RTGS', 'Cheque', 'UPI', 'Direct Transfer'].map((m) => (
                            <option key={m}>{m}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={submitPayment}
                        disabled={busy}
                        className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-bold text-white shadow hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all"
                      >
                        {busy ? 'Recording…' : 'Confirm & Issue Receipt'}
                      </button>
                      <button
                        onClick={() => setPaySlab(null)}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <SectionTitle>Issued Demand Letters (Statutory 18% p.a. Late Interest)</SectionTitle>
                  {selLetters.length === 0 ? (
                    <EmptyState message="No demand notices raised for this unit." />
                  ) : (
                    <ul className="space-y-2">
                      {selLetters.map((l) => (
                        <li
                          key={l.id}
                          className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 text-sm"
                        >
                          <div>
                            <p className="font-bold text-slate-800">{l.letter_no}</p>
                            <p className="text-xs text-slate-400">
                              Principal: {inr(l.amount)} · Overdue Interest: {inr(l.interest)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold tabular-nums text-rose-600">{inr(l.total_due)}</p>
                            <p className="text-[11px] text-slate-400">Issued {fmtDate(l.generated_at)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <SectionTitle>Payment Receipts History</SectionTitle>
                  {selPayments.length === 0 ? (
                    <EmptyState message="No payments recorded." />
                  ) : (
                    <ul className="space-y-2">
                      {selPayments.map((p) => (
                        <li
                          key={p.id}
                          className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 text-sm"
                        >
                          <div>
                            <p className="font-bold text-slate-800">{p.receipt_no}</p>
                            <p className="text-xs text-slate-400">
                              {p.mode} · {p.notes} · {fmtDate(p.paid_on)}
                            </p>
                          </div>
                          <p className="font-bold tabular-nums text-emerald-600">{inr(p.amount)}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {tab === 'compliance' && (
              <div className="space-y-4">
                <SectionTitle>Handover & RERA Compliance Tasks</SectionTitle>
                <div className="space-y-2.5">
                  {selTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => toggleTask(t.id, !t.done)}
                      className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 transition-all hover:border-indigo-300 hover:shadow-sm"
                    >
                      <button className="mt-0.5 text-slate-400 transition-colors">
                        {t.done ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-bold ${t.done ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                            {t.title}
                          </p>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            {t.category}
                          </span>
                        </div>
                        {t.note && <p className="mt-1 text-xs text-slate-400">{t.note}</p>}
                        {t.done_at && (
                          <p className="mt-1 text-[11px] font-medium text-emerald-600">
                            Completed on {fmtDate(t.done_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
