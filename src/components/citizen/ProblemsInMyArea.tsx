import React, { useState, useMemo } from 'react';
import { useCivic } from '../../context/CivicContext';
import { Problem, isProblemActive } from '../../types';
import { AnimatedNumber } from '../common/AnimatedNumber';
import {
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  MapPin,
  Plus,
  Search,
  Users,
} from 'lucide-react';

interface Props {
  onOpenDetails: (problem: Problem) => void;
  onOpenReportModal: () => void;
}

type TabType = 'active' | 'resolved' | 'all';

export const ProblemsInMyArea: React.FC<Props> = ({ onOpenDetails, onOpenReportModal }) => {
  const { currentUser, problems, toggleAffected } = useCivic();

  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('priority');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Pothole',
    'Road',
    'Streetlight',
    'Drainage',
    'Garbage',
    'Water',
    'Footpath',
    'Other',
  ];

  // Base list for citizen's area
  const areaProblems = useMemo(() => {
    return problems.filter((p) => {
      if (p.isDuplicateOf) return false;
      return true;
    });
  }, [problems]);

  const activeCount = useMemo(
    () => areaProblems.filter((p) => isProblemActive(p.status)).length,
    [areaProblems]
  );
  const resolvedCount = useMemo(
    () => areaProblems.filter((p) => p.status === 'Closed').length,
    [areaProblems]
  );
  const allCount = areaProblems.length;

  const filteredProblems = useMemo(() => {
    return areaProblems.filter((p) => {
      // 1. Tab Status Filtering (Requirement 1, 2, 3)
      if (activeTab === 'active') {
        if (!isProblemActive(p.status)) return false;
      } else if (activeTab === 'resolved') {
        if (p.status !== 'Closed') return false;
      }

      // Filter by category
      if (categoryFilter !== 'All' && p.category !== categoryFilter) {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.block.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [areaProblems, activeTab, categoryFilter, searchQuery]);

  const sortedProblems = useMemo(() => {
    return [...filteredProblems].sort((a, b) => {
      if (sortBy === 'priority') {
        return b.priorityScore - a.priorityScore;
      }
      if (sortBy === 'affected') {
        return b.affectedCount - a.affectedCount;
      }
      if (sortBy === 'newest') {
        return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      }
      return 0;
    });
  }, [filteredProblems, sortBy]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary tracking-tight">
            Problems in My Area
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Verified infrastructure reports in <strong className="text-theme-primary">{currentUser?.block || 'Indore'}</strong>
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-4 py-2 bg-olive-primary hover:bg-olive-dark text-white text-xs font-semibold rounded-xl transition-all shadow-xs card-hover flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Report a Problem</span>
        </button>
      </div>

      {/* Main Tab Bar: Active Problems vs Resolved Problems vs All (Requirement 1 & 3) */}
      <div className="flex items-center gap-2 border-b border-theme pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'active'
              ? 'bg-olive-primary text-white shadow-xs'
              : 'bg-card-theme text-theme-secondary hover:text-theme-primary hover:bg-surface border border-theme'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Active Problems</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'active'
                ? 'bg-white/20 text-white'
                : 'bg-surface text-theme-primary'
            }`}
          >
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('resolved')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'resolved'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-card-theme text-theme-secondary hover:text-theme-primary hover:bg-surface border border-theme'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Resolved Problems</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'resolved'
                ? 'bg-white/20 text-white'
                : 'bg-surface text-theme-primary'
            }`}
          >
            {resolvedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'all'
              ? 'bg-theme-secondary text-white shadow-xs'
              : 'bg-card-theme text-theme-secondary hover:text-theme-primary hover:bg-surface border border-theme'
          }`}
        >
          <span>All Reports</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-surface text-theme-primary'
            }`}
          >
            {allCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card-theme border border-theme rounded-2xl p-4 space-y-3 shadow-xs theme-transition">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-theme-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, keyword, street, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-theme rounded-xl text-theme-primary focus:border-olive-primary focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="text-theme-muted font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1.5 px-3 bg-card-theme border border-theme rounded-xl text-theme-primary font-medium focus:outline-hidden"
            >
              <option value="priority">Highest Priority</option>
              <option value="affected">Most Affected</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-theme">
          <span className="text-xs text-theme-muted font-medium mr-1 shrink-0">Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs font-medium px-3 py-1 rounded-lg whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-olive-primary text-white font-semibold'
                  : 'bg-surface text-theme-secondary hover:text-theme-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Proper Empty State (Requirement 1 & 29) */}
      {sortedProblems.length === 0 ? (
        <div className="bg-card-theme border border-theme rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs theme-transition animate-fade-in">
          {activeTab === 'resolved' ? (
            <>
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-theme-primary">
                No resolved problems yet
              </h3>
              <p className="text-xs text-theme-secondary mt-1">
                When reported issues in your area are fixed by municipal teams and verified, they appear here.
              </p>
            </>
          ) : (
            <>
              <Layers className="w-10 h-10 text-theme-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-theme-primary">
                No problems reported in your area
              </h3>
              <p className="text-xs text-theme-secondary mt-1 mb-5">
                Be the first to report an infrastructure issue.
              </p>
              <button
                onClick={onOpenReportModal}
                className="px-5 py-2.5 text-xs font-semibold bg-olive-primary text-white rounded-xl hover:bg-olive-dark transition-all card-hover inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Report a Problem</span>
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProblems.map((problem, idx) => {
            const isUserAffected = currentUser
              ? problem.affectedUserIds?.includes(currentUser.id)
              : false;

            return (
              <div
                key={problem.id}
                style={{ animationDelay: `${idx * 40}ms` }}
                className="bg-card-theme rounded-2xl border border-theme overflow-hidden card-hover transition-all flex flex-col justify-between shadow-xs animate-fade-in"
              >
                <div>
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
                        ✓ RESOLVED & VERIFIED
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-sm font-bold text-theme-primary line-clamp-1">
                      {problem.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-theme-muted flex-wrap">
                      <span>{problem.block}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-olive-dark">
                        Priority: {problem.priority}
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
  );
};
