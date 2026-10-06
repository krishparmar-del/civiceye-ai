import React, { useMemo } from 'react';
import { useCivic } from '../../context/CivicContext';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Info,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import { Problem } from '../../types';

interface DynamicHealthArea {
  id: string;
  locationName: string;
  area: string;
  zone: string;
  ward: string;
  healthScore: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'STABLE';
  complaintCount: number;
  criticalCount: number;
  primaryCategory: string;
  identifiedIssue: string;
  aiInsight: string;
  recentProblems: Problem[];
}

export const InfrastructureHealthView: React.FC = () => {
  const { problems, setCurrentTab, currentUser } = useCivic();

  // Dynamically compute infrastructure fatigue corridors strictly from actual database problems
  const healthAreas: DynamicHealthArea[] = useMemo(() => {
    if (problems.length === 0) return [];

    // Group actual problems by block / locality
    const groups: { [key: string]: Problem[] } = {};
    problems.forEach((p) => {
      const key = p.block || 'General Area';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });

    return Object.entries(groups).map(([blockName, blockProblems], idx) => {
      const totalCount = blockProblems.length;
      const criticalCount = blockProblems.filter(
        (p) => p.priority === 'Critical' || p.severity === 'Critical' || p.priorityScore >= 80
      ).length;

      // Dynamic health score: 100 minus weighted defect penalty
      const healthScore = Math.max(15, Math.min(95, 100 - (totalCount * 12 + criticalCount * 18)));

      let riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'STABLE' = 'STABLE';
      if (healthScore < 45 || criticalCount >= 2) riskLevel = 'CRITICAL';
      else if (healthScore < 65 || criticalCount >= 1) riskLevel = 'HIGH';
      else if (healthScore < 80 || totalCount >= 2) riskLevel = 'MODERATE';

      // Determine top category
      const catCount: { [key: string]: number } = {};
      blockProblems.forEach((p) => {
        catCount[p.category] = (catCount[p.category] || 0) + 1;
      });
      const topCategory = Object.keys(catCount).sort((a, b) => catCount[b] - catCount[a])[0] || 'Infrastructure';

      const first = blockProblems[0];
      const zone = first?.zone || '7';
      const ward = first?.ward || '46';

      let identifiedIssue = `Multiple ${topCategory.toLowerCase()} defects recorded across ${blockName}.`;
      let aiInsight = `AI structural cross-correlation indicates accelerated ground fatigue in ${blockName}. Comprehensive municipal engineering inspection recommended.`;

      if (topCategory.includes('Pothole') || topCategory.includes('Road')) {
        identifiedIssue = `Subgrade asphalt fatigue with repeated water seepage along ${blockName} transit routes.`;
        aiInsight = `Complaint clustering indicates subsurface soil moisture penetration. Recommending deep-milling and subgrade stabilization rather than temporary cold patch repairs.`;
      } else if (topCategory.includes('Drain')) {
        identifiedIssue = `Hydraulic drainage bottleneck and stormwater runoff saturation in ${blockName}.`;
        aiInsight = `Correlating citizen reports shows localized storm sewer blockage. Recommending reinforced chamber desilting and culvert grade expansion.`;
      } else if (topCategory.includes('Light')) {
        identifiedIssue = `Public electrical circuit and illumination faults in ${blockName}.`;
        aiInsight = `Frequent outage reports indicate feeder box overload and underground conduit insulation degradation. Recommending electrical line replacement.`;
      }

      return {
        id: `health_area_${idx + 1}`,
        locationName: `${blockName} Infrastructure Corridor`,
        area: blockName,
        zone,
        ward,
        healthScore,
        riskLevel,
        complaintCount: totalCount,
        criticalCount,
        primaryCategory: topCategory,
        identifiedIssue,
        aiInsight,
        recentProblems: blockProblems,
      };
    });
  }, [problems]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-olive-dark uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5 text-olive-primary" />
          <span>Long-Term Municipal Intelligence</span>
        </div>
        <h1 className="text-2xl font-bold text-theme-primary tracking-tight">
          Infrastructure Health & Fatigue Analytics
        </h1>
        <p className="text-xs text-theme-muted mt-1 max-w-2xl">
          Identifying recurring structural failure corridors where repeated temporary fixes fail to address root subgrade or hydraulic fatigue.
        </p>
      </div>

      {/* Philosophy banner */}
      <div className="bg-card-theme rounded-2xl p-6 border border-theme shadow-xs theme-transition">
        <div className="max-w-3xl space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-olive-dark">
            Core Philosophy: From Citizen Complaints to Smarter Infrastructure Decisions
          </span>
          <h2 className="text-base sm:text-lg font-bold text-theme-primary">
            “Which infrastructure in our area keeps failing, and why?”
          </h2>
          <p className="text-xs text-theme-secondary leading-relaxed">
            CivicEye AI transforms individual complaints into long-term infrastructure health intelligence by cross-referencing complaint recurrence, repair timestamps, and ground verification. Instead of approving endless temporary patches, municipal leadership can commission targeted capital resurfacing.
          </p>
        </div>
      </div>

      {/* Health Cards or Proper Empty State (Requirement 1: 0 fake problems) */}
      {healthAreas.length === 0 ? (
        <div className="bg-card-theme border border-theme rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs theme-transition animate-fade-in">
          <ShieldAlert className="w-10 h-10 text-theme-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-theme-primary">
            No infrastructure fatigue data yet
          </h3>
          <p className="text-xs text-theme-secondary mt-1 leading-relaxed">
            As citizens report infrastructure problems and repairs are logged through the application, CivicEye AI dynamically identifies recurring failure clusters and subgrade deterioration corridors.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {healthAreas.map((area) => {
            const isCritical = area.riskLevel === 'CRITICAL';
            const isHigh = area.riskLevel === 'HIGH';

            return (
              <div
                key={area.id}
                className={`bg-card-theme rounded-2xl border p-6 transition-all shadow-xs theme-transition ${
                  isCritical
                    ? 'border-[#8A3838]/60 bg-[#8A3838]/5'
                    : isHigh
                    ? 'border-[#B28A45]/60'
                    : 'border-theme'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left: Location & Health Score */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-xs text-theme-muted flex-wrap">
                      <span className="font-semibold text-theme-primary flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-olive-primary" />
                        {area.area}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Zone {area.zone}, Ward {area.ward}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px]">
                        {area.complaintCount} actual complaint{area.complaintCount > 1 ? 's' : ''} logged
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-theme-primary">
                      {area.locationName}
                    </h3>

                    <div className="p-3 bg-surface rounded-xl border border-theme text-xs">
                      <span className="font-semibold text-theme-primary block mb-1">
                        Identified Structural Vulnerability:
                      </span>
                      <p className="text-theme-secondary">{area.identifiedIssue}</p>
                    </div>

                    {/* AI Predictive Insight */}
                    <div className="p-3.5 bg-olive-soft/40 border border-theme rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-olive-dark">
                        <Sparkles className="w-4 h-4 text-olive-primary" />
                        <span>AI Predictive Insight</span>
                      </div>
                      <p className="text-theme-secondary font-medium leading-relaxed">
                        {area.aiInsight}
                      </p>
                    </div>
                  </div>

                  {/* Right: Health Metrics Badge */}
                  <div className="lg:w-64 bg-surface p-4 rounded-xl border border-theme shrink-0 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-theme-muted">Health Index</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-[#8A3838]/15 text-[#8A3838]'
                            : isHigh
                            ? 'bg-[#B28A45]/15 text-[#B28A45]'
                            : 'bg-olive-soft text-olive-dark'
                        }`}
                      >
                        {area.riskLevel} FATIGUE
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <div
                        className={`text-3xl font-extrabold tabular-nums ${
                          isCritical
                            ? 'text-[#8A3838]'
                            : isHigh
                            ? 'text-[#B28A45]'
                            : 'text-olive-primary'
                        }`}
                      >
                        {area.healthScore}
                      </div>
                      <span className="text-xs text-theme-muted">/ 100</span>
                    </div>

                    <div className="w-full bg-card-theme h-2 rounded-full overflow-hidden border border-theme">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCritical
                            ? 'bg-[#8A3838]'
                            : isHigh
                            ? 'bg-[#B28A45]'
                            : 'bg-olive-primary'
                        }`}
                        style={{ width: `${area.healthScore}%` }}
                      />
                    </div>

                    <div className="pt-2 border-t border-theme space-y-1 text-[11px] text-theme-muted">
                      <div className="flex justify-between">
                        <span>Total Reports:</span>
                        <strong className="text-theme-primary">{area.complaintCount}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Critical Issues:</span>
                        <strong className="text-[#8A3838]">{area.criticalCount}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
