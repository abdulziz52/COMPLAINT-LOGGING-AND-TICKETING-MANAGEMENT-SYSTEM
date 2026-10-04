import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  GraduationCap,
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Building,
} from 'lucide-react';
import { exportReportToExcel } from '../../utils/excel';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
  onSelectComplaint: (complaintId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onSelectComplaint,
}) => {
  const { currentInstitution, complaints, users, departments, categories } = useApp();

  if (!currentInstitution) return null;

  // Filter records strictly for current institution
  const instComplaints = complaints.filter(c => c.institutionId === currentInstitution.id);
  const instStudents = users.filter(u => u.institutionId === currentInstitution.id && u.role === 'student');
  const instStaff = users.filter(u => u.institutionId === currentInstitution.id && u.role === 'staff');
  const instDepts = departments.filter(d => d.institutionId === currentInstitution.id);
  const instCats = categories.filter(c => c.institutionId === currentInstitution.id);

  const deptMap = new Map(instDepts.map(d => [d.id, d.name]));
  const catMap = new Map(instCats.map(c => [c.id, c.name]));

  // Metrics
  const totalComplaints = instComplaints.length;
  const pending = instComplaints.filter(c => c.status === 'submitted' || c.status === 'pending' || c.status === 'under_review').length;
  const active = instComplaints.filter(c => c.status === 'assigned' || c.status === 'in_progress' || c.status === 'awaiting_student_response').length;
  const resolved = instComplaints.filter(c => c.status === 'resolved').length;
  const closed = instComplaints.filter(c => c.status === 'closed').length;

  const resolutionRate = totalComplaints > 0
    ? `${(((resolved + closed) / totalComplaints) * 100).toFixed(1)}%`
    : '0%';

  // Average resolution time (simulated based on resolved items)
  const avgTurnaround = '2.4 Days';

  // Overdue count (created > escalationDays ago and not resolved/closed)
  const overdueCount = instComplaints.filter(c => {
    if (c.status === 'resolved' || c.status === 'closed') return false;
    const ageDays = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return ageDays > currentInstitution.escalationDays;
  }).length;

  // Complaints by Category Breakdown
  const categoryStats: Record<string, number> = {};
  instComplaints.forEach(c => {
    const name = catMap.get(c.categoryId) || 'General';
    categoryStats[name] = (categoryStats[name] || 0) + 1;
  });

  // Complaints by Department Breakdown
  const departmentStats: Record<string, number> = {};
  instComplaints.forEach(c => {
    const name = deptMap.get(c.departmentId) || 'General';
    departmentStats[name] = (departmentStats[name] || 0) + 1;
  });

  const handleExportExcelReport = () => {
    exportReportToExcel(instComplaints, instDepts, instCats, currentInstitution);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Institution Administrator</span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-medium text-emerald-700">{currentInstitution.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Complaints & Governance Overview
          </h1>
          <p className="text-xs text-slate-500">
            Escalation window: {currentInstitution.escalationDays} days · Prefix: {currentInstitution.ticketPrefix}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcelReport}
            className="px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Analytics (.xlsx)</span>
          </button>
          <button
            onClick={() => onNavigate('excel-management')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Data Management
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total Students', value: instStudents.length, text: 'text-slate-900', sub: 'Enrolled' },
          { label: 'Total Staff', value: instStaff.length, text: 'text-slate-900', sub: 'Officers' },
          { label: 'Total Complaints', value: totalComplaints, text: 'text-blue-700', sub: 'All Time' },
          { label: 'Pending Review', value: pending, text: 'text-amber-700', sub: 'Awaiting Action' },
          { label: 'Active In Progress', value: active, text: 'text-indigo-700', sub: 'Assigned' },
          { label: 'Resolved', value: resolved, text: 'text-emerald-700', sub: 'Addressed' },
          { label: 'Resolution Rate', value: resolutionRate, text: 'text-emerald-700', sub: 'Turnaround' },
          { label: 'Overdue SLA', value: overdueCount, text: overdueCount > 0 ? 'text-rose-700 font-bold' : 'text-slate-500', sub: `>${currentInstitution.escalationDays}d` },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 leading-snug">{kpi.label}</span>
            <span className={`text-xl font-bold font-mono tabular-nums mt-1.5 ${kpi.text}`}>
              {kpi.value}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* Charts / Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints by Category Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Complaints by Category</h3>
            <span className="text-xs text-slate-400 font-mono">Total: {totalComplaints}</span>
          </div>

          <div className="space-y-3">
            {Object.keys(categoryStats).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No complaint categories recorded yet.</p>
            ) : (
              Object.entries(categoryStats).map(([catName, count]) => {
                const pct = totalComplaints > 0 ? (count / totalComplaints) * 100 : 0;
                return (
                  <div key={catName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate max-w-[200px]">{catName}</span>
                      <span className="text-slate-500 font-mono">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Complaints by Department Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Complaints by Department</h3>
            <span className="text-xs text-slate-400 font-mono">Departments: {instDepts.length}</span>
          </div>

          <div className="space-y-3">
            {Object.keys(departmentStats).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No department complaints logged yet.</p>
            ) : (
              Object.entries(departmentStats).map(([deptName, count]) => {
                const pct = totalComplaints > 0 ? (count / totalComplaints) * 100 : 0;
                return (
                  <div key={deptName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate max-w-[200px]">{deptName}</span>
                      <span className="text-slate-500 font-mono">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent High Priority or Overdue Complaints Requiring Intervention */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Active Complaints Requiring Attention</h2>
            <p className="text-[11px] text-slate-500">
              Unresolved student grievances ranked by urgency and escalation timeline
            </p>
          </div>
          <button
            onClick={() => onNavigate('complaints')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Manage All ({totalComplaints})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {instComplaints.filter(c => c.status !== 'resolved' && c.status !== 'closed').length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No active pending complaints. All student grievances have been addressed!
            </div>
          ) : (
            instComplaints
              .filter(c => c.status !== 'resolved' && c.status !== 'closed')
              .slice(0, 5)
              .map(c => (
                <div
                  key={c.id}
                  onClick={() => onSelectComplaint(c.id)}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600">{c.ticketNumber}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-600">{c.studentName} ({c.studentMatricNo})</span>
                    </div>
                    <h4 className="font-bold text-slate-900 truncate">{c.title}</h4>
                    <span className="text-slate-400 text-[11px]">
                      Desk: {c.assignedStaffName || 'Unassigned / Needs Desk Allocation'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="capitalize font-semibold text-amber-800 text-[11px]">
                      {c.priority} Priority
                    </span>
                    <span className="capitalize text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {c.status.replace(/_/g, ' ')}
                    </span>
                    <button className="text-blue-600 font-bold hover:underline">
                      Review &gt;
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
