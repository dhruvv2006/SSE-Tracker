import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export const NewTransactionModal: React.FC = () => {
  const { 
    isNewTransactionModalOpen, 
    closeNewTransactionModal, 
    clients, 
    settings, 
    modalPrefilledClientId, 
    addTransaction,
    currentStaff
  } = useApp();

  const [clientId, setClientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Professional Services');

  useEffect(() => {
    if (isNewTransactionModalOpen) {
      const selected = modalPrefilledClientId || clients[0]?.id || '';
      setClientId(selected);
      const randomNum = Math.floor(100 + Math.random() * 900);
      setInvoiceNumber(`${settings.invoicePrefix || 'INV-2026-'}${randomNum}`);
      
      const today = new Date();
      const defaultDue = new Date(today);
      defaultDue.setDate(today.getDate() + (settings.defaultNetTermsDays || 30));
      setDate(today.toISOString().slice(0, 10));
      setDueDate(defaultDue.toISOString().slice(0, 10));
      setAmount('');
      setDescription('');
      setCategory('Professional Services');
    }
  }, [isNewTransactionModalOpen, modalPrefilledClientId, clients, settings]);

  if (!isNewTransactionModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid invoice amount greater than $0.');
      return;
    }

    addTransaction({
      clientId,
      invoiceNumber,
      date,
      dueDate,
      amount: numAmount,
      description: description || 'Professional Services Retainer',
      category,
      createdBy: currentStaff?.name || 'Administrator'
    });

    closeNewTransactionModal();
  };

  const selectedClient = clients.find(c => c.id === clientId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-[#1A1A1E]/20 relative">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#004AC6]"></span>
              <span className="text-[10px] font-mono-data uppercase tracking-wider font-bold text-[#737686]">
                Receivables Master
              </span>
            </div>
            <h3 className="font-serif-editorial text-xl font-bold text-[#191C1E]">
              Create New Invoice / Transaction
            </h3>
          </div>
          <button 
            onClick={closeNewTransactionModal}
            className="text-gray-400 hover:text-black p-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {/* Client select */}
          <div>
            <label className="block text-xs font-semibold text-[#191C1E] mb-1">Target Client Account *</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E] focus:border-[#004AC6] outline-none"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id}) — Rep: {c.assignedStaffName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Invoice Number *</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs font-mono-data text-[#191C1E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">
                Amount ({settings.currencySymbol || '₹'}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs font-mono-data font-bold text-[#191C1E] focus:border-[#004AC6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Issue Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
              >
                <option value="Professional Services">Professional Services</option>
                <option value="Software Subscription">Software Subscription</option>
                <option value="Hardware">Hardware / Equipment</option>
                <option value="Maintenance">Maintenance & SLAs</option>
                <option value="Engineering">Engineering / Development</option>
                <option value="Logistics">Logistics & Supply</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Created By</label>
              <input
                type="text"
                disabled
                value={currentStaff?.name || 'Administrator'}
                className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-xs text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191C1E] mb-1">Description / Services Rendered *</label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Q4 SaaS Enterprise Licensing renewal & support"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E] focus:border-[#004AC6]"
            />
          </div>

          {/* Automatic Calculation Preview */}
          {amount && !isNaN(parseFloat(amount)) && (
            <div className="bg-[#FAF8F5] p-3 rounded-md border border-[#C3C6D7] text-xs space-y-1">
              <div className="flex justify-between font-mono-data">
                <span className="text-[#737686]">Client:</span>
                <span className="font-bold text-[#191C1E]">{selectedClient?.name}</span>
              </div>
              <div className="flex justify-between font-mono-data">
                <span className="text-[#737686]">Pending Added:</span>
                <span className="font-bold text-[#004AC6]">+${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeNewTransactionModal}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded hover:bg-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#004AC6] text-white text-xs font-semibold rounded hover:bg-[#003EA8] shadow-sm cursor-pointer"
            >
              Generate Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
