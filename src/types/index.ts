export type PaymentStatus = 'PENDING' | 'OVERDUE' | 'PAID' | 'PARTIAL' | 'VOID';

export type PaymentMethod = 
  | 'Bank Transfer' 
  | 'Credit Card' 
  | 'Cash' 
  | 'Check' 
  | 'Stripe' 
  | 'ACH' 
  | 'Wire';

export type FollowUpPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export type UserRole = 'ADMIN' | 'STAFF' | 'SUPER_ADMIN';

export type ActiveView = 
  | 'DASHBOARD' 
  | 'CLIENTS' 
  | 'CLIENT_PROFILE' 
  | 'PENDING_QUEUE' 
  | 'REPORTS' 
  | 'STAFF_MANAGEMENT' 
  | 'AUDIT_LOGS' 
  | 'SETTINGS';

export interface Client {
  id: string; // e.g. "CL-2948"
  name: string;
  code: string; // e.g. "AC"
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  industry: string;
  assignedStaffId: string;
  assignedStaffName: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  creditLimit?: number;
  averagePaymentDays: number;
  healthScore: number; // 0 - 100
  notesCount: number;
}

export interface Transaction {
  id: string; // e.g. "INV-2023-401"
  clientId: string;
  invoiceNumber: string;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  description: string;
  category?: string;
  status: PaymentStatus;
  createdBy: string;
  createdAt: string;
  voidReason?: string;
}

export interface Payment {
  id: string; // e.g. "PAY-8821"
  transactionId?: string;
  clientId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  notes?: string;
  recordedBy: string;
  status: 'POSTED' | 'VOID';
  createdAt: string;
  voidReason?: string;
}

export interface FollowUp {
  id: string;
  clientId: string;
  scheduledDate: string;
  scheduledTime: string;
  note: string;
  priority: FollowUpPriority;
  status: FollowUpStatus;
  assignedTo: string;
  assignedStaffName: string;
  createdAt: string;
  completedAt?: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Collector' | 'Manager';
  avatarColor: string;
  initials: string;
  activeClientsCount: number;
  totalAssignedPending: number;
  targetAmount: number;
  collectedThisMonth: number;
  status: 'active' | 'inactive';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: 
    | 'CREATE_TRANSACTION' 
    | 'RECORD_PAYMENT' 
    | 'VOID_PAYMENT' 
    | 'VOID_TRANSACTION' 
    | 'ASSIGN_STAFF' 
    | 'UPDATE_CLIENT' 
    | 'CREATE_CLIENT' 
    | 'SCHEDULE_FOLLOWUP'
    | 'COMPLETE_FOLLOWUP'
    | 'UPDATE_SETTINGS';
  entityType: 'Transaction' | 'Payment' | 'Client' | 'FollowUp' | 'Staff' | 'Settings';
  entityId: string;
  description: string;
  previousValue?: string;
  newValue?: string;
}

export interface BusinessSettings {
  companyName: string;
  legalName: string;
  businessEmail: string;
  businessPhone: string;
  address: string;
  currencySymbol: string;
  currencyCode: string;
  defaultNetTermsDays: number;
  invoicePrefix: string;
  overpaymentHandling: 'STRICT_BLOCK' | 'CREDIT_BALANCE';
  timezone: string;
  dateFormat: string;
}
