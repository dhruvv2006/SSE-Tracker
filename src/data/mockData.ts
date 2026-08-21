import { Client, Transaction, Payment, FollowUp, Staff, AuditLog, BusinessSettings } from '../types';

export const initialStaff: Staff[] = [
  {
    id: 'ST-1',
    name: 'Sarah Jenkins',
    email: 's.jenkins@assetcorp.com',
    role: 'Admin',
    avatarColor: '#2563EB',
    initials: 'SJ',
    activeClientsCount: 14,
    totalAssignedPending: 148200,
    targetAmount: 200000,
    collectedThisMonth: 184000,
    status: 'active'
  },
  {
    id: 'ST-2',
    name: 'Michael Chen',
    email: 'mchen@assetcorp.com',
    role: 'Collector',
    avatarColor: '#4F46E5',
    initials: 'MC',
    activeClientsCount: 11,
    totalAssignedPending: 116850.50,
    targetAmount: 150000,
    collectedThisMonth: 117000,
    status: 'active'
  },
  {
    id: 'ST-3',
    name: 'Amanda Torres',
    email: 'atorres@assetcorp.com',
    role: 'Collector',
    avatarColor: '#059669',
    initials: 'AT',
    activeClientsCount: 9,
    totalAssignedPending: 0,
    targetAmount: 120000,
    collectedThisMonth: 120000,
    status: 'active'
  },
  {
    id: 'ST-4',
    name: 'Jane Doe',
    email: 'jdoe@assetcorp.com',
    role: 'Collector',
    avatarColor: '#D97706',
    initials: 'JD',
    activeClientsCount: 8,
    totalAssignedPending: 150200,
    targetAmount: 180000,
    collectedThisMonth: 165600,
    status: 'active'
  },
  {
    id: 'ST-5',
    name: 'Mark Smith',
    email: 'msmith@assetcorp.com',
    role: 'Collector',
    avatarColor: '#EA580C',
    initials: 'MS',
    activeClientsCount: 6,
    totalAssignedPending: 84000,
    targetAmount: 110000,
    collectedThisMonth: 85800,
    status: 'active'
  },
  {
    id: 'ST-6',
    name: 'Alice Lee',
    email: 'alee@assetcorp.com',
    role: 'Collector',
    avatarColor: '#DC2626',
    initials: 'AL',
    activeClientsCount: 5,
    totalAssignedPending: 68400,
    targetAmount: 90000,
    collectedThisMonth: 40500,
    status: 'active'
  },
  {
    id: 'ST-7',
    name: 'Robert Jones',
    email: 'rjones@assetcorp.com',
    role: 'Collector',
    avatarColor: '#0284C7',
    initials: 'RJ',
    activeClientsCount: 7,
    totalAssignedPending: 75000,
    targetAmount: 130000,
    collectedThisMonth: 114400,
    status: 'active'
  }
];

export const initialClients: Client[] = [
  {
    id: 'CL-2948',
    name: 'Apex Corp Industrial',
    code: 'AC',
    contactName: 'David Wallace',
    contactEmail: 'd.wallace@apex.com',
    contactPhone: '+1 (555) 349-2104',
    address: '8400 Northway Parkway, Chicago IL',
    industry: 'Industrial Equipment',
    assignedStaffId: 'ST-1',
    assignedStaffName: 'Sarah Jenkins',
    status: 'active',
    joinedDate: 'Jan 15, 2022',
    averagePaymentDays: 22,
    healthScore: 78,
    notesCount: 5
  },
  {
    id: 'CL-3012',
    name: 'Nexus Logistics',
    code: 'NL',
    contactName: 'Elena Rodriguez',
    contactEmail: 'elena@nexuslog.com',
    contactPhone: '+1 (555) 782-9011',
    address: '42 Freight Blvd, Newark NJ',
    industry: 'Supply Chain & Freight',
    assignedStaffId: 'ST-2',
    assignedStaffName: 'Michael Chen',
    status: 'active',
    joinedDate: 'Mar 10, 2022',
    averagePaymentDays: 45,
    healthScore: 52,
    notesCount: 3
  },
  {
    id: 'CL-2105',
    name: 'Global Health Partners',
    code: 'GH',
    contactName: 'Dr. Aris Thorne',
    contactEmail: 'athorne@ghp.org',
    contactPhone: '+1 (555) 492-1138',
    address: '100 Medical Center Way, Boston MA',
    industry: 'Healthcare Services',
    assignedStaffId: 'ST-3',
    assignedStaffName: 'Amanda Torres',
    status: 'active',
    joinedDate: 'Nov 04, 2021',
    averagePaymentDays: 12,
    healthScore: 98,
    notesCount: 2
  },
  {
    id: 'CL-4099',
    name: 'Symbiotic Inc.',
    code: 'S',
    contactName: 'James Gordon',
    contactEmail: 'jgordon@symbiotic.net',
    contactPhone: '+1 (555) 832-6701',
    address: '500 Silicon Way, Austin TX',
    industry: 'Cloud Infrastructure',
    assignedStaffId: 'ST-1',
    assignedStaffName: 'Sarah Jenkins',
    status: 'active',
    joinedDate: 'Jul 19, 2022',
    averagePaymentDays: 28,
    healthScore: 70,
    notesCount: 4
  },
  {
    id: 'CL-1024',
    name: 'Quantum Manufacturing',
    code: 'QM',
    contactName: 'Lisa Chang',
    contactEmail: 'lchang@quantum.co',
    contactPhone: '+1 (555) 902-3312',
    address: '12 Harbor Point, Seattle WA',
    industry: 'Precision Electronics',
    assignedStaffId: 'ST-2',
    assignedStaffName: 'Michael Chen',
    status: 'active',
    joinedDate: 'Feb 01, 2023',
    averagePaymentDays: 31,
    healthScore: 82,
    notesCount: 6
  },
  {
    id: 'CL-1001',
    name: 'Acme Corp International',
    code: 'AC',
    contactName: 'Sarah Jenkins (Controller)',
    contactEmail: 's.jenkins@acmecorp.com',
    contactPhone: '+1 (555) 019-2834',
    address: '123 Industrial Pkwy, Chicago IL',
    industry: 'Enterprise / Manufacturing',
    assignedStaffId: 'ST-1',
    assignedStaffName: 'Sarah Jenkins',
    status: 'active',
    joinedDate: 'Oct 2021',
    averagePaymentDays: 14,
    healthScore: 85,
    notesCount: 4
  },
  {
    id: 'CL-5011',
    name: 'Wayne Enterprises',
    code: 'WE',
    contactName: 'Lucius Fox',
    contactEmail: 'l.fox@waynecorp.com',
    contactPhone: '+1 (555) 670-8800',
    address: '100 Gotham Plaza, New York NY',
    industry: 'Defense & Technology',
    assignedStaffId: 'ST-4',
    assignedStaffName: 'Jane Doe',
    status: 'active',
    joinedDate: 'May 14, 2020',
    averagePaymentDays: 16,
    healthScore: 92,
    notesCount: 1
  },
  {
    id: 'CL-6012',
    name: 'Stark Industries',
    code: 'SI',
    contactName: 'Pepper Potts',
    contactEmail: 'ppotts@stark.io',
    contactPhone: '+1 (555) 431-7722',
    address: '10880 Wilshire Blvd, Los Angeles CA',
    industry: 'Renewable Power & Tech',
    assignedStaffId: 'ST-5',
    assignedStaffName: 'Mark Smith',
    status: 'active',
    joinedDate: 'Aug 22, 2021',
    averagePaymentDays: 34,
    healthScore: 68,
    notesCount: 3
  },
  {
    id: 'CL-7020',
    name: 'Globex Corp',
    code: 'GC',
    contactName: 'Hank Scorpio',
    contactEmail: 'h.scorpio@globex.org',
    contactPhone: '+1 (555) 991-0422',
    address: '742 Cypress Creek, Dallas TX',
    industry: 'International Conglomerate',
    assignedStaffId: 'ST-6',
    assignedStaffName: 'Alice Lee',
    status: 'active',
    joinedDate: 'Sep 09, 2022',
    averagePaymentDays: 62,
    healthScore: 41,
    notesCount: 7
  },
  {
    id: 'CL-8033',
    name: 'TechCorp Inc.',
    code: 'TC',
    contactName: 'Raymond Holt',
    contactEmail: 'rholt@techcorp.io',
    contactPhone: '+1 (555) 234-9988',
    address: '350 Mission St, San Francisco CA',
    industry: 'Enterprise Software',
    assignedStaffId: 'ST-7',
    assignedStaffName: 'Robert Jones',
    status: 'active',
    joinedDate: 'Jan 11, 2023',
    averagePaymentDays: 15,
    healthScore: 95,
    notesCount: 2
  }
];

export const initialTransactions: Transaction[] = [
  // Acme Corp International transactions
  {
    id: 'INV-2023-401',
    clientId: 'CL-1001',
    invoiceNumber: 'INV-2023-401',
    date: '2026-08-12',
    dueDate: '2026-09-12',
    amount: 45000.00,
    paidAmount: 0,
    pendingAmount: 45000.00,
    description: 'Q4 SaaS Licensing Renewals',
    category: 'Software Subscription',
    status: 'PENDING',
    createdBy: 'Sarah Jenkins',
    createdAt: '2026-08-12T10:00:00Z'
  },
  {
    id: 'INV-2023-389',
    clientId: 'CL-1001',
    invoiceNumber: 'INV-2023-389',
    date: '2026-07-01',
    dueDate: '2026-08-01',
    amount: 12500.00,
    paidAmount: 0,
    pendingAmount: 12500.00,
    description: 'Consulting Services - Phase 2',
    category: 'Professional Services',
    status: 'OVERDUE',
    createdBy: 'Sarah Jenkins',
    createdAt: '2026-07-01T14:30:00Z'
  },
  {
    id: 'INV-2023-350',
    clientId: 'CL-1001',
    invoiceNumber: 'INV-2023-350',
    date: '2026-06-15',
    dueDate: '2026-07-15',
    amount: 74000.00,
    paidAmount: 37000.00,
    pendingAmount: 37000.00,
    description: 'Hardware Procurement (Batch A)',
    category: 'Hardware',
    status: 'PARTIAL',
    createdBy: 'Sarah Jenkins',
    createdAt: '2026-06-15T09:15:00Z'
  },
  {
    id: 'INV-2023-312',
    clientId: 'CL-1001',
    invoiceNumber: 'INV-2023-312',
    date: '2026-05-01',
    dueDate: '2026-06-01',
    amount: 120000.00,
    paidAmount: 120000.00,
    pendingAmount: 0.00,
    description: 'Annual Maintenance Contract',
    category: 'Maintenance',
    status: 'PAID',
    createdBy: 'Sarah Jenkins',
    createdAt: '2026-05-01T11:00:00Z'
  },
  {
    id: 'INV-2023-288',
    clientId: 'CL-1001',
    invoiceNumber: 'INV-2023-288',
    date: '2026-04-15',
    dueDate: '2026-05-15',
    amount: 18500.00,
    paidAmount: 18500.00,
    pendingAmount: 0.00,
    description: 'Custom Development Work',
    category: 'Engineering',
    status: 'PAID',
    createdBy: 'Sarah Jenkins',
    createdAt: '2026-04-15T16:00:00Z'
  },

  // Apex Corp Industrial
  {
    id: 'INV-2023-2948-1',
    clientId: 'CL-2948',
    invoiceNumber: 'INV-2023-455',
    date: '2026-08-05',
    dueDate: '2026-09-05',
    amount: 45200.00,
    paidAmount: 0,
    pendingAmount: 45200.00,
    description: 'Heavy Machinery Maintenance & Overhaul',
    category: 'Industrial',
    status: 'PENDING',
    createdBy: 'Sarah Jenkins',
    createdAt: '2026-08-05T10:00:00Z'
  },

  // Nexus Logistics
  {
    id: 'INV-2023-3012-1',
    clientId: 'CL-3012',
    invoiceNumber: 'INV-2023-442',
    date: '2026-06-28',
    dueDate: '2026-07-28',
    amount: 12850.50,
    paidAmount: 0,
    pendingAmount: 12850.50,
    description: 'Dedicated Fleet Routing & Telematics API',
    category: 'Logistics',
    status: 'OVERDUE',
    createdBy: 'Michael Chen',
    createdAt: '2026-06-28T09:30:00Z'
  },

  // Global Health Partners
  {
    id: 'INV-2023-2105-1',
    clientId: 'CL-2105',
    invoiceNumber: 'INV-2023-420',
    date: '2026-07-10',
    dueDate: '2026-08-10',
    amount: 68000.00,
    paidAmount: 68000.00,
    pendingAmount: 0.00,
    description: 'Clinical Portal License Expansion (Tier 1)',
    category: 'Healthcare',
    status: 'PAID',
    createdBy: 'Amanda Torres',
    createdAt: '2026-07-10T12:00:00Z'
  },

  // Symbiotic Inc.
  {
    id: 'INV-2023-4099-1',
    clientId: 'CL-4099',
    invoiceNumber: 'INV-2023-488',
    date: '2026-07-20',
    dueDate: '2026-08-20',
    amount: 17000.00,
    paidAmount: 8500.00,
    pendingAmount: 8500.00,
    description: 'Kubernetes Cluster Managed Support',
    category: 'Infrastructure',
    status: 'PARTIAL',
    createdBy: 'Sarah Jenkins',
    createdAt: '2026-07-20T15:45:00Z'
  },

  // Quantum Manufacturing
  {
    id: 'INV-2023-1024-1',
    clientId: 'CL-1024',
    invoiceNumber: 'INV-2023-502',
    date: '2026-08-10',
    dueDate: '2026-09-10',
    amount: 104000.00,
    paidAmount: 0,
    pendingAmount: 104000.00,
    description: 'Wafer Fabrication Cleanroom Automation Suite',
    category: 'Hardware',
    status: 'PENDING',
    createdBy: 'Michael Chen',
    createdAt: '2026-08-10T08:00:00Z'
  },

  // Wayne Enterprises
  {
    id: 'INV-2023-0915',
    clientId: 'CL-5011',
    invoiceNumber: 'INV-2023-0915',
    date: '2026-08-18',
    dueDate: '2026-08-18',
    amount: 105000.00,
    paidAmount: 0,
    pendingAmount: 105000.00,
    description: 'Satellite Uplink Encryption Protocol Suite',
    category: 'Security',
    status: 'OVERDUE',
    createdBy: 'Jane Doe',
    createdAt: '2026-08-18T11:00:00Z'
  },

  // Stark Industries
  {
    id: 'INV-2023-0902',
    clientId: 'CL-6012',
    invoiceNumber: 'INV-2023-0902',
    date: '2026-07-22',
    dueDate: '2026-08-06',
    amount: 12550.50,
    paidAmount: 0,
    pendingAmount: 12550.50,
    description: 'Arc Reactor Telemetry Diagnostics',
    category: 'Engineering',
    status: 'OVERDUE',
    createdBy: 'Mark Smith',
    createdAt: '2026-07-22T14:20:00Z'
  },

  // Globex Corp
  {
    id: 'INV-2023-0850',
    clientId: 'CL-7020',
    invoiceNumber: 'INV-2023-0850',
    date: '2026-06-15',
    dueDate: '2026-06-19',
    amount: 8400.00,
    paidAmount: 0,
    pendingAmount: 8400.00,
    description: 'Thermal Core Regulators Maintenance',
    category: 'Industrial',
    status: 'OVERDUE',
    createdBy: 'Alice Lee',
    createdAt: '2026-06-15T13:10:00Z'
  }
];

export const initialPayments: Payment[] = [
  {
    id: 'PAY-8821',
    clientId: 'CL-8033',
    amount: 45000.00,
    paymentDate: '2026-08-20',
    paymentMethod: 'Stripe',
    referenceNumber: 'ch_3N5dKl2eZvKYlo2C0p1wQ9x',
    notes: 'Q3 Enterprise SaaS balance settled in full.',
    recordedBy: 'Robert Jones',
    status: 'POSTED',
    createdAt: '2026-08-20T00:23:00Z'
  },
  {
    id: 'PAY-8819',
    transactionId: 'INV-2023-312',
    clientId: 'CL-1001',
    amount: 120000.00,
    paymentDate: '2026-08-10',
    paymentMethod: 'Wire',
    referenceNumber: 'WT-20260810-7712',
    notes: 'Wire received via Chase Commercial Treasury.',
    recordedBy: 'Sarah Jenkins',
    status: 'POSTED',
    createdAt: '2026-08-10T15:00:00Z'
  },
  {
    id: 'PAY-8815',
    transactionId: 'INV-2023-288',
    clientId: 'CL-1001',
    amount: 18500.00,
    paymentDate: '2026-08-01',
    paymentMethod: 'ACH',
    referenceNumber: 'ACH-889021',
    notes: 'Direct deposit cleared.',
    recordedBy: 'Sarah Jenkins',
    status: 'POSTED',
    createdAt: '2026-08-01T10:30:00Z'
  },
  {
    id: 'PAY-8810',
    transactionId: 'INV-2023-350',
    clientId: 'CL-1001',
    amount: 37000.00,
    paymentDate: '2026-07-28',
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'TX-440192',
    notes: '50% initial milestone deposit received.',
    recordedBy: 'Sarah Jenkins',
    status: 'POSTED',
    createdAt: '2026-07-28T16:15:00Z'
  },
  {
    id: 'PAY-8802',
    transactionId: 'INV-2023-4099-1',
    clientId: 'CL-4099',
    amount: 8500.00,
    paymentDate: '2026-08-05',
    paymentMethod: 'Credit Card',
    referenceNumber: 'CC-992014',
    notes: 'Partial installment authorized.',
    recordedBy: 'Sarah Jenkins',
    status: 'POSTED',
    createdAt: '2026-08-05T11:20:00Z'
  },
  {
    id: 'PAY-8790',
    transactionId: 'INV-2023-2105-1',
    clientId: 'CL-2105',
    amount: 68000.00,
    paymentDate: '2026-08-08',
    paymentMethod: 'Wire',
    referenceNumber: 'BOS-WIRE-1002',
    notes: 'Paid within prompt 10-day payment discount terms.',
    recordedBy: 'Amanda Torres',
    status: 'POSTED',
    createdAt: '2026-08-08T09:00:00Z'
  }
];

export const initialFollowUps: FollowUp[] = [
  {
    id: 'FU-101',
    clientId: 'CL-1001',
    scheduledDate: '2026-08-21',
    scheduledTime: '10:00 AM',
    note: 'Call Sarah regarding overdue Invoice INV-2023-389 ($12,500).',
    priority: 'HIGH',
    status: 'PENDING',
    assignedTo: 'ST-1',
    assignedStaffName: 'Sarah Jenkins',
    createdAt: '2026-08-19T14:30:00Z'
  },
  {
    id: 'FU-102',
    clientId: 'CL-3012',
    scheduledDate: '2026-08-21',
    scheduledTime: '02:00 PM',
    note: 'Email Elena regarding 23-day overdue balance ($12,850.50). Request AP contact.',
    priority: 'HIGH',
    status: 'PENDING',
    assignedTo: 'ST-2',
    assignedStaffName: 'Michael Chen',
    createdAt: '2026-08-18T10:00:00Z'
  },
  {
    id: 'FU-103',
    clientId: 'CL-2948',
    scheduledDate: '2026-08-25',
    scheduledTime: '11:30 AM',
    note: 'Send friendly reminder for $45,200 invoice before Net 30 deadline.',
    priority: 'MEDIUM',
    status: 'PENDING',
    assignedTo: 'ST-1',
    assignedStaffName: 'Sarah Jenkins',
    createdAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'FU-104',
    clientId: 'CL-7020',
    scheduledDate: '2026-08-20',
    scheduledTime: '03:30 PM',
    note: 'Final escalation: 62 days overdue ($8,400.00). Issue formal notice.',
    priority: 'HIGH',
    status: 'PENDING',
    assignedTo: 'ST-6',
    assignedStaffName: 'Alice Lee',
    createdAt: '2026-08-12T16:00:00Z'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'AUD-901',
    timestamp: '2026-08-20T00:23:00Z',
    actorName: 'Robert Jones',
    actorRole: 'Collector',
    action: 'RECORD_PAYMENT',
    entityType: 'Payment',
    entityId: 'PAY-8821',
    description: 'Recorded payment of $45,000.00 for TechCorp Inc. (Stripe)'
  },
  {
    id: 'AUD-902',
    timestamp: '2026-08-19T22:15:00Z',
    actorName: 'System',
    actorRole: 'System',
    action: 'CREATE_TRANSACTION',
    entityType: 'Transaction',
    entityId: 'INV-2023-389',
    description: 'System flagged INV-2023-389 as OVERDUE (+18 days past due date)'
  },
  {
    id: 'AUD-903',
    timestamp: '2026-08-19T14:30:00Z',
    actorName: 'Alex M.',
    actorRole: 'Collector',
    action: 'SCHEDULE_FOLLOWUP',
    entityType: 'FollowUp',
    entityId: 'FU-101',
    description: 'Scheduled follow-up call with Sarah (Acme Corp) for Aug 21, 10:00 AM'
  },
  {
    id: 'AUD-904',
    timestamp: '2026-08-18T11:00:00Z',
    actorName: 'Jane Doe',
    actorRole: 'Collector',
    action: 'CREATE_TRANSACTION',
    entityType: 'Transaction',
    entityId: 'INV-2023-0915',
    description: 'Created new invoice INV-2023-0915 (₹1,05,000.00) for Wayne Enterprises'
  },
  {
    id: 'AUD-905',
    timestamp: '2026-08-10T15:00:00Z',
    actorName: 'Sarah Jenkins',
    actorRole: 'Admin',
    action: 'RECORD_PAYMENT',
    entityType: 'Payment',
    entityId: 'PAY-8819',
    description: 'Recorded full wire payment of ₹1,20,000.00 for INV-2023-312 (Acme Corp)'
  }
];

export const initialSettings: BusinessSettings = {
  companyName: 'SSE Tracker Corp',
  legalName: 'SSE Receivables & Ledger Solutions Ltd.',
  businessEmail: 'receivables@ssetracker.io',
  businessPhone: '+91 800-555-0199',
  address: '200 Financial Tower, Nariman Point, Mumbai 400021',
  currencySymbol: '₹',
  currencyCode: 'INR',
  defaultNetTermsDays: 30,
  invoicePrefix: 'INV-2026-',
  overpaymentHandling: 'STRICT_BLOCK',
  timezone: 'Asia/Kolkata (IST)',
  dateFormat: 'DD/MM/YYYY'
};
