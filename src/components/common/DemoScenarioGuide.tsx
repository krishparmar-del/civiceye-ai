import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  UserCheck,
  Building2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const DemoScenarioGuide: React.FC = () => {
  const {
    currentUser,
    loginAsCitizen,
    loginAsOfficial,
    setCurrentTab,
    problems,
    showToast,
  } = useCivic();

  const [isExpanded, setIsExpanded] = useState(false);

  const isCitizen = currentUser?.role === 'citizen';
  const hasProblems = problems.length > 0;

  return (
    <div className="bg-card-theme text-theme-primary border-b border-theme text-xs theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-bold text-olive-dark flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-olive-primary" />
              Live Civic Lifecycle Guide
            </span>
            <span className="hidden md:inline text-theme-secondary">
              Zero fake data · Create real complaints → AI analysis → Official assignment → Citizen verification
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface border border-theme text-theme-muted">
              Active Complaints: <strong className="text-theme-primary">{problems.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-surface hover:bg-card-theme border border-theme text-theme-primary transition-colors font-medium"
            >
              <span>{isExpanded ? 'Hide Workflow' : 'View Workflow Steps'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded Steps Drawer */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-theme grid grid-cols-1 md:grid-cols-3 gap-4 pb-1 animate-fade-in">
            {/* Phase 1: Citizen */}
            <div className="bg-surface p-3.5 rounded-xl border border-theme space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-olive-dark flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-olive-primary" /> 1. Citizen Report
                </span>
                <button
                  onClick={() => {
                    loginAsCitizen();
                    setCurrentTab('home');
                    showToast('Active User: Citizen (Amit Verma, Tilak Nagar)', 'info');
                  }}
                  className="text-[10px] bg-olive-primary hover:bg-olive-dark text-white px-2 py-0.5 rounded font-semibold transition-colors"
                >
                  As Citizen
                </button>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-theme-secondary text-[11px]">
                <li>
                  Click <strong className="text-theme-primary">+ Report a Problem</strong>.
                </li>
                <li>
                  Enter title, description, and upload or select photo.
                </li>
                <li>
                  Live AI analyzes damage, scores severity, and determines municipal jurisdiction.
                </li>
              </ol>
            </div>

            {/* Phase 2: Official */}
            <div className="bg-surface p-3.5 rounded-xl border border-theme space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-olive-dark flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-olive-primary" /> 2. Official Action
                </span>
                <button
                  onClick={() => {
                    loginAsOfficial();
                    setCurrentTab('queue');
                    showToast('Active User: Official (Rahul Sharma, Road Maint)', 'info');
                  }}
                  className="text-[10px] bg-olive-primary hover:bg-olive-dark text-white px-2 py-0.5 rounded font-semibold transition-colors"
                >
                  As Official
                </button>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-theme-secondary text-[11px]">
                <li>
                  Open <strong className="text-theme-primary">AI Priority Queue</strong>.
                </li>
                <li>
                  Inspect problem, assign empaneled civil contractor, and set expected completion.
                </li>
                <li>
                  Upload work completion evidence to request citizen sign-off.
                </li>
              </ol>
            </div>

            {/* Phase 3: Resolution & Verification */}
            <div className="bg-surface p-3.5 rounded-xl border border-theme space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-olive-dark flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-olive-primary" /> 3. Citizen Sign-off
                </span>
                <button
                  onClick={() => {
                    loginAsCitizen();
                    setCurrentTab('my-reports');
                    showToast('Viewing Citizen My Reports', 'info');
                  }}
                  className="text-[10px] bg-olive-primary hover:bg-olive-dark text-white px-2 py-0.5 rounded font-semibold transition-colors"
                >
                  Verify Fix
                </button>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-theme-secondary text-[11px]">
                <li>
                  Status updates to <strong className="text-theme-primary">Pending Citizen Verification</strong>.
                </li>
                <li>
                  Citizen reviews repair note & photo evidence.
                </li>
                <li>
                  Click <strong className="text-theme-primary">✓ Problem Resolved</strong> to close complaint.
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
