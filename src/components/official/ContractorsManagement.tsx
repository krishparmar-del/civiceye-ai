import React from 'react';
import { useCivic } from '../../context/CivicContext';
import { HardHat, Phone, MapPin, Star, Building2, CheckCircle2 } from 'lucide-react';

export const ContractorsManagement: React.FC = () => {
  const { contractors, problems } = useCivic();

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-theme-primary tracking-tight">
          Approved Municipal Contractors
        </h1>
        <p className="text-xs text-theme-muted mt-1">
          Registered infrastructure civil engineering firms with empanelment under Indore Municipal Corporation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contractors.map((c) => {
          // Dynamically compute active work orders from real database problems
          const activeJobs = problems.filter(
            (p) => p.contractor?.name === c.name && p.status !== 'Closed'
          ).length;

          return (
            <div
              key={c.id}
              className="bg-card-theme border border-theme rounded-2xl p-5 hover:border-olive-primary transition-all flex flex-col justify-between shadow-xs card-hover theme-transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-olive-soft/40 text-olive-dark flex items-center justify-center border border-theme">
                    <HardHat className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{c.rating} / 5.0</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-theme-primary">{c.name}</h3>
                  <span className="text-xs text-olive-dark font-semibold">{c.department}</span>
                </div>

                <div className="space-y-1.5 text-xs text-theme-secondary border-t border-theme pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-theme-muted">Operating Area:</span>
                    <span className="font-medium text-theme-primary">{c.area}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-theme-muted">Dispatch Contact:</span>
                    <span className="font-mono text-theme-primary font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3 text-olive-primary" />
                      {c.phone}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-theme-muted">Active Work Orders:</span>
                    <strong className="text-theme-primary tabular-nums">
                      {activeJobs} {activeJobs === 1 ? 'order' : 'orders'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-theme flex items-center justify-between text-xs text-olive-dark font-medium">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-olive-primary" /> Empaneled & Active
                </span>
                <span className="font-mono text-[10px] text-theme-muted">{c.id}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
