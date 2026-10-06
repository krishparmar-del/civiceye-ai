import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { Problem, ProblemStatus } from '../../types';
import { ContractorAssignmentModal } from './ContractorAssignmentModal';
import { CompletionProofModal } from './CompletionProofModal';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  HardHat,
  Layers,
  MapPin,
  Phone,
  ShieldAlert,
  Sparkles,
  Users,
  Wrench,
  X,
} from 'lucide-react';

interface Props {
  problem: Problem | null;
  onClose: () => void;
}

export const OfficialProblemDetailsModal: React.FC<Props> = ({ problem, onClose }) => {
  const {
    currentUser,
    updateProblemStatus,
    problems,
  } = useCivic();

  const [selectedStatus, setSelectedStatus] = useState<ProblemStatus>(
    problem?.status || 'Reported'
  );
  const [statusNote, setStatusNote] = useState('');
  const [showContractorModal, setShowContractorModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  if (!problem) return null;

  // Find linked duplicates if any
  const duplicateReports = problems.filter(
    (p) => p.isDuplicateOf === problem.id || (problem.duplicateReportIds && problem.duplicateReportIds.includes(p.id))
  );

  const handleStatusUpdate = () => {
    if (selectedStatus === 'Completed') {
      setShowCompletionModal(true);
      return;
    }
    updateProblemStatus(problem.id, selectedStatus, statusNote);
    setStatusNote('');
  };

  const statusOptions: ProblemStatus[] = [
    'Reported',
    'Under Review',
    'Verified',
    'Assigned',
    'Work in Progress',
    'Completed',
    'Closed',
    'Reopened',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card-theme rounded-2xl max-w-4xl w-full border border-theme shadow-xl overflow-hidden my-6 theme-transition animate-fade-in">
        {/* Top Header */}
        <div className="p-6 border-b border-theme flex items-start justify-between bg-surface theme-transition gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-theme-muted mb-1 flex-wrap">
              <span className="font-bold text-olive-dark">{problem.id}</span>
              <span aria-hidden="true">·</span>
              <span>{problem.category}</span>
              <span aria-hidden="true">·</span>
              <span>
                Zone {problem.zone}, Ward {problem.ward}, {problem.block}
              </span>
            </div>
            <h3 className="text-lg font-bold text-theme-primary leading-snug">
              {problem.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-theme-muted hover:text-theme-primary p-1.5 rounded-xl bg-card-theme border border-theme shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[78vh] overflow-y-auto space-y-6 text-xs">
          {/* Top row: Evidence + AI Analysis card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual Evidence */}
            <div className="space-y-3">
              <div className="aspect-16/10 bg-surface rounded-xl overflow-hidden border border-theme relative">
                <img
                  src={problem.image}
                  alt={problem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[11px] px-2.5 py-0.5 rounded font-mono">
                  GPS: {problem.latitude.toFixed(4)}, {problem.longitude.toFixed(4)}
                </div>
              </div>

              {/* Citizen Details */}
              <div className="bg-surface p-4 rounded-xl border border-theme space-y-1.5">
                <span className="font-semibold text-theme-primary block text-xs">Citizen Complaint</span>
                <p className="text-theme-secondary leading-relaxed italic">
                  "{problem.description}"
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-theme-muted font-mono border-t border-theme">
                  <span>Reported by: {problem.reportedBy.name}</span>
                  <span>{new Date(problem.reportedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* AI Analysis Card */}
            <div className="bg-surface rounded-xl border border-theme p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-theme pb-2">
                <span className="font-bold text-theme-primary flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-olive-primary" />
                  AI Infrastructure Evaluation
                </span>
                <span className="text-[11px] font-mono text-theme-muted">
                  Confidence: {problem.aiAnalysis.confidence}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card-theme p-2.5 rounded-xl border border-theme">
                  <span className="text-[11px] text-theme-muted block">AI Priority Score</span>
                  <div className="text-xl font-bold text-olive-primary tabular-nums">
                    {problem.priorityScore} <span className="text-xs text-theme-muted font-normal">/ 100</span>
                  </div>
                </div>
                <div className="bg-card-theme p-2.5 rounded-xl border border-theme">
                  <span className="text-[11px] text-theme-muted block">Severity Rating</span>
                  <div className="text-xl font-bold text-olive-dark tabular-nums">
                    {problem.severityScore} <span className="text-xs text-theme-muted font-normal">/ 100</span>
                  </div>
                </div>
                <div className="bg-card-theme p-2.5 rounded-xl border border-theme">
                  <span className="text-[11px] text-theme-muted block">Affected Citizens</span>
                  <div className="text-xl font-bold text-theme-primary tabular-nums">
                    {problem.affectedCount} <span className="text-xs text-theme-muted font-normal">confirmed</span>
                  </div>
                </div>
                <div className="bg-card-theme p-2.5 rounded-xl border border-theme">
                  <span className="text-[11px] text-theme-muted block">Responsible Dept</span>
                  <div className="text-xs font-bold text-theme-primary truncate mt-1">
                    {problem.department}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-theme-primary font-semibold block mb-1">
                  Recommended Official Action:
                </span>
                <div className="p-2.5 bg-card-theme rounded-xl border border-theme font-medium text-theme-secondary">
                  {problem.aiAnalysis.recommendedAction}
                </div>
              </div>

              <div>
                <span className="text-theme-primary font-semibold block mb-1">
                  Why this priority rank? (Decision Factors)
                </span>
                <ul className="space-y-1 text-[11px] text-theme-secondary">
                  {problem.aiAnalysis.reasonFactors.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-olive-primary font-bold">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-[10px] text-theme-muted border-t border-theme pt-2">
                Prototype analytical indicator · Model-derived, not an official engineering safety certification.
              </div>
            </div>
          </div>

          {/* Duplicate Problem Cluster Section */}
          {(problem.duplicateCount || 0) > 0 || duplicateReports.length > 0 ? (
            <div className="bg-olive-soft/30 border border-theme rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-olive-dark flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-olive-primary" />
                  Grouped Duplicate Cluster: {problem.title}
                </span>
                <span className="bg-card-theme text-theme-primary border border-theme font-semibold px-2 py-0.5 rounded text-[11px]">
                  AI Match Confidence: {problem.aiAnalysis.duplicateConfidence || 91}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-card-theme p-2 rounded-lg border border-theme">
                  <span className="text-theme-muted block text-[10px]">Reports Grouped</span>
                  <strong className="text-theme-primary tabular-nums">
                    {(problem.duplicateCount || 0) + 1}
                  </strong>
                </div>
                <div className="bg-card-theme p-2 rounded-lg border border-theme">
                  <span className="text-theme-muted block text-[10px]">Affected Citizens</span>
                  <strong className="text-theme-primary tabular-nums">
                    {problem.affectedCount}
                  </strong>
                </div>
                <div className="bg-card-theme p-2 rounded-lg border border-theme">
                  <span className="text-theme-muted block text-[10px]">Images Analyzed</span>
                  <strong className="text-theme-primary tabular-nums">
                    {(problem.duplicateCount || 0) * 2}
                  </strong>
                </div>
                <div className="bg-card-theme p-2 rounded-lg border border-theme">
                  <span className="text-theme-muted block text-[10px]">Dispatch Efficiency</span>
                  <strong className="text-olive-dark">1 Unified Work Order</strong>
                </div>
              </div>

              {duplicateReports.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-theme-primary">
                    Supporting Citizen Reports in Cluster:
                  </span>
                  <div className="divide-y divide-theme bg-card-theme rounded-xl border border-theme max-h-28 overflow-y-auto">
                    {duplicateReports.map((dup) => (
                      <div key={dup.id} className="p-2 flex items-center justify-between text-[11px]">
                        <div>
                          <strong className="text-theme-primary">{dup.id}</strong> — {dup.title}
                          <span className="text-theme-muted block text-[10px]">
                            Reported by {dup.reportedBy.name} · {dup.affectedCount} affected
                          </span>
                        </div>
                        <span className="font-mono text-theme-muted">{dup.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Status & Contractor Management Console */}
          <div className="bg-card-theme border border-theme rounded-xl p-4 space-y-4">
            <h4 className="font-bold text-theme-primary uppercase tracking-wider text-xs">
              Official Workflow & Status Management
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status updater */}
              <div className="space-y-2">
                <label className="block font-semibold text-theme-primary">
                  Change Problem Status
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as ProblemStatus)}
                    className="flex-1 text-xs px-3 py-2 bg-surface border border-theme rounded-xl focus:outline-hidden text-theme-primary font-medium"
                  >
                    {statusOptions.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    className="px-4 py-2 bg-olive-primary hover:bg-olive-dark text-white font-semibold rounded-xl transition-colors shadow-xs"
                  >
                    Update
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Optional status note (e.g. Field inspection completed, surface base approved)..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-surface border border-theme rounded-xl focus:outline-hidden text-theme-primary"
                />
              </div>

              {/* Contractor action box */}
              <div className="space-y-2">
                <label className="block font-semibold text-theme-primary">
                  Contractor & Completion Actions
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowContractorModal(true)}
                    className="flex-1 py-2 px-3 bg-olive-primary hover:bg-olive-dark text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs card-hover"
                  >
                    <HardHat className="w-3.5 h-3.5" />
                    <span>Assign Contractor</span>
                  </button>
                  <button
                    onClick={() => setShowCompletionModal(true)}
                    className="flex-1 py-2 px-3 bg-[#5F7650] hover:bg-[#4E6242] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs card-hover"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Submit Completion Proof</span>
                  </button>
                </div>
                {problem.contractor && (
                  <div className="p-2.5 bg-surface border border-theme rounded-xl text-[11px] text-theme-secondary flex items-center justify-between">
                    <span>
                      Active: <strong className="text-theme-primary">{problem.contractor.name}</strong> ({problem.contractor.workOrderId})
                    </span>
                    <span className="font-mono text-theme-muted">
                      Due: {problem.expectedCompletion ? new Date(problem.expectedCompletion).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* History audit log */}
          <div className="space-y-2">
            <span className="font-semibold text-theme-primary block uppercase tracking-wider text-[11px]">
              Audit Log & Status History
            </span>
            <div className="bg-surface rounded-xl border border-theme p-3 space-y-2 max-h-40 overflow-y-auto">
              {problem.history.map((hist, idx) => (
                <div key={hist.id || idx} className="text-xs flex items-start gap-3">
                  <span className="font-mono text-[10px] text-theme-muted whitespace-nowrap mt-0.5">
                    {new Date(hist.timestamp).toLocaleDateString()} {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div>
                    <span className="font-bold text-theme-primary">{hist.status}</span>
                    <span className="text-theme-muted font-medium"> — {hist.updatedBy}</span>
                    {hist.notes && <p className="text-theme-secondary mt-0.5">{hist.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contractor Modal */}
      <ContractorAssignmentModal
        problem={problem}
        isOpen={showContractorModal}
        onClose={() => setShowContractorModal(false)}
      />

      {/* Completion Modal */}
      <CompletionProofModal
        problem={problem}
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
      />
    </div>
  );
};
