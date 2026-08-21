import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveView } from '../../types';

export const Sidebar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    openNewTransactionModal, 
    currentRole, 
    setCurrentRole,
    staff,
    currentStaffId,
    setCurrentStaffId
  } = useApp();

  const navItems: { id: ActiveView; label: string; icon: string; badge?: number }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: 'dashboard' },
    { id: 'CLIENTS', label: 'Clients', icon: 'group' },
    { id: 'PENDING_QUEUE', label: 'Pending Queue', icon: 'schedule' },
    { id: 'REPORTS', label: 'Reports', icon: 'assessment' },
    { id: 'STAFF_MANAGEMENT', label: 'Admin Tools', icon: 'admin_panel_settings' },
  ];

  return (
    <aside 
      id="main-sidebar" 
      className="hidden md:flex flex-col h-screen w-[260px] bg-[#1A1A1E] text-[#ECEEF0] sticky top-0 left-0 z-40 shrink-0 border-r border-black/20 select-none"
    >
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#004AC6] flex items-center justify-center text-white font-bold text-xl shadow-inner font-serif-editorial">
            S
          </div>
          <div>
            <h1 className="font-serif-editorial text-xl font-bold tracking-tight text-white leading-tight">
              SSE Tracker
            </h1>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#9EA3B0] font-mono-data font-medium mt-0.5">
              Receivables Mgmt
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        <button
          id="btn-sidebar-new-transaction"
          onClick={() => openNewTransactionModal()}
          className="mt-6 w-full bg-[#004AC6] hover:bg-[#003EA8] active:bg-[#00338F] text-white py-2.5 px-4 rounded-md font-medium text-[13px] flex items-center justify-center gap-2 shadow-sm transition-all duration-150 hover:shadow active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New Transaction</span>
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-1">
        <div className="px-3 py-1 text-[10px] uppercase tracking-[0.25em] font-mono-data font-bold text-[#737686]">
          Workspace
        </div>

        {navItems.map((item) => {
          const isActive = activeView === item.id || (activeView === 'CLIENT_PROFILE' && item.id === 'CLIENTS');
          return (
            <button
              key={item.id}
              id={`nav-${item.id.toLowerCase()}`}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-[13.5px] transition-all duration-150 text-left cursor-pointer ${
                isActive
                  ? 'bg-white/10 text-white font-semibold border-l-4 border-[#2563EB] shadow-sm pl-2.5'
                  : 'text-[#9EA3B0] hover:text-white hover:bg-white/5 border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span 
                  className={`material-symbols-outlined text-[20px] ${isActive ? 'fill' : ''}`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-[#E55B3C] text-white text-[10px] font-mono-data font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Role & Persona Switcher */}
      <div className="p-3 bg-black/30 border-t border-white/5 mx-3 rounded-lg mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-[0.2em] font-mono-data font-semibold text-[#8C90A0]">
            Active Role
          </span>
          <span className={`text-[10px] font-mono-data font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
            currentRole === 'ADMIN' ? 'bg-[#004AC6]/30 text-[#B4C5FF] border border-[#004AC6]/40' : 'bg-[#E55B3C]/20 text-[#FFB596] border border-[#E55B3C]/30'
          }`}>
            {currentRole}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 mb-2">
          <button
            id="role-toggle-admin"
            onClick={() => setCurrentRole('ADMIN')}
            className={`py-1 text-[11px] font-medium rounded transition-colors text-center cursor-pointer ${
              currentRole === 'ADMIN' ? 'bg-white/20 text-white font-bold' : 'text-[#8C90A0] hover:text-white hover:bg-white/5'
            }`}
          >
            Admin
          </button>
          <button
            id="role-toggle-staff"
            onClick={() => setCurrentRole('STAFF')}
            className={`py-1 text-[11px] font-medium rounded transition-colors text-center cursor-pointer ${
              currentRole === 'STAFF' ? 'bg-white/20 text-white font-bold' : 'text-[#8C90A0] hover:text-white hover:bg-white/5'
            }`}
          >
            Staff
          </button>
        </div>
        {currentRole === 'STAFF' && (
          <div className="mt-1">
            <label className="text-[10px] text-[#8C90A0] block mb-1">Staff Member:</label>
            <select
              value={currentStaffId}
              onChange={(e) => setCurrentStaffId(e.target.value)}
              className="w-full bg-[#2A2A2E] text-white text-[11px] rounded px-2 py-1 border border-white/10 outline-none cursor-pointer"
            >
              {staff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.initials})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* System Navigation & Footer */}
      <div className="pt-2 pb-4 px-3 border-t border-white/10 space-y-1">
        <button
          id="nav-settings"
          onClick={() => setActiveView('SETTINGS')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-md text-[13px] text-left transition-colors cursor-pointer ${
            activeView === 'SETTINGS'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-[#9EA3B0] hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-[19px]">settings</span>
          <span>Settings</span>
        </button>

        <button
          id="nav-audit-logs"
          onClick={() => setActiveView('AUDIT_LOGS')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-md text-[13px] text-left transition-colors cursor-pointer ${
            activeView === 'AUDIT_LOGS'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-[#9EA3B0] hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-[19px]">history</span>
          <span>Audit Logs</span>
        </button>
      </div>
    </aside>
  );
};
