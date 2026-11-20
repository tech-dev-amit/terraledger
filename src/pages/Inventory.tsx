import { useMemo, useState } from 'react';
import { MapPin, Ruler, Compass, IndianRupee, Lock, FileSignature, Clock, Building, Sparkles, Plus, Share2, FileText, CheckCircle2 } from 'lucide-react';
import { useStore, cpFirmById } from '@/lib/store';
import type { Unit } from '@/lib/types';
import { Card, Drawer, Field, StatusBadge, inputCls, SectionTitle, EmptyState } from '@/components/ui';
import { inr, inrCompact, fmtDate, fmtDateTime } from '@/lib/format';

const statusCell: Record<string, string> = {
  Available: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-900 font-medium',
  Blocked: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-900 font-medium',
  Booked: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-900 font-medium',
  Sold: 'bg-slate-500/10 hover:bg-slate-500/15 border-slate-300 text-slate-500',
};

export function Inventory({
  onNavigate,
}: {
  onNavigate?: (page: string, projectId?: string) => void;
}) {
  const { projects, towers, units, bookings, schedules, partners, role, blockUnit, createBooking, loading } = useStore();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [towerFilter, setTowerFilter] = useState<string | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const [selected, setSelected] = useState<Unit | null>(null);
  const [mode, setMode] = useState<'view' | 'block' | 'book'>('view');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeProject = projectId ?? projects[0]?.id ?? null;
  const activeProjectData = projects.find((p) => p.id === activeProject);
  const projectTowers = towers.filter((t) => t.project_id === activeProject);

  const visibleUnits = useMemo(
    () =>
      units.filter(
        (u) =>
          u.project_id === activeProject &&
          (towerFilter === 'all' || u.tower_id === towerFilter) &&
          (statusFilter === 'all' || u.status === statusFilter),
      ),
    [units, activeProject, towerFilter, statusFilter],
  );

  const floors = useMemo(
    () => Array.from(new Set(visibleUnits.map((u) => u.floor))).sort((a, b) => b - a),
    [visibleUnits],
  );

  const booking = selected ? bookings.find((b) => b.unit_id === selected.id) : undefined;
  const canTransact = selected?.status === 'Available' || selected?.status === 'Blocked';
  const isBuyerFacing = role === 'cp';

  const [blockDays, setBlockDays] = useState(5);
  const [blockApproval, setBlockApproval] = useState(true);
  const [blockReason, setBlockReason] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [planType, setPlanType] = useState<'CLP' | 'TLP'>('CLP');
  const [cpId, setCpId] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function runBlock() {
    if (!selected) return;
    setBusy(true);
    setActionError(null);
    try {
      await blockUnit(selected.id, blockDays, blockApproval, blockReason);
      setMode('view');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to block unit');
    } finally {
      setBusy(false);
    }
  }

  async function runBooking() {
    if (!selected) return;
    setBusy(true);
    setActionError(null);
    try {
      await createBooking(selected.id, {
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        buyer_email: buyerEmail || undefined,
        plan_type: planType,
        cp_id: cpId || null,
      });
      setMode('view');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to create booking');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <EmptyState message="Loading inventory matrix…" />;

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-bold tracking-tightest text-slate-900">Projects & Live Inventory</h1>
            <span className="rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/50">
              Interactive Grid
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Real-time stacking matrix · click any unit to inspect, place hold, or book
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {role === 'admin' && onNavigate && (
            <button
              onClick={() => onNavigate('add-project')}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-glow-indigo hover:opacity-95 transition-all"
            >
              <Plus className="h-4 w-4" /> Add Project
            </button>
          )}

          <select
            value={activeProject ?? ''}
            onChange={(e) => {
              setProjectId(e.target.value);
              setTowerFilter('all');
            }}
            className={`${inputCls} w-52 font-medium`}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.property_type}
              </option>
            ))}
          </select>

          <select
            value={towerFilter}
            onChange={(e) => setTowerFilter(e.target.value)}
            className={`${inputCls} w-36 font-medium`}
          >
            <option value="all">All Towers</option>
            {projectTowers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${inputCls} w-36 font-medium`}
          >
            <option value="all">All Statuses</option>
            {['Available', 'Blocked', 'Booked', 'Sold'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 bg-white/60 backdrop-blur p-2.5 rounded-xl border border-slate-200/60 shadow-sm">
        {[
          ['Available', 'bg-emerald-500'],
          ['Blocked (Hold)', 'bg-amber-400'],
          ['Booked (Escrow)', 'bg-blue-500'],
          ['Sold & Registered', 'bg-slate-400'],
        ].map(([l, c]) => (
          <span key={l} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${c} shadow-sm`} /> {l}
          </span>
        ))}
      </div>

      {/* Project Hero Banner */}
      {activeProjectData && (
        <Card className="relative overflow-hidden group">
          <div className="relative h-56 w-full sm:h-64">
            {activeProjectData.image_url && (
              <img
                src={activeProjectData.image_url}
                alt={activeProjectData.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 flex flex-wrap items-end justify-between gap-4 p-6">
              <div className="text-white">
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                  {activeProjectData.property_type} · {activeProjectData.status}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tightest">{activeProjectData.name}</h2>
                <p className="mt-0.5 text-sm text-slate-200">
                  {activeProjectData.locality}, {activeProjectData.city}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/20 border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur shadow-sm">
                  {visibleUnits.filter((u) => u.status === 'Available').length} units available
                </span>
                <span className="rounded-full bg-white/20 border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur shadow-sm">
                  Possession: {fmtDate(activeProjectData.possession_date)}
                </span>

                {onNavigate && (
                  <button
                    onClick={() => onNavigate('project-view', activeProjectData.share_slug || activeProjectData.id)}
                    className="flex items-center gap-1.5 rounded-full bg-indigo-600/90 hover:bg-indigo-600 border border-indigo-400 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur shadow-md transition-all active:scale-95"
                  >
                    <FileText className="h-3.5 w-3.5" /> View Catalogue
                  </button>
                )}

                <button
                  onClick={() => {
                    const url = `${window.location.origin}/?page=project-view&id=${activeProjectData.share_slug || activeProjectData.id}`;
                    navigator.clipboard.writeText(url);
                    setCopiedId(activeProjectData.id);
                    setTimeout(() => setCopiedId(null), 2500);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur shadow-sm transition-all active:scale-95"
                >
                  {copiedId === activeProjectData.id ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Copied Link!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Floor by floor unit matrix */}
      {floors.map((floor) => (
        <Card key={floor} className="p-5">
          <div className="mb-3.5 flex items-center justify-between border-b border-slate-100 pb-2">
            <p className="text-sm font-bold text-slate-800">
              {activeProject &&
              towers.find((t) => t.id === visibleUnits.find((u) => u.floor === floor)?.tower_id)?.name === 'Villa Block'
                ? 'Villa Row'
                : `Floor Level ${floor}`}
            </p>
            <span className="text-xs font-medium text-slate-400">
              {visibleUnits.filter((u) => u.floor === floor).length} units
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
            {visibleUnits
              .filter((u) => u.floor === floor)
              .sort((a, b) => a.unit_no.localeCompare(b.unit_no))
              .map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelected(u);
                    setMode('view');
                  }}
                  className={`rounded-xl border p-3.5 text-left transition-all hover:scale-[1.02] hover:shadow-md active:scale-[.98] ${statusCell[u.status]}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{u.unit_no}</span>
                    <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                  </div>
                  <p className="mt-1 truncate text-xs opacity-85 font-medium">{u.config}</p>
                  <p className="text-xs font-bold tabular-nums opacity-95">{inrCompact(u.price)}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider opacity-75">{u.status}</p>
                </button>
              ))}
          </div>
        </Card>
      ))}

      {/* Drawer */}
      <Drawer
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setMode('view');
          setActionError(null);
        }}
        title={selected ? `Unit ${selected.unit_no}` : ''}
        subtitle={selected ? `${projects.find((p) => p.id === selected.project_id)?.name ?? ''} · ${selected.status}` : ''}
      >
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 font-medium text-slate-700">
                <Ruler className="h-4 w-4 text-indigo-500" /> {selected.area_sqft} sq.ft
              </div>
              <div className="flex items-center gap-2 font-medium text-slate-700">
                <MapPin className="h-4 w-4 text-indigo-500" /> Floor {selected.floor}
              </div>
              <div className="flex items-center gap-2 font-medium text-slate-700">
                <Compass className="h-4 w-4 text-indigo-500" /> {selected.facing} facing
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <IndianRupee className="h-4 w-4 text-emerald-600" /> <span className="tabular-nums">{inr(selected.price)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={selected.status} />
              {selected.status === 'Blocked' && selected.blocked_until && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Clock className="h-3.5 w-3.5" /> Hold active until {fmtDateTime(selected.blocked_until)}
                </span>
              )}
            </div>

            {booking && (
              <Card className="bg-slate-50/80 p-4 border border-slate-200">
                <SectionTitle>Buyer & Financial Summary</SectionTitle>
                <p className="text-sm font-bold text-slate-900">{booking.buyer_name}</p>
                <p className="text-xs text-slate-500 font-medium">
                  {booking.buyer_phone} · {cpFirmById(partners, booking.cp_id) !== '—' ? `CP: ${cpFirmById(partners, booking.cp_id)}` : 'Direct Channel'}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center rounded-xl bg-white p-2.5 border border-slate-200/80">
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 uppercase">Agreement</p>
                    <p className="text-sm font-bold tabular-nums text-slate-900">{inrCompact(booking.agreement_value)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 uppercase">Received</p>
                    <p className="text-sm font-bold tabular-nums text-emerald-600">
                      {inrCompact(schedules.filter((s) => s.booking_id === booking.id).reduce((a, s) => a + s.paid_amount, 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 uppercase">Balance</p>
                    <p className="text-sm font-bold tabular-nums text-amber-600">
                      {inrCompact(booking.agreement_value - schedules.filter((s) => s.booking_id === booking.id).reduce((a, s) => a + s.paid_amount, 0))}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {actionError && (
              <p className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-sm font-medium text-rose-700">
                {actionError}
              </p>
            )}

            {canTransact && mode === 'view' && !isBuyerFacing && (
              <div className="flex gap-3">
                <button
                  onClick={() => setMode('block')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-sm hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all"
                >
                  <Lock className="h-4 w-4" /> Block Unit (Hold)
                </button>
                <button
                  onClick={() => setMode('book')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-glow-indigo hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 active:scale-[0.98] transition-all"
                >
                  <FileSignature className="h-4 w-4" /> Create Booking
                </button>
              </div>
            )}

            {mode === 'block' && (
              <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
                <SectionTitle>Block Unit — Hold Reservation</SectionTitle>
                <Field label="Hold duration (days)">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={blockDays}
                    onChange={(e) => setBlockDays(Number(e.target.value))}
                    className={inputCls}
                  />
                </Field>
                <Field label="Reason for hold">
                  <input
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="e.g. Client travelling; asked for 5 days hold"
                    className={inputCls}
                  />
                </Field>
                <label className="flex items-start gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={blockApproval}
                    onChange={(e) => setBlockApproval(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  Requires manager sign-off (hold extensions submitted to approval desk)
                </label>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={runBlock}
                    disabled={busy}
                    className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all"
                  >
                    {busy ? 'Saving…' : 'Confirm Block'}
                  </button>
                  <button
                    onClick={() => setMode('view')}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {mode === 'book' && (
              <div className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
                <SectionTitle>Create New Booking</SectionTitle>
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <Field label="Buyer full name">
                    <input
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Rahul Sharma"
                    />
                  </Field>
                  <Field label="Phone number">
                    <input
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className={inputCls}
                      placeholder="+91…"
                    />
                  </Field>
                  <Field label="Email address (optional)">
                    <input
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className={inputCls}
                      placeholder="buyer@email.com"
                    />
                  </Field>
                  <Field label="Payment plan type">
                    <select
                      value={planType}
                      onChange={(e) => setPlanType(e.target.value as 'CLP' | 'TLP')}
                      className={inputCls}
                    >
                      <option value="CLP">Construction Linked (CLP)</option>
                      <option value="TLP">Time Linked (TLP)</option>
                    </select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Channel Partner referral">
                      <select value={cpId} onChange={(e) => setCpId(e.target.value)} className={inputCls}>
                        <option value="">Direct Sales (No CP)</option>
                        {partners
                          .filter((p) => p.status === 'Active')
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.firm} ({p.name})
                            </option>
                          ))}
                      </select>
                    </Field>
                  </div>
                </div>
                <div className="rounded-xl bg-white/80 p-3 border border-indigo-100 text-xs text-slate-600">
                  Unit value: <strong className="tabular-nums font-bold text-slate-900">{inr(selected.price)}</strong>.
                  Milestone schedule will be automatically generated upon confirmation.
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={runBooking}
                    disabled={busy || !buyerName || !buyerPhone}
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-glow-indigo hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all"
                  >
                    {busy ? 'Creating Booking…' : 'Confirm & Generate Schedule'}
                  </button>
                  <button
                    onClick={() => setMode('view')}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {booking && (
              <div>
                <SectionTitle>Booking Event Trail</SectionTitle>
                <ul className="space-y-2 text-xs font-medium text-slate-500">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    Booked on {fmtDate(booking.booking_date)} · {booking.plan_type} plan · {booking.status}
                  </li>
                  {booking.registration_no && (
                    <li className="flex items-center gap-2 text-indigo-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Registration no: {booking.registration_no}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
