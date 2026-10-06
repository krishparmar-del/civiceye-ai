import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Contractor,
  NotificationItem,
  PriorityWeights,
  Problem,
  ProblemStatus,
  UserProfile,
  CivicStats,
  isProblemActive,
} from '../types';
import {
  APPROVED_CONTRACTORS_LIST,
  DEFAULT_CITIZEN_USER,
  OFFICIAL_ROSTER,
} from '../data/seedData';
import { DEFAULT_PRIORITY_WEIGHTS } from '../services/priorityEngine';

interface Toast {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface CivicContextType {
  currentUser: UserProfile | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  allOfficials: UserProfile[];
  problems: Problem[];
  contractors: Contractor[];
  notifications: NotificationItem[];
  stats: CivicStats;
  priorityWeights: PriorityWeights;
  setPriorityWeights: (w: PriorityWeights) => void;
  jurisdictionFilterActive: boolean;
  setJurisdictionFilterActive: (active: boolean) => void;
  selectedProblem: Problem | null;
  setSelectedProblem: (p: Problem | null) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  toasts: Toast[];
  showToast: (text: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
  isLoading: boolean;

  // Actions
  loginAsCitizen: () => void;
  loginAsOfficial: (officialId?: string) => void;
  loginWithProfile: (profile: UserProfile) => void;
  logout: () => void;
  switchOfficialAccount: (officialId: string) => void;

  toggleAffected: (problemId: string) => Promise<void>;
  submitNewProblem: (
    data: Partial<Problem> & { imageBase64?: string; categoryHint?: string }
  ) => Promise<Problem>;
  updateProblemStatus: (
    problemId: string,
    newStatus: ProblemStatus,
    notes?: string
  ) => Promise<{ success: boolean; error?: string }>;
  assignContractorToProblem: (
    problemId: string,
    contractorData: {
      name: string;
      phone: string;
      workOrderId?: string;
      expectedCompletion: string;
      notes?: string;
    }
  ) => Promise<boolean>;
  submitCompletionProof: (
    problemId: string,
    details: { completionImage?: string; completionNote: string }
  ) => Promise<boolean>;
  verifyProblemResolution: (
    problemId: string,
    isResolved: boolean,
    feedback?: string
  ) => Promise<boolean>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  refreshProblems: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

const CivicContext = createContext<CivicContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USER = 'civiceye_user_v2';
const LOCAL_STORAGE_KEY_THEME = 'civiceye_theme_v2';

export const CivicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state: light by default
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [problems, setProblems] = useState<Problem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [contractors] = useState<Contractor[]>(APPROVED_CONTRACTORS_LIST);
  const [priorityWeights, setPriorityWeights] = useState<PriorityWeights>(DEFAULT_PRIORITY_WEIGHTS);
  const [jurisdictionFilterActive, setJurisdictionFilterActive] = useState<boolean>(true);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Apply theme class to document element with smooth transition
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Sync user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    }
  }, [currentUser]);

  const showToast = useCallback(
    (text: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, text, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch problems from server database (Single source of truth)
  const refreshProblems = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (currentUser) {
        params.append('userId', currentUser.id);
        params.append('role', currentUser.role);
        if (currentUser.block) params.append('block', currentUser.block);
        if (currentUser.role === 'official') {
          params.append('scope', jurisdictionFilterActive ? 'my_assigned' : 'all');
        }
      }

      const res = await fetch(`/api/problems?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProblems(data.problems || []);

        // Also update selectedProblem if open
        if (selectedProblem) {
          const updated = (data.problems || []).find((p: Problem) => p.id === selectedProblem.id);
          if (updated) setSelectedProblem(updated);
        }
      }

      // Fetch notifications
      const notifRes = await fetch(
        `/api/notifications?role=${currentUser?.role || ''}&userId=${currentUser?.id || ''}`
      );
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }
    } catch (err) {
      console.warn('Sync with server database failed:', err);
    }
  }, [currentUser, jurisdictionFilterActive, selectedProblem]);

  // Periodic polling every 3 seconds for real-time synchronization across accounts (Requirement 27)
  useEffect(() => {
    refreshProblems();
    const interval = setInterval(refreshProblems, 3000);
    return () => clearInterval(interval);
  }, [refreshProblems]);

  // Calculate dynamic statistics strictly from actual database problems
  const stats: CivicStats = {
    totalProblems: problems.length,
    activeProblems: problems.filter((p) => isProblemActive(p.status)).length,
    resolvedProblems: problems.filter((p) => p.status === 'Closed').length,
    totalOpen: problems.filter(
      (p) => p.status === 'Reported' || p.status === 'Under Review' || p.status === 'Verified'
    ).length,
    critical: problems.filter(
      (p) => (p.priority === 'Critical' || p.priorityScore >= 85) && isProblemActive(p.status)
    ).length,
    inProgress: problems.filter(
      (p) => p.status === 'Assigned' || p.status === 'Work in Progress'
    ).length,
    overdue: problems.filter((p) => {
      if (!p.expectedCompletion || !isProblemActive(p.status) || p.status === 'Pending Citizen Verification') return false;
      return new Date(p.expectedCompletion).getTime() < Date.now();
    }).length,
    resolved: problems.filter((p) => p.status === 'Closed').length,
    reopened: problems.filter((p) => p.status === 'Reopened').length,
    myReports: currentUser
      ? problems.filter((p) => p.reportedBy?.id === currentUser.id).length
      : 0,
  };

  const loginAsCitizen = () => {
    setCurrentUser(DEFAULT_CITIZEN_USER);
    setCurrentTab('home');
    showToast(`Logged in as Citizen: ${DEFAULT_CITIZEN_USER.name} (${DEFAULT_CITIZEN_USER.block})`, 'success');
  };

  const loginAsOfficial = (officialId?: string) => {
    const target = officialId
      ? OFFICIAL_ROSTER.find((o) => o.id === officialId) || OFFICIAL_ROSTER[0]
      : OFFICIAL_ROSTER[0];
    setCurrentUser(target);
    setCurrentTab('dashboard');
    showToast(`Logged in as Official: ${target.name} (${target.department}, ${target.block})`, 'success');
  };

  const loginWithProfile = (profile: UserProfile) => {
    setCurrentUser(profile);
    setCurrentTab(profile.role === 'citizen' ? 'home' : 'dashboard');
    showToast(`Welcome, ${profile.name} to CivicEye AI`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentTab('home');
    setSelectedProblem(null);
    showToast('Signed out securely.', 'info');
  };

  const switchOfficialAccount = (officialId: string) => {
    const found = OFFICIAL_ROSTER.find((o) => o.id === officialId);
    if (found) {
      setCurrentUser(found);
      showToast(`Switched active official: ${found.name} (${found.department}, ${found.block})`, 'info');
    }
  };

  // Toggle "I'm Affected" with real database persistence
  const toggleAffected = async (problemId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/problems/${problemId}/affected`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      if (res.ok) {
        const data = await res.json();
        await refreshProblems();
        showToast(
          data.isAffected
            ? '✓ Impact recorded: You confirmed you are affected by this issue.'
            : 'Removed your confirmation for this issue.',
          data.isAffected ? 'success' : 'info'
        );
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update affected count', 'error');
    }
  };

  // Submit new problem with automated routing
  const submitNewProblem = async (
    data: Partial<Problem> & { imageBase64?: string; categoryHint?: string }
  ): Promise<Problem> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          reportedBy: {
            id: currentUser?.id || 'usr_citizen_01',
            name: currentUser?.name || 'Citizen',
            phone: currentUser?.phone,
            email: currentUser?.email,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit problem');
      }

      const result = await res.json();
      await refreshProblems();
      setIsLoading(false);
      showToast(`Problem ${result.problem.id} registered & routed to responsible official!`, 'success');
      return result.problem;
    } catch (err: any) {
      setIsLoading(false);
      console.error(err);
      showToast(err.message || 'Submission failed', 'error');
      throw err;
    }
  };

  // Update Problem Status with strict server-side access control
  const updateProblemStatus = async (
    problemId: string,
    newStatus: ProblemStatus,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      const res = await fetch(`/api/problems/${problemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes,
          userId: currentUser.id,
          userName: currentUser.name,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        showToast(errData.error || 'Unauthorized to update this problem status', 'error');
        return { success: false, error: errData.error };
      }

      await refreshProblems();
      showToast(`Problem ${problemId} status updated to "${newStatus}"`, 'success');
      return { success: true };
    } catch (err: any) {
      console.error(err);
      showToast('Network error updating status', 'error');
      return { success: false, error: err.message };
    }
  };

  // Assign contractor with authorization check
  const assignContractorToProblem = async (
    problemId: string,
    contractorData: {
      name: string;
      phone: string;
      workOrderId?: string;
      expectedCompletion: string;
      notes?: string;
    }
  ): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const res = await fetch(`/api/problems/${problemId}/contractor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractorName: contractorData.name,
          phone: contractorData.phone,
          workOrderId: contractorData.workOrderId,
          expectedCompletion: contractorData.expectedCompletion,
          notes: contractorData.notes,
          userId: currentUser.id,
          userName: currentUser.name,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Failed to assign contractor', 'error');
        return false;
      }

      await refreshProblems();
      showToast(`Contractor ${contractorData.name} dispatched`, 'success');
      return true;
    } catch (err) {
      console.error(err);
      showToast('Error assigning contractor', 'error');
      return false;
    }
  };

  // Submit completion proof
  const submitCompletionProof = async (
    problemId: string,
    details: { completionImage?: string; completionNote: string }
  ): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const res = await fetch(`/api/problems/${problemId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completionImage: details.completionImage,
          completionNote: details.completionNote,
          userId: currentUser.id,
          userName: currentUser.name,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Failed to submit completion', 'error');
        return false;
      }

      await refreshProblems();
      showToast('Completion proof submitted. Moved to Pending Citizen Verification.', 'success');
      return true;
    } catch (err) {
      console.error(err);
      showToast('Error submitting completion', 'error');
      return false;
    }
  };

  // Citizen verification
  const verifyProblemResolution = async (
    problemId: string,
    isResolved: boolean,
    feedback?: string
  ): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const res = await fetch(`/api/problems/${problemId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isResolved,
          feedback,
          userId: currentUser.id,
          userName: currentUser.name,
        }),
      });

      if (!res.ok) {
        showToast('Failed to verify problem resolution', 'error');
        return false;
      }

      await refreshProblems();
      if (isResolved) {
        showToast('Thank you! Complaint verified as resolved and closed.', 'success');
      } else {
        showToast('Complaint reopened: Ground defect persists. Official notified!', 'warning');
      }
      return true;
    } catch (err) {
      console.error(err);
      showToast('Error during verification', 'error');
      return false;
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {}
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'all' }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {}
  };

  // Reset database back to 0 problems
  const resetAllData = async () => {
    try {
      await fetch('/api/reset-data', { method: 'POST' });
      await refreshProblems();
      showToast('Database reset: Clean baseline with exactly 0 problems', 'info');
    } catch (e) {
      showToast('Failed to reset database', 'error');
    }
  };

  return (
    <CivicContext.Provider
      value={{
        currentUser,
        theme,
        toggleTheme,
        allOfficials: OFFICIAL_ROSTER,
        problems,
        contractors,
        notifications,
        stats,
        priorityWeights,
        setPriorityWeights,
        jurisdictionFilterActive,
        setJurisdictionFilterActive,
        selectedProblem,
        setSelectedProblem,
        currentTab,
        setCurrentTab,
        toasts,
        showToast,
        dismissToast,
        isLoading,
        loginAsCitizen,
        loginAsOfficial,
        loginWithProfile,
        logout,
        switchOfficialAccount,
        toggleAffected,
        submitNewProblem,
        updateProblemStatus,
        assignContractorToProblem,
        submitCompletionProof,
        verifyProblemResolution,
        markNotificationRead,
        markAllNotificationsRead,
        refreshProblems,
        resetAllData,
      }}
    >
      {children}
    </CivicContext.Provider>
  );
};

export const useCivic = () => {
  const context = useContext(CivicContext);
  if (!context) {
    throw new Error('useCivic must be used within a CivicProvider');
  }
  return context;
};
