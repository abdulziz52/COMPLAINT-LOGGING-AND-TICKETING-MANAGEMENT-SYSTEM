import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { StudentDashboard } from './components/student/StudentDashboard';
import { SubmitComplaint } from './components/student/SubmitComplaint';
import { MyComplaints } from './components/student/MyComplaints';
import { TicketTracker } from './components/student/TicketTracker';
import { ComplaintDetailModal } from './components/student/ComplaintDetailModal';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ComplaintsManagement } from './components/admin/ComplaintsManagement';
import { StudentsManagement } from './components/admin/StudentsManagement';
import { StaffManagement } from './components/admin/StaffManagement';
import { DepartmentsManagement } from './components/admin/DepartmentsManagement';
import { CategoriesManagement } from './components/admin/CategoriesManagement';
import { ExcelManagement } from './components/admin/ExcelManagement';
import { ReportsView } from './components/admin/ReportsView';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { InstitutionSettings } from './components/admin/InstitutionSettings';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { ProfileView } from './components/common/ProfileView';
import { HelpView } from './components/common/HelpView';
import { UserRole } from './types';

const MainAppContent: React.FC = () => {
  const { currentUser, currentInstitution } = useApp();

  // Navigation states
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [publicTab, setPublicTab] = useState<string>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginDefaultRole, setLoginDefaultRole] = useState<UserRole>('student');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Active complaint inspection & tracker states
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [trackerTicket, setTrackerTicket] = useState<string>('');

  const handleOpenLogin = (role: UserRole = 'student') => {
    setLoginDefaultRole(role);
    setIsLoginOpen(true);
  };

  const handleQuickTrack = (ticketNumber: string) => {
    setTrackerTicket(ticketNumber);
    if (!currentUser) {
      setPublicTab('track');
    } else {
      setActiveView('track-ticket');
    }
  };

  const handleInspectComplaint = (complaintId: string) => {
    setSelectedComplaintId(complaintId);
  };

  // Render view for logged in user
  const renderDashboardView = () => {
    if (!currentUser) return null;

    // Student Views
    if (currentUser.role === 'student') {
      switch (activeView) {
        case 'dashboard':
          return (
            <StudentDashboard
              onNavigate={setActiveView}
              onSelectComplaint={handleInspectComplaint}
            />
          );
        case 'submit-complaint':
          return (
            <SubmitComplaint
              onNavigate={setActiveView}
              onSelectComplaint={handleInspectComplaint}
            />
          );
        case 'my-complaints':
          return (
            <MyComplaints
              onNavigate={setActiveView}
              onSelectComplaint={handleInspectComplaint}
              onTrackTicket={handleQuickTrack}
            />
          );
        case 'track-ticket':
          return (
            <TicketTracker
              initialTicketNumber={trackerTicket}
              onSelectComplaint={handleInspectComplaint}
            />
          );
        case 'profile':
          return <ProfileView />;
        case 'help':
          return <HelpView />;
        default:
          return (
            <StudentDashboard
              onNavigate={setActiveView}
              onSelectComplaint={handleInspectComplaint}
            />
          );
      }
    }

    // Staff Views
    if (currentUser.role === 'staff') {
      switch (activeView) {
        case 'dashboard':
        case 'all-complaints':
          return (
            <StaffDashboard
              onSelectComplaint={handleInspectComplaint}
              onTrackTicket={handleQuickTrack}
            />
          );
        case 'track-ticket':
          return (
            <TicketTracker
              initialTicketNumber={trackerTicket}
              onSelectComplaint={handleInspectComplaint}
            />
          );
        case 'staff-profile':
          return <ProfileView />;
        default:
          return (
            <StaffDashboard
              onSelectComplaint={handleInspectComplaint}
              onTrackTicket={handleQuickTrack}
            />
          );
      }
    }

    // Institution Admin Views
    if (currentUser.role === 'institution_admin') {
      switch (activeView) {
        case 'dashboard':
          return (
            <AdminDashboard
              onNavigate={setActiveView}
              onSelectComplaint={handleInspectComplaint}
            />
          );
        case 'complaints':
          return (
            <ComplaintsManagement
              onSelectComplaint={handleInspectComplaint}
              onTrackTicket={handleQuickTrack}
            />
          );
        case 'students':
          return <StudentsManagement />;
        case 'staff':
          return <StaffManagement />;
        case 'departments':
          return <DepartmentsManagement />;
        case 'categories':
          return <CategoriesManagement />;
        case 'excel-management':
          return <ExcelManagement />;
        case 'reports':
          return <ReportsView />;
        case 'audit-logs':
          return <AuditLogsView />;
        case 'settings':
          return <InstitutionSettings />;
        default:
          return (
            <AdminDashboard
              onNavigate={setActiveView}
              onSelectComplaint={handleInspectComplaint}
            />
          );
      }
    }

    // Super Admin Views
    if (currentUser.role === 'super_admin') {
      switch (activeView) {
        case 'super-dashboard':
        case 'super-institutions':
          return <SuperAdminDashboard />;
        case 'super-complaints':
          return (
            <ComplaintsManagement
              onSelectComplaint={handleInspectComplaint}
              onTrackTicket={handleQuickTrack}
            />
          );
        case 'super-excel':
          return <ExcelManagement />;
        case 'super-reports':
          return <ReportsView />;
        case 'super-audit':
          return <AuditLogsView />;
        default:
          return <SuperAdminDashboard />;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenLoginModal={() => handleOpenLogin('student')}
        onOpenRegisterModal={() => setIsRegisterOpen(true)}
        onSelectComplaint={handleInspectComplaint}
        activeTab={publicTab}
        setActiveTab={setPublicTab}
      />

      {/* Main Content Layout */}
      {!currentUser ? (
        // Public Unauthenticated Area
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {publicTab === 'home' && (
            <LandingPage
              onOpenLogin={handleOpenLogin}
              onOpenRegister={() => setIsRegisterOpen(true)}
              onQuickTrack={handleQuickTrack}
            />
          )}

          {publicTab === 'track' && (
            <div className="py-6">
              <TicketTracker initialTicketNumber={trackerTicket} />
            </div>
          )}

          {publicTab === 'institutions' && (
            <div className="py-8 space-y-6">
              <SuperAdminDashboard />
            </div>
          )}

          {publicTab === 'help' && (
            <div className="py-8">
              <HelpView />
            </div>
          )}
        </main>
      ) : (
        // Authenticated Workspace Area with Sidebar
        <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <main className="flex-1 min-w-0">
            {renderDashboardView()}
          </main>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Authentication Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        defaultRole={loginDefaultRole}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />

      {/* Complaint Detail & Two-Way Discussion Modal */}
      <ComplaintDetailModal
        complaintId={selectedComplaintId}
        isOpen={!!selectedComplaintId}
        onClose={() => setSelectedComplaintId(null)}
        onTrackTicket={handleQuickTrack}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
