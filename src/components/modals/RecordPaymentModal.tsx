import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';

export const RecordPaymentModal: React.FC = () => {
  const {
    isRecordPaymentModalOpen,
    closeRecordPaymentModal,
    clients,
    transactions,
    modalPrefilledClientId,
    modalPrefilledTransactionId,
    recordPayment,
    currentStaff,
    getClientPendingBalance,
    formatCurrency,
    settings
  } = useApp();

  const [clientId, setClientId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isRecordPaymentModalOpen) {
      const selectedClient = modalPrefilledClientId || clients[0]?.id || '';
      setClientId(selectedClient);
      
      const clientTx = transactions.filter(t => t.clientId === selectedClient && t.pendingAmount > 0 && t.status !== 'VOID');
      const targetTx = modalPrefilledTransactionId || (clientTx[0]?.id || '');
      setTransactionId(targetTx);

      const targetTxObj = transactions.find(t => t.id === targetTx);
      if (targetTxObj) {
        setAmount(targetTxObj.pendingAmount.toString());
      } else {
        const clientPending = getClientPendingBalance(selectedClient);
        setAmount(clientPending > 0 ? clientPending.toString() : '');
      }

      setPaymentDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('Bank Transfer');
      setReferenceNumber(`TX-${Math.floor(100000 + Math.random() * 900000)}`);
      setNotes('');
    }
  }, [isRecordPaymentModalOpen, modalPrefilledClientId, modalPrefilledTransactionId, clients, transactions]);

  // When client changes, update available invoices
  const handleClientChange = (newClientId: string) => {
    setClientId(newClientId);
    const clientTx = transactions.filter(t => t.clientId === newClientId && t.pendingAmount > 0 && t.status !== 'VOID');
    if (clientTx.length > 0) {
      setTransactionId(clientTx[0].id);
      setAmount(clientTx[0].pendingAmount.toString());
    } else {
      setTransactionId('');
      setAmount('');
    }
  };

  // When invoice changes, update amount
  const handleTransactionChange = (newTxId: string) => {
    setTransactionId(newTxId);
    const tx = transactions.find(t => t.id === newTxId);
    if (tx) {
      setAmount(tx.pendingAmount.toString());
    }
  };

  if (!isRecordPaymentModalOpen) return null;

  const clientOpenTransactions = transactions.filter(t => t.clientId === clientId && t.pendingAmount > 0 && t.status !== 'VOID');
  const selectedTx = transactions.find(t => t.id === transactionId);
  const clientPendingTotal = getClientPendingBalance(clientId);

  const handlePayInFull = () => {
    if (selectedTx) {
      setAmount(selectedTx.pendingAmount.toString());
    } else if (clientPendingTotal > 0) {
      setAmount(clientPendingTotal.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid payment amount greater than $0.');
      return;
    }

    const { isFullPayment } = recordPayment({
      clientId,
      transactionId: transactionId || undefined,
      amount: numAmount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      notes,
      recordedBy: currentStaff?.name || 'Administrator'
    });

    if (isFullPayment) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Confetti fallback
      }
    }

    closeRecordPaymentModal();
  };

  const numAmount = parseFloat(amount) || 0;
  const targetPending = selectedTx ? selectedTx.pendingAmount : clientPendingTotal;
  const remainingAfterPayment = Math.max(0, targetPending - numAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-[#1A1A1E]/20 relative">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
              <span className="text-[10px] font-mono-data uppercase tracking-wider font-bold text-[#737686]">
                Cash Collections
              </span>
            </div>
            <h3 className="font-serif-editorial text-xl font-bold text-[#191C1E]">
              Record Payment & Reconcile
            </h3>
          </div>
          <button 
            onClick={closeRecordPaymentModal}
            className="text-gray-400 hover:text-black p-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {/* Client Select */}
          <div>
            <label className="block text-xs font-semibold text-[#191C1E] mb-1">Select Client *</label>
            <select
              value={clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              required
              className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E] focus:border-[#004AC6] outline-none"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — Pending: {formatCurrency(getClientPendingBalance(c.id))}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice / Transaction picker */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#191C1E]">
                Apply To Specific Invoice (Optional)
              </label>
              {targetPending > 0 && (
                <button
                  type="button"
                  onClick={handlePayInFull}
                  className="text-[11px] font-mono-data font-bold text-[#004AC6] hover:underline cursor-pointer"
                >
                  Pay Full Balance ({formatCurrency(targetPending)})
                </button>
              )}
            </div>
            <select
              value={transactionId}
              onChange={(e) => handleTransactionChange(e.target.value)}
              className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E] focus:border-[#004AC6] outline-none"
            >
              <option value="">Apply across all open invoices (Oldest due first)</option>
              {clientOpenTransactions.map(tx => (
                <option key={tx.id} value={tx.id}>
                  {tx.id} — {tx.description} (Due: {tx.dueDate}) — Bal: {formatCurrency(tx.pendingAmount)}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">
                Payment Amount ({settings.currencySymbol || '₹'}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs font-mono-data font-bold text-[#16A34A] focus:border-[#16A34A] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Payment Date *</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
              />
            </div>
          </div>

          {/* Payment Method & Reference # */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Payment Method *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Wire">Wire Transfer</option>
                <option value="Stripe">Stripe / Card</option>
                <option value="Credit Card">Credit Card</option>
                <option value="ACH">ACH Direct Debit</option>
                <option value="Check">Check</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Reference / TX ID</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. WT-20260810-7712"
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs font-mono-data text-[#191C1E]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#191C1E] mb-1">Remittance Advice / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared via Chase treasury, invoice settled."
              className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
            />
          </div>

          {/* Real-time Rebalancing Preview */}
          <div className="bg-[#FAF8F5] p-3 rounded-md border border-[#C3C6D7] text-xs space-y-1">
            <div className="flex justify-between font-mono-data">
              <span className="text-[#737686]">Target Balance:</span>
              <span className="text-[#191C1E]">{formatCurrency(targetPending)}</span>
            </div>
            <div className="flex justify-between font-mono-data">
              <span className="text-[#737686]">Payment Applied:</span>
              <span className="font-bold text-[#16A34A]">-{formatCurrency(numAmount)}</span>
            </div>
            <div className="flex justify-between font-mono-data pt-1 border-t border-gray-200">
              <span className="font-semibold text-[#191C1E]">Remaining Balance:</span>
              <span className={`font-bold ${remainingAfterPayment === 0 ? 'text-[#16A34A]' : 'text-[#004AC6]'}`}>
                {formatCurrency(remainingAfterPayment)}
                {remainingAfterPayment === 0 && ' (SETTLED IN FULL)'}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeRecordPaymentModal}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded hover:bg-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#16A34A] text-white text-xs font-semibold rounded hover:bg-[#15803D] shadow-sm cursor-pointer"
            >
              Post Payment & Recalculate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
