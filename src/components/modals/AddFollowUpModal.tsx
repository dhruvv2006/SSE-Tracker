import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FollowUpPriority } from '../../types';

export const AddFollowUpModal: React.FC = () => {
  const { 
    isAddFollowUpModalOpen, 
    closeAddFollowUpModal, 
    clients, 
    staff, 
    modalPrefilledClientId, 
    addFollowUp,
    currentStaff 
  } = useApp();

  const [clientId, setClientId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');
  const [note, setNote] = useState('');
  const [priority, setPriority] = useState<FollowUpPriority>('HIGH');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    if (isAddFollowUpModalOpen) {
      const selected = modalPrefilledClientId || clients[0]?.id || '';
      setClientId(selected);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduledDate(tomorrow.toISOString().slice(0, 10));
      setScheduledTime('10:00 AM');
      setNote('');
      setPriority('HIGH');
      setAssignedTo(currentStaff?.id || 'ST-1');
    }
  }, [isAddFollowUpModalOpen, modalPrefilledClientId, clients, currentStaff]);

  if (!isAddFollowUpModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    const assigned = staff.find(s => s.id === assignedTo) || staff[0];

    addFollowUp({
      clientId,
      scheduledDate,
      scheduledTime,
      note,
      priority,
      assignedTo: assigned.id,
      assignedStaffName: assigned.name
    });

    closeAddFollowUpModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-[#1A1A1E]/20 relative">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#004AC6]"></span>
              <span className="text-[10px] font-mono-data uppercase tracking-wider font-bold text-[#737686]">
                Collection Queue
              </span>
            </div>
            <h3 className="font-serif-editorial text-xl font-bold text-[#191C1E]">
              Schedule Follow-up Action
            </h3>
          </div>
          <button 
            onClick={closeAddFollowUpModal}
            className="text-gray-400 hover:text-black p-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-3.5">
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
                  {c.name} ({c.id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Scheduled Date *</label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Time</label>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:30 PM">03:30 PM</option>
                <option value="05:00 PM">05:00 PM</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as FollowUpPriority)}
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
              >
                <option value="HIGH">High Priority (Urgent)</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority (Routine)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191C1E] mb-1">Assigned Collector</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E]"
              >
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191C1E] mb-1">Follow-up Note & Objective *</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Call Controller regarding overdue invoice balance and verify wire release schedule."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#F7F9FB] border border-[#C3C6D7] rounded p-2 text-xs text-[#191C1E] focus:border-[#004AC6]"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeAddFollowUpModal}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded hover:bg-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#004AC6] text-white text-xs font-semibold rounded hover:bg-[#003EA8] shadow-sm cursor-pointer"
            >
              Save Follow-up Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
