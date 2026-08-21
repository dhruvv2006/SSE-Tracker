import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';

export const PendingQueue: React.FC = () => {
  const { 
    transactions, 
    clients, 
    staff, 
    currentStaffId, 
    setActiveView,
    openRecordPaymentModal,
    openAddFollowUpModal,
    getDaysOverdue,
    formatCurrency
  } = useApp();

  const [filterMode, setFilterMode] = useState<'ALL' | 'MY_ASSIGNED' | 'OVERDUE_30' | 'HIGH_VALUE'>('ALL');
  const [sortBy, setSortBy] = useState<'OVERDUE_DESC' | 'AMOUNT_DESC' | 'NAME_ASC'>('OVERDUE_DESC');
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Open transactions with pending balance > 0
  const pendingItems = useMemo(() => {
    return transactions
      .filter(tx => tx.pendingAmount > 0 && tx.status !== 'VOID')
      .map(tx => {
        const client = clients.find(c => c.id === tx.clientId);
        const daysOverdue = getDaysOverdue(tx.dueDate);
        const assignedStaff = staff.find(s => s.id === client?.assignedStaffId) || staff[0];

        return {
          ...tx,
          clientName: client?.name || 'Unknown Client',
          clientCode: client?.code || 'CL',
          assignedStaffId: client?.assignedStaffId,
          assignedStaffName: client?.assignedStaffName || assignedStaff.name,
          assignedStaffInitials: assignedStaff.initials,
          assignedStaffAvatarColor: assignedStaff.avatarColor,
          daysOverdue,
          lastFollowUp: 'Oct 12, 2026'
        };
      })
      .filter(item => {
        if (filterMode === 'MY_ASSIGNED' && item.assignedStaffId !== currentStaffId) {
          return false;
        }
        if (filterMode === 'OVERDUE_30' && item.daysOverdue < 30) {
          return false;
        }
        if (filterMode === 'HIGH_VALUE' && item.pendingAmount < 10000) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'OVERDUE_DESC') {
          return b.daysOverdue - a.daysOverdue;
        } else if (sortBy === 'AMOUNT_DESC') {
          return b.pendingAmount - a.pendingAmount;
        } else {
          return a.clientName.localeCompare(b.clientName);
        }
      });
  }, [transactions, clients, staff, currentStaffId, filterMode, sortBy, getDaysOverdue]);

  const totalPages = Math.ceil(pendingItems.length / itemsPerPage) || 1;
  const paginatedItems = pendingItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedTxIds.length === pendingItems.length) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(pendingItems.map(i => i.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedTxIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkExport = () => {
    const itemsToExport = selectedTxIds.length > 0
      ? pendingItems.filter(i => selectedTxIds.includes(i.id))
      : pendingItems;

    const headers = ['Invoice ID', 'Client Name', 'Pending Amount ($)', 'Days Overdue', 'Assigned Staff', 'Due Date'];
    const rows = itemsToExport.map(i => [
      i.id,
      `"${i.clientName}"`,
      i.pendingAmount.toFixed(2),
      i.daysOverdue,
      `"${i.assignedStaffName}"`,
      i.dueDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SSE_Pending_WorkList_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDaysBadge = (days: number) => {
    if (days >= 30) {
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-[#DC2626]/10 text-[#DC2626] font-mono-data font-bold text-[11px] border border-[#DC2626]/20">
          {days} Days
        </span>
      );
    } else if (days >= 10) {
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-[#EA580C]/10 text-[#EA580C] font-mono-data font-bold text-[11px] border border-[#EA580C]/20">
          {days} Days
        </span>
      );
    } else if (days > 0) {
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono-data font-bold text-[11px] border border-gray-200">
          {days} Days
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-[#004AC6]/10 text-[#004AC6] font-mono-data font-medium text-[11px]">
        Current
      </span>
    );
  };

  return (
    <div id="pending-queue-view" className="space-y-6 max-w-[1440px] mx-auto">
      {/* Page Header & Quick Filter Pills */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono-data uppercase tracking-[0.25em] font-bold text-[#737686]">
              Collection Ops
            </span>
          </div>
          <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#191C1E] tracking-tight">
            Work List
          </h2>
          <p className="text-xs sm:text-sm text-[#737686] mt-0.5">
            Manage, prioritize, and follow-up on pending collections.
          </p>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-mono-data font-medium transition-all cursor-pointer ${
              filterMode === 'ALL'
                ? 'bg-[#1A1A1E] text-white font-bold'
                : 'bg-white text-[#505F76] border border-[#C3C6D7] hover:bg-gray-50'
            }`}
          >
            All Pending ({transactions.filter(t => t.pendingAmount > 0).length})
          </button>

          <button
            onClick={() => setFilterMode('MY_ASSIGNED')}
            className={`px-3 py-1.5 rounded-full text-xs font-mono-data font-medium transition-all cursor-pointer ${
              filterMode === 'MY_ASSIGNED'
                ? 'bg-[#004AC6] text-white font-bold'
                : 'bg-white text-[#505F76] border border-[#C3C6D7] hover:bg-gray-50'
            }`}
          >
            My Assignments
          </button>

          <button
            onClick={() => setFilterMode('OVERDUE_30')}
            className={`px-3 py-1.5 rounded-full text-xs font-mono-data font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              filterMode === 'OVERDUE_30'
                ? 'bg-[#DC2626] text-white font-bold'
                : 'bg-white text-[#DC2626] border border-[#DC2626]/30 hover:bg-[#FFDAD6]/20'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
            Overdue &gt; 30 Days
          </button>

          <button
            onClick={() => setFilterMode('HIGH_VALUE')}
            className={`px-3 py-1.5 rounded-full text-xs font-mono-data font-medium transition-all cursor-pointer ${
              filterMode === 'HIGH_VALUE'
                ? 'bg-[#004AC6] text-white font-bold'
                : 'bg-white text-[#004AC6] border border-[#004AC6]/30 hover:bg-[#DBE1FF]/20'
            }`}
          >
            High Value (&gt; $10k)
          </button>
        </div>
      </div>

      {/* Main Data Table Card */}
      <div className="bg-white border border-[#1A1A1E]/15 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-[#C3C6D7] bg-[#F7F9FB] rounded-t-lg gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Select All */}
            <div className="flex items-center gap-2 border-r border-[#C3C6D7] pr-3 mr-1">
              <input
                id="select-all-checkbox"
                type="checkbox"
                checked={pendingItems.length > 0 && selectedTxIds.length === pendingItems.length}
                onChange={toggleSelectAll}
                className="rounded border-[#C3C6D7] text-[#004AC6] focus:ring-[#004AC6] w-4 h-4 cursor-pointer"
              />
              <label htmlFor="select-all-checkbox" className="text-xs font-mono-data text-[#505F76] hidden sm:inline cursor-pointer">
                Select All
              </label>
            </div>

            {/* Bulk Actions */}
            <button
              onClick={() => {
                if (selectedTxIds.length === 0) return;
                const first = pendingItems.find(p => p.id === selectedTxIds[0]);
                if (first) openAddFollowUpModal(first.clientId);
              }}
              disabled={selectedTxIds.length === 0}
              className={`px-3 py-1.5 border rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                selectedTxIds.length > 0
                  ? 'bg-white text-[#191C1E] border-[#C3C6D7] hover:bg-[#F2F4F6] cursor-pointer shadow-xs'
                  : 'bg-[#F2F4F6] text-gray-400 border-gray-200 opacity-60 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">mail</span>
              <span>Batch Follow-up ({selectedTxIds.length})</span>
            </button>

            <button
              onClick={handleBulkExport}
              className="px-3 py-1.5 bg-white text-[#505F76] border border-[#C3C6D7] rounded text-xs font-medium flex items-center gap-1.5 hover:bg-[#F2F4F6] transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export</span>
            </button>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-mono-data text-[#737686] hidden md:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#C3C6D7] rounded px-3 py-1.5 text-xs font-mono-data text-[#191C1E] focus:outline-none cursor-pointer"
            >
              <option value="OVERDUE_DESC">Days Overdue (Desc)</option>
              <option value="AMOUNT_DESC">Pending Amount (Desc)</option>
              <option value="NAME_ASC">Client Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#ECEEF0] border-b border-[#C3C6D7] sticky top-0 text-[#434655] font-mono-data text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center"></th>
                <th className="py-3 px-4">Client & Invoice</th>
                <th className="py-3 px-4 text-right">Pending Amount</th>
                <th className="py-3 px-4 text-center">Days Overdue</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 hidden md:table-cell">Assigned Staff</th>
                <th className="py-3 px-4 w-28 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E3E5]">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No pending items matching the selected filter.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const isSelected = selectedTxIds.includes(item.id);

                  return (
                    <tr 
                      key={item.id}
                      className={`hover:bg-[#F1F5F9] transition-colors group ${
                        isSelected ? 'bg-[#DBE1FF]/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(item.id)}
                          className="rounded border-[#C3C6D7] text-[#004AC6] focus:ring-[#004AC6] w-4 h-4 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div 
                          onClick={() => setActiveView('CLIENT_PROFILE', item.clientId)}
                          className="font-semibold text-[#191C1E] hover:text-[#004AC6] cursor-pointer"
                        >
                          {item.clientName}
                        </div>
                        <div className="text-[#737686] text-[11px] font-mono-data mt-0.5">
                          {item.id} • {item.description}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono-data text-xs font-bold text-[#191C1E]">
                        {formatCurrency(item.pendingAmount)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {getDaysBadge(item.daysOverdue)}
                      </td>

                      <td className="py-3.5 px-4 text-[#505F76] font-mono-data">
                        {item.dueDate}
                      </td>

                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-mono-data font-bold"
                            style={{ backgroundColor: item.assignedStaffAvatarColor }}
                          >
                            {item.assignedStaffInitials}
                          </div>
                          <span className="text-[#191C1E] font-medium">{item.assignedStaffName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openRecordPaymentModal(item.clientId, item.id)}
                            className="px-2.5 py-1 bg-[#004AC6] text-white rounded text-[11px] font-semibold hover:bg-[#003EA8] shadow-xs cursor-pointer active:scale-95"
                          >
                            Record Pay
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex justify-between items-center p-3.5 border-t border-[#C3C6D7] bg-[#F7F9FB] rounded-b-lg text-xs font-mono-data text-[#505F76]">
          <span>
            Showing {pendingItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, pendingItems.length)} of {pendingItems.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-[#C3C6D7] hover:bg-[#ECEEF0] transition-colors disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="px-2 font-bold text-[#191C1E]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded border border-[#C3C6D7] hover:bg-[#ECEEF0] transition-colors disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
