import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveView } from '../../types';

interface TopHeaderProps {
  onOpenMobileMenu?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenMobileMenu }) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    currentRole, 
    currentStaff, 
    setActiveView,
    followUps,
    transactions,
    resetAllData
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Compute urgent notifications (pending follow-ups + overdue invoices)
  const overdueCount = transactions.filter(t => t.status === 'OVERDUE').length;
  const pendingFollowupsCount = followUps.filter(f => f.status === 'PENDING').length;
  const notificationCount = overdueCount + pendingFollowupsCount;

  return (
    <>
      <header 
        id="top-app-bar"
        className="sticky top-0 z-30 h-16 bg-[#F9F7F2]/90 backdrop-blur-md border-b border-[#1A1A1E]/10 flex items-center justify-between px-4 md:px-6 transition-all"
      >
        {/* Left Side: Mobile Menu + Search */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-btn"
            onClick={onOpenMobileMenu}
            className="md:hidden text-[#1A1A1E] p-2 -ml-2 rounded-lg hover:bg-black/5 active:bg-black/10 transition-colors"
            aria-label="Open navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          {/* Search Box with Editorial subtle border */}
          <div className="relative flex items-center w-56 sm:w-80">
            <span className="material-symbols-outlined absolute left-3 text-[#737686] text-[19px] pointer-events-none">
              search
            </span>
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients, invoices, notes..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#FFFFFF] border border-[#1A1A1E]/15 rounded-md text-[13px] text-[#1A1A1E] placeholder:text-[#8C90A0] focus:border-[#004AC6] focus:ring-2 focus:ring-[#004AC6]/15 outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-[#8C90A0] hover:text-[#1A1A1E] text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Center: Mobile Title if small */}
        <div className="md:hidden font-serif-editorial font-bold text-lg text-[#1A1A1E]">
          SSE Tracker
        </div>

        {/* Right Side: Notification, Help, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications button */}
          <div className="relative">
            <button
              id="btn-notifications"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-2 text-[#434655] hover:text-[#191C1E] hover:bg-black/5 rounded-full transition-colors relative cursor-pointer"
              aria-label="View notifications"
            >
              <span className="material-symbols-outlined text-[21px]">notifications</span>
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#E55B3C] rounded-full border-2 border-[#F9F7F2] ring-1 ring-white"></span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#1A1A1E]/15 rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-[#1A1A1E]/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#1A1A1E] uppercase tracking-wider font-mono-data">
                      Receivables Alerts
                    </span>
                    <span className="bg-[#E55B3C]/10 text-[#E55B3C] text-[10px] font-mono-data font-bold px-1.5 py-0.5 rounded">
                      {notificationCount} Active
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-[#737686] hover:text-black"
                  >
                    ✕
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-gray-100 text-xs">
                  {overdueCount > 0 && (
                    <div 
                      onClick={() => {
                        setActiveView('PENDING_QUEUE');
                        setShowNotifications(false);
                      }}
                      className="p-3 hover:bg-[#F9F7F2] cursor-pointer flex gap-3 items-start transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#E55B3C]/10 text-[#E55B3C] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#1A1A1E]">{overdueCount} Invoices are Overdue</p>
                        <p className="text-[#737686] text-[11px] mt-0.5">Total overdue amounts require active follow-up.</p>
                      </div>
                    </div>
                  )}

                  {followUps.slice(0, 3).map(fu => (
                    <div 
                      key={fu.id}
                      onClick={() => {
                        setActiveView('CLIENT_PROFILE', fu.clientId);
                        setShowNotifications(false);
                      }}
                      className="p-3 hover:bg-[#F9F7F2] cursor-pointer flex gap-3 items-start transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#004AC6]/10 text-[#004AC6] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">schedule_send</span>
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1A1E]">{fu.note}</p>
                        <p className="text-[#737686] text-[11px] mt-0.5">Due: {fu.scheduledDate} ({fu.scheduledTime})</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t border-gray-100 bg-[#F9F7F2] text-center">
                  <button
                    onClick={() => {
                      setActiveView('PENDING_QUEUE');
                      setShowNotifications(false);
                    }}
                    className="text-[11px] font-bold text-[#004AC6] hover:underline"
                  >
                    View All Collections in Work List →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button
            id="btn-help"
            onClick={() => setShowHelpModal(true)}
            className="p-2 text-[#434655] hover:text-[#191C1E] hover:bg-black/5 rounded-full transition-colors hidden sm:flex cursor-pointer"
            aria-label="Open User Guide"
            title="System Documentation & Architecture"
          >
            <span className="material-symbols-outlined text-[21px]">help_outline</span>
          </button>

          {/* User Profile & Role Dropdown */}
          <div className="relative">
            <button
              id="user-profile-menu-btn"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full border border-[#1A1A1E]/15 hover:bg-white hover:shadow-sm transition-all cursor-pointer bg-white/70"
            >
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold font-mono-data"
                style={{ backgroundColor: currentStaff?.avatarColor || '#004AC6' }}
              >
                {currentStaff?.initials || 'AD'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-[12px] font-semibold leading-tight text-[#1A1A1E]">
                  {currentStaff?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-[#737686] uppercase tracking-wider font-mono-data">
                  {currentRole}
                </div>
              </div>
              <span className="material-symbols-outlined text-[#737686] text-[16px]">
                expand_more
              </span>
            </button>

            {/* Profile Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#1A1A1E]/15 rounded-lg shadow-xl py-2 z-50 animate-in fade-in duration-150">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-[11px] uppercase tracking-widest text-[#737686] font-mono-data">Logged in as</p>
                  <p className="font-semibold text-sm text-[#1A1A1E]">{currentStaff?.name}</p>
                  <p className="text-xs text-[#737686]">{currentStaff?.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveView('SETTINGS');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#1A1A1E] hover:bg-[#F9F7F2] flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#737686]">settings</span>
                    Business Settings
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('AUDIT_LOGS');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#1A1A1E] hover:bg-[#F9F7F2] flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#737686]">history</span>
                    System Audit Trail
                  </button>

                  <button
                    onClick={() => {
                      resetAllData();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#DC2626] hover:bg-[#FEE2E2]/40 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    Reset Demo State
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#1A1A1E]/20 rounded-xl shadow-2xl max-w-xl w-full p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#004AC6] text-white flex items-center justify-center font-bold">
                  S
                </div>
                <div>
                  <h3 className="font-serif-editorial text-lg font-bold text-[#1A1A1E]">SSE Tracker Architecture</h3>
                  <p className="text-xs text-[#737686] font-mono-data">Core Receivables Formula & Workflows</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-black p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-[#333] leading-relaxed">
              <div className="bg-[#F9F7F2] p-3 rounded-lg border border-[#1A1A1E]/10">
                <span className="font-bold text-[#004AC6] uppercase tracking-wider font-mono-data block mb-1">
                  Core Formula:
                </span>
                <p className="font-mono-data text-sm text-[#1A1A1E] font-semibold">
                  Pending Amount = Total Valid Transactions − Total Valid Payments
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="font-semibold text-[#1A1A1E]">Key System Guarantees:</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li><strong>Instant Automated Balance:</strong> Recording partial or full payments immediately recalculates client outstanding balance across all dashboards and reports.</li>
                  <li><strong>Role-Based Security:</strong> Admins oversee company-wide receivables while Collection Staff focus on assigned portfolios and daily follow-up queues.</li>
                  <li><strong>Audit Integrity:</strong> All financial entries (invoices, payments, voids, and reassignments) are permanently captured in the immutable audit log.</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-[#1A1A1E] text-white text-xs font-semibold rounded hover:bg-black"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
