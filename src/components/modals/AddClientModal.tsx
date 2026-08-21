import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const AddClientModal: React.FC = () => {
  const { isAddClientModalOpen, closeAddClientModal, addClient, staff, setActiveView } = useApp();

  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [industry, setIndustry] = useState('Enterprise Software');
  const [assignedStaffId, setAssignedStaffId] = useState(staff[0]?.id || 'ST-1');

  if (!isAddClientModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const assigned = staff.find(s => s.id === assignedStaffId) || staff[0];

    const newClient = addClient({
      name,
      contactName,
      contactEmail,
      contactPhone,
      address,
      industry,
      assignedStaffId,
      assignedStaffName: assigned.name,
      status: 'active'
    });

    closeAddClientModal();
    setActiveView('CLIENT_PROFILE', newClient.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-[#1A1A1E]/20 relative">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#004AC6]"></span>
              <span className="text-[10px] font-mono-data uppercase tracking-wider font-bold text-[#737686]">
                Client Onboarding
              </span>
            </div>
            <h3 className="font-serif-editorial text-xl font-bold text-[#191C1E]">
              Add New Client Account
            </h3>
          </div>
          <button 
            onClick={closeAddClientModal}
            className="text-gray-400 hover:text-black p-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#191C1E] mb-1">Company / Client Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Horizon Energy Systems"
              className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E] focus:border-[#004AC6] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Primary Contact Name *</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Sarah Connor"
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Contact Email *</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="s.connor@horizon.com"
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Phone Number</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (555) 012-3456"
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Clean Energy"
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191C1E] mb-1">Corporate Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 500 Energy Way, Houston TX"
              className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191C1E] mb-1">Assigned Collection Officer *</label>
            <select
              value={assignedStaffId}
              onChange={(e) => setAssignedStaffId(e.target.value)}
              className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
            >
              {staff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeAddClientModal}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded hover:bg-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#004AC6] text-white text-xs font-semibold rounded hover:bg-[#003EA8] shadow-sm cursor-pointer"
            >
              Create Client Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
