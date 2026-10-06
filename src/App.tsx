import React, { useState } from 'react';
import { CivicProvider, useCivic } from './context/CivicContext';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginLanding } from './components/auth/LoginLanding';
import { CitizenHome } from './components/citizen/CitizenHome';
import { ProblemsInMyArea } from './components/citizen/ProblemsInMyArea';
import { CitizenMap } from './components/citizen/CitizenMap';
import { MyReports } from './components/citizen/MyReports';
import { CitizenProblemDetailsModal } from './components/citizen/CitizenProblemDetailsModal';
import { ReportProblemModal } from './components/citizen/ReportProblemModal';
import { OfficialDashboard } from './components/official/OfficialDashboard';
import { PriorityQueueView } from './components/official/PriorityQueueView';
import { OfficialProblemList } from './components/official/OfficialProblemList';
import { OfficialMap } from './components/official/OfficialMap';
import { InfrastructureHealthView } from './components/official/InfrastructureHealthView';
import { ContractorsManagement } from './components/official/ContractorsManagement';
import { OfficialProblemDetailsModal } from './components/official/OfficialProblemDetailsModal';
import { ProfileView } from './components/common/ProfileView';
import { Problem } from './types';

const MainAppContent: React.FC = () => {
  const { currentUser, currentTab, setCurrentTab } = useCivic();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [citizenActiveProblem, setCitizenActiveProblem] = useState<Problem | null>(null);
  const [officialActiveProblem, setOfficialActiveProblem] = useState<Problem | null>(null);

  if (!currentUser) {
    return <LoginLanding />;
  }

  const isCitizen = currentUser.role === 'citizen';

  const handleOpenDetails = (problem: Problem) => {
    if (isCitizen) {
      setCitizenActiveProblem(problem);
    } else {
      setOfficialActiveProblem(problem);
    }
  };

  return (
    <div className="min-h-screen bg-app text-theme-primary flex flex-col theme-transition">
      {/* Main Top Bar adhering strictly to Top Bar Contract */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {isCitizen ? (
          <>
            {currentTab === 'home' && (
              <CitizenHome
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onOpenDetails={handleOpenDetails}
              />
            )}
            {currentTab === 'area-feed' && (
              <ProblemsInMyArea
                onOpenDetails={handleOpenDetails}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}
            {currentTab === 'citizen-map' && (
              <CitizenMap onOpenDetails={handleOpenDetails} />
            )}
            {currentTab === 'my-reports' && (
              <MyReports
                onOpenDetails={handleOpenDetails}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}
            {currentTab === 'profile' && <ProfileView />}
          </>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <OfficialDashboard onOpenDetails={handleOpenDetails} />
            )}
            {currentTab === 'queue' && (
              <PriorityQueueView onOpenDetails={handleOpenDetails} />
            )}
            {currentTab === 'all-problems' && (
              <OfficialProblemList onOpenDetails={handleOpenDetails} />
            )}
            {currentTab === 'official-map' && (
              <OfficialMap onOpenDetails={handleOpenDetails} />
            )}
            {currentTab === 'health' && <InfrastructureHealthView />}
            {currentTab === 'contractors' && <ContractorsManagement />}
            {currentTab === 'profile' && <ProfileView />}
          </>
        )}
      </main>

      {/* Modals */}
      <ReportProblemModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={(problem) => {
          setCitizenActiveProblem(problem);
        }}
      />

      <CitizenProblemDetailsModal
        problem={citizenActiveProblem}
        onClose={() => setCitizenActiveProblem(null)}
      />

      <OfficialProblemDetailsModal
        problem={officialActiveProblem}
        onClose={() => setOfficialActiveProblem(null)}
      />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <CivicProvider>
      <MainAppContent />
    </CivicProvider>
  );
}
