import { useMemo, useState } from 'react';
import { Sparkles, CalendarPlus, Phone, Flame, Plus, UserCheck } from 'lucide-react';
import { useStore, projectNameById, cpFirmById } from '@/lib/store';
import { Card, Drawer, Field, StatusBadge, inputCls, SectionTitle, EmptyState } from '@/components/ui';
import { fmtDate, fmtDateTime, inrCompact, relativeDue } from '@/lib/format';
import type { Lead } from '@/lib/types';

const sourceTone: Record<string, string> = {
  'Property Portal': 'bg-violet-500/10 text-violet-700 border-violet-200',
  'Meta/Google Ads': 'bg-sky-500/10 text-sky-700 border-sky-200',
  Website: 'bg-teal-500/10 text-teal-700 border-teal-200',
  Direct: 'bg-slate-500/10 text-slate-700 border-slate-200',
  'Channel Partner': 'bg-amber-500/10 text-amber-700 border-amber-200',
};

export function LeadsPage() {
  const { leads, siteVisits, projects, partners, updateLeadStatus, scheduleVisit, addLead } = useStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [visitWhen, setVisitWhen] = useState('');
  const [visitProject, setVisitProject] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Website',
    project_id: '',
    interested_config: '',
    budget_max: '',
    cp_id: '',
  });

  const filtered = useMemo(
    () => leads.filter((l) => statusFilter === 'all' || l.status === statusFilter),
    [leads, statusFilter],
  );

  const isOverdue = (l: Lead) =>
    l.next_followup_at && new Date(l.next_followup_at) < new Date() && !['Booked', 'Dropped'].includes(l.status);

  async function submitVisit() {
    if (!selected || !visitWhen) return;
    setBusy(true);
    try {
      await scheduleVisit(selected.id, visitProject || selected.project_id, new Date(visitWhen).toISOString());
      setSelected(null);
      setVisitWhen('');
    } finally {
      setBusy(false);
    }
  }

  async function submitNew() {
    if (!form.name || !form.phone) return;
    setBusy(true);
    try {
      await addLead({
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        source: form.source,
        project_id: form.project_id || null,
        interested_config: form.interested_config || undefined,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
        cp_id: form.cp_id || null,
      });
      setShowNew(false);
      setForm({
        name: '',
        phone: '',
        email: '',
        source: 'Website',
        project_id: '',
        interested_config: '',
        budget_max: '',
        cp_id: '',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-bold tracking-tightest text-slate-900">Leads & Follow-Up Engine</h1>
            <span className="rounded-full bg-gradient-to-r from-violet-500/10 to-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-700 border border-violet-200/50">
              AI Powered
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {leads.length} total active prospects · call summaries · automatic overdue escalation triggers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${inputCls} w-44 font-medium`}
          >
            <option value="all">All Statuses</option>
            {['New', 'Contacted', 'Site Visit Scheduled', 'Site Visit Done', 'Negotiation', 'Booked', 'Dropped'].map(
              (s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ),
            )}
          </select>
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-glow-indigo hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Main Leads Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400 bg-slate-50/40">
                <th className="px-6 py-3 font-semibold">Lead Info</th>
                <th className="px-6 py-3 font-semibold">Source</th>
                <th className="px-6 py-3 font-semibold">Interest & Project</th>
                <th className="px-6 py-3 font-semibold">Intent Score</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Next Follow-Up</th>
                <th className="px-6 py-3 font-semibold">Owner</th>
                <th className="px-6 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5">
                    <button
                      onClick={() => setSelected(l)}
                      className="text-left font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      {l.name}
                      {isOverdue(l) && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-200">
                          <Flame className="h-3 w-3" /> OVERDUE
                        </span>
                      )}
                    </button>
                    <p className="text-xs font-medium text-slate-400">{l.phone}</p>
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        sourceTone[l.source] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {l.source}
                    </span>
                    {l.cp_id && <p className="mt-0.5 text-xs font-medium text-slate-400">{cpFirmById(partners, l.cp_id)}</p>}
                  </td>
                  <td className="px-6 py-3.5 font-medium text-slate-700">
                    {l.interested_config ?? '—'}
                    <p className="text-xs font-medium text-slate-400">{projectNameById(projects, l.project_id)}</p>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100 p-0.5">
                        <div
                          className={`h-full rounded-full ${
                            l.score >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : l.score >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-slate-300'
                          }`}
                          style={{ width: `${l.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold tabular-nums text-slate-700">{l.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={l.status} />
                  </td>
                  <td
                    className={`px-6 py-3.5 text-xs font-semibold ${
                      isOverdue(l) ? 'text-rose-600' : 'text-slate-500'
                    }`}
                  >
                    {relativeDue(l.next_followup_at)}
                  </td>
                  <td className="px-6 py-3.5 text-xs font-medium text-slate-500">{l.assigned_to ?? 'Sales Desk'}</td>
                  <td className="px-6 py-3.5">
                    <button
                      onClick={() => setSelected(l)}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all"
                      title="Inspect Lead"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState message="No leads match this filter criteria." />}
        </div>
      </Card>

      {/* Site Visit Calendar */}
      <Card>
        <div className="px-6 py-5 border-b border-slate-100">
          <SectionTitle>Site Visit Calendar</SectionTitle>
        </div>
        <ul className="divide-y divide-slate-100">
          {siteVisits.slice(0, 8).map((v) => (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 hover:bg-slate-50/60 transition-colors">
              <div>
                <p className="text-sm font-bold text-slate-800">{leads.find((l) => l.id === v.lead_id)?.name ?? 'Lead'}</p>
                <p className="text-xs font-medium text-slate-400">
                  {projectNameById(projects, v.project_id)} · Rep: {v.picked_by ?? 'Unassigned'} · {fmtDateTime(v.scheduled_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {v.feedback && <p className="hidden max-w-sm truncate text-xs font-medium text-slate-500 md:block">{v.feedback}</p>}
                <StatusBadge status={v.status} />
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Lead Detail Drawer */}
      <Drawer
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setVisitWhen('');
        }}
        title={selected?.name ?? ''}
        subtitle={selected ? `${selected.source} · ${selected.status}` : ''}
      >
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3.5 text-sm font-medium text-slate-700 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              <p>
                <span className="text-slate-400 font-normal">Phone:</span> {selected.phone}
              </p>
              <p>
                <span className="text-slate-400 font-normal">Email:</span> {selected.email ?? '—'}
              </p>
              <p>
                <span className="text-slate-400 font-normal">Budget:</span>{' '}
                {selected.budget_max ? inrCompact(selected.budget_max) : '—'}
              </p>
              <p>
                <span className="text-slate-400 font-normal">Config:</span> {selected.interested_config ?? '—'}
              </p>
              <p>
                <span className="text-slate-400 font-normal">Last contact:</span> {fmtDate(selected.last_contacted_at)}
              </p>
              <p>
                <span className="text-slate-400 font-normal">Next follow-up:</span> {fmtDate(selected.next_followup_at)}
              </p>
            </div>

            <Card className="border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-violet-50/40 p-4.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <p className="text-sm font-bold text-indigo-950">AI Call & Client Summary</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-indigo-900 font-medium">
                {selected.ai_notes ?? 'No automated summary logged yet.'}
              </p>
            </Card>

            <div>
              <SectionTitle>Move Pipeline Stage</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {['Contacted', 'Site Visit Done', 'Negotiation', 'Booked', 'Dropped'].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateLeadStatus(selected.id, s)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      selected.status === s
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4.5">
              <div className="flex items-center gap-2">
                <CalendarPlus className="h-4 w-4 text-indigo-600" />
                <p className="text-sm font-bold text-indigo-950">Schedule Site Visit</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Date & time">
                  <input
                    type="datetime-local"
                    value={visitWhen}
                    onChange={(e) => setVisitWhen(e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Project location">
                  <select
                    value={visitProject}
                    onChange={(e) => setVisitProject(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Use lead's preferred project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <button
                onClick={submitVisit}
                disabled={busy || !visitWhen}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
              >
                {busy ? 'Scheduling…' : 'Confirm Site Visit'}
              </button>
            </div>

            <div>
              <SectionTitle>Logged Visits</SectionTitle>
              {siteVisits.filter((v) => v.lead_id === selected.id).length === 0 ? (
                <EmptyState message="No site visits on record." />
              ) : (
                <ul className="space-y-2">
                  {siteVisits
                    .filter((v) => v.lead_id === selected.id)
                    .map((v) => (
                      <li
                        key={v.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 text-sm font-medium"
                      >
                        <span className="text-slate-700">{fmtDateTime(v.scheduled_at)}</span>
                        <StatusBadge status={v.status} />
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Add New Lead Drawer */}
      <Drawer
        open={showNew}
        onClose={() => setShowNew(false)}
        title="Register New Lead"
        subtitle="Source attribution is locked upon creation"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Prospect full name">
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
                placeholder="name@email.com"
              />
            </Field>
            <Field label="Marketing source">
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className={inputCls}
              >
                {Object.keys(sourceTone).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Interested project">
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
                value={form.interested_config}
                onChange={(e) => setForm({ ...form, interested_config: e.target.value })}
                className={inputCls}
                placeholder="e.g. 3 BHK / 4 BHK Villa"
              />
            </Field>
            <Field label="Maximum budget (₹)">
              <input
                type="number"
                value={form.budget_max}
                onChange={(e) => setForm({ ...form, budget_max: e.target.value })}
                className={inputCls}
                placeholder="e.g. 15000000"
              />
            </Field>
            <Field label="Channel partner referral">
              <select
                value={form.cp_id}
                onChange={(e) => setForm({ ...form, cp_id: e.target.value })}
                className={inputCls}
              >
                <option value="">Direct registration</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firm}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <button
            onClick={submitNew}
            disabled={busy || !form.name || !form.phone}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-glow-indigo hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all"
          >
            {busy ? 'Saving Lead…' : 'Register Lead & Trigger AI Profile'}
          </button>
        </div>
      </Drawer>
    </div>
  );
}
