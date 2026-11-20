import { createContext, useContext } from 'react';
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

export interface StoreData {
  projects: Project[];
  towers: Tower[];
  units: Unit[];
  partners: Partner[];
  leads: Lead[];
  siteVisits: SiteVisit[];
  bookings: Booking[];
  schedules: PaymentSchedule[];
  payments: Payment[];
  letters: DemandLetter[];
  tasks: ComplianceTask[];
  approvals: Approval[];
  events: BookingEvent[];
}

export interface ProjectInput {
  name: string;
  property_type: string;
  city: string;
  locality: string;
  possession_date?: string | null;
  status: string;
  image_url?: string | null;
  description?: string | null;
  publish_status?: 'Draft' | 'Published';
  rera_no?: string | null;
  amenities?: string[];
  gallery_images?: string[];
  documents?: { name: string; url: string; size?: string; type?: string }[];
  geo_lat?: number | null;
  geo_lng?: number | null;
  brochure_url?: string | null;
  price_range_min?: number | null;
  price_range_max?: number | null;
  total_units?: number;
}

export interface UnitInput {
  floor: number;
  unit_no: string;
  config: string;
  area_sqft: number;
  facing: string;
  price: number;
  status?: Unit['status'];
  tower_name?: string;
}

export type Role = 'admin' | 'crm' | 'cp' | 'buyer';

export interface Store extends StoreData {
  loading: boolean;
  error: string | null;
  role: Role;
  setRole: (r: Role) => void;
  refresh: () => Promise<void>;

  addProject: (
    input: ProjectInput,
    towers?: { name: string; floors: number }[],
    units?: UnitInput[],
  ) => Promise<string>;
  updateProject: (id: string, updates: Partial<ProjectInput>) => Promise<void>;
  publishProject: (id: string) => Promise<void>;

  blockUnit: (unitId: string, days: number, needsApproval: boolean, reason: string) => Promise<void>;
  createBooking: (unitId: string, input: {
    buyer_name: string;
    buyer_phone: string;
    buyer_email?: string;
    plan_type: 'CLP' | 'TLP';
    cp_id?: string | null;
    lead_id?: string | null;
  }) => Promise<void>;
  recordPayment: (bookingId: string, scheduleId: string, amount: number, mode: string) => Promise<void>;
  generateDemandLetter: (scheduleId: string) => Promise<void>;
  toggleTask: (taskId: string, done: boolean) => Promise<void>;
  addLead: (input: {
    name: string;
    phone: string;
    email?: string;
    source: string;
    project_id: string | null;
    interested_config?: string;
    budget_max?: number | null;
    cp_id?: string | null;
    ai_notes?: string;
  }) => Promise<void>;
  updateLeadStatus: (leadId: string, status: string) => Promise<void>;
  scheduleVisit: (leadId: string, projectId: string | null, when: string) => Promise<void>;
  decideApproval: (id: string, status: 'Approved' | 'Rejected') => Promise<void>;
}

export const StoreContext = createContext<Store | null>(null);

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreContext');
  return ctx;
}

export const statusRank: Record<string, number> = {
  New: 0, Contacted: 1, 'Site Visit Scheduled': 2, 'Site Visit Done': 3,
  Negotiation: 4, Booked: 5, Dropped: 6,
};

export const cpFirmById = (partners: Partner[], id: string | null | undefined): string =>
  partners.find((p) => p.id === id)?.firm ?? '—';

export const unitById = (units: Unit[], id: string | null | undefined): Unit | undefined =>
  units.find((u) => u.id === id);

export const projectNameById = (projects: Project[], id: string | null | undefined): string =>
  projects.find((p) => p.id === id)?.name ?? '—';
