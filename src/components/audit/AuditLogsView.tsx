import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [filterAction, setFilterAction] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (filterAction && log.action !== filterAction) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesDesc = log.description.toLowerCase().includes(q);
        const matchesActor = log.actorName.toLowerCase().includes(q);
        const matchesId = log.entityId.toLowerCase().includes(q);
        if (!matchesDesc && !matchesActor && !matchesId) return false;
      }
      return true;
    });
  }, [auditLogs, filterAction, searchTerm]);

  const handleExportAuditCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Entity Type', 'Entity ID', 'Description'];
    const rows = filteredLogs.map(l => [
      l.id, l.timestamp, `"${l.actorName}"`, l.actorRole, l.action, l.entityType, l.entityId, `"${l.description}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SSE_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="audit-logs-view" className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono-data uppercase tracking-[0.25em] font-bold text-[#737686]">
              Compliance & Security
            </span>
          </div>
          <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#191C1E] tracking-tight">
            System Audit Trail
          </h2>
          <p className="text-xs sm:text-sm text-[#737686] mt-0.5">
            Immutable chronological record of all ledger adjustments, payments, voids, and assignments.
          </p>
        </div>

        <button
          onClick={handleExportAuditCSV}
          className="px-4 py-2 bg-white text-[#505F76] border border-[#C3C6D7] hover:bg-[#F2F4F6] rounded-md text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[17px]">download</span>
          <span>Export Audit Ledger</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#1A1A1E]/15 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737686] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by description, actor, or entity ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F7F9FB] border border-[#C3C6D7] rounded text-xs text-[#191C1E] focus:border-[#004AC6] outline-none"
          />
        </div>

        <div className="sm:w-60">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded px-3 py-1.5 text-xs text-[#191C1E] focus:border-[#004AC6] outline-none cursor-pointer"
          >
            <option value="">All Action Types</option>
            <option value="RECORD_PAYMENT">Record Payment</option>
            <option value="CREATE_TRANSACTION">Create Invoice / Transaction</option>
            <option value="VOID_PAYMENT">Void Payment</option>
            <option value="VOID_TRANSACTION">Void Invoice</option>
            <option value="SCHEDULE_FOLLOWUP">Schedule Follow-up</option>
            <option value="ASSIGN_STAFF">Assign Staff</option>
            <option value="CREATE_CLIENT">Create Client</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#1A1A1E]/15 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#C3C6D7] text-[#434655] font-mono-data text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-32">Timestamp</th>
                <th className="py-3 px-4 w-36">Actor</th>
                <th className="py-3 px-4 w-36">Action</th>
                <th className="py-3 px-4 w-28">Entity</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E3E5]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No audit records matching your search query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isPayment = log.action === 'RECORD_PAYMENT';
                  const isVoid = log.action.includes('VOID');

                  return (
                    <tr key={log.id} className="hover:bg-[#F1F5F9] transition-colors">
                      <td className="py-3 px-4 font-mono-data text-[#505F76] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                        <span className="text-[#8C90A0]">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#191C1E]">{log.actorName}</span>
                        <span className="block text-[10px] font-mono-data text-[#737686]">{log.actorRole}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono-data font-bold uppercase tracking-wider ${
                          isPayment 
                            ? 'bg-green-100 text-green-800' 
                            : isVoid 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono-data text-[#505F76]">
                        <span className="font-bold text-[#191C1E]">{log.entityType}</span>
                        <span className="block text-[10px] text-[#737686]">{log.entityId}</span>
                      </td>

                      <td className="py-3 px-4 text-[#191C1E] leading-relaxed">
                        {log.description}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#FAF8F5] border-t border-[#C3C6D7] text-right text-xs text-[#737686] font-mono-data">
          Showing {filteredLogs.length} verified immutable records
        </div>
      </div>
    </div>
  );
};
