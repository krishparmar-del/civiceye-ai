import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { Problem, Contractor } from '../../types';
import { HardHat, Calendar, Phone, X, Check } from 'lucide-react';

interface Props {
  problem: Problem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContractorAssignmentModal: React.FC<Props> = ({ problem, isOpen, onClose }) => {
  const { contractors, assignContractorToProblem, problems } = useCivic();

  const [selectedContractorId, setSelectedContractorId] = useState<string>(
    contractors[0]?.id || ''
  );
  const [workOrderId, setWorkOrderId] = useState<string>(
    `WO-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`
  );
  
  // Default target date: 3 days from now formatted for datetime-local
  const defaultDueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const [expectedCompletion, setExpectedCompletion] = useState<string>(defaultDueDate);
  const [notes, setNotes] = useState<string>(
    'Urgent field repair order. Restore surface grade and compact subgrade base.'
  );

  if (!isOpen || !problem) return null;

  const currentContractor = contractors.find((c) => c.id === selectedContractorId) || contractors[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentContractor) return;

    assignContractorToProblem(problem.id, {
      name: currentContractor.name,
      phone: currentContractor.phone,
      workOrderId,
      expectedCompletion: new Date(expectedCompletion).toISOString(),
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card-theme rounded-2xl max-w-lg w-full border border-theme shadow-xl overflow-hidden my-6 theme-transition animate-fade-in">
        <div className="p-6 border-b border-theme flex items-center justify-between bg-surface theme-transition">
          <div>
            <h3 className="text-base font-bold text-theme-primary flex items-center gap-2">
              <HardHat className="w-4 h-4 text-olive-primary" />
              Assign Municipal Contractor
            </h3>
            <p className="text-xs text-theme-muted mt-0.5">
              Issue formal work order for {problem.id} ({problem.category})
            </p>
          </div>
          <button onClick={onClose} className="text-theme-muted hover:text-theme-primary p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-theme-primary mb-1">
              Select Approved Contractor
            </label>
            <select
              value={selectedContractorId}
              onChange={(e) => setSelectedContractorId(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-surface border border-theme rounded-xl focus:border-olive-primary focus:outline-hidden text-theme-primary font-medium"
            >
              {contractors.map((c) => {
                const liveCount = problems.filter(
                  (p) => p.contractor?.name === c.name && p.status !== 'Closed'
                ).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.department}) — {liveCount} active orders
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3.5 bg-surface rounded-xl border border-theme">
            <div>
              <span className="text-theme-muted block text-[11px]">Contact Number:</span>
              <span className="font-semibold text-theme-primary font-mono">{currentContractor?.phone}</span>
            </div>
            <div>
              <span className="text-theme-muted block text-[11px]">Service Area:</span>
              <span className="font-semibold text-theme-primary">{currentContractor?.area}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-theme-primary mb-1">Work Order ID</label>
              <input
                type="text"
                required
                value={workOrderId}
                onChange={(e) => setWorkOrderId(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-theme rounded-xl font-mono text-theme-primary focus:border-olive-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-theme-primary mb-1">Target Completion</label>
              <input
                type="datetime-local"
                required
                value={expectedCompletion}
                onChange={(e) => setExpectedCompletion(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-theme rounded-xl text-theme-primary focus:border-olive-primary focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-theme-primary mb-1">Work Order Instructions</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-theme rounded-xl text-theme-primary focus:border-olive-primary focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-theme">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-theme-secondary hover:text-theme-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold bg-olive-primary text-white rounded-xl hover:bg-olive-dark transition-colors shadow-xs card-hover flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Dispatch Work Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
