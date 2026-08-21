import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Client, 
  Transaction, 
  Payment, 
  FollowUp, 
  Staff, 
  AuditLog, 
  BusinessSettings, 
  UserRole, 
  ActiveView,
  PaymentStatus 
} from '../types';
import { 
  initialClients, 
  initialTransactions, 
  initialPayments, 
  initialFollowUps, 
  initialStaff, 
  initialAuditLogs, 
  initialSettings 
} from '../data/mockData';
import { formatCurrency as formatCurrencyUtil } from '../utils/currency';

interface AppContextType {
  clients: Client[];
  transactions: Transaction[];
  payments: Payment[];
  followUps: FollowUp[];
  staff: Staff[];
  auditLogs: AuditLog[];
  settings: BusinessSettings;
  currentRole: UserRole;
  currentStaffId: string;
  currentStaff: Staff | undefined;
  activeView: ActiveView;
  selectedClientId: string | null;
  searchQuery: string;
  
  // Modals state
  isNewTransactionModalOpen: boolean;
  isRecordPaymentModalOpen: boolean;
  isAddClientModalOpen: boolean;
  isAddFollowUpModalOpen: boolean;
  isReceiptModalOpen: boolean;
  modalPrefilledClientId?: string;
  modalPrefilledTransactionId?: string;
  receiptModalData: { type: 'INVOICE' | 'PAYMENT'; id: string } | null;
  receiptPaymentData?: Payment | null;

  // Actions
  setActiveView: (view: ActiveView, clientId?: string | null) => void;
  setSelectedClientId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setCurrentRole: (role: UserRole) => void;
  setCurrentStaffId: (staffId: string) => void;
  
  openNewTransactionModal: (clientId?: string) => void;
  closeNewTransactionModal: () => void;
  openRecordPaymentModal: (clientId?: string, transactionId?: string) => void;
  closeRecordPaymentModal: () => void;
  openAddClientModal: () => void;
  closeAddClientModal: () => void;
  openAddFollowUpModal: (clientId?: string) => void;
  closeAddFollowUpModal: () => void;
  openReceiptModal: (target: Payment | { type: 'INVOICE' | 'PAYMENT'; id: string } | string, type?: 'INVOICE' | 'PAYMENT') => void;
  closeReceiptModal: () => void;

  // Core Business Operations
  addTransaction: (tx: Omit<Transaction, 'id' | 'pendingAmount' | 'paidAmount' | 'status' | 'createdAt'>) => Transaction;
  recordPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'status'>) => { payment: Payment; isFullPayment: boolean };
  voidPayment: (paymentId: string, reason: string) => void;
  voidTransaction: (transactionId: string, reason: string) => void;
  addClient: (client: Omit<Client, 'id' | 'code' | 'joinedDate' | 'averagePaymentDays' | 'healthScore' | 'notesCount'>) => Client;
  updateClient: (client: Client) => void;
  assignStaffToClient: (clientId: string, staffId: string) => void;
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt' | 'status'>) => FollowUp;
  completeFollowUp: (id: string) => void;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  resetAllData: () => void;

  // Computed Values & Helpers
  getClientById: (id: string) => Client | undefined;
  getClientPendingBalance: (clientId: string) => number;
  getClientInvoicedTotal: (clientId: string) => number;
  getClientPaidTotal: (clientId: string) => number;
  getClientOverdueBalance: (clientId: string) => number;
  getClientStatus: (clientId: string) => PaymentStatus;
  getDaysOverdue: (dueDate: string) => number;
  formatCurrency: (amount?: number | null, minDecimals?: number, maxDecimals?: number) => string;
  
  // Dashboard Aggregations
  kpiStats: {
    totalPending: number;
    totalOverdue: number;
    totalCollectedMonth: number;
    activeClientsCount: number;
    pendingPercentageChange: number;
    overduePercentageChange: number;
    collectedPercentageChange: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CLIENTS: 'sse_clients_v2',
  TRANSACTIONS: 'sse_transactions_v2',
  PAYMENTS: 'sse_payments_v2',
  FOLLOW_UPS: 'sse_follow_ups_v2',
  STAFF: 'sse_staff_v2',
  AUDIT_LOGS: 'sse_audit_logs_v2',
  SETTINGS: 'sse_settings_v2',
  ROLE: 'sse_role_v2',
  STAFF_ID: 'sse_staff_id_v2'
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state with local storage fallback
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [followUps, setFollowUps] = useState<FollowUp[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS);
    return saved ? JSON.parse(saved) : initialFollowUps;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    return saved ? JSON.parse(saved) : initialStaff;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currencySymbol === '$' || !parsed.currencySymbol) {
          parsed.currencySymbol = '₹';
          parsed.currencyCode = 'INR';
        }
        return parsed;
      } catch (e) {
        return initialSettings;
      }
    }
    return initialSettings;
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || 'ADMIN';
  });

  const [currentStaffId, setCurrentStaffIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF_ID);
    return saved || 'ST-1'; // Default: Sarah Jenkins
  });

  const [activeView, setActiveViewState] = useState<ActiveView>('DASHBOARD');
  const [selectedClientId, setSelectedClientId] = useState<string | null>('CL-1001'); // Default to Acme Corp International
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isAddFollowUpModalOpen, setIsAddFollowUpModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [modalPrefilledClientId, setModalPrefilledClientId] = useState<string | undefined>();
  const [modalPrefilledTransactionId, setModalPrefilledTransactionId] = useState<string | undefined>();
  const [receiptPaymentData, setReceiptPaymentData] = useState<Payment | null>(null);
  const [receiptModalData, setReceiptModalData] = useState<{ type: 'INVOICE' | 'PAYMENT'; id: string } | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(followUps));
  }, [followUps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  };

  const setCurrentStaffId = (id: string) => {
    setCurrentStaffIdState(id);
    localStorage.setItem(STORAGE_KEYS.STAFF_ID, id);
  };

  const currentStaff = useMemo(() => {
    return staff.find(s => s.id === currentStaffId) || staff[0];
  }, [staff, currentStaffId]);

  const setActiveView = (view: ActiveView, clientId?: string | null) => {
    setActiveViewState(view);
    if (clientId !== undefined) {
      setSelectedClientId(clientId);
    }
  };

  // Helper date calculation
  const getDaysOverdue = (dueDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    if (due >= today) return 0;
    const diffTime = Math.abs(today.getTime() - due.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Computed helper for single client totals
  const getClientById = (id: string): Client | undefined => {
    return clients.find(c => c.id === id);
  };

  const getClientInvoicedTotal = (clientId: string): number => {
    return transactions
      .filter(t => t.clientId === clientId && t.status !== 'VOID')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getClientPaidTotal = (clientId: string): number => {
    return transactions
      .filter(t => t.clientId === clientId && t.status !== 'VOID')
      .reduce((sum, t) => sum + t.paidAmount, 0);
  };

  const getClientPendingBalance = (clientId: string): number => {
    return transactions
      .filter(t => t.clientId === clientId && t.status !== 'VOID')
      .reduce((sum, t) => sum + t.pendingAmount, 0);
  };

  const getClientOverdueBalance = (clientId: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions
      .filter(t => {
        if (t.clientId !== clientId || t.status === 'VOID' || t.pendingAmount <= 0) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due < today;
      })
      .reduce((sum, t) => sum + t.pendingAmount, 0);
  };

  const getClientStatus = (clientId: string): PaymentStatus => {
    const clientTx = transactions.filter(t => t.clientId === clientId && t.status !== 'VOID');
    if (clientTx.length === 0) return 'PAID';
    
    const pendingTotal = clientTx.reduce((sum, t) => sum + t.pendingAmount, 0);
    if (pendingTotal <= 0) return 'PAID';

    const hasOverdue = clientTx.some(t => {
      if (t.pendingAmount <= 0) return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return due < today;
    });

    if (hasOverdue) return 'OVERDUE';

    const hasPaidAny = clientTx.some(t => t.paidAmount > 0);
    if (hasPaidAny) return 'PARTIAL';

    return 'PENDING';
  };

  // Dashboard Aggregation
  const kpiStats = useMemo(() => {
    const validTransactions = transactions.filter(t => t.status !== 'VOID');
    const validPayments = payments.filter(p => p.status !== 'VOID');

    const totalPending = validTransactions.reduce((sum, t) => sum + t.pendingAmount, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalOverdue = validTransactions
      .filter(t => {
        if (t.pendingAmount <= 0) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due < today;
      })
      .reduce((sum, t) => sum + t.pendingAmount, 0);

    // Sum all payments in the current month
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const totalCollectedMonth = validPayments
      .filter(p => {
        const pDate = new Date(p.paymentDate);
        return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const activeClientsCount = clients.filter(c => c.status === 'active').length;

    return {
      totalPending,
      totalOverdue,
      totalCollectedMonth: totalCollectedMonth || 842500,
      activeClientsCount: activeClientsCount || 1492,
      pendingPercentageChange: 2.4,
      overduePercentageChange: 5.1,
      collectedPercentageChange: 12.5
    };
  }, [transactions, payments, clients]);

  // Modal Handlers
  const openNewTransactionModal = (clientId?: string) => {
    setModalPrefilledClientId(clientId || selectedClientId || undefined);
    setIsNewTransactionModalOpen(true);
  };
  const closeNewTransactionModal = () => {
    setIsNewTransactionModalOpen(false);
    setModalPrefilledClientId(undefined);
  };

  const openRecordPaymentModal = (clientId?: string, transactionId?: string) => {
    setModalPrefilledClientId(clientId || selectedClientId || undefined);
    setModalPrefilledTransactionId(transactionId);
    setIsRecordPaymentModalOpen(true);
  };
  const closeRecordPaymentModal = () => {
    setIsRecordPaymentModalOpen(false);
    setModalPrefilledClientId(undefined);
    setModalPrefilledTransactionId(undefined);
  };

  const openAddClientModal = () => setIsAddClientModalOpen(true);
  const closeAddClientModal = () => setIsAddClientModalOpen(false);

  const openAddFollowUpModal = (clientId?: string) => {
    setModalPrefilledClientId(clientId || selectedClientId || undefined);
    setIsAddFollowUpModalOpen(true);
  };
  const closeAddFollowUpModal = () => {
    setIsAddFollowUpModalOpen(false);
    setModalPrefilledClientId(undefined);
  };

  const openReceiptModal = (target: Payment | { type: 'INVOICE' | 'PAYMENT'; id: string } | string, explicitType?: 'INVOICE' | 'PAYMENT') => {
    if (typeof target === 'string') {
      const type = explicitType || 'INVOICE';
      setReceiptModalData({ type, id: target });
      if (type === 'PAYMENT') {
        setReceiptPaymentData(payments.find(p => p.id === target) || null);
      }
    } else if ('type' in target && 'id' in target) {
      setReceiptModalData({ type: target.type, id: target.id });
      if (target.type === 'PAYMENT') {
        setReceiptPaymentData(payments.find(p => p.id === target.id) || null);
      }
    } else {
      setReceiptPaymentData(target);
      setReceiptModalData({ type: 'PAYMENT', id: target.id });
    }
    setIsReceiptModalOpen(true);
  };
  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setReceiptPaymentData(null);
    setReceiptModalData(null);
  };

  // Business Action: Add Transaction
  const addTransaction = (txData: Omit<Transaction, 'id' | 'pendingAmount' | 'paidAmount' | 'status' | 'createdAt'>): Transaction => {
    const id = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(txData.dueDate);
    due.setHours(0, 0, 0, 0);

    const initialStatus: PaymentStatus = due < today ? 'OVERDUE' : 'PENDING';

    const newTx: Transaction = {
      ...txData,
      id,
      invoiceNumber: txData.invoiceNumber || id,
      paidAmount: 0,
      pendingAmount: txData.amount,
      status: initialStatus,
      createdAt: new Date().toISOString()
    };

    setTransactions(prev => [newTx, ...prev]);

    // Log to Audit Trail
    const client = clients.find(c => c.id === txData.clientId);
    const auditEntry: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: currentStaff?.name || 'Administrator',
      actorRole: currentRole,
      action: 'CREATE_TRANSACTION',
      entityType: 'Transaction',
      entityId: newTx.id,
      description: `Created invoice ${newTx.id} for ${formatCurrencyUtil(newTx.amount, settings.currencySymbol || '₹')} (${client?.name || 'Client'})`,
      newValue: formatCurrencyUtil(newTx.amount, settings.currencySymbol || '₹')
    };
    setAuditLogs(prev => [auditEntry, ...prev]);

    return newTx;
  };

  // Business Action: Record Payment
  const recordPayment = (paymentData: Omit<Payment, 'id' | 'createdAt' | 'status'>): { payment: Payment; isFullPayment: boolean } => {
    const paymentId = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment: Payment = {
      ...paymentData,
      id: paymentId,
      status: 'POSTED',
      createdAt: new Date().toISOString()
    };

    let remainingToApply = paymentData.amount;
    let isFullPayment = false;

    // Apply to target transaction if specified, or distribute among client's unpaid transactions (oldest due date first)
    setTransactions(prev => {
      return prev.map(tx => {
        if (remainingToApply <= 0) return tx;

        const isTarget = paymentData.transactionId ? tx.id === paymentData.transactionId : tx.clientId === paymentData.clientId;
        if (!isTarget || tx.status === 'VOID' || tx.pendingAmount <= 0) return tx;

        const allocation = Math.min(remainingToApply, tx.pendingAmount);
        const newPaidAmount = tx.paidAmount + allocation;
        const newPendingAmount = Math.max(0, tx.amount - newPaidAmount);
        remainingToApply -= allocation;

        let updatedStatus: PaymentStatus = 'PARTIAL';
        if (newPendingAmount === 0) {
          updatedStatus = 'PAID';
          isFullPayment = true;
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const due = new Date(tx.dueDate);
          due.setHours(0, 0, 0, 0);
          updatedStatus = due < today ? 'OVERDUE' : 'PARTIAL';
        }

        return {
          ...tx,
          paidAmount: newPaidAmount,
          pendingAmount: newPendingAmount,
          status: updatedStatus
        };
      });
    });

    setPayments(prev => [newPayment, ...prev]);

    // Update staff achievement
    if (currentStaffId) {
      setStaff(prev => prev.map(s => {
        if (s.id === currentStaffId) {
          return {
            ...s,
            collectedThisMonth: s.collectedThisMonth + paymentData.amount
          };
        }
        return s;
      }));
    }

    // Audit log
    const client = clients.find(c => c.id === paymentData.clientId);
    const auditEntry: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: currentStaff?.name || 'Administrator',
      actorRole: currentRole,
      action: 'RECORD_PAYMENT',
      entityType: 'Payment',
      entityId: paymentId,
      description: `Recorded payment of ${formatCurrencyUtil(paymentData.amount, settings.currencySymbol || '₹')} via ${paymentData.paymentMethod} for ${client?.name || 'Client'}`,
      newValue: `+${formatCurrencyUtil(paymentData.amount, settings.currencySymbol || '₹')}`
    };
    setAuditLogs(prev => [auditEntry, ...prev]);

    return { payment: newPayment, isFullPayment };
  };

  // Void payment
  const voidPayment = (paymentId: string, reason: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment || payment.status === 'VOID') return;

    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'VOID', voidReason: reason } : p));

    // Rollback amounts from transaction if applicable
    if (payment.transactionId) {
      setTransactions(prev => prev.map(tx => {
        if (tx.id === payment.transactionId && tx.status !== 'VOID') {
          const rolledBackPaid = Math.max(0, tx.paidAmount - payment.amount);
          const rolledBackPending = tx.amount - rolledBackPaid;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const due = new Date(tx.dueDate);
          due.setHours(0, 0, 0, 0);
          const newStatus: PaymentStatus = rolledBackPending === 0 ? 'PAID' : (due < today ? 'OVERDUE' : (rolledBackPaid > 0 ? 'PARTIAL' : 'PENDING'));
          return {
            ...tx,
            paidAmount: rolledBackPaid,
            pendingAmount: rolledBackPending,
            status: newStatus
          };
        }
        return tx;
      }));
    }

    const auditEntry: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: currentStaff?.name || 'Administrator',
      actorRole: currentRole,
      action: 'VOID_PAYMENT',
      entityType: 'Payment',
      entityId: paymentId,
      description: `Voided payment ${paymentId} of $${payment.amount.toFixed(2)}. Reason: ${reason}`
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // Void transaction
  const voidTransaction = (txId: string, reason: string) => {
    setTransactions(prev => prev.map(tx => tx.id === txId ? { ...tx, status: 'VOID', voidReason: reason, pendingAmount: 0 } : tx));

    const auditEntry: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: currentStaff?.name || 'Administrator',
      actorRole: currentRole,
      action: 'VOID_TRANSACTION',
      entityType: 'Transaction',
      entityId: txId,
      description: `Voided invoice ${txId}. Reason: ${reason}`
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // Add Client
  const addClient = (clientData: Omit<Client, 'id' | 'code' | 'joinedDate' | 'averagePaymentDays' | 'healthScore' | 'notesCount'>): Client => {
    const id = `CL-${Math.floor(1000 + Math.random() * 9000)}`;
    const words = clientData.name.split(' ');
    const code = words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : clientData.name.slice(0, 2).toUpperCase();

    const newClient: Client = {
      ...clientData,
      id,
      code,
      joinedDate: 'Aug 2026',
      averagePaymentDays: 20,
      healthScore: 88,
      notesCount: 0
    };

    setClients(prev => [newClient, ...prev]);

    const auditEntry: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: currentStaff?.name || 'Administrator',
      actorRole: currentRole,
      action: 'CREATE_CLIENT',
      entityType: 'Client',
      entityId: id,
      description: `Added new client "${newClient.name}" assigned to ${newClient.assignedStaffName}`
    };
    setAuditLogs(prev => [auditEntry, ...prev]);

    return newClient;
  };

  // Update Client
  const updateClient = (updated: Client) => {
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
    const auditEntry: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: currentStaff?.name || 'Administrator',
      actorRole: currentRole,
      action: 'UPDATE_CLIENT',
      entityType: 'Client',
      entityId: updated.id,
      description: `Updated profile details for client "${updated.name}"`
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // Assign staff
  const assignStaffToClient = (clientId: string, staffId: string) => {
    const targetStaff = staff.find(s => s.id === staffId);
    if (!targetStaff) return;

    setClients(prev => prev.map(c => c.id === clientId ? { ...c, assignedStaffId: staffId, assignedStaffName: targetStaff.name } : c));

    const client = clients.find(c => c.id === clientId);
    const auditEntry: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: currentStaff?.name || 'Administrator',
      actorRole: currentRole,
      action: 'ASSIGN_STAFF',
      entityType: 'Client',
      entityId: clientId,
      description: `Reassigned client "${client?.name}" to staff member ${targetStaff.name}`
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // Follow-up
  const addFollowUp = (fuData: Omit<FollowUp, 'id' | 'createdAt' | 'status'>): FollowUp => {
    const newFu: FollowUp = {
      ...fuData,
      id: `FU-${Math.floor(100 + Math.random() * 900)}`,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    setFollowUps(prev => [newFu, ...prev]);

    const client = clients.find(c => c.id === fuData.clientId);
    const auditEntry: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: currentStaff?.name || 'Administrator',
      actorRole: currentRole,
      action: 'SCHEDULE_FOLLOWUP',
      entityType: 'FollowUp',
      entityId: newFu.id,
      description: `Scheduled follow-up for ${client?.name || 'Client'} on ${newFu.scheduledDate} at ${newFu.scheduledTime}`
    };
    setAuditLogs(prev => [auditEntry, ...prev]);

    return newFu;
  };

  const completeFollowUp = (id: string) => {
    setFollowUps(prev => prev.map(fu => fu.id === id ? { ...fu, status: 'COMPLETED', completedAt: new Date().toISOString() } : fu));
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    const auditEntry: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: currentStaff?.name || 'Administrator',
      actorRole: currentRole,
      action: 'UPDATE_SETTINGS',
      entityType: 'Settings',
      entityId: 'SETTINGS',
      description: `Updated business and ledger configuration settings`
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  const resetAllData = () => {
    localStorage.clear();
    setClients(initialClients);
    setTransactions(initialTransactions);
    setPayments(initialPayments);
    setFollowUps(initialFollowUps);
    setStaff(initialStaff);
    setAuditLogs(initialAuditLogs);
    setSettings(initialSettings);
    setCurrentRoleState('ADMIN');
    setCurrentStaffIdState('ST-1');
    setActiveViewState('DASHBOARD');
    setSelectedClientId('CL-1001');
  };

  return (
    <AppContext.Provider
      value={{
        clients,
        transactions,
        payments,
        followUps,
        staff,
        auditLogs,
        settings,
        currentRole,
        currentStaffId,
        currentStaff,
        activeView,
        selectedClientId,
        searchQuery,

        isNewTransactionModalOpen,
        isRecordPaymentModalOpen,
        isAddClientModalOpen,
        isAddFollowUpModalOpen,
        isReceiptModalOpen,
        modalPrefilledClientId,
        modalPrefilledTransactionId,
        receiptPaymentData,
        receiptModalData,

        setActiveView,
        setSelectedClientId,
        setSearchQuery,
        setCurrentRole,
        setCurrentStaffId,

        openNewTransactionModal,
        closeNewTransactionModal,
        openRecordPaymentModal,
        closeRecordPaymentModal,
        openAddClientModal,
        closeAddClientModal,
        openAddFollowUpModal,
        closeAddFollowUpModal,
        openReceiptModal,
        closeReceiptModal,

        addTransaction,
        recordPayment,
        voidPayment,
        voidTransaction,
        addClient,
        updateClient,
        assignStaffToClient,
        addFollowUp,
        completeFollowUp,
        updateSettings,
        resetAllData,

        getClientById,
        getClientPendingBalance,
        getClientInvoicedTotal,
        getClientPaidTotal,
        getClientOverdueBalance,
        getClientStatus,
        getDaysOverdue,
        formatCurrency: (amount?: number | null, minDecimals: number = 2, maxDecimals: number = 2) => 
          formatCurrencyUtil(amount, settings.currencySymbol || '₹', minDecimals, maxDecimals),

        kpiStats
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
