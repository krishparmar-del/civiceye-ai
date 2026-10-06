import { PriorityLevel, PriorityWeights, SeverityLevel } from '../types';

export const DEFAULT_PRIORITY_WEIGHTS: PriorityWeights = {
  severityWeight: 30,
  affectedWeight: 25,
  recurrenceWeight: 20,
  complaintAgeWeight: 15,
  vulnerableLocationWeight: 10,
};

export interface PriorityCalculationResult {
  score: number; // 0-100
  level: PriorityLevel;
  factors: string[];
  subscores: {
    severityScorePart: number;
    affectedScorePart: number;
    recurrenceScorePart: number;
    ageScorePart: number;
    locationScorePart: number;
  };
}

export function calculatePriorityScore(
  severity: SeverityLevel,
  severityScore: number, // 0-100
  affectedCount: number,
  recurrenceCount: number,
  reportedAtIso: string,
  isVulnerableLocation: boolean = false,
  weights: PriorityWeights = DEFAULT_PRIORITY_WEIGHTS
): PriorityCalculationResult {
  // 1. Severity subscore (0 to weights.severityWeight)
  // Severity score is 0-100
  const normalizedSeverity = Math.min(100, Math.max(0, severityScore)) / 100;
  const severityScorePart = Math.round(normalizedSeverity * weights.severityWeight);

  // 2. Affected Citizens subscore (0 to weights.affectedWeight)
  // 1 affected = ~5%, 20 affected = ~50%, 50+ affected = 100%
  const affectedFactor = Math.min(1, Math.log10(Math.max(1, affectedCount) + 1) / Math.log10(60));
  const affectedScorePart = Math.round(affectedFactor * weights.affectedWeight);

  // 3. Recurrence subscore (0 to weights.recurrenceWeight)
  // 1 report = 15%, 3 reports = 50%, 6+ reports = 100%
  const recurrenceFactor = Math.min(1, (recurrenceCount - 1) / 5);
  const recurrenceScorePart = Math.round(Math.max(0, recurrenceFactor) * weights.recurrenceWeight);

  // 4. Complaint Age subscore (0 to weights.complaintAgeWeight)
  const now = new Date('2026-10-05T23:00:00Z').getTime(); // anchored demo time
  const reportedTime = new Date(reportedAtIso).getTime();
  const ageHours = Math.max(0, (now - reportedTime) / (1000 * 60 * 60));
  const ageDays = ageHours / 24;
  // 0 days = 10%, 2 days = 50%, 5+ days unresolved = 100%
  const ageFactor = Math.min(1, ageDays / 5);
  const ageScorePart = Math.round(ageFactor * weights.complaintAgeWeight);

  // 5. Vulnerable Location subscore (0 to weights.vulnerableLocationWeight)
  const locationFactor = isVulnerableLocation ? 1.0 : 0.4;
  const locationScorePart = Math.round(locationFactor * weights.vulnerableLocationWeight);

  const totalScore = Math.min(
    100,
    Math.max(10, severityScorePart + affectedScorePart + recurrenceScorePart + ageScorePart + locationScorePart)
  );

  let level: PriorityLevel = 'Low';
  if (totalScore >= 85) level = 'Critical';
  else if (totalScore >= 70) level = 'High';
  else if (totalScore >= 45) level = 'Medium';
  else level = 'Low';

  // Build transparent decision factors ("Why is this high priority?")
  const factors: string[] = [];

  if (severity === 'Critical' || severityScore >= 85) {
    factors.push(`Critical physical risk score (${severityScore}/100) endangering public safety`);
  } else if (severity === 'High' || severityScore >= 70) {
    factors.push(`High severity infrastructure defect (${severityScore}/100)`);
  } else if (severity === 'Medium') {
    factors.push(`Moderate structural degradation requiring maintenance`);
  }

  if (affectedCount >= 30) {
    factors.push(`${affectedCount} verified nearby citizens confirmed affected`);
  } else if (affectedCount > 10) {
    factors.push(`${affectedCount} neighborhood residents affected`);
  } else if (affectedCount > 1) {
    factors.push(`${affectedCount} citizens registered impact`);
  }

  if (recurrenceCount >= 4) {
    factors.push(`High recurrence: similar problem reported ${recurrenceCount} times in this cluster`);
  } else if (recurrenceCount >= 2) {
    factors.push(`Repeated issue: ${recurrenceCount} related reports in vicinity`);
  }

  if (ageDays >= 3) {
    factors.push(`Complaint aging: Unresolved for ${Math.floor(ageDays)} days`);
  } else if (ageHours >= 24) {
    factors.push(`Report active for over 24 hours`);
  }

  if (isVulnerableLocation) {
    factors.push(`High-density transit artery / school / hospital zone proximity`);
  }

  if (factors.length === 0) {
    factors.push('Standard single-incident priority baseline');
  }

  return {
    score: totalScore,
    level,
    factors,
    subscores: {
      severityScorePart,
      affectedScorePart,
      recurrenceScorePart,
      ageScorePart,
      locationScorePart,
    },
  };
}
