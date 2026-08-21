/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { ClientList } from './components/clients/ClientList';
import { ClientProfile } from './components/clients/ClientProfile';
import { PendingQueue } from './components/pending/PendingQueue';
import { ReportsView } from './components/reports/ReportsView';
import { StaffManagement } from './components/staff/StaffManagement';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { SettingsView } from './components/settings/SettingsView';

import { NewTransactionModal } from './components/modals/NewTransactionModal';
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';
import { AddClientModal } from './components/modals/AddClientModal';
import { AddFollowUpModal } from './components/modals/AddFollowUpModal';
import { InvoiceReceiptModal } from './components/modals/InvoiceReceiptModal';

const AppContent: React.FC = () => {
  const { activeView } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F9FB] text-[#191C1E] font-sans antialiased selection:bg-[#004AC6]/15 selection:text-[#004AC6]">
      {/* Editorial Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Global Header */}
        <TopHeader onOpenMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {activeView === 'DASHBOARD' && <AdminDashboard />}
          {activeView === 'CLIENTS' && <ClientList />}
          {activeView === 'CLIENT_PROFILE' && <ClientProfile />}
          {activeView === 'PENDING_QUEUE' && <PendingQueue />}
          {activeView === 'REPORTS' && <ReportsView />}
          {activeView === 'STAFF_MANAGEMENT' && <StaffManagement />}
          {activeView === 'AUDIT_LOGS' && <AuditLogsView />}
          {activeView === 'SETTINGS' && <SettingsView />}
        </main>
      </div>

      {/* Interactive Global Modals */}
      <NewTransactionModal />
      <RecordPaymentModal />
      <AddClientModal />
      <AddFollowUpModal />
      <InvoiceReceiptModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
