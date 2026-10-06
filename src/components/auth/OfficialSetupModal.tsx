import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { Building2, Shield, X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialSetupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { allOfficials, loginWithProfile, switchOfficialAccount } = useCivic();

  const [selectedOfficialId, setSelectedOfficialId] = useState<string>(
    allOfficials[0]?.id || 'off_rahul'
  );

  if (!isOpen) return null;

  const handleSelectOfficial = (off: any) => {
    loginWithProfile(off);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card-theme rounded-2xl max-w-lg w-full border border-theme shadow-xl overflow-hidden my-8 animate-fade-in">
        <div className="p-6 border-b border-theme flex items-center justify-between bg-surface">
          <div>
            <h3 className="text-base font-bold text-theme-primary flex items-center gap-2">
              <Shield className="w-4 h-4 text-olive-primary" />
              Government Official Authentication
            </h3>
            <p className="text-xs text-theme-muted mt-0.5">
              Select an authorized municipal employee identity to inspect their assigned jurisdiction
            </p>
          </div>
          <button onClick={onClose} className="text-theme-muted hover:text-theme-primary p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-theme-primary uppercase tracking-wider">
              Authorized Municipal Accounts (Indore Municipal Corporation)
            </label>

            <div className="space-y-2">
              {allOfficials.map((off) => (
                <div
                  key={off.id}
                  onClick={() => handleSelectOfficial(off)}
                  className="p-3.5 rounded-xl border border-theme bg-surface hover:border-olive-primary hover:bg-card-theme cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-theme-primary group-hover:text-olive-primary transition-colors">
                        {off.name}
                      </span>
                      <span className="font-mono text-[10px] text-theme-muted bg-card-theme px-1.5 py-0.5 rounded border border-theme">
                        {off.officialId}
                      </span>
                      {off.isSupervisor && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                          Supervisor
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-theme-secondary flex items-center gap-1.5">
                      <span>{off.department}</span>
                      <span aria-hidden="true">·</span>
                      <span>{off.block} (Zone {off.zone}, Ward {off.ward})</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs font-semibold bg-olive-primary text-white rounded-lg group-hover:bg-olive-dark transition-colors"
                  >
                    Enter
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-surface border border-theme rounded-xl text-[11px] text-theme-muted">
            <strong>Jurisdiction Access Policy (Requirement 20 & 24):</strong> Each official only receives and can modify problems belonging to their authorized department and area. Supervisors have citywide oversight.
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-theme-muted hover:text-theme-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
