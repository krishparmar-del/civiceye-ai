import React, { useState, useMemo } from 'react';
import { useCivic } from '../../context/CivicContext';
import { Problem, isProblemActive } from '../../types';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Flame,
  HardHat,
  HelpCircle,
  Layers,
  MapPin,
  Repeat,
  Sliders,
  Sparkles,
  Users,
} from 'lucide-react';

interface Props {
  onOpenDetails: (problem: Problem) => void;
}

export const PriorityQueueView: React.FC<Props> = ({ onOpenDetails }) => {
  const {
    currentUser,
    problems,
    priorityWeights,
    setPriorityWeights,
    jurisdictionFilterActive,
    setJurisdictionFilterActive,
  } = useCivic();

  const [expandedFactorsId, setExpandedFactorsId] = useState<string | null>(null);
  const [showWeightsModal, setShowWeightsModal] = useState(false);
  const [tempWeights, setTempWeights] = useState(priorityWeights);

  // Filter by jurisdiction if active
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (p.isDuplicateOf) return false;
      if (!isProblemActive(p.status)) return false;

      if (jurisdictionFilterActive && currentUser?.role === 'official') {
        const matchesArea = p.block.toLowerCase() === currentUser.block.toLowerCase();
        const matchesDept = currentUser.department
          ? p.department.toLowerCase() === currentUser.department.toLowerCase()
          : true;
        return matchesArea || matchesDept;
      }
      return true;
    });
  }, [problems, jurisdictionFilterActive, currentUser]);

  // Rank strictly by AI Priority Score descending
  const rankedProblems = useMemo(() => {
    return [...filteredProblems].sort((a, b) => b.priorityScore - a.priorityScore);
  }, [filteredProblems]);

  const toggleFactors = (id: string) => {
    setExpandedFactorsId((prev) => (prev === id ? null : id));
  };

  const getAgeString = (reportedAtIso: string) => {
    const hours = Math.max(1, Math.floor((Date.now() - new Date(reportedAtIso).getTime()) / (1000 * 60 * 60)));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary tracking-tight flex items-center gap-2">
            <span>AI Recommended Priority Queue</span>
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Deterministic + AI hybrid scoring ranking infrastructure issues by immediate public safety & community impact
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Jurisdiction Toggle */}
          <button
            onClick={() => setJurisdictionFilterActive(!jurisdictionFilterActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border border-theme transition-colors ${
              jurisdictionFilterActive
                ? 'bg-olive-primary text-white'
                : 'bg-card-theme text-theme-secondary hover:text-theme-primary hover:bg-surface'
            }`}
          >
            {jurisdictionFilterActive
              ? `My Jurisdiction (${currentUser?.block || 'Zone 7'})`
              : 'All Indore City Issues'}
          </button>

          {/* Weights Config Button */}
          <button
            onClick={() => {
              setTempWeights(priorityWeights);
              setShowWeightsModal(true);
            }}
            className="px-3 py-1.5 bg-card-theme border border-theme hover:bg-surface text-theme-secondary hover:text-theme-primary text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            title="Configure mathematical weighting formula"
          >
            <Sliders className="w-3.5 h-3.5 text-olive-primary" />
            <span>Formula Weights</span>
          </button>
        </div>
      </div>

      {/* Queue List or Empty State */}
      {rankedProblems.length === 0 ? (
        <div className="bg-card-theme border border-theme rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs theme-transition animate-fade-in">
          <Layers className="w-10 h-10 text-theme-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-theme-primary">
            No infrastructure problems yet
          </h3>
          <p className="text-xs text-theme-secondary mt-1 leading-relaxed">
            New reports from your assigned area ({currentUser?.block || 'Tilak Nagar'}) will appear here once citizens submit complaints.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rankedProblems.map((prob, index) => {
            const rank = index + 1;
            const isCritical = prob.priority === 'Critical' || prob.priorityScore >= 90;
            const isHigh = prob.priority === 'High' || prob.priorityScore >= 75;
            const isExpanded = expandedFactorsId === prob.id;

            return (
              <div
                key={prob.id}
                className={`bg-card-theme rounded-2xl border transition-all shadow-xs theme-transition ${
                  isCritical
                    ? 'border-[#8A3838]/60 bg-[#8A3838]/5'
                    : isHigh
                    ? 'border-[#B28A45]/60'
                    : 'border-theme'
                }`}
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Rank, Category, and Details */}
                    <div className="flex items-start gap-4">
                      {/* Rank Badge */}
                      <div
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 tabular-nums ${
                          isCritical
                            ? 'bg-[#8A3838]/15 border border-[#8A3838]/30 text-[#8A3838]'
                            : isHigh
                            ? 'bg-[#B28A45]/15 border border-[#B28A45]/30 text-[#B28A45]'
                            : 'bg-surface border border-theme text-theme-primary'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider">Rank</span>
                        <span className="text-base font-extrabold leading-none">#{rank}</span>
                      </div>

                      {/* Problem Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className="font-mono text-olive-dark font-bold">{prob.id}</span>
                          <span aria-hidden="true" className="text-theme-muted">·</span>
                          <span className="font-semibold text-theme-primary">{prob.category}</span>
                          <span aria-hidden="true" className="text-theme-muted">·</span>
                          <span className="text-theme-secondary flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-olive-primary" />
                            {prob.block}, {prob.city}
                          </span>
                          {prob.duplicateCount && prob.duplicateCount > 0 ? (
                            <span className="bg-olive-soft text-olive-dark font-semibold px-2 py-0.5 rounded text-[10px]">
                              {prob.duplicateCount + 1} Reports
                            </span>
                          ) : null}
                        </div>

                        <h3 className="text-base font-bold text-theme-primary leading-snug">
                          {prob.title}
                        </h3>

                        <div className="text-xs text-theme-secondary">
                          Recommended Action:{' '}
                          <strong className="text-theme-primary font-semibold">
                            {prob.aiAnalysis.recommendedAction}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Metrics grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface p-3 rounded-xl border border-theme text-center text-xs">
                      <div>
                        <span className="text-[10px] text-theme-muted block uppercase">Severity</span>
                        <strong className="text-olive-dark font-bold tabular-nums">
                          {prob.severityScore}/100
                        </strong>
                      </div>

                      <div>
                        <span className="text-[10px] text-theme-muted block uppercase">Affected</span>
                        <strong className="text-theme-primary font-bold tabular-nums">
                          {prob.affectedCount} citizens
                        </strong>
                      </div>

                      <div>
                        <span className="text-[10px] text-theme-muted block uppercase">Recurrence</span>
                        <strong className="text-theme-primary font-bold tabular-nums">
                          {prob.recurrenceCount || 1} report{(prob.recurrenceCount || 1) > 1 ? 's' : ''}
                        </strong>
                      </div>

                      <div>
                        <span className="text-[10px] text-theme-muted block uppercase">Age</span>
                        <strong className="text-theme-primary font-medium font-mono text-[11px]">
                          {getAgeString(prob.reportedAt)}
                        </strong>
                      </div>
                    </div>

                    {/* Right: Score & Inspect Button */}
                    <div className="flex items-center lg:flex-col lg:items-end justify-between gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-theme-muted block uppercase tracking-wider font-semibold">
                          AI Priority Score
                        </span>
                        <div
                          className={`text-2xl font-black tabular-nums ${
                            isCritical ? 'text-[#8A3838]' : isHigh ? 'text-[#B28A45]' : 'text-olive-primary'
                          }`}
                        >
                          {prob.priorityScore}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFactors(prob.id)}
                          className="p-2 text-theme-secondary hover:text-theme-primary rounded-xl border border-theme hover:bg-surface transition-colors"
                          title="View reasoning factors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => onOpenDetails(prob)}
                          className="px-4 py-2 bg-olive-primary hover:bg-olive-dark text-white font-semibold text-xs rounded-xl transition-colors whitespace-nowrap shadow-xs card-hover"
                        >
                          Inspect & Action
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Why is this high priority? Decision Factor Drawer */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-theme bg-surface -mx-5 -mb-5 p-5 rounded-b-2xl space-y-2">
                      <span className="text-xs font-bold text-theme-primary flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-olive-primary" />
                        Why is this prioritized?
                      </span>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-theme-secondary pt-1">
                        {prob.aiAnalysis.reasonFactors.map((fac, i) => (
                          <li key={i} className="flex items-start gap-2 bg-card-theme p-2.5 rounded-xl border border-theme">
                            <span className="text-olive-dark font-bold">✓</span>
                            <span>{fac}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-2 text-[10px] text-theme-muted flex items-center justify-between flex-wrap gap-2">
                        <span>Formula: Severity ({priorityWeights.severityWeight}%) + Affected ({priorityWeights.affectedWeight}%) + Recurrence ({priorityWeights.recurrenceWeight}%) + Age ({priorityWeights.complaintAgeWeight}%) + Transit Risk ({priorityWeights.vulnerableLocationWeight}%)</span>
                        <span className="font-mono">Department: {prob.department}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Priority Scoring Formula Configuration Modal */}
      {showWeightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card-theme rounded-2xl max-w-lg w-full border border-theme shadow-xl p-6 space-y-5 text-xs theme-transition animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-theme-primary">
                Configure Priority Scoring Formula
              </h3>
              <p className="text-xs text-theme-muted mt-0.5">
                Adjust deterministic municipal weights to adapt prioritization to monsoon, budget, or traffic conditions
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between font-semibold text-theme-primary mb-1">
                  <span>Physical Severity Weight</span>
                  <span className="font-mono tabular-nums">{tempWeights.severityWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={tempWeights.severityWeight}
                  onChange={(e) => setTempWeights({ ...tempWeights, severityWeight: parseInt(e.target.value) })}
                  className="w-full accent-[#65734A]"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-theme-primary mb-1">
                  <span>Affected Population Weight</span>
                  <span className="font-mono tabular-nums">{tempWeights.affectedWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={tempWeights.affectedWeight}
                  onChange={(e) => setTempWeights({ ...tempWeights, affectedWeight: parseInt(e.target.value) })}
                  className="w-full accent-[#65734A]"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-theme-primary mb-1">
                  <span>Recurrence & Cluster Weight</span>
                  <span className="font-mono tabular-nums">{tempWeights.recurrenceWeight}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={tempWeights.recurrenceWeight}
                  onChange={(e) => setTempWeights({ ...tempWeights, recurrenceWeight: parseInt(e.target.value) })}
                  className="w-full accent-[#65734A]"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-theme-primary mb-1">
                  <span>Complaint Age / Aging SLA Weight</span>
                  <span className="font-mono tabular-nums">{tempWeights.complaintAgeWeight}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={tempWeights.complaintAgeWeight}
                  onChange={(e) => setTempWeights({ ...tempWeights, complaintAgeWeight: parseInt(e.target.value) })}
                  className="w-full accent-[#65734A]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-theme flex items-center justify-end gap-2">
              <button
                onClick={() => setShowWeightsModal(false)}
                className="px-4 py-2 font-medium text-theme-secondary hover:text-theme-primary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setPriorityWeights(tempWeights);
                  setShowWeightsModal(false);
                }}
                className="px-4 py-2 bg-olive-primary text-white font-semibold rounded-xl hover:bg-olive-dark transition-colors shadow-xs"
              >
                Apply Weights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
