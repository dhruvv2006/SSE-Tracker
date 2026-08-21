import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Staff } from '../../types';

export const StaffManagement: React.FC = () => {
  const { staff, clients, assignStaffToClient, setActiveView, formatCurrency, settings } = useApp();
  const currSym = settings.currencySymbol || '₹';

  const [selectedStaffForReassign, setSelectedStaffForReassign] = useState<Staff | null>(null);
  const [targetClientId, setTargetClientId] = useState<string>('');
  const [newStaffModalOpen, setNewStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'Collector' | 'Manager' | 'Admin'>('Collector');
  const [newStaffTarget, setNewStaffTarget] = useState('150000');

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForReassign || !targetClientId) return;
    assignStaffToClient(targetClientId, selectedStaffForReassign.id);
    setSelectedStaffForReassign(null);
    setTargetClientId('');
  };

  return (
    <div id="staff-management-view" className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono-data uppercase tracking-[0.25em] font-bold text-[#737686]">
              Administration
            </span>
          </div>
          <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#191C1E] tracking-tight">
            Staff & Caseload Management
          </h2>
          <p className="text-xs sm:text-sm text-[#737686] mt-0.5">
            Manage collectors, configure collection quotas, and reassign client accounts.
          </p>
        </div>

        <button
          onClick={() => setNewStaffModalOpen(true)}
          className="px-4 py-2 bg-[#004AC6] text-white hover:bg-[#003EA8] rounded-md text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[17px]">person_add</span>
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Staff Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {staff.map((member) => {
          const memberClients = clients.filter(c => c.assignedStaffId === member.id);
          const attainment = Math.min(100, Math.round((member.collectedThisMonth / member.targetAmount) * 100));

          return (
            <div 
              key={member.id}
              className="bg-white rounded-lg border border-[#1A1A1E]/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex flex-col justify-between hover:border-[#004AC6]/40 transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-mono-data font-bold text-sm shadow-xs"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[#191C1E]">{member.name}</h3>
                      <p className="text-[11px] font-mono-data text-[#737686]">{member.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-bold uppercase tracking-wider ${
                    member.role === 'Admin' ? 'bg-[#004AC6]/10 text-[#004AC6]' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {member.role}
                  </span>
                </div>

                {/* Performance Progress */}
                <div className="space-y-2 py-3 border-y border-gray-100 my-3">
                  <div className="flex justify-between text-xs font-mono-data">
                    <span className="text-[#737686]">Monthly Target:</span>
                    <span className="font-bold text-[#191C1E]">{formatCurrency(member.targetAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono-data">
                    <span className="text-[#737686]">Collected:</span>
                    <span className="font-bold text-[#16A34A]">{formatCurrency(member.collectedThisMonth)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${attainment >= 80 ? 'bg-[#16A34A]' : 'bg-[#004AC6]'}`}
                      style={{ width: `${attainment}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-[10px] font-mono-data font-bold text-[#737686]">
                    {attainment}% of quota reached
                  </div>
                </div>

                {/* Portfolio Info */}
                <div className="flex justify-between items-center text-xs text-[#505F76]">
                  <span>Active Clients: <strong>{memberClients.length} accounts</strong></span>
                  <span className="font-mono-data font-bold text-[#191C1E]">{formatCurrency(member.totalAssignedPending)} pend.</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => setSelectedStaffForReassign(member)}
                  className="flex-1 py-1.5 bg-[#F7F9FB] hover:bg-[#ECEEF0] text-[#004AC6] rounded text-xs font-semibold transition-colors cursor-pointer border border-[#C3C6D7]"
                >
                  Assign Clients
                </button>
                <button
                  onClick={() => setActiveView('CLIENTS')}
                  className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded text-xs font-medium border border-gray-200"
                >
                  View List
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reassign Clients Modal */}
      {selectedStaffForReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-[#1A1A1E]/20 animate-in fade-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <h3 className="font-serif-editorial text-lg font-bold text-[#191C1E]">
                  Assign Client to {selectedStaffForReassign.name}
                </h3>
                <p className="text-xs text-[#737686] font-mono-data">Portfolio Reallocation</p>
              </div>
              <button 
                onClick={() => setSelectedStaffForReassign(null)}
                className="text-gray-400 hover:text-black p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#191C1E] mb-1">
                  Select Client to Reassign:
                </label>
                <select
                  value={targetClientId}
                  onChange={(e) => setTargetClientId(e.target.value)}
                  required
                  className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E] focus:border-[#004AC6] outline-none"
                >
                  <option value="">-- Choose a Client Account --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Current: {c.assignedStaffName})
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-[#737686] leading-relaxed">
                Reassigning this client will immediately route upcoming follow-ups, overdue notifications, and collection tracking to {selectedStaffForReassign.name}.
              </p>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStaffForReassign(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!targetClientId}
                  className="px-4 py-2 bg-[#004AC6] text-white text-xs font-semibold rounded hover:bg-[#003EA8] disabled:opacity-50"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Staff Modal */}
      {newStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-[#1A1A1E]/20 animate-in fade-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <h3 className="font-serif-editorial text-lg font-bold text-[#191C1E]">
                  Add Collection Officer
                </h3>
                <p className="text-xs text-[#737686] font-mono-data">New Team Member Onboarding</p>
              </div>
              <button 
                onClick={() => setNewStaffModalOpen(false)}
                className="text-gray-400 hover:text-black p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              alert(`Staff member ${newStaffName} created successfully with quota ${formatCurrency(Number(newStaffTarget))}!`);
              setNewStaffModalOpen(false);
            }} className="py-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#191C1E] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191C1E] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="r.adams@assetcorp.com"
                  className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#191C1E] mb-1">Role</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as any)}
                    className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
                  >
                    <option value="Collector">Collector</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#191C1E] mb-1">Monthly Target ({currSym})</label>
                  <input
                    type="number"
                    required
                    value={newStaffTarget}
                    onChange={(e) => setNewStaffTarget(e.target.value)}
                    className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E] font-mono-data"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewStaffModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#004AC6] text-white text-xs font-semibold rounded hover:bg-[#003EA8]"
                >
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
