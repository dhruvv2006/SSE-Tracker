import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetAllData, clients, transactions, payments } = useApp();

  const [formData, setFormData] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportFullJSON = () => {
    const backupData = {
      exportTimestamp: new Date().toISOString(),
      system: 'SSE Tracker v2.0',
      settings: formData,
      summary: {
        totalClients: clients.length,
        totalTransactions: transactions.length,
        totalPayments: payments.length
      },
      clients,
      transactions,
      payments
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SSE_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="settings-view" className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono-data uppercase tracking-[0.25em] font-bold text-[#737686]">
              System Configuration
            </span>
          </div>
          <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#191C1E] tracking-tight">
            Settings & Business Profile
          </h2>
          <p className="text-xs sm:text-sm text-[#737686] mt-0.5">
            Configure company identity, payment terms, currency formats, and ledger policies.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-md text-xs font-mono-data font-bold flex items-center gap-1.5 animate-in fade-in">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Settings Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Business Identity */}
        <div className="bg-white rounded-lg border border-[#1A1A1E]/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <span className="material-symbols-outlined text-[#004AC6] text-[20px]">domain</span>
            <h3 className="font-serif-editorial text-base font-bold text-[#191C1E]">
              Business Profile & Statements
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Company Display Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E] focus:border-[#004AC6] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Legal Registered Entity</label>
              <input
                type="text"
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                required
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E] focus:border-[#004AC6] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Receivables Email</label>
              <input
                type="email"
                value={formData.businessEmail}
                onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                required
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E] focus:border-[#004AC6] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Office Telephone</label>
              <input
                type="text"
                value={formData.businessPhone}
                onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                required
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E] focus:border-[#004AC6] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Billing & Remittance Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E] focus:border-[#004AC6] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Financial Rules & Terms */}
        <div className="bg-white rounded-lg border border-[#1A1A1E]/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <span className="material-symbols-outlined text-[#004AC6] text-[20px]">tune</span>
            <h3 className="font-serif-editorial text-base font-bold text-[#191C1E]">
              Receivables Calculation Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Currency Symbol</label>
              <select
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E] focus:border-[#004AC6] outline-none cursor-pointer"
              >
                <option value="$">$ (USD / CAD / AUD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="₹">₹ (INR)</option>
                <option value="¥">¥ (JPY / CNY)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Default Net Terms (Days)</label>
              <select
                value={formData.defaultNetTermsDays}
                onChange={(e) => setFormData({ ...formData, defaultNetTermsDays: Number(e.target.value) })}
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E] focus:border-[#004AC6] outline-none cursor-pointer"
              >
                <option value={15}>Net 15 Days</option>
                <option value={30}>Net 30 Days (Standard)</option>
                <option value={45}>Net 45 Days</option>
                <option value={60}>Net 60 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E] font-mono-data"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Overpayment Policy</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                <label className={`p-3 rounded border flex items-start gap-3 cursor-pointer transition-all ${
                  formData.overpaymentHandling === 'STRICT_BLOCK' ? 'border-[#004AC6] bg-[#DBE1FF]/20' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="overpayment"
                    checked={formData.overpaymentHandling === 'STRICT_BLOCK'}
                    onChange={() => setFormData({ ...formData, overpaymentHandling: 'STRICT_BLOCK' })}
                    className="mt-0.5 text-[#004AC6]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#191C1E] block">Strict Block (Cap to Pending)</span>
                    <span className="text-[11px] text-gray-500">Do not permit payments exceeding total invoice balance.</span>
                  </div>
                </label>

                <label className={`p-3 rounded border flex items-start gap-3 cursor-pointer transition-all ${
                  formData.overpaymentHandling === 'CREDIT_BALANCE' ? 'border-[#004AC6] bg-[#DBE1FF]/20' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="overpayment"
                    checked={formData.overpaymentHandling === 'CREDIT_BALANCE'}
                    onChange={() => setFormData({ ...formData, overpaymentHandling: 'CREDIT_BALANCE' })}
                    className="mt-0.5 text-[#004AC6]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#191C1E] block">Record as Client Credit</span>
                    <span className="text-[11px] text-gray-500">Allow surplus payments and store remainder as unapplied credit balance.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#004AC6] text-white rounded text-xs font-semibold hover:bg-[#003EA8] shadow-sm transition-all cursor-pointer"
            >
              Save Configuration Changes
            </button>
          </div>
        </div>

        {/* Card 3: Data Management & Backup */}
        <div className="bg-white rounded-lg border border-[#1A1A1E]/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <span className="material-symbols-outlined text-[#737686] text-[20px]">database</span>
            <h3 className="font-serif-editorial text-base font-bold text-[#191C1E]">
              Data Backup & Testing
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#191C1E]">Download Full Workspace Snapshot</p>
              <p className="text-[11px] text-[#737686]">Export all clients, active invoices, posted payments, and audit logs as JSON.</p>
            </div>
            <button
              type="button"
              onClick={handleExportFullJSON}
              className="px-4 py-2 bg-white border border-[#C3C6D7] hover:bg-[#F2F4F6] text-gray-800 text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export JSON Backup</span>
            </button>
          </div>

          <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#DC2626]">Reset Workspace to Factory Seed Data</p>
              <p className="text-[11px] text-[#737686]">Clears all local storage overrides and restores initial sample database.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to restore initial demo data? All newly added records will be reset.')) {
                  resetAllData();
                  alert('Demo database reset successfully.');
                }
              }}
              className="px-4 py-2 bg-[#FEE2E2] hover:bg-[#FECACA] text-[#DC2626] text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap"
            >
              Reset Demo State
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
