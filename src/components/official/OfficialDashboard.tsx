import React from 'react';
import { useCivic } from '../../context/CivicContext';
import { Problem, isProblemActive } from '../../types';
import { AnimatedNumber } from '../common/AnimatedNumber';
import {
  AlertCircle,
  Building2,
  HardHat,
  MapPin,
  Shield,
  Sparkles,
} from 'lucide-react';

interface Props {
  onOpenDetails: (problem: Problem) => void;
}

export const OfficialDashboard: React.FC<Props> = ({ onOpenDetails }) => {
  const {
    currentUser,
    problems,
    stats,
    setCurrentTab,
    jurisdictionFilterActive,
    setJurisdictionFilterActive,
  } = useCivic();

  if (!currentUser) return null;

  // Filter problems for official: assigned to this official or area
  const displayProblems = problems.filter((p) => {
    if (p.isDuplicateOf) return false;
    if (currentUser.isSupervisor) return true;
    if (jurisdictionFilterActive) {
      return p.assigned_official_id === currentUser.id;
    }
    return (
      p.block.toLowerCase() === currentUser.block.toLowerCase() ||
      p.department.toLowerCase() === currentUser.department?.toLowerCase()
    );
  });

  const topCriticalQueue = [...displayProblems]
    .filter((p) => isProblemActive(p.status))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 4);

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Official Identity & Jurisdiction Header (Requirement 19) */}
      <div className="bg-card-theme border border-theme rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs theme-transition">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-olive-dark flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Municipal Command Authority
            </span>
            <span aria-hidden="true" className="text-theme-muted">·</span>
            <span className="font-mono text-xs text-theme-muted font-semibold">
              ID: {currentUser.officialId || 'IMC-ENG-8492'}
            </span>
            {currentUser.isSupervisor && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                Supervisor Oversight
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary tracking-tight">
            Infrastructure Monitoring
          </h1>

          {/* Formatted jurisdiction string: [District] · [Zone] · [Ward] · [Assigned Area] (Requirement 19) */}
          <div className="mt-2 flex items-center gap-2 text-xs text-theme-secondary flex-wrap font-medium">
            <span className="font-semibold text-theme-primary">{currentUser.name}</span>
            <span aria-hidden="true">·</span>
            <span className="text-olive-dark font-semibold">{currentUser.department}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 font-mono text-theme-muted flex-wrap break-words">
              <MapPin className="w-3.5 h-3.5 text-olive-primary shrink-0" />
              <span className="break-words">{currentUser.district} · Zone {currentUser.zone || '7'} · Ward {currentUser.ward || '46'} · {currentUser.block}</span>
            </span>
          </div>
        </div>

        {/* Jurisdiction Filter Toggle */}
        <div className="bg-surface p-3 rounded-xl border border-theme shrink-0 space-y-1.5">
          <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block">
            Scope
          </span>
          <div className="flex items-center gap-1 bg-card-theme p-1 rounded-lg border border-theme text-xs font-medium">
            <button
              onClick={() => setJurisdictionFilterActive(true)}
              className={`px-3 py-1 rounded-md transition-colors ${
                jurisdictionFilterActive
                  ? 'bg-olive-primary text-white font-semibold'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              My Assigned
            </button>
            <button
              onClick={() => setJurisdictionFilterActive(false)}
              className={`px-3 py-1 rounded-md transition-colors ${
                !jurisdictionFilterActive
                  ? 'bg-olive-primary text-white font-semibold'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              Ward Area
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Statistics Cards (Requirement 19: All statistics calculated dynamically, 0 when empty!) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-card-theme border border-theme rounded-xl p-4 shadow-xs theme-transition">
          <span className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider block">
            Active Problems
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-theme-primary mt-2">
            <AnimatedNumber value={stats.activeProblems} />
          </div>
          <span className="text-[10px] text-theme-muted mt-1 block">
            {stats.totalOpen} open · {stats.inProgress} in work
          </span>
        </div>

        <div className="bg-card-theme border border-theme rounded-xl p-4 shadow-xs theme-transition">
          <span className="text-[11px] font-semibold text-[#8A3838] uppercase tracking-wider block">
            Critical
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#8A3838] mt-2">
            <AnimatedNumber value={stats.critical} />
          </div>
          <span className="text-[10px] text-[#8A3838] mt-1 block font-medium">Immediate hazard</span>
        </div>

        <div className="bg-card-theme border border-theme rounded-xl p-4 shadow-xs theme-transition">
          <span className="text-[11px] font-semibold text-olive-dark uppercase tracking-wider block">
            In Progress
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-olive-primary mt-2">
            <AnimatedNumber value={stats.inProgress} />
          </div>
          <span className="text-[10px] text-theme-muted mt-1 block">Contractors active</span>
        </div>

        <div className="bg-card-theme border border-theme rounded-xl p-4 shadow-xs theme-transition">
          <span className="text-[11px] font-semibold text-[#B28A45] uppercase tracking-wider block">
            Overdue
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#B28A45] mt-2">
            <AnimatedNumber value={stats.overdue} />
          </div>
          <span className="text-[10px] text-theme-muted mt-1 block font-medium">Past target deadline</span>
        </div>

        <div className="bg-card-theme border border-theme rounded-xl p-4 shadow-xs theme-transition col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
            Resolved Problems
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            <AnimatedNumber value={stats.resolvedProblems} />
          </div>
          <span className="text-[10px] text-theme-muted mt-1 block">Citizen verified & closed</span>
        </div>
      </div>

      {/* AI Priority Action Queue Snapshot */}
      <div className="bg-card-theme border border-theme rounded-2xl p-6 space-y-4 shadow-xs theme-transition">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-theme-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-olive-primary" />
              Highest Urgent Action Queue
            </h2>
            <p className="text-xs text-theme-muted">
              Problems dynamically ranked by impact score in your assigned jurisdiction
            </p>
          </div>
          {displayProblems.length > 0 && (
            <button
              onClick={() => setCurrentTab('queue')}
              className="text-xs font-semibold text-olive-primary hover:underline"
            >
              View Full Priority Queue →
            </button>
          )}
        </div>

        {/* Proper Empty State when 0 problems exist (Requirement 1 & 19) */}
        {displayProblems.length === 0 ? (
          <div className="bg-surface rounded-xl border border-theme p-8 text-center max-w-md mx-auto space-y-2">
            <p className="text-sm font-bold text-theme-primary">
              No infrastructure problems yet
            </p>
            <p className="text-xs text-theme-secondary leading-relaxed">
              New reports from your assigned area ({currentUser.block}) will automatically route and appear here once submitted by citizens.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topCriticalQueue.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-theme bg-surface hover:bg-card-theme hover:border-olive-primary transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-olive-dark font-bold">{item.id}</span>
                    <span className="font-bold text-theme-primary tabular-nums text-xs">
                      Priority: {item.priorityScore}/100
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-theme-primary mb-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-theme-secondary line-clamp-2 mb-3">
                    {item.description}
                  </p>

                  <div className="text-xs text-theme-muted flex items-center gap-3 flex-wrap border-t border-theme pt-2">
                    <span>
                      Affected: <strong className="text-theme-primary">{item.affectedCount}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Severity: <strong className="text-olive-dark">{item.severity}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Status: <strong className="text-theme-primary">{item.status}</strong>
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-theme-muted font-medium">
                    {item.block} · {item.department}
                  </span>
                  <button
                    onClick={() => onOpenDetails(item)}
                    className="px-3 py-1.5 bg-olive-primary hover:bg-olive-dark text-white font-semibold text-xs rounded-lg transition-colors"
                  >
                    Inspect Defect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => setCurrentTab('official-map')}
          className="bg-card-theme border border-theme rounded-2xl p-5 card-hover cursor-pointer group shadow-xs theme-transition"
        >
          <div className="w-10 h-10 rounded-xl bg-olive-soft/40 text-olive-dark flex items-center justify-center mb-3">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-theme-primary group-hover:text-olive-primary transition-colors">
            Jurisdiction Incident Map
          </h3>
          <p className="text-xs text-theme-muted mt-1">
            Geographic distribution of open defects across {currentUser.block}.
          </p>
        </div>

        <div
          onClick={() => setCurrentTab('health')}
          className="bg-card-theme border border-theme rounded-2xl p-5 card-hover cursor-pointer group shadow-xs theme-transition"
        >
          <div className="w-10 h-10 rounded-xl bg-olive-soft/40 text-olive-dark flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-theme-primary group-hover:text-olive-primary transition-colors">
            Infrastructure Health Intelligence
          </h3>
          <p className="text-xs text-theme-muted mt-1">
            Evaluate repeating structural failure corridors from actual history.
          </p>
        </div>

        <div
          onClick={() => setCurrentTab('contractors')}
          className="bg-card-theme border border-theme rounded-2xl p-5 card-hover cursor-pointer group shadow-xs theme-transition"
        >
          <div className="w-10 h-10 rounded-xl bg-olive-soft/40 text-olive-dark flex items-center justify-center mb-3">
            <HardHat className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-theme-primary group-hover:text-olive-primary transition-colors">
            Contractor Directory & Work Orders
          </h3>
          <p className="text-xs text-theme-muted mt-1">
            Empaneled municipal contractors available for immediate work dispatch.
          </p>
        </div>
      </div>
    </div>
  );
};
