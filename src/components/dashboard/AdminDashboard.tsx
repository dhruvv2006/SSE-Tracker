import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { 
    kpiStats, 
    staff, 
    transactions, 
    payments, 
    auditLogs, 
    setActiveView,
    openNewTransactionModal,
    openRecordPaymentModal,
    formatCurrency,
    settings
  } = useApp();

  const [chartViewMode, setChartViewMode] = useState<'weekly' | 'daily'>('weekly');
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'PAYMENTS' | 'INVOICES' | 'OVERDUE'>('ALL');

  const currSym = settings.currencySymbol || '₹';

  // Weekly data for Collection vs Pending Chart
  const weeklyData = [
    { week: 'W1', collected: 400000, pending: 800000, collectedLabel: `${currSym}4,00,000`, pendingLabel: `${currSym}8,00,000` },
    { week: 'W2', collected: 520000, pending: 720000, collectedLabel: `${currSym}5,20,000`, pendingLabel: `${currSym}7,20,000` },
    { week: 'W3', collected: 680000, pending: 580000, collectedLabel: `${currSym}6,80,000`, pendingLabel: `${currSym}5,80,000` },
    { week: 'W4', collected: 842500, pending: 490000, collectedLabel: `${currSym}8,42,500`, pendingLabel: `${currSym}4,90,000` },
  ];

  const filteredLogs = auditLogs.filter(log => {
    if (activityFilter === 'PAYMENTS') return log.action.includes('PAYMENT');
    if (activityFilter === 'INVOICES') return log.action.includes('TRANSACTION');
    if (activityFilter === 'OVERDUE') return log.description.toLowerCase().includes('overdue');
    return true;
  });

  return (
    <div id="admin-dashboard-view" className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header with Title and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono-data uppercase tracking-[0.25em] font-bold text-[#737686]">
              Executive Overview
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#004AC6]"></span>
          </div>
          <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#191C1E] tracking-tight">
            Admin Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-[#737686] mt-0.5">
            Overview of company receivables and staff collection performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-quick-record-payment"
            onClick={() => openRecordPaymentModal()}
            className="px-3.5 py-2 bg-white text-[#191C1E] border border-[#1A1A1E]/20 rounded-md text-xs font-semibold hover:bg-[#F3EFE6] transition-all flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px] text-[#004AC6]">payments</span>
            <span>Record Payment</span>
          </button>
          <button
            id="btn-quick-new-transaction"
            onClick={() => openNewTransactionModal()}
            className="px-3.5 py-2 bg-[#004AC6] text-white rounded-md text-xs font-semibold hover:bg-[#003EA8] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Pending */}
        <div 
          onClick={() => setActiveView('PENDING_QUEUE')}
          className="bg-white rounded-lg p-5 border border-[#1A1A1E]/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:border-[#004AC6]/40 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#ECEEF0] flex items-center justify-center text-[#434655] group-hover:bg-[#DBE1FF] group-hover:text-[#004AC6] transition-colors">
              <span className="material-symbols-outlined text-[21px]">account_balance_wallet</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono-data font-bold text-[#505F76] bg-[#F2F4F6] px-2 py-0.5 rounded">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +{kpiStats.pendingPercentageChange}%
            </span>
          </div>
          <div>
            <p className="text-xs text-[#737686] font-medium mb-1 uppercase tracking-wider font-mono-data">
              Total Pending Amount
            </p>
            <h3 className="text-2xl lg:text-[26px] font-bold text-[#191C1E] font-mono-data tracking-tight">
              {formatCurrency(kpiStats.totalPending)}
            </h3>
          </div>
        </div>

        {/* KPI 2: Overdue Amount */}
        <div 
          onClick={() => setActiveView('PENDING_QUEUE')}
          className="bg-white rounded-lg p-5 border border-[#E55B3C]/30 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:border-[#E55B3C] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#FFDAD6]/60 flex items-center justify-center text-[#BA1A1A] group-hover:bg-[#FFDAD6] transition-colors">
              <span className="material-symbols-outlined text-[21px]">warning</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono-data font-bold text-[#BA1A1A] bg-[#FFDAD6]/40 px-2 py-0.5 rounded">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +{kpiStats.overduePercentageChange}%
            </span>
          </div>
          <div>
            <p className="text-xs text-[#737686] font-medium mb-1 uppercase tracking-wider font-mono-data">
              Overdue Amount
            </p>
            <h3 className="text-2xl lg:text-[26px] font-bold text-[#BA1A1A] font-mono-data tracking-tight">
              {formatCurrency(kpiStats.totalOverdue)}
            </h3>
          </div>
        </div>

        {/* KPI 3: Collected This Month */}
        <div 
          onClick={() => setActiveView('REPORTS')}
          className="bg-white rounded-lg p-5 border border-[#1A1A1E]/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:border-[#16A34A]/40 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#D1FAE5]/60 flex items-center justify-center text-[#047857] group-hover:bg-[#D1FAE5] transition-colors">
              <span className="material-symbols-outlined text-[21px]">task_alt</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono-data font-bold text-[#047857] bg-[#D1FAE5]/40 px-2 py-0.5 rounded">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +{kpiStats.collectedPercentageChange}%
            </span>
          </div>
          <div>
            <p className="text-xs text-[#737686] font-medium mb-1 uppercase tracking-wider font-mono-data">
              Collected This Month
            </p>
            <h3 className="text-2xl lg:text-[26px] font-bold text-[#191C1E] font-mono-data tracking-tight">
              {formatCurrency(kpiStats.totalCollectedMonth)}
            </h3>
          </div>
        </div>

        {/* KPI 4: Active Clients */}
        <div 
          onClick={() => setActiveView('CLIENTS')}
          className="bg-white rounded-lg p-5 border border-[#1A1A1E]/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:border-[#004AC6]/40 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#DBE1FF]/70 flex items-center justify-center text-[#004AC6]">
              <span className="material-symbols-outlined text-[21px]">groups</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest font-mono-data text-[#737686] font-bold">
              PORTFOLIO
            </span>
          </div>
          <div>
            <p className="text-xs text-[#737686] font-medium mb-1 uppercase tracking-wider font-mono-data">
              Active Clients
            </p>
            <h3 className="text-2xl lg:text-[26px] font-bold text-[#191C1E] font-mono-data tracking-tight">
              {kpiStats.activeClientsCount.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Bento Grid: Left (Chart) & Right (Staff Performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-[#1A1A1E]/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono-data font-bold text-[#737686]">
                  Realization Trend
                </span>
              </div>
              <h3 className="font-serif-editorial text-lg sm:text-xl font-bold text-[#191C1E]">
                Collection vs. Pending (30 Days)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-[#F2F4F6] p-0.5 rounded flex text-xs font-mono-data">
                <button
                  onClick={() => setChartViewMode('weekly')}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    chartViewMode === 'weekly' ? 'bg-white shadow-xs text-[#191C1E] font-bold' : 'text-[#737686]'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setChartViewMode('daily')}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    chartViewMode === 'daily' ? 'bg-white shadow-xs text-[#191C1E] font-bold' : 'text-[#737686]'
                  }`}
                >
                  Cumulative
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="w-full h-64 relative rounded-md border border-[#E0E3E5] bg-[#FDFBF7] p-4 flex items-end justify-between select-none">
            {/* Y-Axis scale marks */}
            <div className="absolute left-3 top-3 bottom-8 flex flex-col justify-between text-[10px] font-mono-data text-[#8C90A0] z-10 pointer-events-none">
              <span>{currSym}15L</span>
              <span>{currSym}10L</span>
              <span>{currSym}5L</span>
              <span>{currSym}0</span>
            </div>

            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pl-14 pr-4 py-6 pointer-events-none">
              <div className="w-full h-px bg-[#E5E2D9]"></div>
              <div className="w-full h-px bg-[#E5E2D9]"></div>
              <div className="w-full h-px bg-[#E5E2D9]"></div>
              <div className="w-full h-px bg-[#D3D0C7]"></div>
            </div>

            {/* Bars */}
            <div className="flex-1 flex items-end justify-around h-full z-10 pl-12 pr-2">
              {weeklyData.map((item, idx) => {
                const maxVal = 1500000;
                const collectedHeight = `${(item.collected / maxVal) * 100}%`;
                const pendingHeight = `${(item.pending / maxVal) * 100}%`;

                return (
                  <div key={item.week} className="w-full max-w-[50px] flex flex-col gap-1 items-center group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 bg-[#1A1A1E] text-[#F9F7F2] text-[10px] font-mono-data py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30 shadow-lg">
                      <p className="font-bold">{item.week} Snapshot</p>
                      <p className="text-[#93C5FD]">Collected: {item.collectedLabel}</p>
                      <p className="text-[#D1D5DB]">Pending: {item.pendingLabel}</p>
                    </div>

                    {/* Pending Bar */}
                    <div 
                      className="w-full bg-[#E0E3E5] group-hover:bg-[#C3C6D7] rounded-t transition-all"
                      style={{ height: pendingHeight }}
                    ></div>

                    {/* Collected Bar */}
                    <div 
                      className="w-full bg-[#004AC6] group-hover:bg-[#2563EB] rounded-t transition-all shadow-xs"
                      style={{ height: collectedHeight }}
                    ></div>

                    <span className="text-[11px] font-mono-data font-semibold text-[#737686] mt-2">
                      {item.week}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center items-center gap-6 mt-4 pt-2 border-t border-[#1A1A1E]/5 text-xs text-[#505F76]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-[#004AC6]"></span>
              <span className="font-medium">Collected Cash Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-[#E0E3E5]"></span>
              <span className="font-medium">Outstanding Pending Receivables</span>
            </div>
          </div>
        </div>

        {/* Right Staff Performance (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-[#1A1A1E]/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">
          <div className="p-5 border-b border-[#1A1A1E]/10 flex justify-between items-center bg-[#FAF8F5]">
            <div>
              <h3 className="font-serif-editorial text-lg font-bold text-[#191C1E]">
                Staff Performance
              </h3>
              <p className="text-[11px] text-[#737686] font-mono-data">Collection Target Quotas</p>
            </div>
            <button 
              onClick={() => setActiveView('STAFF_MANAGEMENT')}
              className="text-[#004AC6] text-xs font-bold hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="flex-1 overflow-x-auto divide-y divide-[#1A1A1E]/5">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#F2F4F6] text-[#737686] font-mono-data uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3.5 font-bold">Agent</th>
                  <th className="py-2.5 px-3.5 font-bold text-right">Target</th>
                  <th className="py-2.5 px-3.5 font-bold w-28">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1E]/5">
                {staff.slice(0, 5).map((member) => {
                  const percentage = Math.min(100, Math.round((member.collectedThisMonth / member.targetAmount) * 100));
                  const isWarning = percentage < 50;

                  return (
                    <tr key={member.id} className="hover:bg-[#F9F7F2] transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white font-mono-data font-bold text-[10px]"
                            style={{ backgroundColor: member.avatarColor }}
                          >
                            {member.initials}
                          </div>
                          <span className="font-medium text-[#191C1E] truncate max-w-[100px]">
                            {member.name}
                          </span>
                        </div>
                      </td>
                      <td className={`py-3 px-3.5 font-mono-data text-right font-bold ${
                        isWarning ? 'text-[#BA1A1A]' : 'text-[#191C1E]'
                      }`}>
                        {percentage}%
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="w-full h-2 bg-[#E0E3E5] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              isWarning ? 'bg-[#BA1A1A]' : 'bg-[#004AC6]'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#FAF8F5] border-t border-[#1A1A1E]/10 text-center">
            <button
              onClick={() => setActiveView('STAFF_MANAGEMENT')}
              className="text-xs font-mono-data font-bold text-[#004AC6] hover:underline"
            >
              Manage 7 Assigned Agents →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity Feed */}
      <div className="bg-white rounded-lg border border-[#1A1A1E]/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-5 border-b border-[#1A1A1E]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5]">
          <div>
            <h3 className="font-serif-editorial text-lg font-bold text-[#191C1E]">
              Recent Financial Activity
            </h3>
            <p className="text-xs text-[#737686]">Real-time stream of invoices, payments, and overdue triggers.</p>
          </div>

          {/* Filters */}
          <div className="flex gap-1 bg-white p-1 rounded-md border border-[#1A1A1E]/10 text-xs font-mono-data">
            {(['ALL', 'PAYMENTS', 'INVOICES', 'OVERDUE'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActivityFilter(tab)}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  activityFilter === tab ? 'bg-[#1A1A1E] text-white font-bold' : 'text-[#737686] hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#1A1A1E]/5">
          {filteredLogs.slice(0, 5).map((log) => {
            const isPayment = log.action === 'RECORD_PAYMENT';
            const isOverdue = log.description.toLowerCase().includes('overdue');

            return (
              <div 
                key={log.id} 
                className="p-4 sm:p-5 flex items-start gap-4 hover:bg-[#F9F7F2] transition-colors group cursor-pointer"
                onClick={() => {
                  if (log.entityType === 'Client') {
                    setActiveView('CLIENT_PROFILE', log.entityId);
                  } else {
                    setActiveView('AUDIT_LOGS');
                  }
                }}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isPayment 
                    ? 'bg-[#D1FAE5]/60 text-[#047857]' 
                    : isOverdue 
                    ? 'bg-[#FFDAD6]/60 text-[#BA1A1A]' 
                    : 'bg-[#ECEEF0] text-[#434655]'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {isPayment ? 'payments' : isOverdue ? 'error' : 'description'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <p className="text-sm font-semibold text-[#191C1E] truncate">
                      {log.description}
                    </p>
                    {log.newValue && (
                      <span className={`font-mono-data text-xs font-bold shrink-0 ${
                        isPayment ? 'text-[#047857]' : isOverdue ? 'text-[#BA1A1A]' : 'text-[#191C1E]'
                      }`}>
                        {isPayment ? `+${log.newValue}` : log.newValue}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#737686] font-mono-data">
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>•</span>
                    <span>Actor: {log.actorName} ({log.actorRole})</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isPayment 
                        ? 'bg-[#D1FAE5] text-[#047857]' 
                        : isOverdue 
                        ? 'bg-[#FFDAD6] text-[#BA1A1A]' 
                        : 'bg-[#ECEEF0] text-[#434655]'
                    }`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-[#FAF8F5] border-t border-[#1A1A1E]/10 text-center">
          <button 
            onClick={() => setActiveView('AUDIT_LOGS')}
            className="text-xs font-mono-data font-bold text-[#004AC6] hover:underline cursor-pointer"
          >
            View Complete Audit Log Ledger ({auditLogs.length} Events) →
          </button>
        </div>
      </div>
    </div>
  );
};
