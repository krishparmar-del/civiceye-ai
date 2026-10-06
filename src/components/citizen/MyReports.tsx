import React from 'react';
import { useCivic } from '../../context/CivicContext';
import { Problem } from '../../types';
import {
  Eye,
  FileText,
  Plus,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  onOpenDetails: (problem: Problem) => void;
  onOpenReportModal: () => void;
}

export const MyReports: React.FC<Props> = ({ onOpenDetails, onOpenReportModal }) => {
  const { currentUser, problems } = useCivic();

  if (!currentUser) return null;

  const myReports = problems.filter((p) => p.reportedBy?.id === currentUser.id);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary tracking-tight">
            My Submitted Reports
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Tracking lifecycle and verification for issues reported by {currentUser.name}
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-4 py-2 bg-olive-primary hover:bg-olive-dark text-white text-xs font-semibold rounded-xl transition-all shadow-xs card-hover flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Complaint</span>
        </button>
      </div>

      {myReports.length === 0 ? (
        <div className="bg-card-theme border border-theme rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs theme-transition animate-fade-in">
          <FileText className="w-10 h-10 text-theme-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-theme-primary">No reports yet</h3>
          <p className="text-xs text-theme-secondary mt-1 mb-5">
            You haven't submitted any civic complaints under your account.
          </p>
          <button
            onClick={onOpenReportModal}
            className="px-5 py-2.5 text-xs font-semibold bg-olive-primary text-white rounded-xl hover:bg-olive-dark transition-all card-hover inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Report a Problem</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myReports.map((problem) => {
            const isPendingVerification = problem.status === 'Pending Citizen Verification';

            return (
              <div
                key={problem.id}
                className={`bg-card-theme rounded-2xl border p-5 transition-all flex flex-col justify-between shadow-xs card-hover ${
                  isPendingVerification
                    ? 'border-olive-primary bg-olive-soft/10 ring-1 ring-olive-primary/30'
                    : 'border-theme'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-olive-dark">{problem.id}</span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        problem.status === 'Closed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : isPendingVerification
                          ? 'bg-olive-soft text-olive-dark font-bold'
                          : 'bg-surface text-theme-secondary border border-theme'
                      }`}
                    >
                      {problem.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-theme-primary mb-1">
                    {problem.title}
                  </h3>

                  <p className="text-xs text-theme-secondary line-clamp-2 mb-4 leading-relaxed">
                    {problem.description}
                  </p>

                  <div className="space-y-1 text-xs text-theme-secondary border-t border-theme pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-theme-muted">Location:</span>
                      <span className="font-medium text-theme-primary">{problem.block}, {problem.city}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-theme-muted">Department:</span>
                      <span className="font-medium text-theme-primary">{problem.department}</span>
                    </div>

                    {problem.expectedCompletion && (
                      <div className="flex items-center justify-between">
                        <span className="text-theme-muted">Expected Completion:</span>
                        <span className="font-mono text-theme-primary">
                          {new Date(problem.expectedCompletion).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-theme">
                  {isPendingVerification ? (
                    <button
                      onClick={() => onOpenDetails(problem)}
                      className="w-full py-2 px-3 bg-olive-primary hover:bg-olive-dark text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Contractor Resolution</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenDetails(problem)}
                      className="w-full py-2 px-3 bg-surface hover:bg-card-theme border border-theme text-theme-primary font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-olive-primary" />
                      <span>View Timeline & Status</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
