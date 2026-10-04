import React from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { LogOut, User, Building2, ChevronDown, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenLoginModal?: () => void;
  onOpenRegisterModal?: () => void;
  onSelectComplaint?: (complaintId: string) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenLoginModal,
  onOpenRegisterModal,
  onSelectComplaint,
  activeTab,
  setActiveTab,
}) => {
  const { currentUser, currentInstitution, institutions, logout, switchUser, users } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand & Institution Identity */}
          <div className="flex items-center gap-3 min-w-0">
            {currentUser && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Toggle navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setActiveTab && setActiveTab('home')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs transition-transform group-hover:scale-105 shrink-0"
                style={{ backgroundColor: currentInstitution?.primaryColor || '#2563eb' }}
              >
                {currentInstitution?.abbreviation?.slice(0, 3) || 'SCL'}
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-bold tracking-tight text-slate-900 truncate">
                  {currentInstitution?.abbreviation || 'SCLT'} · Complaint Portal
                </span>
                <span className="block text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                  {currentInstitution?.name || 'Multi-Institution Management Platform'}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean text links with hover effect, Top Bar Contract) */}
          {!currentUser && (
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setActiveTab && setActiveTab('home')}
                className={`transition-colors hover:text-slate-900 ${activeTab === 'home' ? 'text-blue-600' : ''}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab && setActiveTab('track')}
                className={`transition-colors hover:text-slate-900 ${activeTab === 'track' ? 'text-blue-600' : ''}`}
              >
                Track Ticket
              </button>
              <button
                onClick={() => setActiveTab && setActiveTab('institutions')}
                className={`transition-colors hover:text-slate-900 ${activeTab === 'institutions' ? 'text-blue-600' : ''}`}
              >
                Participating Institutions
              </button>
              <button
                onClick={() => setActiveTab && setActiveTab('help')}
                className={`transition-colors hover:text-slate-900 ${activeTab === 'help' ? 'text-blue-600' : ''}`}
              >
                Guidelines & Help
              </button>
            </nav>
          )}

          {/* Zone 3: Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {currentUser ? (
              <>
                <NotificationDropdown onSelectComplaint={onSelectComplaint} />

                {/* Switch Role Quick Tester Dropdown */}
                <div className="relative group hidden sm:block">
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Switch Role</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1 hidden group-hover:block z-50">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Demo Accounts Switcher
                    </div>
                    {users.slice(0, 6).map(u => {
                      const inst = institutions.find(i => i.id === u.institutionId);
                      return (
                        <button
                          key={u.id}
                          onClick={() => switchUser(u)}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between ${
                            u.id === currentUser.id ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <span className="block truncate">{u.name}</span>
                            <span className="block text-[10px] text-slate-400">
                              {u.role.replace('_', ' ')} · {inst?.abbreviation || 'Global'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Profile Pill */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="hidden sm:block text-right">
                    <span className="block text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                      {currentUser.name}
                    </span>
                    <span className="block text-[10px] text-slate-500 capitalize">
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Sign Out"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {/* Quick Role Tester for Unauthenticated Reviewers */}
                <div className="relative group">
                  <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                    <span>Quick Demo Login</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1 hidden group-hover:block z-50">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Instant One-Click Login
                    </div>
                    {users.slice(0, 6).map(u => {
                      const inst = institutions.find(i => i.id === u.institutionId);
                      return (
                        <button
                          key={u.id}
                          onClick={() => switchUser(u)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-100 last:border-0"
                        >
                          <span className="block font-semibold text-slate-800">{u.name}</span>
                          <span className="block text-[10px] text-slate-500">
                            {u.role.toUpperCase().replace('_', ' ')} · {inst?.name || 'Platform'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={onOpenLoginModal}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onOpenRegisterModal}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                >
                  Student Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
