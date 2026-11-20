export type UnitStatus = 'Available' | 'Blocked' | 'Booked' | 'Sold';

export interface ProjectDocument {
  name: string;
  url: string;
  size?: string;
  type?: string;
}

export interface Project {
  id: string;
  name: string;
  property_type: string;
  city: string;
  locality: string;
  possession_date: string | null;
  status: string;
  image_url: string | null;
  description?: string | null;
  publish_status?: 'Draft' | 'Published';
  rera_no?: string | null;
  amenities?: string[];
  gallery_images?: string[];
  documents?: ProjectDocument[];
  geo_lat?: number | null;
  geo_lng?: number | null;
  brochure_url?: string | null;
  share_slug?: string | null;
  price_range_min?: number | null;
  price_range_max?: number | null;
  total_units?: number;
}

export interface Tower {
  id: string;
  project_id: string;
  name: string;
  floors: number;
}

export interface Unit {
  id: string;
  project_id: string;
  tower_id: string | null;
  floor: number;
  unit_no: string;
  config: string;
  area_sqft: number;
  facing: string;
  price: number;
  status: UnitStatus;
  blocked_until: string | null;
}

export interface Partner {
  id: string;
  name: string;
  firm: string;
  phone: string;
  email: string;
  city: string;
  commission_pct: number;
  status: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string;
  project_id: string | null;
  interested_config: string | null;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  assigned_to: string | null;
  cp_id: string | null;
  score: number;
  ai_notes: string | null;
  next_followup_at: string | null;
  last_contacted_at: string | null;
  created_at: string;
}

export interface SiteVisit {
  id: string;
  lead_id: string;
  project_id: string | null;
  scheduled_at: string;
  status: string;
  feedback: string | null;
  picked_by: string | null;
}

export interface Booking {
  id: string;
  unit_id: string;
  lead_id: string | null;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string | null;
  cp_id: string | null;
  plan_type: 'CLP' | 'TLP';
  agreement_value: number;
  booking_date: string;
  status: string;
  registration_no: string | null;
  notes: string | null;
}

export interface PaymentSchedule {
  id: string;
  booking_id: string;
  seq: number;
  milestone: string;
  pct: number;
  amount: number;
  due_date: string;
  paid_amount: number;
  status: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  schedule_id: string | null;
  receipt_no: string;
  amount: number;
  mode: string;
  paid_on: string;
  notes: string | null;
}

export interface DemandLetter {
  id: string;
  booking_id: string;
  schedule_id: string | null;
  letter_no: string;
  amount: number;
  interest: number;
  total_due: number;
  due_date: string | null;
  generated_at: string;
}

export interface ComplianceTask {
  id: string;
  booking_id: string;
  category: string;
  title: string;
  done: boolean;
  done_at: string | null;
  note: string | null;
  sort: number;
}

export interface Approval {
  id: string;
  type: string;
  unit_id: string | null;
  booking_id: string | null;
  requested_by: string;
  reason: string | null;
  discount_pct: number | null;
  status: string;
  created_at: string;
}

export interface BookingEvent {
  id: string;
  booking_id: string;
  type: string;
  description: string;
  created_at: string;
}
