export type UserRole = 'citizen' | 'official';

export type ProblemCategory =
  | 'Pothole'
  | 'Road'
  | 'Streetlight'
  | 'Drainage'
  | 'Garbage'
  | 'Water'
  | 'Footpath'
  | 'Public Building'
  | 'Other';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ProblemStatus =
  | 'Reported'
  | 'Under Review'
  | 'Verified'
  | 'Assigned'
  | 'Work in Progress'
  | 'In Progress'
  | 'Completed'
  | 'Pending Citizen Verification'
  | 'Closed'
  | 'Reopened';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  district: string;
  city: string;
  zone?: string;
  ward?: string;
  block: string;
  address?: string;
  // Official specific
  officialId?: string;
  department?: string;
  isSupervisor?: boolean;
}

export interface ProblemHistoryEntry {
  id: string;
  status: ProblemStatus;
  updatedBy: string;
  updatedById?: string;
  role: UserRole | 'system';
  timestamp: string;
  notes?: string;
  evidenceImage?: string;
}

export interface Contractor {
  id: string;
  name: string;
  phone: string;
  department: string;
  area: string;
  activeWorkOrders: number;
  rating: number;
}

export interface AIAnalysisResult {
  category: ProblemCategory;
  severity: SeverityLevel;
  severityScore: number; // 0-100
  estimatedRisk: number; // 0-100
  priorityScore: number; // 0-100
  recommendedPriority: PriorityLevel;
  possibleAffectedPeople: number;
  potentialDuplicate: boolean;
  duplicateGroupId?: string;
  duplicateConfidence?: number;
  likelyDepartment: string;
  recommendedAction: string;
  reasonFactors: string[];
  confidence: number; // 0-100
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  image: string;
  latitude: number;
  longitude: number;
  district: string;
  city: string;
  zone: string;
  ward: string;
  block: string;
  address?: string;
  severity: SeverityLevel;
  severityScore: number;
  priorityScore: number;
  priority: PriorityLevel;
  status: ProblemStatus;
  reportedBy: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  reportedAt: string;
  affectedCount: number;
  affectedUserIds: string[];
  department: string;
  assigned_official_id: string; // The single authorized official responsible for managing this problem
  assignedOfficial?: {
    id: string;
    name: string;
    officialId: string;
    department?: string;
    zone?: string;
    ward?: string;
    block?: string;
  };
  contractor?: {
    name: string;
    phone: string;
    workOrderId: string;
    assignedAt: string;
    notes?: string;
  };
  expectedCompletion?: string;
  completionDetails?: {
    completionImage?: string;
    completionNote: string;
    completedAt: string;
    completedBy: string;
  };
  citizenVerification?: {
    verifiedAt?: string;
    verifiedBy?: string;
    isResolved: boolean;
    feedback?: string;
  };
  aiAnalysis: AIAnalysisResult;
  history: ProblemHistoryEntry[];
  duplicateCount?: number;
  duplicateReportIds?: string[];
  isDuplicateOf?: string;
  recurrenceCount?: number;
}

export interface NotificationItem {
  id: string;
  recipientRole: UserRole;
  recipientId?: string;
  targetArea?: string;
  problemId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type:
    | 'verified'
    | 'assigned'
    | 'progress'
    | 'completed'
    | 'reopened'
    | 'closed'
    | 'high_priority'
    | 'duplicate_alert'
    | 'affected_surge';
}

export interface InfrastructureHealthArea {
  id: string;
  locationName: string;
  area: string;
  zone: string;
  ward: string;
  healthScore: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'STABLE';
  complaintHistory90Days: number;
  previousRepairs: number;
  repeatReportsAfterRepair: number;
  primaryIssue: string;
  aiInsight: string;
  lastInspectionDate: string;
}

export interface PriorityWeights {
  severityWeight: number; // default 30
  affectedWeight: number; // default 25
  recurrenceWeight: number; // default 20
  complaintAgeWeight: number; // default 15
  vulnerableLocationWeight: number; // default 10
}
