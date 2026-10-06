import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { Problem } from '../../types';
import { AnimatedNumber } from '../common/AnimatedNumber';
import {
  Check,
  HardHat,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';

interface Props {
  problem: Problem | null;
  onClose: () => void;
}

export const CitizenProblemDetailsModal: React.FC<Props> = ({ problem, onClose }) => {
  const {
    currentUser,
    toggleAffected,
    verifyProblemResolution,
  } = useCivic();

  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);

  if (!problem) return null;

  const isUserAffected = currentUser
    ? problem.affectedUserIds?.includes(currentUser.id)
    : false;

  const timelineStages = [
    { key: 'Reported', label: 'Reported' },
    { key: 'Verified', label: 'Verified' },
    { key: 'Assigned', label: 'Assigned' },
    { key: 'Work in Progress', label: 'In Progress' },
    { key: 'Completed', label: 'Completed' },
    { key: 'Closed', label: 'Closed' },
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'Reported':
      case 'Under Review':
        return 0;
      case 'Verified':
        return 1;
      case 'Assigned':
        return 2;
      case 'Work in Progress':
      case 'In Progress':
        return 3;
      case 'Completed':
      case 'Pending Citizen Verification':
        return 4;
      case 'Closed':
        return 5;
      case 'Reopened':
        return 3;
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(problem.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card-theme rounded-2xl max-w-2xl w-full border border-theme shadow-xl overflow-hidden my-6 theme-transition animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-theme flex items-start justify-between bg-surface theme-transition gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-theme-muted font-mono mb-1 flex-wrap break-words">
              <span className="font-bold text-olive-dark shrink-0">{problem.id}</span>
              <span aria-hidden="true">·</span>
              <span className="shrink-0">{problem.category}</span>
              <span aria-hidden="true">·</span>
              <span className="break-words max-w-full">{problem.address || `${problem.block}, ${problem.city}`}</span>
            </div>
            <h3 className="text-lg font-bold text-theme-primary leading-snug break-words">
              {problem.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-theme-muted hover:text-theme-primary p-1.5 rounded-lg border border-theme bg-card-theme shadow-xs shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs">
          {/* Main Visual & Community Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-3 min-w-0">
              <div className="aspect-16/10 bg-surface rounded-xl overflow-hidden border border-theme">
                <img
                  src={problem.image}
                  alt={problem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* I'm Affected card */}
              <div className="bg-surface p-3.5 rounded-xl border border-theme space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-theme-primary flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-olive-primary" /> Community Impact
                  </span>
                  <span className="font-bold text-theme-primary tabular-nums">
                    <AnimatedNumber value={problem.affectedCount} /> citizens affected
                  </span>
                </div>
                <button
                  onClick={() => toggleAffected(problem.id)}
                  className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    isUserAffected
                      ? 'bg-olive-soft text-olive-dark border border-olive-primary shadow-xs'
                      : 'bg-card-theme hover:bg-surface text-theme-secondary border border-theme'
                  }`}
                >
                  {isUserAffected ? (
                    <>
                      <Check className="w-4 h-4 text-olive-dark stroke-[2.5]" />
                      <span>✓ I’m Affected (Confirmed)</span>
                    </>
                  ) : (
                    <span>＋ I’m Affected</span>
                  )}
                </button>
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-3 min-w-0">
              <div>
                <span className="font-semibold text-theme-muted block mb-1">Description</span>
                <p className="text-theme-secondary leading-relaxed bg-surface p-3 rounded-xl border border-theme break-words">
                  {problem.description}
                </p>
              </div>

              {/* Exact Location & Address with robust word wrapping */}
              <div className="p-3 bg-surface rounded-xl border border-theme space-y-1 overflow-hidden">
                <span className="text-theme-muted block text-[11px] font-semibold">Incident Location & Address</span>
                <p className="text-theme-primary text-xs font-medium break-words leading-relaxed">
                  {problem.address || `${problem.block}, ${problem.city}`}
                </p>
                <div className="text-[10px] text-theme-muted font-mono mt-0.5">
                  Zone {problem.zone}, Ward {problem.ward} · GPS: {problem.latitude.toFixed(4)}, {problem.longitude.toFixed(4)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-surface rounded-xl border border-theme">
                <div>
                  <span className="text-theme-muted block text-[11px]">Severity</span>
                  <strong className="text-olive-dark">{problem.severity}</strong>
                </div>
                <div>
                  <span className="text-theme-muted block text-[11px]">Priority</span>
                  <strong className="text-theme-primary">{problem.priority} ({problem.priorityScore}/100)</strong>
                </div>
                <div>
                  <span className="text-theme-muted block text-[11px]">Department</span>
                  <strong className="text-theme-secondary truncate block">{problem.department}</strong>
                </div>
                <div>
                  <span className="text-theme-muted block text-[11px]">Status</span>
                  <strong className="text-theme-primary">{problem.status}</strong>
                </div>
              </div>

              {/* Contractor info */}
              <div className="p-3 bg-surface border border-theme rounded-xl space-y-1 overflow-hidden">
                <span className="font-semibold text-theme-muted flex items-center gap-1 text-[11px]">
                  <HardHat className="w-3.5 h-3.5 text-olive-primary shrink-0" /> Assigned Contractor
                </span>
                {problem.contractor ? (
                  <>
                    <div className="text-theme-primary font-bold text-xs break-words">{problem.contractor.name}</div>
                    <div className="flex items-center justify-between text-theme-secondary text-[11px] flex-wrap gap-1">
                      <span className="font-mono">{problem.contractor.phone}</span>
                      {problem.expectedCompletion && (
                        <span className="font-mono text-olive-dark font-medium">
                          Due: {new Date(problem.expectedCompletion).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-theme-muted italic">
                    Awaiting contractor dispatch by municipal authority.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Citizen Verification prompt if completed */}
          {problem.status === 'Pending Citizen Verification' && (
            <div className="p-4 bg-olive-soft/40 border border-olive-primary rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-olive-dark shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-theme-primary uppercase tracking-wider">
                    Municipal Completion Verification Required
                  </h4>
                  <p className="text-xs text-theme-secondary mt-0.5">
                    The assigned municipal contractor marked this repair work as completed. Please confirm whether the defect has actually been fixed on the ground.
                  </p>
                </div>
              </div>

              {problem.completionDetails && (
                <div className="bg-card-theme p-3 rounded-lg border border-theme text-xs space-y-1">
                  <span className="font-semibold text-theme-primary block">Official Completion Note:</span>
                  <p className="italic text-theme-secondary">"{problem.completionDetails.completionNote}"</p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => verifyProblemResolution(problem.id, true, verificationFeedback)}
                  className="flex-1 py-2 px-3 bg-olive-primary hover:bg-olive-dark text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>✅ Problem Resolved</span>
                </button>
                <button
                  onClick={() => {
                    if (!showFeedbackInput) {
                      setShowFeedbackInput(true);
                    } else {
                      verifyProblemResolution(problem.id, false, verificationFeedback || 'Issue still persists on ground');
                    }
                  }}
                  className="flex-1 py-2 px-3 bg-card-theme border border-rose-300 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>❌ Problem Still Exists</span>
                </button>
              </div>

              {showFeedbackInput && (
                <input
                  type="text"
                  placeholder="Provide brief ground feedback..."
                  value={verificationFeedback}
                  onChange={(e) => setVerificationFeedback(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-card-theme border border-theme rounded-lg focus:outline-hidden"
                />
              )}
            </div>
          )}

          {/* Sequential Animated Timeline (Requirement 13) */}
          <div className="space-y-3 pt-2 border-t border-theme">
            <h4 className="text-xs font-bold text-theme-primary uppercase tracking-wider">
              Resolution Timeline
            </h4>

            <div className="overflow-x-auto pb-2 scrollbar-none">
              <div className="flex items-center min-w-[500px] justify-between">
                {timelineStages.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div
                      key={stage.key}
                      style={{ animationDelay: `${idx * 80}ms` }}
                      className="flex flex-col items-center flex-1 text-center relative animate-fade-in"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 transition-all ${
                          isCompleted
                            ? 'bg-olive-primary text-white shadow-xs'
                            : 'bg-surface text-theme-muted border border-theme'
                        } ${isCurrent ? 'animate-subtle-pulse ring-2 ring-olive-light/50' : ''}`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : idx + 1}
                      </div>

                      <span
                        className={`text-[11px] mt-1.5 leading-tight ${
                          isCurrent
                            ? 'font-bold text-olive-dark'
                            : isCompleted
                            ? 'text-theme-primary font-medium'
                            : 'text-theme-muted'
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Status History from actual database (Requirement 25) */}
            <div className="mt-4 bg-surface rounded-xl border border-theme p-4 space-y-2 max-h-44 overflow-y-auto">
              <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block">
                Recorded Event History
              </span>
              {problem.history.map((hist, idx) => (
                <div key={hist.id || idx} className="text-xs flex items-start gap-3">
                  <span className="text-theme-muted font-mono text-[10px] whitespace-nowrap mt-0.5">
                    {new Date(hist.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div>
                    <span className="font-bold text-theme-primary">{hist.status}</span>{' '}
                    <span className="text-theme-secondary">— by {hist.updatedBy}</span>
                    {hist.notes && <p className="text-theme-muted mt-0.5 italic">{hist.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
