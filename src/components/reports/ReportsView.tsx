import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';

export const ReportsView: React.FC = () => {
  const { 
    clients, 
    transactions, 
    payments, 
    staff,
    getClientPendingBalance,
    getClientOverdueBalance,
    getClientStatus,
    getDaysOverdue,
    formatCurrency,
    settings
  } = useApp();

  const currSym = settings.currencySymbol || '₹';

  const [reportType, setReportType] = useState<'AGING' | 'COLLECTIONS' | 'TRANSACTIONS' | 'STAFF'>('AGING');
  const [dateRange, setDateRange] = useState<'30_DAYS' | 'THIS_QUARTER' | 'YTD' | 'ALL'>('30_DAYS');
  const [filterStaffId, setFilterStaffId] = useState<string>('');

  // Aging buckets calculation
  const agingAnalysis = useMemo(() => {
    const validTx = transactions.filter(t => t.pendingAmount > 0 && t.status !== 'VOID');
    
    let current = 0;
    let days1_30 = 0;
    let days31_60 = 0;
    let days61_90 = 0;
    let days90Plus = 0;

    validTx.forEach(tx => {
      const overdue = getDaysOverdue(tx.dueDate);
      if (overdue === 0) current += tx.pendingAmount;
      else if (overdue <= 30) days1_30 += tx.pendingAmount;
      else if (overdue <= 60) days31_60 += tx.pendingAmount;
      else if (overdue <= 90) days61_90 += tx.pendingAmount;
      else days90Plus += tx.pendingAmount;
    });

    const total = current + days1_30 + days31_60 + days61_90 + days90Plus;

    return {
      current,
      days1_30,
      days31_60,
      days61_90,
      days90Plus,
      total
    };
  }, [transactions, getDaysOverdue]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportReportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === 'AGING') {
      headers = [`Aging Bracket`, `Amount (${currSym})`, `Percentage of Total`];
      const total = agingAnalysis.total || 1;
      rows = [
        ['Current (Not Due)', agingAnalysis.current.toFixed(2), `${((agingAnalysis.current / total) * 100).toFixed(1)}%`],
        ['1 - 30 Days Past Due', agingAnalysis.days1_30.toFixed(2), `${((agingAnalysis.days1_30 / total) * 100).toFixed(1)}%`],
        ['31 - 60 Days Past Due', agingAnalysis.days31_60.toFixed(2), `${((agingAnalysis.days1_30 / total) * 100).toFixed(1)}%`],
        ['61 - 90 Days Past Due', agingAnalysis.days61_90.toFixed(2), `${((agingAnalysis.days61_90 / total) * 100).toFixed(1)}%`],
        ['90+ Days Past Due', agingAnalysis.days90Plus.toFixed(2), `${((agingAnalysis.days90Plus / total) * 100).toFixed(1)}%`]
      ];
    } else if (reportType === 'COLLECTIONS') {
      headers = ['Payment ID', 'Date', 'Client', 'Method', 'Reference #', `Amount (${currSym})`, 'Recorded By'];
      rows = payments.filter(p => p.status !== 'VOID').map(p => {
        const client = clients.find(c => c.id === p.clientId);
        return [
          p.id, p.paymentDate, `"${client?.name || 'Client'}"`, p.paymentMethod, p.referenceNumber, p.amount.toFixed(2), `"${p.recordedBy}"`
        ];
      });
    } else if (reportType === 'STAFF') {
      headers = ['Agent Name', 'Active Clients', `Assigned Pending (${currSym})`, `Monthly Target (${currSym})`, `Collected (${currSym})`, 'Achievement %'];
      rows = staff.map(s => [
        `"${s.name}"`, s.activeClientsCount.toString(), s.totalAssignedPending.toFixed(2), s.targetAmount.toFixed(2), s.collectedThisMonth.toFixed(2), `${Math.round((s.collectedThisMonth / s.targetAmount) * 100)}%`
      ]);
    } else {
      headers = ['Invoice ID', 'Date', 'Due Date', 'Client', `Amount (${currSym})`, `Paid (${currSym})`, `Pending (${currSym})`, 'Status'];
      rows = transactions.filter(t => t.status !== 'VOID').map(t => {
        const client = clients.find(c => c.id === t.clientId);
        return [
          t.id, t.date, t.dueDate, `"${client?.name || 'Client'}"`, t.amount.toFixed(2), t.paidAmount.toFixed(2), t.pendingAmount.toFixed(2), t.status
        ];
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SSE_Report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="reports-view" className="space-y-6 max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono-data uppercase tracking-[0.25em] font-bold text-[#737686]">
              Financial Intelligence
            </span>
          </div>
          <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#191C1E] tracking-tight">
            Financial & Receivables Reports
          </h2>
          <p className="text-xs sm:text-sm text-[#737686] mt-0.5">
            Audit-ready aging schedules, payment reconciliation, and staff performance reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white text-[#505F76] border border-[#C3C6D7] rounded-md text-xs font-semibold hover:bg-[#F2F4F6] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">print</span>
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportReportCSV}
            className="px-4 py-2 bg-[#004AC6] text-white hover:bg-[#003EA8] rounded-md text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Report Type & Range */}
      <div className="bg-white border border-[#1A1A1E]/15 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Report Types Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: 'AGING', label: 'Aging Schedule', icon: 'timelapse' },
            { id: 'COLLECTIONS', label: 'Collections Stream', icon: 'payments' },
            { id: 'TRANSACTIONS', label: 'Invoices & Ledger', icon: 'receipt_long' },
            { id: 'STAFF', label: 'Staff Attribution', icon: 'badge' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                reportType === tab.id
                  ? 'bg-[#1A1A1E] text-white shadow-xs'
                  : 'bg-[#F7F9FB] text-[#505F76] hover:bg-[#ECEEF0]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs font-mono-data text-[#737686]">Period:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="bg-[#F7F9FB] border border-[#C3C6D7] rounded px-3 py-1.5 text-xs font-mono-data text-[#191C1E] focus:outline-none cursor-pointer"
          >
            <option value="30_DAYS">Last 30 Days</option>
            <option value="THIS_QUARTER">Current Quarter (Q3)</option>
            <option value="YTD">Year to Date (2026)</option>
            <option value="ALL">All Recorded History</option>
          </select>
        </div>
      </div>

      {/* Dynamic Content based on Report Type */}
      {reportType === 'AGING' && (
        <div className="space-y-6">
          {/* Aging Buckets Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-lg border border-[#C3C6D7] shadow-xs">
              <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#737686] block mb-1">
                Current (Not Due)
              </span>
              <div className="font-mono-data text-lg font-bold text-[#16A34A]">
                {formatCurrency(agingAnalysis.current)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#C3C6D7] shadow-xs">
              <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#737686] block mb-1">
                1 - 30 Days
              </span>
              <div className="font-mono-data text-lg font-bold text-[#EA580C]">
                {formatCurrency(agingAnalysis.days1_30)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#C3C6D7] shadow-xs">
              <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#737686] block mb-1">
                31 - 60 Days
              </span>
              <div className="font-mono-data text-lg font-bold text-[#DC2626]">
                {formatCurrency(agingAnalysis.days31_60)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#C3C6D7] shadow-xs">
              <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#737686] block mb-1">
                61 - 90 Days
              </span>
              <div className="font-mono-data text-lg font-bold text-[#991B1B]">
                {formatCurrency(agingAnalysis.days61_90)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#C3C6D7] shadow-xs">
              <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#737686] block mb-1">
                90+ Days
              </span>
              <div className="font-mono-data text-lg font-bold text-[#7F1D1D]">
                {formatCurrency(agingAnalysis.days90Plus)}
              </div>
            </div>

            <div className="bg-[#1A1A1E] text-white p-4 rounded-lg border border-black shadow-xs">
              <span className="text-[10px] font-mono-data uppercase tracking-wider text-gray-400 block mb-1">
                Total Outstanding
              </span>
              <div className="font-mono-data text-lg font-bold text-[#93C5FD]">
                {formatCurrency(agingAnalysis.total)}
              </div>
            </div>
          </div>

          {/* Aging Table Breakdown by Client */}
          <div className="bg-white border border-[#1A1A1E]/15 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-4 border-b border-[#C3C6D7] bg-[#FAF8F5]">
              <h3 className="font-serif-editorial text-lg font-bold text-[#191C1E]">
                Client Receivables Aging Matrix
              </h3>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#F7F9FB] border-b border-[#C3C6D7] text-[#434655] font-mono-data text-[10px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Assigned Agent</th>
                    <th className="py-3 px-4 text-right">Current</th>
                    <th className="py-3 px-4 text-right">1-30 Days</th>
                    <th className="py-3 px-4 text-right">31-60 Days</th>
                    <th className="py-3 px-4 text-right">61+ Days</th>
                    <th className="py-3 px-4 text-right font-bold">Total Pending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E3E5]">
                  {clients.map(client => {
                    const clientTx = transactions.filter(t => t.clientId === client.id && t.status !== 'VOID' && t.pendingAmount > 0);
                    if (clientTx.length === 0) return null;

                    let cCurrent = 0;
                    let c1_30 = 0;
                    let c31_60 = 0;
                    let c61Plus = 0;

                    clientTx.forEach(t => {
                      const d = getDaysOverdue(t.dueDate);
                      if (d === 0) cCurrent += t.pendingAmount;
                      else if (d <= 30) c1_30 += t.pendingAmount;
                      else if (d <= 60) c31_60 += t.pendingAmount;
                      else c61Plus += t.pendingAmount;
                    });

                    const cTotal = cCurrent + c1_30 + c31_60 + c61Plus;

                    return (
                      <tr key={client.id} className="hover:bg-[#F1F5F9] transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#191C1E]">
                          {client.name}
                        </td>
                        <td className="py-3 px-4 text-[#505F76]">
                          {client.assignedStaffName}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-data text-[#16A34A]">
                          {formatCurrency(cCurrent)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-data text-[#EA580C]">
                          {formatCurrency(c1_30)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-data text-[#DC2626]">
                          {formatCurrency(c31_60)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-data text-[#7F1D1D] font-bold">
                          {formatCurrency(c61Plus)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-data font-bold text-[#191C1E]">
                          {formatCurrency(cTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Collections Stream Report */}
      {reportType === 'COLLECTIONS' && (
        <div className="bg-white border border-[#1A1A1E]/15 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-[#C3C6D7] bg-[#FAF8F5]">
            <h3 className="font-serif-editorial text-lg font-bold text-[#191C1E]">
              Payment Reconciliation Ledger
            </h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#F7F9FB] border-b border-[#C3C6D7] text-[#434655] font-mono-data text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Reference #</th>
                  <th className="py-3 px-4 text-right">Amount ({currSym})</th>
                  <th className="py-3 px-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E3E5]">
                {payments.map(p => {
                  const client = clients.find(c => c.id === p.clientId);
                  return (
                    <tr key={p.id} className="hover:bg-[#F1F5F9] transition-colors">
                      <td className="py-3 px-4 font-mono-data font-semibold text-[#16A34A]">{p.id}</td>
                      <td className="py-3 px-4 font-mono-data text-[#505F76]">{p.paymentDate}</td>
                      <td className="py-3 px-4 font-medium text-[#191C1E]">{client?.name || 'Client'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-gray-100 font-mono-data text-[10px]">{p.paymentMethod}</span>
                      </td>
                      <td className="py-3 px-4 font-mono-data text-[#737686]">{p.referenceNumber}</td>
                      <td className="py-3 px-4 text-right font-mono-data font-bold text-[#16A34A]">
                        +{formatCurrency(p.amount)}
                      </td>
                      <td className="py-3 px-4 text-[#505F76]">{p.recordedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Attribution Report */}
      {reportType === 'STAFF' && (
        <div className="bg-white border border-[#1A1A1E]/15 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-[#C3C6D7] bg-[#FAF8F5]">
            <h3 className="font-serif-editorial text-lg font-bold text-[#191C1E]">
              Staff Performance & Quota Attribution
            </h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#F7F9FB] border-b border-[#C3C6D7] text-[#434655] font-mono-data text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-4">Agent Name</th>
                  <th className="py-3 px-4 text-center">Active Clients</th>
                  <th className="py-3 px-4 text-right">Assigned Pending ({currSym})</th>
                  <th className="py-3 px-4 text-right">Monthly Target ({currSym})</th>
                  <th className="py-3 px-4 text-right">Collected This Month ({currSym})</th>
                  <th className="py-3 px-4 text-center">Attainment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E3E5]">
                {staff.map(s => {
                  const pct = Math.min(100, Math.round((s.collectedThisMonth / s.targetAmount) * 100));
                  return (
                    <tr key={s.id} className="hover:bg-[#F1F5F9] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#191C1E]">{s.name} ({s.role})</td>
                      <td className="py-3 px-4 text-center font-mono-data">{s.activeClientsCount}</td>
                      <td className="py-3 px-4 text-right font-mono-data">{formatCurrency(s.totalAssignedPending)}</td>
                      <td className="py-3 px-4 text-right font-mono-data">{formatCurrency(s.targetAmount)}</td>
                      <td className="py-3 px-4 text-right font-mono-data font-bold text-[#16A34A]">{formatCurrency(s.collectedThisMonth)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono-data font-bold text-[10px] ${
                          pct >= 80 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Log Report */}
      {reportType === 'TRANSACTIONS' && (
        <div className="bg-white border border-[#1A1A1E]/15 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-[#C3C6D7] bg-[#FAF8F5]">
            <h3 className="font-serif-editorial text-lg font-bold text-[#191C1E]">
              Master Invoicing Ledger
            </h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#F7F9FB] border-b border-[#C3C6D7] text-[#434655] font-mono-data text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4 text-right">Invoiced ({currSym})</th>
                  <th className="py-3 px-4 text-right">Paid ({currSym})</th>
                  <th className="py-3 px-4 text-right">Pending ({currSym})</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E3E5]">
                {transactions.map(t => {
                  const client = clients.find(c => c.id === t.clientId);
                  return (
                    <tr key={t.id} className="hover:bg-[#F1F5F9] transition-colors">
                      <td className="py-3 px-4 font-mono-data font-semibold text-[#004AC6]">{t.id}</td>
                      <td className="py-3 px-4 font-mono-data text-[#505F76]">{t.date}</td>
                      <td className="py-3 px-4 font-mono-data text-[#505F76]">{t.dueDate}</td>
                      <td className="py-3 px-4 font-medium text-[#191C1E]">{client?.name || 'Client'}</td>
                      <td className="py-3 px-4 text-right font-mono-data">{formatCurrency(t.amount)}</td>
                      <td className="py-3 px-4 text-right font-mono-data text-[#16A34A]">{formatCurrency(t.paidAmount)}</td>
                      <td className="py-3 px-4 text-right font-mono-data font-bold text-[#BA1A1A]">{formatCurrency(t.pendingAmount)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono-data font-bold bg-gray-100">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
