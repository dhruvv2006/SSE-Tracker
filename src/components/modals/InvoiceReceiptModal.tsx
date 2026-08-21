import React from 'react';
import { useApp } from '../../context/AppContext';

export const InvoiceReceiptModal: React.FC = () => {
  const {
    isReceiptModalOpen,
    closeReceiptModal,
    receiptModalData,
    clients,
    transactions,
    payments,
    settings,
    formatCurrency
  } = useApp();

  if (!isReceiptModalOpen || !receiptModalData) return null;

  const { type, id } = receiptModalData;

  const handlePrint = () => {
    window.print();
  };

  if (type === 'INVOICE') {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return null;
    const client = clients.find(c => c.id === tx.clientId);
    const relatedPayments = payments.filter(p => p.transactionId === tx.id && p.status !== 'VOID');

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 border border-[#1A1A1E]/20 max-h-[90vh] overflow-y-auto custom-scrollbar">
          {/* Action Bar */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-200 no-print">
            <span className="text-xs font-mono-data uppercase tracking-wider text-gray-500">
              Tax Invoice Preview
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-[#004AC6] text-white rounded text-xs font-semibold hover:bg-[#003EA8] flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print / Save PDF
              </button>
              <button
                onClick={closeReceiptModal}
                className="text-gray-400 hover:text-black p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Printable Invoice Sheet */}
          <div className="py-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-[#1A1A1E] flex items-center justify-center text-white font-bold text-sm">
                    ST
                  </div>
                  <span className="font-serif-editorial text-xl font-bold text-[#191C1E]">
                    {settings.companyName}
                  </span>
                </div>
                <p className="text-xs text-[#737686] mt-1">{settings.legalName}</p>
                <p className="text-xs text-[#737686]">{settings.address}</p>
                <p className="text-xs text-[#737686]">{settings.businessEmail} • {settings.businessPhone}</p>
              </div>

              <div className="text-right">
                <h2 className="font-serif-editorial text-2xl font-bold text-[#191C1E]">
                  INVOICE
                </h2>
                <p className="font-mono-data text-xs font-bold text-[#004AC6] mt-1">{tx.id}</p>
                <div className="mt-2 inline-block px-2.5 py-1 rounded text-xs font-mono-data font-bold uppercase tracking-wider bg-gray-100 text-gray-800">
                  Status: {tx.status}
                </div>
              </div>
            </div>

            {/* Bill To & Meta */}
            <div className="grid grid-cols-2 gap-6 p-4 bg-[#FAF8F5] rounded-lg border border-[#C3C6D7]">
              <div>
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#737686] block mb-1">
                  Billed To:
                </span>
                <h4 className="font-semibold text-sm text-[#191C1E]">{client?.name}</h4>
                <p className="text-xs text-[#505F76]">{client?.contactName}</p>
                <p className="text-xs text-[#505F76]">{client?.address}</p>
                <p className="text-xs text-[#505F76]">{client?.contactEmail}</p>
              </div>

              <div className="text-right space-y-1 font-mono-data text-xs">
                <div>
                  <span className="text-[#737686]">Issue Date: </span>
                  <span className="font-medium text-[#191C1E]">{tx.date}</span>
                </div>
                <div>
                  <span className="text-[#737686]">Due Date: </span>
                  <span className="font-bold text-[#DC2626]">{tx.dueDate}</span>
                </div>
                <div>
                  <span className="text-[#737686]">Created By: </span>
                  <span className="text-[#191C1E]">{tx.createdBy}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-[#C3C6D7] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F7F9FB] border-b border-[#C3C6D7] font-mono-data text-[10px] uppercase text-[#434655]">
                  <tr>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4 text-[#191C1E] font-medium">{tx.description}</td>
                    <td className="py-3 px-4 text-[#505F76]">{tx.category}</td>
                    <td className="py-3 px-4 text-right font-mono-data font-bold text-[#191C1E]">
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculations & Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-xs font-mono-data">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(tx.amount)}</span>
                </div>
                <div className="flex justify-between text-[#16A34A]">
                  <span>Payments Applied:</span>
                  <span>-{formatCurrency(tx.paidAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300 font-bold text-sm text-[#191C1E]">
                  <span>Pending Amount Due:</span>
                  <span className="text-[#004AC6]">
                    {formatCurrency(tx.pendingAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Remittance Advice */}
            <div className="p-4 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-200 space-y-1">
              <p className="font-bold text-[#191C1E]">Remittance & Wire Instructions:</p>
              <p>Bank: JPMorgan Chase Bank, N.A. • Routing: 021000021 • Account: 8492049102</p>
              <p>Please include invoice number <span className="font-mono-data font-bold text-[#191C1E]">{tx.id}</span> in the payment memo.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAYMENT RECEIPT PREVIEW
  const pmt = payments.find(p => p.id === id);
  if (!pmt) return null;
  const client = clients.find(c => c.id === pmt.clientId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-[#1A1A1E]/20">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200 no-print">
          <span className="text-xs font-mono-data uppercase tracking-wider text-green-700 font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Official Payment Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-[#16A34A] text-white rounded text-xs font-semibold hover:bg-[#15803D] flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">print</span>
              Print Receipt
            </button>
            <button
              onClick={closeReceiptModal}
              className="text-gray-400 hover:text-black p-1 rounded"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="py-6 space-y-5 text-center">
          <div className="w-14 h-14 bg-green-100 text-[#16A34A] rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">check_circle</span>
          </div>

          <div>
            <h3 className="font-serif-editorial text-2xl font-bold text-[#191C1E]">
              Payment Received
            </h3>
            <p className="font-mono-data text-2xl font-bold text-[#16A34A] mt-1">
              {formatCurrency(pmt.amount)}
            </p>
            <p className="text-xs text-[#737686] font-mono-data mt-0.5">Receipt #{pmt.id}</p>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#C3C6D7] text-left text-xs space-y-2">
            <div className="flex justify-between font-mono-data">
              <span className="text-[#737686]">Client:</span>
              <span className="font-bold text-[#191C1E]">{client?.name}</span>
            </div>
            <div className="flex justify-between font-mono-data">
              <span className="text-[#737686]">Payment Date:</span>
              <span className="text-[#191C1E]">{pmt.paymentDate}</span>
            </div>
            <div className="flex justify-between font-mono-data">
              <span className="text-[#737686]">Method:</span>
              <span className="font-bold text-[#191C1E]">{pmt.paymentMethod}</span>
            </div>
            <div className="flex justify-between font-mono-data">
              <span className="text-[#737686]">Reference #:</span>
              <span className="text-[#191C1E]">{pmt.referenceNumber}</span>
            </div>
            <div className="flex justify-between font-mono-data">
              <span className="text-[#737686]">Recorded By:</span>
              <span className="text-[#191C1E]">{pmt.recordedBy}</span>
            </div>
            {pmt.notes && (
              <div className="pt-2 border-t border-gray-200 text-gray-600 italic">
                "{pmt.notes}"
              </div>
            )}
          </div>

          <p className="text-[11px] text-gray-500">
            Thank you for your business. This transaction has been posted to your account ledger.
          </p>
        </div>
      </div>
    </div>
  );
};
