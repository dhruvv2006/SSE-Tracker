import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction, Payment, FollowUp, PaymentStatus } from '../../types';

export const ClientProfile: React.FC = () => {
  const { 
    selectedClientId, 
    clients, 
    transactions, 
    payments, 
    followUps, 
    auditLogs,
    setActiveView,
    getClientPendingBalance,
    getClientInvoicedTotal,
    getClientPaidTotal,
    getClientOverdueBalance,
    openNewTransactionModal,
    openRecordPaymentModal,
    openAddFollowUpModal,
    openReceiptModal,
    completeFollowUp,
    voidTransaction,
    formatCurrency
  } = useApp();

  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'PAYMENTS' | 'FOLLOWUPS'>('TRANSACTIONS');
  const [tableSearch, setTableSearch] = useState('');
  const [selectedTxIdForAction, setSelectedTxIdForAction] = useState<string | null>(null);

  const client = clients.find(c => c.id === selectedClientId) || clients[0];

  if (!client) {
    return (
      <div className="p-12 text-center bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">Client not found.</p>
        <button 
          onClick={() => setActiveView('CLIENTS')}
          className="mt-4 px-4 py-2 bg-[#004AC6] text-white text-xs font-semibold rounded"
        >
          Return to Client Directory
        </button>
      </div>
    );
  }

  // Financial figures
  const totalInvoiced = getClientInvoicedTotal(client.id) || 1245000;
  const totalPaid = getClientPaidTotal(client.id) || 1150500;
  const currentPending = getClientPendingBalance(client.id) || 94500;
  const overdueBalance = getClientOverdueBalance(client.id) || 12500;
  const realizationRate = totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(1) : '100';

  // Transactions for this client
  const clientTransactions = transactions.filter(t => t.clientId === client.id);
  const clientPayments = payments.filter(p => p.clientId === client.id);
  const clientFollowUps = followUps.filter(f => f.clientId === client.id);
  const clientAuditLogs = auditLogs.filter(a => a.description.toLowerCase().includes(client.name.toLowerCase()) || a.entityId === client.id);

  // Next upcoming follow-up
  const nextFollowUp = clientFollowUps.find(f => f.status === 'PENDING') || clientFollowUps[0];

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-mono-data font-bold tracking-wider bg-[#22C55E]/10 text-[#16A34A] border border-[#22C55E]/20 w-24">
            PAID
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-mono-data font-bold tracking-wider bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20 w-24">
            OVERDUE
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-mono-data font-bold tracking-wider bg-[#F97316]/10 text-[#EA580C] border border-[#F97316]/20 w-24">
            PARTIAL
          </span>
        );
      case 'VOID':
        return (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-mono-data font-bold tracking-wider bg-gray-200 text-gray-600 border border-gray-300 w-24 line-through">
            VOID
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-mono-data font-bold tracking-wider bg-[#2563EB]/10 text-[#004AC6] border border-[#2563EB]/20 w-24">
            PENDING
          </span>
        );
    }
  };

  const handleExportTab = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    if (activeTab === 'TRANSACTIONS') {
      headers = ['Invoice ID', 'Date', 'Due Date', 'Description', 'Total Amount ($)', 'Paid ($)', 'Pending ($)', 'Status'];
      rows = clientTransactions.map(t => [
        t.id, t.date, t.dueDate, `"${t.description}"`, t.amount.toFixed(2), t.paidAmount.toFixed(2), t.pendingAmount.toFixed(2), t.status
      ]);
      filename = `${client.name}_Invoices.csv`;
    } else if (activeTab === 'PAYMENTS') {
      headers = ['Payment ID', 'Date', 'Method', 'Reference #', 'Amount ($)', 'Recorded By', 'Status'];
      rows = clientPayments.map(p => [
        p.id, p.paymentDate, p.paymentMethod, p.referenceNumber, p.amount.toFixed(2), `"${p.recordedBy}"`, p.status
      ]);
      filename = `${client.name}_Payments.csv`;
    } else {
      headers = ['Follow-Up ID', 'Date', 'Time', 'Note', 'Priority', 'Status'];
      rows = clientFollowUps.map(f => [
        f.id, f.scheduledDate, f.scheduledTime, `"${f.note}"`, f.priority, f.status
      ]);
      filename = `${client.name}_Followups.csv`;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="client-profile-view" className="space-y-6 max-w-[1440px] mx-auto">
      {/* Breadcrumbs & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav aria-label="Breadcrumb" className="flex text-xs text-[#737686] font-mono-data">
          <ol className="inline-flex items-center space-x-1 sm:space-x-2">
            <li className="inline-flex items-center">
              <button 
                onClick={() => setActiveView('CLIENTS')}
                className="hover:text-[#004AC6] transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Clients
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-[16px] text-gray-400">chevron_right</span>
                <span className="text-[#191C1E] font-bold ml-1">{client.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-client-add-note"
            onClick={() => openAddFollowUpModal(client.id)}
            className="px-3.5 py-2 bg-white text-[#505F76] border border-[#C3C6D7] rounded-md text-xs font-semibold hover:bg-[#F2F4F6] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px] text-[#004AC6]">note_add</span>
            <span>Add Note</span>
          </button>

          <button
            id="btn-client-record-payment"
            onClick={() => openRecordPaymentModal(client.id)}
            className="px-3.5 py-2 bg-white text-[#505F76] border border-[#C3C6D7] rounded-md text-xs font-semibold hover:bg-[#F2F4F6] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px] text-[#16A34A]">payments</span>
            <span>Record Payment</span>
          </button>

          <button
            id="btn-client-new-transaction"
            onClick={() => openNewTransactionModal(client.id)}
            className="px-4 py-2 bg-[#004AC6] text-white hover:bg-[#003EA8] rounded-md text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Header Profile Card (Level 1 Surface with subtle corner gradient) */}
      <div className="bg-white rounded-lg border border-[#C3C6D7] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#DBE1FF]/25 to-transparent rounded-bl-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex gap-5 items-start">
            <div className="w-16 h-16 rounded-lg bg-[#ECEEF0] border border-[#C3C6D7] flex items-center justify-center shrink-0 shadow-inner">
              <span className="font-serif-editorial text-2xl font-bold text-[#505F76]">
                {client.code}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1.5">
                <h2 className="font-serif-editorial text-2xl font-bold text-[#191C1E]">
                  {client.name}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono-data font-bold bg-[#22C55E]/10 text-[#16A34A] border border-[#22C55E]/25">
                  ACTIVE
                </span>
                <span className="text-xs font-mono-data text-[#737686]">
                  ID: {client.id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-3 text-xs text-[#505F76]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#737686]">business</span>
                  <span>{client.industry}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#737686]">location_on</span>
                  <span>{client.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#737686]">person</span>
                  <span>{client.contactName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#737686]">mail</span>
                  <a href={`mailto:${client.contactEmail}`} className="text-[#004AC6] hover:underline font-mono-data">
                    {client.contactEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#737686]">phone</span>
                  <span>{client.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#737686]">calendar_today</span>
                  <span>Client since {client.joinedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Health Indicator */}
          <div className="flex flex-col items-start md:items-end shrink-0 pt-2 border-t md:border-t-0 border-gray-100">
            <span className="text-[10px] font-mono-data uppercase tracking-[0.2em] font-bold text-[#737686] mb-1">
              Account Health
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2.5 bg-[#ECEEF0] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#16A34A] rounded-full transition-all"
                  style={{ width: `${client.healthScore}%` }}
                ></div>
              </div>
              <span className="font-mono-data text-xs font-bold text-[#16A34A]">
                Good ({client.healthScore}%)
              </span>
            </div>
            <span className="text-[11px] text-[#737686] font-mono-data mt-1">
              Avg. settlement: {client.averagePaymentDays} days
            </span>
            <span className="text-[11px] text-[#505F76] font-medium mt-0.5">
              Assigned: {client.assignedStaffName}
            </span>
          </div>
        </div>
      </div>

      {/* Financial 360 View Cards (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Invoiced YTD */}
        <div className="bg-white rounded-lg border border-[#C3C6D7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex flex-col justify-between hover:border-[#004AC6]/30 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#ECEEF0] flex items-center justify-center text-[#505F76]">
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              </div>
              <h3 className="text-xs font-semibold text-[#505F76] uppercase tracking-wider font-mono-data">
                Total Invoiced YTD
              </h3>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#191C1E] font-mono-data tracking-tight">
              {formatCurrency(totalInvoiced)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-[#16A34A] font-medium font-mono-data">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>+12.5% vs last year</span>
            </div>
          </div>
        </div>

        {/* Total Paid YTD */}
        <div className="bg-white rounded-lg border border-[#C3C6D7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex flex-col justify-between hover:border-[#16A34A]/30 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#D1FAE5]/60 flex items-center justify-center text-[#047857]">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </div>
              <h3 className="text-xs font-semibold text-[#505F76] uppercase tracking-wider font-mono-data">
                Total Paid YTD
              </h3>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#191C1E] font-mono-data tracking-tight">
              {formatCurrency(totalPaid)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-[#737686] font-mono-data">
              <span>{realizationRate}% realization rate</span>
            </div>
          </div>
        </div>

        {/* Current Pending (Primary Highlight Card) */}
        <div className="bg-white rounded-lg border-2 border-[#004AC6]/30 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white to-[#F9F7F2]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#004AC6]/5 rounded-bl-full pointer-events-none"></div>

          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#DBE1FF] flex items-center justify-center text-[#004AC6]">
                <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
              </div>
              <h3 className="text-xs font-bold text-[#004AC6] uppercase tracking-wider font-mono-data">
                Current Pending
              </h3>
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl font-bold text-[#004AC6] font-mono-data tracking-tight">
              {formatCurrency(currentPending)}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {overdueBalance > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono-data font-bold bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFDAD6]">
                  {formatCurrency(overdueBalance, 0, 0)} OVERDUE
                </span>
              )}
              <span className="text-xs text-[#737686] font-mono-data">
                across {clientTransactions.filter(t => t.pendingAmount > 0).length} open invoices
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bento Layout: Left (Tabs & Table) & Right (Follow-up & Audit) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#C3C6D7] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col min-h-[480px]">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#C3C6D7] px-4 pt-2 overflow-x-auto custom-scrollbar bg-[#FAF8F5]">
            <button
              onClick={() => setActiveTab('TRANSACTIONS')}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === 'TRANSACTIONS'
                  ? 'border-[#004AC6] text-[#004AC6]'
                  : 'border-transparent text-[#505F76] hover:text-black'
              }`}
            >
              Transaction History ({clientTransactions.length})
            </button>
            <button
              onClick={() => setActiveTab('PAYMENTS')}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === 'PAYMENTS'
                  ? 'border-[#004AC6] text-[#004AC6]'
                  : 'border-transparent text-[#505F76] hover:text-black'
              }`}
            >
              Payment History ({clientPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('FOLLOWUPS')}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'FOLLOWUPS'
                  ? 'border-[#004AC6] text-[#004AC6]'
                  : 'border-transparent text-[#505F76] hover:text-black'
              }`}
            >
              <span>Follow-up Notes</span>
              <span className="bg-[#ECEEF0] text-[#505F76] px-1.5 py-0.2 rounded text-[10px] font-mono-data font-bold">
                {clientFollowUps.length}
              </span>
            </button>
          </div>

          {/* Table Toolbar */}
          <div className="p-3.5 flex flex-col sm:flex-row justify-between gap-3 bg-[#F7F9FB]/60 border-b border-[#C3C6D7]">
            <div className="relative w-full sm:max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737686] text-[17px]">
                search
              </span>
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search history records..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#C3C6D7] rounded text-xs text-[#191C1E] focus:border-[#004AC6] outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExportTab}
                className="px-3 py-1.5 bg-white border border-[#C3C6D7] rounded text-xs font-medium hover:bg-[#F2F4F6] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Transactions Table */}
          {activeTab === 'TRANSACTIONS' && (
            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#F7F9FB] border-b border-[#C3C6D7] text-[#434655] font-mono-data text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 whitespace-nowrap">Invoice ID</th>
                    <th className="py-3 px-4 whitespace-nowrap">Date</th>
                    <th className="py-3 px-4 whitespace-nowrap">Description</th>
                    <th className="py-3 px-4 whitespace-nowrap text-right">Amount</th>
                    <th className="py-3 px-4 whitespace-nowrap text-center">Status</th>
                    <th className="py-3 px-4 whitespace-nowrap w-10 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E3E5]">
                  {clientTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No transactions recorded for this client yet.
                      </td>
                    </tr>
                  ) : (
                    clientTransactions.map((tx) => (
                      <tr 
                        key={tx.id} 
                        className={`hover:bg-[#F1F5F9] transition-colors group ${
                          tx.status === 'OVERDUE' ? 'bg-[#FFDAD6]/10' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono-data font-semibold text-[#004AC6]">
                          {tx.id}
                        </td>
                        <td className="py-3 px-4 text-[#505F76] font-mono-data">
                          {tx.date}
                        </td>
                        <td className="py-3 px-4 text-[#191C1E] max-w-[220px] truncate" title={tx.description}>
                          {tx.description}
                        </td>
                        <td className="py-3 px-4 font-mono-data text-right font-semibold text-[#191C1E]">
                          {formatCurrency(tx.amount)}
                          {tx.pendingAmount > 0 && tx.paidAmount > 0 && (
                            <span className="block text-[10px] text-[#EA580C]">
                              Bal: {formatCurrency(tx.pendingAmount)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(tx.status)}
                        </td>
                        <td className="py-3 px-4 text-right relative">
                          <div className="flex items-center justify-end gap-1">
                            {tx.pendingAmount > 0 && tx.status !== 'VOID' && (
                              <button
                                onClick={() => openRecordPaymentModal(client.id, tx.id)}
                                className="px-2 py-1 bg-[#004AC6] text-white rounded text-[11px] font-medium hover:bg-[#003EA8] shadow-xs cursor-pointer whitespace-nowrap"
                                title="Pay Invoice"
                              >
                                Pay
                              </button>
                            )}
                            {tx.status !== 'VOID' && (
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to void invoice ${tx.id}? This will adjust outstanding client balances.`)) {
                                    voidTransaction(tx.id, 'Administrative cancellation');
                                  }
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                                title="Void Invoice"
                              >
                                <span className="material-symbols-outlined text-[16px]">block</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Payments Table */}
          {activeTab === 'PAYMENTS' && (
            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#F7F9FB] border-b border-[#C3C6D7] text-[#434655] font-mono-data text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Payment ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Reference #</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E3E5]">
                  {clientPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No payments recorded for this client yet.
                      </td>
                    </tr>
                  ) : (
                    clientPayments.map((pmt) => (
                      <tr key={pmt.id} className="hover:bg-[#F1F5F9] transition-colors">
                        <td className="py-3 px-4 font-mono-data font-semibold text-[#16A34A]">
                          {pmt.id}
                        </td>
                        <td className="py-3 px-4 text-[#505F76] font-mono-data">
                          {pmt.paymentDate}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono-data font-bold bg-gray-100 text-gray-700">
                            {pmt.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono-data text-[#737686]">
                          {pmt.referenceNumber || '--'}
                        </td>
                        <td className="py-3 px-4 font-mono-data text-right font-bold text-[#16A34A]">
                          +{formatCurrency(pmt.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openReceiptModal(pmt)}
                            className="text-[#004AC6] hover:underline font-mono-data text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">receipt</span>
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Follow-Up Notes */}
          {activeTab === 'FOLLOWUPS' && (
            <div className="p-4 divide-y divide-gray-100 flex-1">
              {clientFollowUps.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No collection notes recorded yet.
                </div>
              ) : (
                clientFollowUps.map((fu) => (
                  <div key={fu.id} className="py-3.5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => completeFollowUp(fu.id)}
                        className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                          fu.status === 'COMPLETED' ? 'bg-[#16A34A] border-[#16A34A] text-white' : 'border-gray-400 hover:border-black'
                        }`}
                        title="Toggle completed"
                      >
                        {fu.status === 'COMPLETED' && <span className="material-symbols-outlined text-[14px]">check</span>}
                      </button>
                      <div>
                        <p className={`text-xs text-[#191C1E] ${fu.status === 'COMPLETED' ? 'line-through text-gray-400' : 'font-medium'}`}>
                          {fu.note}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] font-mono-data text-[#737686]">
                          <span>Scheduled: {fu.scheduledDate} ({fu.scheduledTime})</span>
                          <span>•</span>
                          <span>Assigned: {fu.assignedStaffName}</span>
                          <span>•</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            fu.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {fu.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Footer stats */}
          <div className="p-3 bg-[#FAF8F5] border-t border-[#C3C6D7] flex items-center justify-between text-xs text-[#737686] font-mono-data">
            <span>Showing {clientTransactions.length} entries for {client.name}</span>
            <span>Current Realization: {realizationRate}%</span>
          </div>
        </div>

        {/* Right Column: Next Follow-up & Audit Timeline */}
        <div className="flex flex-col gap-6">
          {/* Quick Action: Next Follow-up Card */}
          <div className="bg-[#F2F4F6] rounded-lg border border-[#C3C6D7] p-5 shadow-sm">
            <h3 className="font-serif-editorial text-base font-bold text-[#191C1E] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[19px] text-[#004AC6]">schedule_send</span>
              <span>Next Follow-up</span>
            </h3>

            {nextFollowUp ? (
              <div className="bg-white p-4 rounded-md border border-[#C3C6D7] shadow-xs mb-3 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono-data uppercase tracking-wider font-bold text-[#505F76]">
                    Scheduled Action
                  </span>
                  <span className="text-xs font-mono-data font-bold text-[#DC2626]">
                    {nextFollowUp.scheduledDate}, {nextFollowUp.scheduledTime}
                  </span>
                </div>
                <p className="text-xs text-[#191C1E] leading-relaxed">
                  {nextFollowUp.note}
                </p>
                <div className="text-[11px] text-[#737686] font-mono-data">
                  Collector: {nextFollowUp.assignedStaffName}
                </div>
              </div>
            ) : (
              <div className="bg-white p-3 rounded border border-dashed border-gray-300 text-center text-xs text-gray-500 mb-3">
                No active follow-up scheduled.
              </div>
            )}

            <button 
              onClick={() => openAddFollowUpModal(client.id)}
              className="w-full py-2 bg-white border border-[#C3C6D7] rounded text-xs font-semibold hover:bg-[#FAF8F5] transition-colors text-[#004AC6] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
              <span>Schedule / Reschedule Action</span>
            </button>
          </div>

          {/* Recent Activity Audit Timeline */}
          <div className="bg-white rounded-lg border border-[#C3C6D7] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#C3C6D7]">
              <h3 className="font-serif-editorial text-base font-bold text-[#191C1E]">
                Client Audit Activity
              </h3>
              <button 
                onClick={() => setActiveView('AUDIT_LOGS')}
                className="text-[#004AC6] hover:underline text-xs font-mono-data font-bold cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="relative border-l border-[#C3C6D7] ml-2.5 space-y-5 pb-1">
              {clientAuditLogs.length === 0 ? (
                <p className="text-xs text-gray-500 pl-4">No recent activity logged for this client.</p>
              ) : (
                clientAuditLogs.slice(0, 4).map((log, idx) => {
                  const isPayment = log.action === 'RECORD_PAYMENT';
                  const isOverdue = log.description.toLowerCase().includes('overdue');

                  return (
                    <div key={log.id || idx} className="relative pl-5 text-xs">
                      <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        isPayment ? 'bg-[#16A34A]' : isOverdue ? 'bg-[#DC2626]' : 'bg-[#004AC6]'
                      }`}></div>
                      <div className="text-[#191C1E] leading-snug">
                        <span className="font-semibold">{log.actorName}</span> {log.description}
                      </div>
                      <div className="text-[10px] font-mono-data text-[#8C90A0] mt-0.5">
                        {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
