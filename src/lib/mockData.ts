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
import type { StoreData } from './store';

export function getInitialDemoData(): StoreData {
  const projects: Project[] = [
    {
      id: 'a0000000-0000-4000-8000-000000000001',
      name: 'Meridian Heights',
      property_type: 'Apartments',
      city: 'Bengaluru',
      locality: 'Whitefield, ITPL Road',
      possession_date: '2027-06-15',
      status: 'Under Construction',
      publish_status: 'Published',
      rera_no: 'PRM/KA/RERA/1251/446/PR/210323/004011',
      description: 'Luxury high-rise smart residences crafted for modern tech executives and visionary families. Featuring expansive panoramic balconies, home automation, and 45,000 sq.ft. of world-class resort amenities.',
      amenities: ['Olympic Pool', 'Sky Lounge', 'Gym & CrossFit', 'EV Charging', 'Tennis Court', 'Squash Court', '24x7 Security', 'Co-working Pods', 'Jogging Track', 'Kids Play Park'],
      gallery_images: [
        '/projects/meridian-heights.webp',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      ],
      documents: [
        { name: 'RERA Approval Certificate.pdf', url: '#', size: '2.4 MB' },
        { name: 'Meridian Heights Master Brochure.pdf', url: '#', size: '8.1 MB' },
        { name: 'Tower A & B Floor Plans.pdf', url: '#', size: '4.5 MB' },
      ],
      geo_lat: 12.9863,
      geo_lng: 77.7335,
      price_range_min: 11500000,
      price_range_max: 18800000,
      total_units: 56,
      share_slug: 'meridian-heights-whitefield',
      image_url: '/projects/meridian-heights.webp',
    },
    {
      id: 'a0000000-0000-4000-8000-000000000002',
      name: 'Oakridge Villas',
      property_type: 'Villas',
      city: 'Hyderabad',
      locality: 'Gachibowli, Financial District',
      possession_date: '2026-12-01',
      status: 'Nearing Possession',
      publish_status: 'Published',
      rera_no: 'P02400002134',
      description: 'Exclusive gated enclave of bespoke triplex villas overlooking serene green landscapes. Each villa boasts private garden lawns, double-height living spaces, dedicated elevator provisions, and private splash pools.',
      amenities: ['Private Lawn', 'Clubhouse', 'Temperature Pool', 'Yoga Deck', 'Bespoke Concierge', 'Multi-tier Security', 'Solar Power Grid', 'Pet Park'],
      gallery_images: [
        '/projects/oakridge-villas.webp',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      ],
      documents: [
        { name: 'Environmental Clearance.pdf', url: '#', size: '1.8 MB' },
        { name: 'Oakridge Luxury Brochure.pdf', url: '#', size: '12.4 MB' },
      ],
      geo_lat: 17.4401,
      geo_lng: 78.3489,
      price_range_min: 38500000,
      price_range_max: 44000000,
      total_units: 8,
      share_slug: 'oakridge-villas-hyderabad',
      image_url: '/projects/oakridge-villas.webp',
    },
    {
      id: 'a0000000-0000-4000-8000-000000000003',
      name: 'Apex Trade Hub',
      property_type: 'Commercial',
      city: 'Pune',
      locality: 'Baner, Pune-Mumbai Bypass',
      possession_date: '2027-03-31',
      status: 'Under Construction',
      publish_status: 'Published',
      rera_no: 'P52100033109',
      description: 'Next-generation Grade-A commercial landmark with premium retail showrooms on ground and scalable tech suites across upper floors. Designed with LEED Gold pre-certification and high-capacity central HVAC.',
      amenities: ['High Speed Elevators', 'Double-height Lobby', 'Power Backup 100%', 'Food Court & Cafes', 'Automated Multi-level Parking', 'LEED Gold Certified'],
      gallery_images: [
        '/projects/apex-trade-hub.webp',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      ],
      documents: [
        { name: 'Apex Commercial Brochure.pdf', url: '#', size: '6.7 MB' },
        { name: 'Fire NOC & Layout Plans.pdf', url: '#', size: '3.9 MB' },
      ],
      geo_lat: 18.5590,
      geo_lng: 73.7868,
      price_range_min: 13200000,
      price_range_max: 24500000,
      total_units: 20,
      share_slug: 'apex-trade-hub-baner',
      image_url: '/projects/apex-trade-hub.webp',
    },
  ];

  const towers: Tower[] = [
    { id: 'a1000000-0000-4000-8000-000000000001', project_id: 'a0000000-0000-4000-8000-000000000001', name: 'Tower A', floors: 8 },
    { id: 'a1000000-0000-4000-8000-000000000002', project_id: 'a0000000-0000-4000-8000-000000000001', name: 'Tower B', floors: 8 },
    { id: 'a1000000-0000-4000-8000-000000000003', project_id: 'a0000000-0000-4000-8000-000000000002', name: 'Villa Block', floors: 2 },
    { id: 'a1000000-0000-4000-8000-000000000004', project_id: 'a0000000-0000-4000-8000-000000000003', name: 'Trade Tower 1', floors: 5 },
  ];

  const units: Unit[] = [];
  const now = new Date();

  // Meridian Heights: Tower A (8 floors x 4 units)
  for (let f = 1; f <= 8; f++) {
    for (let u = 1; u <= 4; u++) {
      const uno = `A-${f}0${u}`;
      const cfg = u <= 2 ? '2 BHK' : '3 BHK';
      const area = u <= 2 ? 1105 : 1540;
      const price = u <= 2 ? 11500000 + (f - 1) * 150000 : 16800000 + (f - 1) * 200000;
      const face = ['East', 'West', 'North', 'North-East'][u - 1];
      let st: Unit['status'] = 'Available';
      let blockedUntil: string | null = null;
      if (f <= 2) st = 'Sold';
      else if (f === 3 && u === 2) st = 'Booked';
      else if (f === 4 && u === 1) {
        st = 'Blocked';
        blockedUntil = new Date(now.getTime() + 5 * 86400000).toISOString();
      } else if (f === 5 && u === 4) {
        st = 'Blocked';
        blockedUntil = new Date(now.getTime() + 5 * 86400000).toISOString();
      } else if (f === 6 && u === 3) st = 'Booked';

      units.push({
        id: `unit-mh-${uno.toLowerCase()}`,
        project_id: 'a0000000-0000-4000-8000-000000000001',
        tower_id: 'a1000000-0000-4000-8000-000000000001',
        floor: f,
        unit_no: uno,
        config: cfg,
        area_sqft: area,
        facing: face,
        price,
        status: st,
        blocked_until: blockedUntil,
      });
    }
  }

  // Meridian Heights: Tower B (8 floors x 3 units)
  for (let f = 1; f <= 8; f++) {
    for (let u = 1; u <= 3; u++) {
      const uno = `B-${f}0${u}`;
      const cfg = u === 1 ? '2 BHK' : '3 BHK';
      const area = u === 1 ? 1180 : 1615;
      const price = u === 1 ? 12100000 + (f - 1) * 150000 : 17400000 + (f - 1) * 200000;
      const face = ['East', 'South-West', 'West'][u - 1];
      let st: Unit['status'] = 'Available';
      let blockedUntil: string | null = null;
      if (f <= 2) st = 'Sold';
      else if (f === 3 && u === 3) st = 'Sold';
      else if (f === 5 && u === 2) st = 'Booked';
      else if (f === 7 && u === 1) {
        st = 'Blocked';
        blockedUntil = new Date(now.getTime() + 4 * 86400000).toISOString();
      }

      units.push({
        id: `unit-mh-${uno.toLowerCase()}`,
        project_id: 'a0000000-0000-4000-8000-000000000001',
        tower_id: 'a1000000-0000-4000-8000-000000000002',
        floor: f,
        unit_no: uno,
        config: cfg,
        area_sqft: area,
        facing: face,
        price,
        status: st,
        blocked_until: blockedUntil,
      });
    }
  }

  // Oakridge Villas: 8 villas
  for (let i = 1; i <= 8; i++) {
    const uno = `V-${i}`;
    const price = i <= 4 ? 38500000 : 44000000;
    let st: Unit['status'] = 'Available';
    let blockedUntil: string | null = null;
    if (i === 1 || i === 5) st = 'Sold';
    else if (i === 3) st = 'Booked';
    else if (i === 7) {
      st = 'Blocked';
      blockedUntil = new Date(now.getTime() + 6 * 86400000).toISOString();
    }

    units.push({
      id: `unit-ov-${uno.toLowerCase()}`,
      project_id: 'a0000000-0000-4000-8000-000000000002',
      tower_id: 'a1000000-0000-4000-8000-000000000003',
      floor: 0,
      unit_no: uno,
      config: i <= 4 ? '4 BHK Villa' : '5 BHK Villa',
      area_sqft: i <= 4 ? 3200 : 3850,
      facing: ['East', 'West', 'North', 'South'][i % 4],
      price,
      status: st,
      blocked_until: blockedUntil,
    });
  }

  // Apex Trade Hub: 5 floors x 4 commercial units
  for (let f = 1; f <= 5; f++) {
    for (let u = 1; u <= 4; u++) {
      const uno = `T1-${f}0${u}`;
      const cfg = f === 1 ? 'Retail Showroom' : 'Office Suite';
      const area = f === 1 ? 1450 : 1200;
      const price = f === 1 ? 24500000 : 13200000 + u * 300000;
      let st: Unit['status'] = 'Available';
      let blockedUntil: string | null = null;
      if (f === 1 && u === 2) st = 'Sold';
      else if (f === 1 && u === 1) st = 'Booked';
      else if (f === 2 && u === 3) {
        st = 'Blocked';
        blockedUntil = new Date(now.getTime() + 3 * 86400000).toISOString();
      }

      units.push({
        id: `unit-at-${uno.toLowerCase()}`,
        project_id: 'a0000000-0000-4000-8000-000000000003',
        tower_id: 'a1000000-0000-4000-8000-000000000004',
        floor: f,
        unit_no: uno,
        config: cfg,
        area_sqft: area,
        facing: ['Main Road', 'West', 'Courtyard', 'East'][u - 1],
        price,
        status: st,
        blocked_until: blockedUntil,
      });
    }
  }

  const partners: Partner[] = [
    {
      id: 'd0000000-0000-4000-8000-000000000001',
      name: 'Rajesh Kumar',
      firm: 'Skyline Realty Consultants',
      phone: '+91 98450 11223',
      email: 'rajesh@skylinerealty.in',
      city: 'Bengaluru',
      commission_pct: 2.0,
      status: 'Active',
    },
    {
      id: 'd0000000-0000-4000-8000-000000000002',
      name: 'Meera Joshi',
      firm: 'Prime Estates Advisory',
      phone: '+91 98860 44556',
      email: 'meera@primeestates.in',
      city: 'Hyderabad',
      commission_pct: 1.5,
      status: 'Active',
    },
    {
      id: 'd0000000-0000-4000-8000-000000000003',
      name: 'Arun Verma',
      firm: 'Verma Property Links',
      phone: '+91 99870 77889',
      email: 'arun@vermaplinks.in',
      city: 'Pune',
      commission_pct: 1.25,
      status: 'Active',
    },
    {
      id: 'd0000000-0000-4000-8000-000000000004',
      name: 'Sneha Rao',
      firm: 'UrbanNest Partners',
      phone: '+91 97400 33221',
      email: 'sneha@urbannest.in',
      city: 'Bengaluru',
      commission_pct: 2.5,
      status: 'On Hold',
    },
  ];

  const leads: Lead[] = [
    {
      id: 'c0000000-0000-4000-8000-000000000001',
      name: 'Vikram Shah',
      phone: '+91 98201 33445',
      email: 'vikram.shah@gmail.com',
      source: 'Property Portal',
      project_id: 'a0000000-0000-4000-8000-000000000001',
      interested_config: '3 BHK',
      budget_min: 15000000,
      budget_max: 17500000,
      status: 'Negotiation',
      assigned_to: 'Kavya (Sales)',
      cp_id: null,
      score: 82,
      ai_notes: 'Called 12-Nov. Wants corner unit, East facing, 3 BHK in Tower A. Price-sensitive; hinted at 2% discount ask. Ready to close this month if discount approved.',
      next_followup_at: new Date(now.getTime() + 1 * 86400000).toISOString(),
      last_contacted_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
      created_at: new Date(now.getTime() - 18 * 86400000).toISOString(),
    },
    {
      id: 'c0000000-0000-4000-8000-000000000002',
      name: 'Anita Desai',
      phone: '+91 98455 66778',
      email: 'anita.desai@outlook.com',
      source: 'Website',
      project_id: 'a0000000-0000-4000-8000-000000000001',
      interested_config: '2 BHK',
      budget_min: 10500000,
      budget_max: 12500000,
      status: 'Site Visit Done',
      assigned_to: 'Arjun (Sales)',
      cp_id: null,
      score: 74,
      ai_notes: 'Visited Tower A on 14-Nov. Loved floor-6 view. Comparing with Prestigio across road. Send cost sheet + payment plan comparison.',
      next_followup_at: new Date(now.getTime() + 2 * 86400000).toISOString(),
      last_contacted_at: new Date(now.getTime() - 5 * 86400000).toISOString(),
      created_at: new Date(now.getTime() - 25 * 86400000).toISOString(),
    },
    {
      id: 'c0000000-0000-4000-8000-000000000003',
      name: 'Suresh Babu',
      phone: '+91 90080 99112',
      email: 'suresh.babu@yahoo.in',
      source: 'Channel Partner',
      project_id: 'a0000000-0000-4000-8000-000000000002',
      interested_config: '5 BHK Villa',
      budget_min: 40000000,
      budget_max: 47000000,
      status: 'New',
      assigned_to: 'Meera (Sales)',
      cp_id: 'd0000000-0000-4000-8000-000000000002',
      score: 68,
      ai_notes: 'Referred by Prime Estates. NRI buyer, prefers WhatsApp updates. Needs villa with private pool. Verify home-loan eligibility with HDFC.',
      next_followup_at: new Date(now.getTime() - 1 * 86400000).toISOString(),
      last_contacted_at: new Date(now.getTime() - 4 * 86400000).toISOString(),
      created_at: new Date(now.getTime() - 6 * 86400000).toISOString(),
    },
    {
      id: 'c0000000-0000-4000-8000-000000000004',
      name: 'Priya Menon',
      phone: '+91 99004 55667',
      email: 'priya.menon@gmail.com',
      source: 'Meta/Google Ads',
      project_id: 'a0000000-0000-4000-8000-000000000001',
      interested_config: '2 BHK',
      budget_min: 10000000,
      budget_max: 12000000,
      status: 'Contacted',
      assigned_to: 'Kavya (Sales)',
      cp_id: null,
      score: 61,
      ai_notes: 'Came from Instagram lead ad. First-time buyer, home loan pre-approved up to Rs 90L. Follow up with EMI illustration.',
      next_followup_at: new Date(now.getTime() + 3 * 86400000).toISOString(),
      last_contacted_at: new Date(now.getTime() - 1 * 86400000).toISOString(),
      created_at: new Date(now.getTime() - 9 * 86400000).toISOString(),
    },
    {
      id: 'c0000000-0000-4000-8000-000000000005',
      name: 'Rahul Khanna',
      phone: '+91 98110 22334',
      email: 'rahul.khanna@zenco.in',
      source: 'Direct',
      project_id: 'a0000000-0000-4000-8000-000000000003',
      interested_config: 'Retail Showroom',
      budget_min: 22000000,
      budget_max: 26000000,
      status: 'Site Visit Done',
      assigned_to: 'Farhan (Sales)',
      cp_id: null,
      score: 88,
      ai_notes: 'Wants ground-floor retail for his apparel brand. Visited 10-Nov with architect. Asked for CAM charges and footfall study. Hot lead — escalate to manager if idle 48h.',
      next_followup_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
      last_contacted_at: new Date(now.getTime() - 9 * 86400000).toISOString(),
      created_at: new Date(now.getTime() - 16 * 86400000).toISOString(),
    },
    {
      id: 'c0000000-0000-4000-8000-000000000006',
      name: 'Deepika Rao',
      phone: '+91 96633 77889',
      email: 'deepika.rao@gmail.com',
      source: 'Property Portal',
      project_id: 'a0000000-0000-4000-8000-000000000002',
      interested_config: '4 BHK Villa',
      budget_min: 36000000,
      budget_max: 40000000,
      status: 'Negotiation',
      assigned_to: 'Meera (Sales)',
      cp_id: null,
      score: 79,
      ai_notes: 'Second visit done with family. Kids loved the lawn. Negotiation stage now; wants club membership waived.',
      next_followup_at: new Date(now.getTime() + 1 * 86400000).toISOString(),
      last_contacted_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
      created_at: new Date(now.getTime() - 21 * 86400000).toISOString(),
    },
    {
      id: 'c0000000-0000-4000-8000-000000000007',
      name: 'Imran Shaikh',
      phone: '+91 99872 11009',
      email: 'imran.s@gmail.com',
      source: 'Channel Partner',
      project_id: 'a0000000-0000-4000-8000-000000000003',
      interested_config: 'Office Suite',
      budget_min: 12000000,
      budget_max: 14000000,
      status: 'Contacted',
      assigned_to: 'Farhan (Sales)',
      cp_id: 'd0000000-0000-4000-8000-000000000003',
      score: 55,
      ai_notes: 'CP-referred IT services firm looking to own office. Needs 30+ seats, prefers west wing. Send floor plans of levels 2-4.',
      next_followup_at: new Date(now.getTime() + 4 * 86400000).toISOString(),
      last_contacted_at: new Date(now.getTime() - 6 * 86400000).toISOString(),
      created_at: new Date(now.getTime() - 11 * 86400000).toISOString(),
    },
    {
      id: 'c0000000-0000-4000-8000-000000000008',
      name: 'Sunita Kapoor',
      phone: '+91 98200 88991',
      email: 'sunita.kapoor@gmail.com',
      source: 'Website',
      project_id: 'a0000000-0000-4000-8000-000000000001',
      interested_config: '3 BHK',
      budget_min: 16000000,
      budget_max: 18000000,
      status: 'Site Visit Scheduled',
      assigned_to: 'Arjun (Sales)',
      cp_id: null,
      score: 71,
      ai_notes: 'Booking form downloaded from website. Visit booked for Saturday morning. Husband prefers higher floor, budget flexible.',
      next_followup_at: new Date(now.getTime() + 2 * 86400000).toISOString(),
      last_contacted_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
      created_at: new Date(now.getTime() - 7 * 86400000).toISOString(),
    },
    {
      id: 'c0000000-0000-4000-8000-000000000011',
      name: 'Gaurav Bhatia',
      phone: '+91 98456 90012',
      email: 'gaurav.bhatia@gmail.com',
      source: 'Channel Partner',
      project_id: 'a0000000-0000-4000-8000-000000000001',
      interested_config: '2 BHK',
      budget_min: 11000000,
      budget_max: 12500000,
      status: 'Booked',
      assigned_to: 'Kavya (Sales)',
      cp_id: 'd0000000-0000-4000-8000-000000000001',
      score: 85,
      ai_notes: 'Booked A-302 via Skyline Realty. Token received, agreement in drafting. CP commission claim logged.',
      next_followup_at: new Date(now.getTime() + 5 * 86400000).toISOString(),
      last_contacted_at: new Date(now.getTime() - 10 * 86400000).toISOString(),
      created_at: new Date(now.getTime() - 30 * 86400000).toISOString(),
    },
  ];

  const siteVisits: SiteVisit[] = [
    {
      id: 'e0000000-0000-4000-8000-000000000001',
      lead_id: 'c0000000-0000-4000-8000-000000000002',
      project_id: 'a0000000-0000-4000-8000-000000000001',
      scheduled_at: new Date(now.getTime() - 5 * 86400000).toISOString(),
      status: 'Completed',
      feedback: 'Impressed by sample flat and amenities deck. Asked for cost sheet by email.',
      picked_by: 'Arjun (Sales)',
    },
    {
      id: 'e0000000-0000-4000-8000-000000000002',
      lead_id: 'c0000000-0000-4000-8000-000000000005',
      project_id: 'a0000000-0000-4000-8000-000000000003',
      scheduled_at: new Date(now.getTime() - 9 * 86400000).toISOString(),
      status: 'Completed',
      feedback: 'Brought architect. Measured showroom frontage. Wants CAM + footfall data.',
      picked_by: 'Farhan (Sales)',
    },
    {
      id: 'e0000000-0000-4000-8000-000000000004',
      lead_id: 'c0000000-0000-4000-8000-000000000008',
      project_id: 'a0000000-0000-4000-8000-000000000001',
      scheduled_at: new Date(now.getTime() + 2 * 86400000).toISOString(),
      status: 'Scheduled',
      feedback: null,
      picked_by: 'Arjun (Sales)',
    },
    {
      id: 'e0000000-0000-4000-8000-000000000006',
      lead_id: 'c0000000-0000-4000-8000-000000000003',
      project_id: 'a0000000-0000-4000-8000-000000000002',
      scheduled_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
      status: 'No Show',
      feedback: 'Did not arrive; CP says rescheduling to next weekend.',
      picked_by: 'Meera (Sales)',
    },
  ];

  const unitA302 = units.find((u) => u.unit_no === 'A-302')!;
  const unitV3 = units.find((u) => u.unit_no === 'V-3')!;
  const unitT1 = units.find((u) => u.unit_no === 'T1-101')!;

  const bookings: Booking[] = [
    {
      id: 'b0000000-0000-4000-8000-000000000001',
      unit_id: unitA302.id,
      lead_id: 'c0000000-0000-4000-8000-000000000011',
      buyer_name: 'Gaurav Bhatia',
      buyer_phone: '+91 98456 90012',
      buyer_email: 'gaurav.bhatia@gmail.com',
      cp_id: 'd0000000-0000-4000-8000-000000000001',
      plan_type: 'CLP',
      agreement_value: unitA302.price,
      booking_date: new Date(now.getTime() - 45 * 86400000).toISOString().slice(0, 10),
      status: 'Confirmed',
      registration_no: null,
      notes: 'CP-referred booking via Skyline Realty. Discount 2% approved by manager.',
    },
    {
      id: 'b0000000-0000-4000-8000-000000000003',
      unit_id: unitV3.id,
      lead_id: null,
      buyer_name: 'Kunal & Ritu Deshpande',
      buyer_phone: '+91 90040 55667',
      buyer_email: 'kunal.deshpande@gmail.com',
      cp_id: 'd0000000-0000-4000-8000-000000000002',
      plan_type: 'CLP',
      agreement_value: unitV3.price,
      booking_date: new Date(now.getTime() - 120 * 86400000).toISOString().slice(0, 10),
      status: 'Confirmed',
      registration_no: null,
      notes: 'Villa with private lawn. Nearing possession; handover checklist active.',
    },
    {
      id: 'b0000000-0000-4000-8000-000000000004',
      unit_id: unitT1.id,
      lead_id: null,
      buyer_name: 'Zenith Retail Solutions Pvt Ltd',
      buyer_phone: '+91 98203 77889',
      buyer_email: 'admin@zenithretail.in',
      cp_id: null,
      plan_type: 'CLP',
      agreement_value: unitT1.price,
      booking_date: new Date(now.getTime() - 75 * 86400000).toISOString().slice(0, 10),
      status: 'Confirmed',
      registration_no: null,
      notes: 'Ground-floor retail showroom. GST invoice required on all demands.',
    },
  ];

  const schedules: PaymentSchedule[] = [];
  const payments: Payment[] = [];
  const letters: DemandLetter[] = [];
  const tasks: ComplianceTask[] = [];

  // Generate schedules & payments for bookings
  bookings.forEach((b) => {
    const miles = ['Booking Amount', 'Agreement (10%)', 'Foundation Cast', 'Plinth Slab', 'Ground Floor Slab', 'First Floor Slab', 'Brickwork & Finishing', 'On Possession'];
    const pcts = [5, 10, 10, 10, 15, 15, 25, 10];
    const gaps = [0, 7, 60, 120, 190, 260, 340, 430];
    const bDate = new Date(b.booking_date).getTime();

    miles.forEach((m, idx) => {
      const slabId = `sched-${b.id.slice(0, 8)}-${idx + 1}`;
      const slabDate = new Date(bDate + gaps[idx] * 86400000);
      const isPast = slabDate < now;
      const amt = Math.round((b.agreement_value * pcts[idx]) / 100);

      let paid = 0;
      let status = 'Pending';
      if (idx === 0) {
        paid = amt;
        status = 'Paid';
        payments.push({
          id: `pay-${slabId}`,
          booking_id: b.id,
          schedule_id: slabId,
          receipt_no: `RCPT-2026-${1000 + payments.length}`,
          amount: amt,
          mode: 'NEFT',
          paid_on: slabDate.toISOString().slice(0, 10),
          notes: 'Booking amount received',
        });
      } else if (idx === 1 && b.id === 'b0000000-0000-4000-8000-000000000003') {
        paid = amt;
        status = 'Paid';
        payments.push({
          id: `pay-${slabId}`,
          booking_id: b.id,
          schedule_id: slabId,
          receipt_no: `RCPT-2026-${1000 + payments.length}`,
          amount: amt,
          mode: 'RTGS',
          paid_on: slabDate.toISOString().slice(0, 10),
          notes: 'Agreement installment received',
        });
      } else if (isPast) {
        status = 'Overdue';
        const overdueDays = Math.max(1, Math.ceil((now.getTime() - slabDate.getTime()) / 86400000));
        const interest = Math.round(amt * 0.18 * (overdueDays / 365));
        letters.push({
          id: `dl-${slabId}`,
          booking_id: b.id,
          schedule_id: slabId,
          letter_no: `DL-2026-${2000 + letters.length}`,
          amount: amt,
          interest,
          total_due: amt + interest,
          due_date: slabDate.toISOString().slice(0, 10),
          generated_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
        });
      }

      schedules.push({
        id: slabId,
        booking_id: b.id,
        seq: idx + 1,
        milestone: m,
        pct: pcts[idx],
        amount: amt,
        due_date: slabDate.toISOString().slice(0, 10),
        paid_amount: paid,
        status,
      });
    });

    // Compliance tasks
    tasks.push(
      {
        id: `task-${b.id}-1`,
        booking_id: b.id,
        category: 'Documentation',
        title: 'Allotment Letter issued',
        done: true,
        done_at: new Date(bDate + 86400000).toISOString(),
        note: 'Auto-generated from template AL-MH-01',
        sort: 1,
      },
      {
        id: `task-${b.id}-2`,
        booking_id: b.id,
        category: 'Documentation',
        title: 'Agreement to Sale executed',
        done: b.status === 'Registered',
        done_at: null,
        note: 'Draft with legal team',
        sort: 2,
      },
      {
        id: `task-${b.id}-3`,
        booking_id: b.id,
        category: 'Loan & Registration',
        title: 'Bank loan sanction received',
        done: false,
        done_at: null,
        note: 'Pre-approval submitted to HDFC',
        sort: 3,
      },
      {
        id: `task-${b.id}-4`,
        booking_id: b.id,
        category: 'Handover',
        title: 'Snag list inspection',
        done: false,
        done_at: null,
        note: 'Scheduled near possession',
        sort: 4,
      },
    );
  });

  const approvals: Approval[] = [
    {
      id: 'f2000000-0000-4000-8000-000000000001',
      type: 'Block Extension',
      unit_id: units.find((u) => u.unit_no === 'A-401')?.id ?? null,
      booking_id: null,
      requested_by: 'Kavya (Sales)',
      reason: 'Client travelling; needs 5 more days on hold before booking',
      discount_pct: null,
      status: 'Pending',
      created_at: new Date(now.getTime() - 1 * 86400000).toISOString(),
    },
    {
      id: 'f2000000-0000-4000-8000-000000000002',
      type: 'Discount Approval',
      unit_id: units.find((u) => u.unit_no === 'A-603')?.id ?? null,
      booking_id: null,
      requested_by: 'Arjun (Sales)',
      reason: 'Vikram Shah (hot lead, 82 score) asking for 2.5% on A-603 East-facing corner',
      discount_pct: 2.5,
      status: 'Pending',
      created_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
  ];

  const events: BookingEvent[] = [
    {
      id: 'f3000000-0000-4000-8000-000000000001',
      booking_id: bookings[0].id,
      type: 'Booking',
      description: 'Booking confirmed on unit A-302 with 2% manager-approved discount',
      created_at: new Date(now.getTime() - 45 * 86400000).toISOString(),
    },
    {
      id: 'f3000000-0000-4000-8000-000000000002',
      booking_id: bookings[0].id,
      type: 'Payment',
      description: 'Booking amount received via NEFT. Receipt issued.',
      created_at: new Date(now.getTime() - 44 * 86400000).toISOString(),
    },
  ];

  return {
    projects,
    towers,
    units,
    partners,
    leads,
    siteVisits,
    bookings,
    schedules,
    payments,
    letters,
    tasks,
    approvals,
    events,
  };
}
