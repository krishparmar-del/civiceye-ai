import React from 'react';
import { useCivic } from '../../context/CivicContext';
import { User, MapPin, Mail, Phone, Shield, Building2, LogOut, RefreshCw } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, logout, resetAllData } = useCivic();

  if (!currentUser) return null;

  const isCitizen = currentUser.role === 'citizen';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-theme-primary tracking-tight">
          User Profile & Authentication
        </h1>
        <p className="text-xs text-theme-muted mt-1">
          Registered credentials and municipal geographic assignment
        </p>
      </div>

      <div className="bg-card-theme border border-theme rounded-2xl p-6 space-y-6 shadow-xs theme-transition">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-olive-primary text-white flex items-center justify-center text-xl font-bold shadow-xs">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-theme-primary">{currentUser.name}</h2>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-olive-dark mt-0.5">
              <span>{currentUser.role === 'citizen' ? 'Verified Citizen' : 'Municipal Authority'}</span>
              {currentUser.officialId && <span className="font-mono text-theme-muted">· ID: {currentUser.officialId}</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-theme pt-4">
          <div className="p-3 bg-surface rounded-xl border border-theme">
            <span className="text-theme-muted block mb-0.5">Email Address</span>
            <strong className="text-theme-primary font-mono">{currentUser.email}</strong>
          </div>

          <div className="p-3 bg-surface rounded-xl border border-theme">
            <span className="text-theme-muted block mb-0.5">Phone Number</span>
            <strong className="text-theme-primary font-mono">{currentUser.phone}</strong>
          </div>

          <div className="p-3 bg-surface rounded-xl border border-theme">
            <span className="text-theme-muted block mb-0.5">Jurisdiction Zone & Ward</span>
            <strong className="text-theme-primary">
              Zone {currentUser.zone || '7'}, Ward {currentUser.ward || '46'}
            </strong>
          </div>

          <div className="p-3 bg-surface rounded-xl border border-theme">
            <span className="text-theme-muted block mb-0.5">Assigned Locality / Block</span>
            <strong className="text-theme-primary">
              {currentUser.block}, {currentUser.city}
            </strong>
          </div>

          {!isCitizen && currentUser.department && (
            <div className="p-3 bg-surface rounded-xl border border-theme sm:col-span-2">
              <span className="text-theme-muted block mb-0.5">Municipal Department</span>
              <strong className="text-olive-dark font-semibold">{currentUser.department}</strong>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-theme flex items-center justify-between gap-3">
          <button
            onClick={resetAllData}
            className="px-3.5 py-2 text-xs text-theme-secondary hover:text-theme-primary border border-theme rounded-xl font-medium flex items-center gap-1.5 hover:bg-surface transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Database (0 Problems)
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 bg-[#8A3838] hover:bg-[#722e2e] text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
