import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import {
  FilePlus2,
  FolderOpen,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  Building,
} from 'lucide-react';
import { formatDateTime } from '../../utils/ticket';

interface StudentDashboardProps {
  onNavigate: (view: string) => void;
  onSelectComplaint: (complaintId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onSelectComplaint,
}) => {
  const { currentUser, currentInstitution, complaints, departments, categories } = useApp();

  if (!currentUser) return null;

  // Filter complaints for this specific student in this institution
  const studentComplaints = complaints.filter(
    c => c.studentId === currentUser.id && c.institutionId === currentInstitution?.id
  );

  const deptMap = new Map(departments.map(d => [d.id, d.name]));
  const catMap = new Map(categories.map(c => [c.id, c.name]));

  // Calculate statistics
  const total = studentComplaints.length;
  const pending = studentComplaints.filter(c => c.status === 'pending' || c.status === 'submitted').length;
  const underReview = studentComplaints.filter(c => c.status === 'under_review').length;
  const inProgress = studentComplaints.filter(c => c.status === 'in_progress' || c.status === 'assigned').length;
  const resolved = studentComplaints.filter(c => c.status === 'resolved').length;
  const closed = studentComplaints.filter(c => c.status === 'closed').length;

  const userDept = currentUser.departmentId ? deptMap.get(currentUser.departmentId) : 'Academic Department';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Student Portal</span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-medium text-blue-600">{currentInstitution?.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {currentUser.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1 font-mono">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              Matric: {currentUser.studentId || 'N/A'}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {userDept}
            </span>
            <span>·</span>
            <span>Level: {currentUser.level || 'General'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('submit-complaint')}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>Submit Complaint</span>
          </button>
          <button
            onClick={() => onNavigate('track-ticket')}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Track Ticket</span>
          </button>
        </div>
      </div>

      {/* Dashboard Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'Total Complaints', value: total, text: 'text-slate-900', border: 'border-slate-200' },
          { label: 'Pending', value: pending, text: 'text-amber-700', border: 'border-amber-200/80 bg-amber-50/20' },
          { label: 'Under Review', value: underReview, text: 'text-blue-700', border: 'border-blue-200/80 bg-blue-50/20' },
          { label: 'In Progress', value: inProgress, text: 'text-indigo-700', border: 'border-indigo-200/80 bg-indigo-50/20' },
          { label: 'Resolved', value: resolved, text: 'text-emerald-700', border: 'border-emerald-200/80 bg-emerald-50/20' },
          { label: 'Closed', value: closed, text: 'text-slate-600', border: 'border-slate-200' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`bg-white p-4 rounded-xl border ${stat.border} transition-all flex flex-col justify-between`}
          >
            <span className="text-[11px] font-medium text-slate-500">{stat.label}</span>
            <span className={`text-2xl font-bold font-mono tabular-nums mt-2 ${stat.text}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {[
          { id: 'submit-complaint', label: 'Submit Complaint', icon: FilePlus2 },
          { id: 'my-complaints', label: 'My Complaints', icon: FolderOpen },
          { id: 'track-ticket', label: 'Track Ticket', icon: Search },
          { id: 'notifications', label: 'Notifications', icon: Clock },
          { id: 'profile', label: 'Profile', icon: GraduationCap },
          { id: 'help', label: 'Help / Support', icon: AlertCircle },
        ].map(btn => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              onClick={() => onNavigate(btn.id)}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors text-left"
            >
              <Icon className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* Recent Complaints Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Complaints</h2>
            <p className="text-[11px] text-slate-500">
              Live complaints logged with {currentInstitution?.abbreviation || 'your institution'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('my-complaints')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All ({total})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {studentComplaints.length === 0 ? (
          <div className="py-12 text-center space-y-3 px-4">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">No Complaints Recorded</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t submitted any grievances yet. If you have any academic, exam, or facility issues, submit
              a ticket now.
            </p>
            <button
              onClick={() => onNavigate('submit-complaint')}
              className="mt-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs inline-flex items-center gap-1.5"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Log First Complaint</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {studentComplaints.slice(0, 5).map(c => (
              <div
                key={c.id}
                onClick={() => onSelectComplaint(c.id)}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-blue-600">{c.ticketNumber}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600">{catMap.get(c.categoryId) || 'General Category'}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400 font-mono text-[11px]">{formatDateTime(c.createdAt)}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{c.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{c.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                  <span className="text-xs font-semibold text-blue-600 hover:underline">
                    View &gt;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
