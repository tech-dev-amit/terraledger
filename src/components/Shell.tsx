import { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileSignature,
  Handshake,
  Home,
  PlusCircle,
  PanelLeftClose,
  PanelLeftOpen,
  AlertTriangle,
  ChevronDown,
  Download,
  Wifi,
  WifiOff,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Role } from '@/lib/store';
import { usePwa } from '@/lib/usePwa';

const roles: { id: Role; label: string; desc: string }[] = [
  { id: 'admin', label: 'Builder Admin / Sales', desc: 'Full portfolio, approvals & inventory control' },
  { id: 'crm', label: 'CRM & Accounts', desc: 'Collections, demand letters & compliance' },
  { id: 'cp', label: 'Channel Partner Portal', desc: 'Commission tracking & client registration' },
  { id: 'buyer', label: 'Buyer Portal', desc: 'Home milestone progress & payment ledger' },
];

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

const nav: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'crm'] },
  { id: 'inventory', label: 'Projects & Inventory', icon: Building2, roles: ['admin', 'crm', 'cp'] },
  { id: 'add-project', label: 'Add New Project', icon: PlusCircle, roles: ['admin'] },
  { id: 'leads', label: 'Leads & Visits', icon: Users, roles: ['admin', 'crm'] },
  { id: 'bookings', label: 'Bookings & Post-Sales', icon: FileSignature, roles: ['admin', 'crm'] },
  { id: 'cp', label: 'Partner Portal', icon: Handshake, roles: ['cp'] },
  { id: 'buyer', label: 'My Home', icon: Home, roles: ['buyer'] },
];

export function TerraLedgerLogo({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 p-2 shadow-glow-indigo transition-transform duration-300 hover:scale-105 ${className}`}
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-sm"
      >
        {/* Modern Geometric Architectural Towers & Ledger Monogram */}
        <path d="M6 29V14L15 9V29H6Z" fill="url(#tl-tower-left)" opacity="0.9" />
        <path d="M15 9L24 4V29H15V9Z" fill="url(#tl-tower-center)" />
        <path d="M24 16L30 20V29H24V16Z" fill="url(#tl-tower-right)" opacity="0.85" />
        {/* Precision Ledger Architectural Lines */}
        <path d="M6 23H30" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 18H24" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15 13H24" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Apex Pinnacle Pin */}
        <circle cx="24" cy="4" r="1.5" fill="#38BDF8" />
        <defs>
          <linearGradient id="tl-tower-left" x1="6" y1="9" x2="15" y2="29" gradientUnits="userSpaceOnUse">
            <stop stopColor="#93C5FD" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="tl-tower-center" x1="15" y1="4" x2="24" y2="29" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.35" stopColor="#EEF2FF" />
            <stop offset="1" stopColor="#A5B4FC" />
          </linearGradient>
          <linearGradient id="tl-tower-right" x1="24" y1="16" x2="30" y2="29" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C4B5FD" />
            <stop offset="1" stopColor="#818CF8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function Sidebar({
  page,
  setPage,
  collapsed,
  onToggle,
}: {
  page: string;
  setPage: (p: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { role, approvals, leads, error } = useStore();
  const { isInstalled, isInstallable, installApp } = usePwa();
  const items = nav.filter((n) => n.roles.includes(role));
  const pendingApprovals = approvals.filter((a) => a.status === 'Pending').length;
  const overdueFollowups = leads.filter(
    (l) => l.next_followup_at && new Date(l.next_followup_at) < new Date() && !['Booked', 'Dropped'].includes(l.status),
  ).length;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col border-r border-slate-200/90 bg-sidebar-gradient text-slate-700 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-64'
      } shrink-0 select-none shadow-sm z-40`}
    >
      {/* Brand Logo & Name */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-200/80 ${collapsed ? 'justify-center px-0' : ''}`}>
        <TerraLedgerLogo className="h-10 w-10 shrink-0" />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[16px] font-bold tracking-tightest text-gradient-brand">TerraLedger</span>
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-indigo-700 border border-indigo-200/70">
                ERP
              </span>
            </div>
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
              Builders & Developers
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="mt-3 flex-1 overflow-y-auto space-y-1 px-3">
        {items.map((n) => {
          const active = page === n.id;
          const badge =
            n.id === 'bookings' && pendingApprovals > 0
              ? pendingApprovals
              : n.id === 'leads' && overdueFollowups > 0
                ? overdueFollowups
                : null;
          return (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              title={collapsed ? n.label : undefined}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium tracking-tight transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-glow-indigo font-semibold'
                  : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'
              }`}
            >
              <n.icon
                className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                  active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                }`}
              />
              {!collapsed && <span className="flex-1 text-left">{n.label}</span>}
              {!collapsed && badge != null && (
                <span
                  className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums shadow-sm ${
                    active ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* PWA App Install Callout */}
      {!collapsed && (
        <div className="mx-3 mb-3 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/70 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">PWA Desktop / Mobile</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Install for offline access & faster app shell launch.</p>
          <button
            onClick={installApp}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 py-1.5 px-2 text-xs font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-blue-500 active:scale-[0.98] transition-all"
          >
            {isInstalled ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" /> App Installed
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" /> {isInstallable ? 'Install PWA App' : 'Add to Device'}
              </>
            )}
          </button>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="px-3 pb-4">
        <button
          onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
          {!collapsed && 'Collapse Sidebar'}
        </button>
      </div>

      {error && (
        <div
          className={`mx-3 mb-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 ${
            collapsed ? 'hidden' : ''
          }`}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
    </aside>
  );
}

export function RoleSwitcher() {
  const { role, setRole } = useStore();
  const [open, setOpen] = useState(false);
  const current = roles.find((r) => r.id === role)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-1.5 text-[13px] font-semibold tracking-tight text-slate-800 shadow-sm backdrop-blur hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-glow-indigo/10 transition-all"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-slate-500 font-medium text-xs">Role:</span>
        <span className="text-indigo-950">{current.label}</span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 animate-fade-up overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            Switch Perspective
          </div>
          {roles.map((r) => {
            const active = r.id === role;
            return (
              <button
                key={r.id}
                onMouseDown={() => {
                  setRole(r.id);
                  setOpen(false);
                }}
                className={`group flex w-full items-start justify-between rounded-xl p-2.5 text-left text-[13px] tracking-tight transition-all ${
                  active
                    ? 'bg-gradient-to-r from-indigo-50 to-blue-50 font-semibold text-indigo-950 shadow-sm border border-indigo-100'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="font-semibold">{r.label}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400 font-normal">{r.desc}</p>
                </div>
                {active && (
                  <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TopHeader() {
  const { isOnline, isInstalled, installApp } = usePwa();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/85 px-8 py-3.5 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,23,42,0.03)]">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-bold tracking-tightest text-slate-900">TerraLedger Suite</p>
            <span className="hidden sm:inline-block rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm">
              v2.0 PWA
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-400">
            Real Estate CRM, Inventory Matrix & Post-Sales ERP
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Network & PWA status pill */}
        <div
          className={`hidden md:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            isOnline
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="h-3 w-3" />
              <span>Online · PWA Synced</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span>Offline Mode Ready</span>
            </>
          )}
        </div>

        {/* Quick PWA Install pill */}
        {!isInstalled && (
          <button
            onClick={installApp}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <Download className="h-3 w-3 text-indigo-600" />
            <span>Install PWA</span>
          </button>
        )}

        <RoleSwitcher />
      </div>
    </header>
  );
}
