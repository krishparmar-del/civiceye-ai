import React, { useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { CitizenSetupModal } from './CitizenSetupModal';
import { OfficialSetupModal } from './OfficialSetupModal';
import {
  ArrowRight,
  Building2,
  Moon,
  Sun,
  Users,
} from 'lucide-react';

export const LoginLanding: React.FC = () => {
  const { loginAsCitizen, loginAsOfficial, theme, toggleTheme } = useCivic();
  const [showCitizenModal, setShowCitizenModal] = useState(false);
  const [showOfficialModal, setShowOfficialModal] = useState(false);

  return (
    <div className="min-h-screen bg-app text-theme-primary flex flex-col justify-between theme-transition">
      {/* Top minimal header with Theme Toggle */}
      <div className="border-b border-theme bg-card-theme theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-olive-primary inline-block"></span>
            <span className="font-bold text-xl tracking-tight text-theme-primary">
              CivicEye AI
            </span>
            <span className="text-xs text-theme-muted font-mono hidden sm:inline">
              · Municipal Infrastructure Intelligence
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg border border-theme text-theme-secondary hover:text-theme-primary hover:bg-surface theme-transition"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-theme-secondary" />
              ) : (
                <Sun className="w-4 h-4 text-amber-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main hero & role selection content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex flex-col justify-center animate-fade-in">
        {/* Hero title & tagline (Requirement 17) */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-olive-dark mb-4 bg-olive-soft/40 px-3 py-1 rounded-md border border-theme">
            <span>Citizen Reports</span>
            <span aria-hidden="true">·</span>
            <span>AI Prioritization</span>
            <span aria-hidden="true">·</span>
            <span>Verified Resolution</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-theme-primary mb-3">
            CivicEye AI
          </h1>

          <p className="text-lg sm:text-xl text-theme-secondary font-medium max-w-xl mx-auto">
            AI-powered infrastructure monitoring for smarter and more accountable cities.
          </p>
        </div>

        {/* Two large role cards (Requirement 17) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto w-full">
          {/* Card 1: Citizen */}
          <div
            onClick={loginAsCitizen}
            className="bg-card-theme rounded-2xl border border-theme p-8 shadow-xs cursor-pointer group card-hover relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-olive-soft/50 border border-theme text-olive-dark flex items-center justify-center transition-colors group-hover:bg-olive-primary group-hover:text-white">
                <Users className="w-6 h-6 stroke-[1.75]" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-theme-primary mb-1">
                  Citizen
                </h2>
                <p className="text-sm text-theme-secondary leading-relaxed">
                  Report infrastructure problems, see issues in your area, and track their resolution.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs font-semibold text-olive-primary group-hover:text-olive-dark">
                <span>Continue as Citizen</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1.5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-theme">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCitizenModal(true);
                }}
                className="text-[11px] text-theme-muted hover:text-theme-primary transition-colors"
              >
                Custom Profile Setup / Location Change →
              </button>
            </div>
          </div>

          {/* Card 2: Government Official */}
          <div
            onClick={() => loginAsOfficial()}
            className="bg-card-theme rounded-2xl border border-theme p-8 shadow-xs cursor-pointer group card-hover relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-olive-soft/50 border border-theme text-olive-dark flex items-center justify-center transition-colors group-hover:bg-olive-primary group-hover:text-white">
                <Building2 className="w-6 h-6 stroke-[1.75]" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-theme-primary mb-1">
                  Government Official
                </h2>
                <p className="text-sm text-theme-secondary leading-relaxed">
                  Monitor infrastructure issues in your jurisdiction, prioritize problems, and update resolutions.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs font-semibold text-olive-primary group-hover:text-olive-dark">
                <span>Continue as Government Official</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1.5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-theme">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOfficialModal(true);
                }}
                className="text-[11px] text-theme-muted hover:text-theme-primary transition-colors"
              >
                Official ID Credential Verification →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-theme bg-card-theme py-6 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-theme-muted flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CivicEye AI · Pilot Deployment for Municipal Infrastructure Operations</span>
          <span>Single Source of Truth · Real Citizen Records</span>
        </div>
      </footer>

      {/* Profile Modals */}
      <CitizenSetupModal
        isOpen={showCitizenModal}
        onClose={() => setShowCitizenModal(false)}
      />
      <OfficialSetupModal
        isOpen={showOfficialModal}
        onClose={() => setShowOfficialModal(false)}
      />
    </div>
  );
};
