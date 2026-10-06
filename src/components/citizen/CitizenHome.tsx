import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { Problem, isProblemActive } from '../../types';
import { AnimatedNumber } from '../common/AnimatedNumber';
import {
  Check,
  MapPin,
  Plus,
  Users,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  onOpenReportModal: () => void;
  onOpenDetails: (problem: Problem) => void;
}

export const CitizenHome: React.FC<Props> = ({ onOpenReportModal, onOpenDetails }) => {
  const { currentUser, problems, toggleAffected, setCurrentTab } = useCivic();
  const [feedMode, setFeedMode] = useState<'active' | 'resolved'>('active');

  if (!currentUser) return null;

  // Filter problems for citizen's block/area strictly from actual database
  const areaProblems = problems.filter(
    (p) => p.block.toLowerCase() === currentUser.block.toLowerCase() && !p.isDuplicateOf
  );

  const activeAreaProblems = areaProblems.filter((p) => isProblemActive(p.status));
  const resolvedAreaProblems = areaProblems.filter((p) => p.status === 'Closed');

  const openCount = areaProblems.filter(
    (p) => p.status === 'Reported' || p.status === 'Under Review' || p.status === 'Verified'
  ).length;

  const myReportsCount = problems.filter(
    (p) => p.reportedBy?.id === currentUser.id
  ).length;

  const resolvedCount = resolvedAreaProblems.length;

  const affectedIssuesCount = areaProblems.filter(
    (p) => p.affectedUserIds && p.affectedUserIds.includes(currentUser.id)
  ).length;

  const displayProblems = feedMode === 'active' ? activeAreaProblems : resolvedAreaProblems;

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="bg-card-theme border border-theme rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs theme-transition">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary tracking-tight">
            Hello, {currentUser.name}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-theme-secondary font-medium flex-wrap">
            <MapPin className="w-4 h-4 text-olive-primary shrink-0" />
            <span className="break-words">📍 {currentUser.block}, {currentUser.city}</span>
            <span className="text-theme-muted hidden sm:inline">·</span>
            <span className="text-xs text-theme-muted font-mono shrink-0">
              Zone {currentUser.zone || '7'}, Ward {currentUser.ward || '46'}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenReportModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-olive-primary hover:bg-olive-dark text-white font-semibold text-xs rounded-xl transition-all shadow-xs card-hover"
        >
          <Plus className="w-4 h-4" />
          <span>Report a Problem</span>
        </button>
      </div>

      {/* Summary Cards with Animated Numbers (Calculated dynamically from actual DB, 0 when empty!) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card-theme border border-theme rounded-xl p-5 shadow-xs theme-transition">
          <div className="text-xs font-semibold text-theme-muted uppercase tracking-wider">
            Active Problems
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-theme-primary mt-2">
            <AnimatedNumber value={activeAreaProblems.length} />
          </div>
          <div className="text-[11px] text-theme-muted mt-1">
            {openCount} new · {activeAreaProblems.length - openCount} in progress
          </div>
        </div>

        <div className="bg-card-theme border border-theme rounded-xl p-5 shadow-xs theme-transition">
          <div className="text-xs font-semibold text-olive-dark uppercase tracking-wider">
            My Reports
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-olive-primary mt-2">
            <AnimatedNumber value={myReportsCount} />
          </div>
          <div className="text-[11px] text-theme-muted mt-1">
            <button
              onClick={() => setCurrentTab('my-reports')}
              className="text-olive-primary hover:underline font-medium"
            >
              View My Reports →
            </button>
          </div>
        </div>

        <div className="bg-card-theme border border-theme rounded-xl p-5 shadow-xs theme-transition">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Resolved
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            <AnimatedNumber value={resolvedCount} />
          </div>
          <div className="text-[11px] text-theme-muted mt-1">Citizen verified & closed</div>
        </div>

        <div className="bg-card-theme border border-theme rounded-xl p-5 shadow-xs theme-transition">
          <div className="text-xs font-semibold text-theme-muted uppercase tracking-wider">
            Affected Issues
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-theme-primary mt-2">
            <AnimatedNumber value={affectedIssuesCount} />
          </div>
          <div className="text-[11px] text-theme-muted mt-1">Issues you confirmed impact on</div>
        </div>
      </div>

      {/* Section: Problems Around You */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-theme-primary">
              Problems Around You
            </h2>
            <p className="text-xs text-theme-muted">
              Civic infrastructure issues reported in {currentUser.block}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Feed mode toggle */}
            <div className="bg-surface p-1 rounded-xl border border-theme flex items-center text-xs">
              <button
                onClick={() => setFeedMode('active')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  feedMode === 'active'
                    ? 'bg-olive-primary text-white font-semibold shadow-xs'
                    : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                Active ({activeAreaProblems.length})
              </button>
              <button
                onClick={() => setFeedMode('resolved')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  feedMode === 'resolved'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                Resolved ({resolvedAreaProblems.length})
              </button>
            </div>

            {displayProblems.length > 0 && (
              <button
                onClick={() => setCurrentTab('area-feed')}
                className="text-xs font-semibold text-olive-primary hover:underline ml-2"
              >
                View Full Feed →
              </button>
            )}
          </div>
        </div>

        {/* Proper Empty State when 0 problems exist (Requirement 1 & 18) */}
        {displayProblems.length === 0 ? (
          <div className="bg-card-theme border border-theme rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs theme-transition">
            <div className="w-12 h-12 rounded-full bg-olive-soft/40 border border-theme text-olive-dark flex items-center justify-center mx-auto mb-3">
              {feedMode === 'resolved' ? (
                <CheckCircle2 className="w-6 h-6 stroke-[1.5] text-emerald-600" />
              ) : (
                <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
              )}
            </div>
            <h3 className="text-base font-bold text-theme-primary">
              {feedMode === 'resolved'
                ? 'No resolved problems in your area yet'
                : 'No problems reported in your area'}
            </h3>
            <p className="text-xs text-theme-secondary mt-1 mb-6 leading-relaxed max-w-sm mx-auto">
              {feedMode === 'resolved'
                ? 'Once complaints are repaired by the municipal authority and verified by citizens, they will be archived here.'
                : 'Be the first to report an infrastructure issue. Your report will be automatically analyzed by AI and routed to the assigned municipal department.'}
            </p>
            {feedMode === 'active' && (
              <button
                onClick={onOpenReportModal}
                className="px-5 py-2.5 bg-olive-primary hover:bg-olive-dark text-white font-semibold text-xs rounded-xl transition-all shadow-xs card-hover inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Report a Problem</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProblems.slice(0, 6).map((problem, idx) => {
              const isUserAffected = problem.affectedUserIds?.includes(currentUser.id);

              return (
                <div
                  key={problem.id}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className="bg-card-theme rounded-2xl border border-theme overflow-hidden card-hover transition-all flex flex-col justify-between shadow-xs animate-fade-in"
                >
                  <div>
                    {/* Image */}
                    <div className="relative aspect-16/10 bg-surface overflow-hidden">
                      <img
                        src={problem.image}
                        alt={problem.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded">
                        {problem.category}
                      </div>
                      {problem.status === 'Closed' && (
                        <div className="absolute top-2.5 right-2.5 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                          ✓ RESOLVED
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-5 space-y-3">
                      <h3 className="text-sm font-bold text-theme-primary line-clamp-1">
                        {problem.title}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-theme-muted flex-wrap">
                        <span>{problem.block}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-olive-dark">
                          Severity: {problem.severity}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">
                          {new Date(problem.reportedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-theme-secondary line-clamp-2 leading-relaxed">
                        {problem.description}
                      </p>

                      <div className="pt-2 border-t border-theme space-y-1 text-xs">
                        <div className="flex items-center justify-between text-theme-secondary">
                          <span className="text-theme-muted">Status:</span>
                          <span className="font-semibold text-theme-primary">{problem.status}</span>
                        </div>

                        <div className="flex items-center justify-between text-theme-secondary">
                          <span className="text-theme-muted">Department:</span>
                          <span className="truncate max-w-[160px] text-right font-medium">
                            {problem.department}
                          </span>
                        </div>

                        {problem.contractor && (
                          <div className="flex items-center justify-between text-theme-secondary">
                            <span className="text-theme-muted">Contractor:</span>
                            <span className="truncate max-w-[160px] text-right font-medium text-theme-primary">
                              {problem.contractor.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 border-t border-theme mt-2 flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleAffected(problem.id)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                        isUserAffected
                          ? 'bg-olive-soft text-olive-dark border border-olive-primary'
                          : 'bg-surface hover:bg-card-theme text-theme-secondary border border-theme'
                      }`}
                    >
                      {isUserAffected ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-olive-dark stroke-[2.5]" />
                          <span>Affected ({problem.affectedCount})</span>
                        </>
                      ) : (
                        <>
                          <Users className="w-3.5 h-3.5" />
                          <span>I’m Affected ({problem.affectedCount})</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onOpenDetails(problem)}
                      className="py-1.5 px-3 bg-olive-primary hover:bg-olive-dark text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
