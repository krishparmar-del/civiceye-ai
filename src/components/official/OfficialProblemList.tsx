import React, { useState, useMemo } from 'react';
import { useCivic } from '../../context/CivicContext';
import { Problem, isProblemActive } from '../../types';
import {
  Archive,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react';

interface Props {
  onOpenDetails: (problem: Problem) => void;
}

type TabType = 'active' | 'resolved' | 'reopened' | 'all';

export const OfficialProblemList: React.FC<Props> = ({ onOpenDetails }) => {
  const {
    currentUser,
    problems,
    jurisdictionFilterActive,
    setJurisdictionFilterActive,
  } = useCivic();

  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [blockFilter, setBlockFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // Base list considering jurisdiction
  const scopedProblems = useMemo(() => {
    return problems.filter((p) => {
      if (p.isDuplicateOf) return false;
      if (jurisdictionFilterActive && currentUser?.role === 'official') {
        const matchesArea = p.block.toLowerCase() === currentUser.block.toLowerCase();
        const matchesDept = currentUser.department
          ? p.department.toLowerCase() === currentUser.department.toLowerCase()
          : true;
        if (!matchesArea && !matchesDept) return false;
      }
      return true;
    });
  }, [problems, jurisdictionFilterActive, currentUser]);

  // Counts strictly calculated from database
  const activeCount = useMemo(
    () => scopedProblems.filter((p) => isProblemActive(p.status)).length,
    [scopedProblems]
  );
  const resolvedCount = useMemo(
    () => scopedProblems.filter((p) => p.status === 'Closed').length,
    [scopedProblems]
  );
  const reopenedCount = useMemo(
    () => scopedProblems.filter((p) => p.status === 'Reopened').length,
    [scopedProblems]
  );
  const allCount = scopedProblems.length;

  const filteredProblems = useMemo(() => {
    return scopedProblems.filter((p) => {
      // 1. Strict Tab Status Filtering (Requirement 1, 2, 3)
      if (activeTab === 'active') {
        if (!isProblemActive(p.status)) return false;
      } else if (activeTab === 'resolved') {
        if (p.status !== 'Closed') return false;
      } else if (activeTab === 'reopened') {
        if (p.status !== 'Reopened') return false;
      }

      // Priority
      if (priorityFilter !== 'All' && p.priority !== priorityFilter) return false;

      // Category
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;

      // Block
      if (blockFilter !== 'All' && p.block !== blockFilter) return false;

      // Department
      if (deptFilter !== 'All' && p.department !== deptFilter) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          p.id.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.block.toLowerCase().includes(q) ||
          p.reportedBy.name.toLowerCase().includes(q) ||
          (p.contractor?.name && p.contractor.name.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [
    scopedProblems,
    activeTab,
    priorityFilter,
    categoryFilter,
    blockFilter,
    deptFilter,
    search,
  ]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary tracking-tight">
            Jurisdiction Problem Register
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Displaying complaints filtered by municipal administrative area ({currentUser?.block || 'Indore'})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setJurisdictionFilterActive(!jurisdictionFilterActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border border-theme transition-colors ${
              jurisdictionFilterActive
                ? 'bg-olive-primary text-white'
                : 'bg-card-theme text-theme-secondary hover:text-theme-primary hover:bg-surface'
            }`}
          >
            {jurisdictionFilterActive
              ? `My Assigned Ward (${currentUser?.block || 'Tilak Nagar'})`
              : 'All Municipal Wards'}
          </button>
        </div>
      </div>

      {/* Main Tab Navigation: Active vs Resolved vs Reopened vs All (Requirement 1, 2, 3) */}
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
          onClick={() => setActiveTab('reopened')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'reopened'
              ? 'bg-[#8A3838] text-white shadow-xs'
              : 'bg-card-theme text-theme-secondary hover:text-theme-primary hover:bg-surface border border-theme'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reopened</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'reopened'
                ? 'bg-white/20 text-white'
                : 'bg-surface text-theme-primary'
            }`}
          >
            {reopenedCount}
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
          <Archive className="w-3.5 h-3.5" />
          <span>Resolution History</span>
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
        <div className="relative">
          <Search className="w-4 h-4 text-theme-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search problems by keyword, citizen name, ID, contractor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-theme rounded-xl text-theme-primary focus:border-olive-primary focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="text-[10px] text-theme-muted block mb-0.5 font-medium">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-surface border border-theme rounded-lg font-medium text-theme-primary focus:outline-hidden"
            >
              <option value="All">All Categories</option>
              <option value="Pothole">Potholes</option>
              <option value="Road">Roads</option>
              <option value="Streetlight">Streetlights</option>
              <option value="Drainage">Drainage</option>
              <option value="Water">Water Leakage</option>
              <option value="Garbage">Garbage Overflow</option>
              <option value="Footpath">Footpaths</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-theme-muted block mb-0.5 font-medium">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-surface border border-theme rounded-lg font-medium text-theme-primary focus:outline-hidden"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-theme-muted block mb-0.5 font-medium">Locality / Block</label>
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-surface border border-theme rounded-lg font-medium text-theme-primary focus:outline-hidden"
            >
              <option value="All">All Blocks</option>
              <option value="Tilak Nagar">Tilak Nagar</option>
              <option value="Vijay Nagar">Vijay Nagar</option>
              <option value="Palasia">Palasia</option>
              <option value="Bhawarkua">Bhawarkua</option>
              <option value="Rau">Rau</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-theme-muted block mb-0.5 font-medium">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-surface border border-theme rounded-lg font-medium text-theme-primary focus:outline-hidden"
            >
              <option value="All">All Departments</option>
              <option value="Road Maintenance">Road Maintenance</option>
              <option value="Stormwater & Drainage">Stormwater & Drainage</option>
              <option value="Public Electrical & Lighting">Public Electrical</option>
              <option value="Municipal Solid Waste">Solid Waste</option>
              <option value="Water Supply Maintenance">Water Supply</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table / Grid or Proper Empty State */}
      {filteredProblems.length === 0 ? (
        <div className="bg-card-theme border border-theme rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs theme-transition animate-fade-in">
          {activeTab === 'resolved' ? (
            <>
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-theme-primary">
                No resolved problems yet
              </h3>
              <p className="text-xs text-theme-secondary mt-1 leading-relaxed">
                Problems marked completed and confirmed by citizens will automatically appear in this resolved register.
              </p>
            </>
          ) : activeTab === 'reopened' ? (
            <>
              <RefreshCw className="w-10 h-10 text-theme-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-theme-primary">
                No reopened problems
              </h3>
              <p className="text-xs text-theme-secondary mt-1 leading-relaxed">
                When citizens report that a repaired defect still exists on the ground, it will be flagged here for immediate re-inspection.
              </p>
            </>
          ) : (
            <>
              <Layers className="w-10 h-10 text-theme-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-theme-primary">
                No active problems found
              </h3>
              <p className="text-xs text-theme-secondary mt-1 leading-relaxed">
                {activeCount === 0
                  ? `No infrastructure problems yet. New reports from your assigned area (${currentUser?.block || 'Tilak Nagar'}) will appear here.`
                  : 'No complaints match your active filter criteria.'}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-card-theme border border-theme rounded-2xl overflow-hidden shadow-xs theme-transition">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-theme text-theme-muted font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">ID & Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4 text-center">Affected</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Contractor</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {filteredProblems.map((prob) => {
                  const priorityClass =
                    prob.priority === 'Critical'
                      ? 'text-[#8A3838] font-bold bg-[#8A3838]/10'
                      : prob.priority === 'High'
                      ? 'text-[#B28A45] font-semibold bg-[#B28A45]/10'
                      : 'text-theme-primary bg-surface';

                  return (
                    <tr key={prob.id} className="hover:bg-surface/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] text-olive-dark font-bold">{prob.id}</div>
                        <div className="font-bold text-theme-primary line-clamp-1 max-w-xs">
                          {prob.title}
                        </div>
                        {prob.duplicateCount && prob.duplicateCount > 0 ? (
                          <span className="text-[10px] text-olive-dark font-medium">
                            +{prob.duplicateCount} duplicate reports grouped
                          </span>
                        ) : null}
                      </td>

                      <td className="py-3 px-4 font-medium text-theme-primary">
                        {prob.category}
                      </td>

                      <td className="py-3 px-4 text-theme-secondary">
                        <div>{prob.block}</div>
                        <div className="text-[10px] text-theme-muted font-mono">
                          Zone {prob.zone}, Ward {prob.ward}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${priorityClass}`}>
                          {prob.priority} ({prob.priorityScore})
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-theme-primary tabular-nums">
                        {prob.affectedCount}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            prob.status === 'Closed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : prob.status === 'Reopened'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold'
                              : prob.status === 'Pending Citizen Verification'
                              ? 'bg-olive-soft text-olive-dark font-bold'
                              : prob.status === 'Work in Progress'
                              ? 'bg-[#B28A45]/15 text-[#B28A45]'
                              : 'bg-surface text-theme-secondary border border-theme'
                          }`}
                        >
                          {prob.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-theme-secondary">
                        {prob.contractor ? (
                          <div>
                            <div className="font-medium text-theme-primary">{prob.contractor.name}</div>
                            <div className="text-[10px] text-theme-muted font-mono">
                              {prob.contractor.workOrderId}
                            </div>
                          </div>
                        ) : (
                          <span className="text-theme-muted italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onOpenDetails(prob)}
                          className="px-3 py-1 bg-olive-primary hover:bg-olive-dark text-white font-semibold rounded-lg text-xs transition-colors shadow-xs card-hover"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
