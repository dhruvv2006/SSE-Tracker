import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, PaymentStatus } from '../../types';

export const ClientList: React.FC = () => {
  const { 
    clients, 
    staff, 
    searchQuery, 
    setSearchQuery, 
    setActiveView,
    getClientPendingBalance,
    getClientStatus,
    openAddClientModal,
    openNewTransactionModal,
    currentRole,
    currentStaffId,
    formatCurrency
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [staffFilter, setStaffFilter] = useState<string>('');
  const [sortField, setSortField] = useState<'name' | 'pending' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Permission boundary: if Staff role, can see either all or assigned based on filter
      if (currentRole === 'STAFF' && staffFilter === 'my_assigned' && client.assignedStaffId !== currentStaffId) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = client.name.toLowerCase().includes(q);
        const matchesId = client.id.toLowerCase().includes(q);
        const matchesContact = client.contactName.toLowerCase().includes(q) || client.contactEmail.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesContact) return false;
      }

      // Staff filter
      if (staffFilter && staffFilter !== 'my_assigned') {
        if (client.assignedStaffId !== staffFilter) return false;
      }

      // Status filter
      if (statusFilter) {
        const clientStatus = getClientStatus(client.id);
        if (statusFilter.toUpperCase() !== clientStatus) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortField === 'pending') {
        const pendingA = getClientPendingBalance(a.id);
        const pendingB = getClientPendingBalance(b.id);
        return sortOrder === 'asc' ? pendingA - pendingB : pendingB - pendingA;
      } else if (sortField === 'name') {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      return 0;
    });
  }, [clients, searchQuery, statusFilter, staffFilter, sortField, sortOrder, currentRole, currentStaffId, getClientPendingBalance, getClientStatus]);

  // Pagination slice
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;
  const paginatedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: 'name' | 'pending' | 'status') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Client ID', 'Client Name', 'Contact Name', 'Contact Email', 'Assigned Staff', 'Total Pending ($)', 'Status'];
    const rows = filteredClients.map(c => [
      c.id,
      `"${c.name}"`,
      `"${c.contactName}"`,
      c.contactEmail,
      `"${c.assignedStaffName}"`,
      getClientPendingBalance(c.id).toFixed(2),
      getClientStatus(c.id)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SSE_Clients_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono-data font-bold tracking-wider bg-[#22C55E]/10 text-[#16A34A] border border-[#22C55E]/20">
            PAID
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono-data font-bold tracking-wider bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20 animate-pulse">
            OVERDUE
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono-data font-bold tracking-wider bg-[#F97316]/10 text-[#EA580C] border border-[#F97316]/20">
            PARTIAL
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono-data font-bold tracking-wider bg-[#2563EB]/10 text-[#004AC6] border border-[#2563EB]/20">
            PENDING
          </span>
        );
    }
  };

  return (
    <div id="clients-view" className="space-y-6 max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono-data uppercase tracking-[0.25em] font-bold text-[#737686]">
              Portfolio Master
            </span>
          </div>
          <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#191C1E] tracking-tight">
            Clients
          </h2>
          <p className="text-xs sm:text-sm text-[#737686] mt-0.5">
            Manage client accounts, credit profiles, and receivables tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-export-clients-csv"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white text-[#505F76] border border-[#737686]/40 hover:bg-[#F2F4F6] rounded-md text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            <span>Export CSV</span>
          </button>

          <button
            id="btn-add-client"
            onClick={openAddClientModal}
            className="px-4 py-2 bg-[#004AC6] text-white hover:bg-[#003EA8] rounded-md text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[17px]">person_add</span>
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar (Level 1 Surface) */}
      <div className="bg-white border border-[#1A1A1E]/15 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737686] text-[20px]">
            search
          </span>
          <input
            id="client-search-filter"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients by name, ID, or email..."
            className="w-full pl-10 pr-4 py-2 bg-[#F7F9FB] border border-[#C3C6D7] rounded-md text-xs text-[#191C1E] placeholder:text-[#8C90A0] focus:border-[#004AC6] focus:ring-2 focus:ring-[#004AC6]/20 outline-none transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          <div className="relative min-w-[150px]">
            <select
              id="filter-client-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-8 py-2 bg-[#F7F9FB] border border-[#C3C6D7] rounded-md text-xs text-[#191C1E] focus:border-[#004AC6] outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
              <option value="partial">Partially Paid</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737686] pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          <div className="relative min-w-[180px]">
            <select
              id="filter-client-staff"
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-8 py-2 bg-[#F7F9FB] border border-[#C3C6D7] rounded-md text-xs text-[#191C1E] focus:border-[#004AC6] outline-none cursor-pointer"
            >
              <option value="">All Assigned Staff</option>
              {currentRole === 'STAFF' && <option value="my_assigned">My Assigned Clients Only</option>}
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737686] pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {(searchQuery || statusFilter || staffFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
                setStaffFilter('');
              }}
              className="px-3 py-2 text-xs font-mono-data text-[#BA1A1A] hover:bg-[#FFDAD6]/30 rounded transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Data Table (Level 1 Surface) */}
      <div className="bg-white border border-[#1A1A1E]/15 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col min-h-[420px]">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[#F7F9FB] border-b border-[#C3C6D7] text-[#434655] font-mono-data text-[11px] uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 w-[25%] cursor-pointer hover:bg-[#ECEEF0] transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    Client Name 
                    <span className="material-symbols-outlined text-[15px] text-[#737686]">
                      {sortField === 'name' && sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'}
                    </span>
                  </div>
                </th>
                <th className="py-3 px-4 w-[20%]">Primary Contact</th>
                <th className="py-3 px-4 w-[15%]">Assigned Staff</th>
                <th 
                  onClick={() => handleSort('pending')}
                  className="py-3 px-4 w-[15%] text-right cursor-pointer hover:bg-[#ECEEF0] transition-colors select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    Total Pending
                    <span className="material-symbols-outlined text-[15px] text-[#737686]">
                      {sortField === 'pending' && sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'}
                    </span>
                  </div>
                </th>
                <th className="py-3 px-4 w-[15%] text-center">Status</th>
                <th className="py-3 px-4 w-[10%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E3E5] text-xs text-[#191C1E]">
              {paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#737686]">
                    <div className="max-w-xs mx-auto space-y-2">
                      <span className="material-symbols-outlined text-4xl text-gray-400">group_off</span>
                      <p className="font-semibold text-sm text-[#191C1E]">No clients match the criteria</p>
                      <p className="text-xs text-gray-500">Try adjusting your search query or status filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => {
                  const pendingBalance = getClientPendingBalance(client.id);
                  const status = getClientStatus(client.id);
                  const isOverdue = status === 'OVERDUE';

                  return (
                    <tr 
                      key={client.id}
                      onClick={() => setActiveView('CLIENT_PROFILE', client.id)}
                      className="hover:bg-[#F1F5F9] transition-colors group cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#ECEEF0] flex items-center justify-center text-[#004AC6] font-bold text-xs font-mono-data border border-[#C3C6D7]">
                            {client.code}
                          </div>
                          <div>
                            <p className="font-semibold text-[#191C1E] group-hover:text-[#004AC6] transition-colors">
                              {client.name}
                            </p>
                            <p className="text-[#737686] text-[11px] font-mono-data mt-0.5">
                              ID: {client.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#434655]">
                        <span className="font-medium text-[#191C1E]">{client.contactName}</span>
                        <br />
                        <a 
                          href={`mailto:${client.contactEmail}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#004AC6] hover:underline text-[11px] font-mono-data"
                        >
                          {client.contactEmail}
                        </a>
                      </td>

                      <td className="py-3.5 px-4 text-[#434655]">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#004AC6]"></span>
                          <span>{client.assignedStaffName}</span>
                        </div>
                      </td>

                      <td className={`py-3.5 px-4 font-mono-data text-right text-xs font-semibold ${
                        isOverdue ? 'text-[#BA1A1A]' : 'text-[#191C1E]'
                      }`}>
                        {formatCurrency(pendingBalance)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveView('CLIENT_PROFILE', client.id);
                            }}
                            className="p-1.5 text-[#434655] hover:text-[#004AC6] hover:bg-[#DBE1FF] rounded transition-colors"
                            title="View 360° Profile"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openNewTransactionModal(client.id);
                            }}
                            className="p-1.5 text-[#434655] hover:text-[#004AC6] hover:bg-[#DBE1FF] rounded transition-colors"
                            title="Add Transaction"
                          >
                            <span className="material-symbols-outlined text-[18px]">post_add</span>
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

        {/* Table Footer / Pagination */}
        <div className="bg-[#F7F9FB] border-t border-[#C3C6D7] py-3 px-4 flex items-center justify-between text-[#434655] text-xs font-mono-data">
          <div>
            Showing {filteredClients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredClients.length)} of {filteredClients.length} clients
          </div>
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
