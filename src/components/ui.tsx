import type { ReactNode } from 'react';
import { X, Sparkles } from 'lucide-react';

const statusStyles: Record<string, string> = {
  Available: 'bg-emerald-500/10 text-emerald-700 ring-emerald-600/25 border-emerald-500/20',
  Blocked: 'bg-amber-500/10 text-amber-700 ring-amber-600/25 border-amber-500/20',
  Booked: 'bg-blue-500/10 text-blue-700 ring-blue-600/25 border-blue-500/20',
  Sold: 'bg-slate-500/10 text-slate-600 ring-slate-500/20 border-slate-400/20',
  Paid: 'bg-emerald-500/10 text-emerald-700 ring-emerald-600/25 border-emerald-500/20',
  'Due Soon': 'bg-amber-500/10 text-amber-700 ring-amber-600/25 border-amber-500/20',
  Overdue: 'bg-rose-500/10 text-rose-700 ring-rose-600/25 border-rose-500/20',
  'Part-Paid': 'bg-sky-500/10 text-sky-700 ring-sky-600/25 border-sky-500/20',
  Pending: 'bg-slate-500/10 text-slate-600 ring-slate-500/20 border-slate-400/20',
  Approved: 'bg-emerald-500/10 text-emerald-700 ring-emerald-600/25 border-emerald-500/20',
  Rejected: 'bg-rose-500/10 text-rose-700 ring-rose-600/25 border-rose-500/20',
  Confirmed: 'bg-indigo-500/10 text-indigo-700 ring-indigo-600/25 border-indigo-500/20',
  Registered: 'bg-violet-500/10 text-violet-700 ring-violet-600/25 border-violet-500/20',
  Scheduled: 'bg-blue-500/10 text-blue-700 ring-blue-600/25 border-blue-500/20',
  Completed: 'bg-emerald-500/10 text-emerald-700 ring-emerald-600/25 border-emerald-500/20',
  'No Show': 'bg-rose-500/10 text-rose-700 ring-rose-600/25 border-rose-500/20',
  New: 'bg-teal-500/10 text-teal-700 ring-teal-600/25 border-teal-500/20',
  Contacted: 'bg-sky-500/10 text-sky-700 ring-sky-600/25 border-sky-500/20',
  'Site Visit Scheduled': 'bg-blue-500/10 text-blue-700 ring-blue-600/25 border-blue-500/20',
  'Site Visit Done': 'bg-indigo-500/10 text-indigo-700 ring-indigo-600/25 border-indigo-500/20',
  Negotiation: 'bg-amber-500/10 text-amber-700 ring-amber-600/25 border-amber-500/20',
  Dropped: 'bg-slate-500/10 text-slate-500 ring-slate-500/20 border-slate-400/20',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = statusStyles[status] ?? 'bg-slate-500/10 text-slate-600 ring-slate-500/20 border-slate-400/20';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-tight ring-1 ring-inset ${cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function Card({
  children,
  className = '',
  gradientBorder = false,
}: {
  children: ReactNode;
  className?: string;
  gradientBorder?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-card-lux backdrop-blur-sm card-gradient-hover ${
        gradientBorder ? 'before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-blue-600 before:via-indigo-500 before:to-violet-500' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  tone = 'default',
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'default' | 'emerald' | 'amber' | 'blue' | 'red';
  icon?: ReactNode;
}) {
  const toneThemes = {
    default: {
      text: 'text-slate-900',
      badgeBg: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border-slate-300/60',
      topLine: 'from-slate-400 to-slate-600',
    },
    emerald: {
      text: 'text-emerald-600',
      badgeBg: 'bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-700 border-emerald-300/60',
      topLine: 'from-emerald-400 to-teal-500',
    },
    amber: {
      text: 'text-amber-600',
      badgeBg: 'bg-gradient-to-br from-amber-50 to-orange-100 text-amber-700 border-amber-300/60',
      topLine: 'from-amber-400 to-orange-500',
    },
    blue: {
      text: 'text-blue-600',
      badgeBg: 'bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 border-blue-300/60',
      topLine: 'from-blue-500 to-indigo-600',
    },
    red: {
      text: 'text-rose-600',
      badgeBg: 'bg-gradient-to-br from-rose-50 to-red-100 text-rose-700 border-rose-300/60',
      topLine: 'from-rose-400 to-red-500',
    },
  };

  const currentTheme = toneThemes[tone];

  return (
    <Card className="group relative p-5">
      <div
        className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${currentTheme.topLine} opacity-80 group-hover:opacity-100 transition-opacity`}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
          <p className={`mt-2 text-[28px] font-bold tabular-nums leading-none tracking-tightest ${currentTheme.text}`}>
            {value}
          </p>
          {sub && <p className="mt-2 text-xs font-medium text-slate-500">{sub}</p>}
        </div>
        {icon && (
          <div
            className={`rounded-xl border p-2.5 shadow-sm transition-transform duration-200 group-hover:scale-105 ${currentTheme.badgeBg}`}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[4px] transition-opacity" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-xl animate-[slideIn_.28s_cubic-bezier(.21,1.02,.73,1)_both] flex-col border-l border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-md">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600" />
        <header className="flex items-start justify-between border-b border-slate-100 px-7 pb-5 pt-6">
          <div>
            <h2 className="text-lg font-bold tracking-tightest text-slate-900">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-7 py-6">{children}</div>
      </aside>
      <style>{`@keyframes slideIn { from { transform: translateX(48px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }`}</style>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm tracking-tight text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all';

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />
        <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-600">{children}</h3>
      </div>
      {right}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 shadow-inner">
        <Sparkles className="h-6 w-6 text-slate-400" />
      </div>
      <p className="mt-3 text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}
