import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FilePlus2,
  FolderOpen,
  Search,
  Users,
  GraduationCap,
  Building,
  Tag,
  FileSpreadsheet,
  BarChart3,
  History,
  Settings,
  ShieldCheck,
  Building2,
  Bell,
  LogOut,
  HelpCircle,
  Briefcase,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  isOpen,
  onClose,
}) => {
  const { currentUser, currentInstitution, logout, unreadNotifsCount } = useApp();

  if (!currentUser) return null;

  const role = currentUser.role;

  // Build navigation items based on role
  const getNavSections = () => {
    if (role === 'student') {
      return [
        {
          title: 'Student Portal',
          items: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'submit-complaint', label: 'Submit Complaint', icon: FilePlus2 },
            { id: 'my-complaints', label: 'My Complaints', icon: FolderOpen },
            { id: 'track-ticket', label: 'Track Ticket', icon: Search },
            {
              id: 'notifications',
              label: 'Notifications',
              icon: Bell,
              badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
            },
            { id: 'profile', label: 'Student Profile', icon: GraduationCap },
            { id: 'help', label: 'Help & FAQ', icon: HelpCircle },
          ],
        },
      ];
    }

    if (role === 'staff') {
      return [
        {
          title: 'Staff Portal',
          items: [
            { id: 'dashboard', label: 'Assigned Cases', icon: LayoutDashboard },
            { id: 'all-complaints', label: 'Department Queue', icon: FolderOpen },
            { id: 'track-ticket', label: 'Lookup Ticket', icon: Search },
            {
              id: 'notifications',
              label: 'Notifications',
              icon: Bell,
              badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
            },
            { id: 'staff-profile', label: 'Staff Profile', icon: Briefcase },
          ],
        },
      ];
    }

    if (role === 'institution_admin') {
      return [
        {
          title: 'Administration',
          items: [
            { id: 'dashboard', label: 'Analytics Dashboard', icon: LayoutDashboard },
            { id: 'complaints', label: 'Complaints Central', icon: FolderOpen },
            { id: 'students', label: 'Students Directory', icon: GraduationCap },
            { id: 'staff', label: 'Staff Roster', icon: Users },
            { id: 'departments', label: 'Departments', icon: Building },
            { id: 'categories', label: 'Complaint Categories', icon: Tag },
          ],
        },
        {
          title: 'Data & Governance',
          items: [
            { id: 'excel-management', label: 'Excel & Data Tools', icon: FileSpreadsheet },
            { id: 'reports', label: 'Statistical Reports', icon: BarChart3 },
            { id: 'audit-logs', label: 'Audit Trail', icon: History },
            { id: 'settings', label: 'Institution Settings', icon: Settings },
          ],
        },
      ];
    }

    // Super Admin
    return [
      {
        title: 'Platform Control',
        items: [
          { id: 'super-dashboard', label: 'Global Overview', icon: ShieldCheck },
          { id: 'super-institutions', label: 'Institutions Directory', icon: Building2 },
          { id: 'super-complaints', label: 'Platform Complaints', icon: FolderOpen },
          { id: 'super-excel', label: 'Cross-Institution Export', icon: FileSpreadsheet },
          { id: 'super-reports', label: 'Global Analytics', icon: BarChart3 },
          { id: 'super-audit', label: 'System Audit Logs', icon: History },
        ],
      },
    ];
  };

  const navSections = getNavSections();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-0`}
      >
        {/* Institution Brand Card */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
              style={{ backgroundColor: currentInstitution?.primaryColor || '#2563eb' }}
            >
              {currentInstitution?.abbreviation || 'SCL'}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-slate-900 truncate">
                {currentInstitution?.name || 'Central Platform'}
              </span>
              <span className="block text-[11px] text-slate-500 font-mono">
                {currentInstitution?.ticketPrefix || 'CMP-2026'}
              </span>
            </div>
          </div>
        </div>

        {/* User Role Card */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{currentUser.name}</p>
            <p className="text-[11px] text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</p>
          </div>
          <span
            className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
            title="Online & Connected"
          />
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full font-mono ${
                            isActive ? 'bg-white text-slate-900' : 'bg-rose-600 text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom sign out */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
