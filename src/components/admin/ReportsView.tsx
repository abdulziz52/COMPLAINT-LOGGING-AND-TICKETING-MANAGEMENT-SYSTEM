import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { exportReportToExcel } from '../../utils/excel';

export const ReportsView: React.FC = () => {
  const { currentInstitution, complaints, departments, categories } = useApp();

  if (!currentInstitution) return null;

  const instComplaints = complaints.filter(c => c.institutionId === currentInstitution.id);
  const instDepts = departments.filter(d => d.institutionId === currentInstitution.id);
  const instCats = categories.filter(c => c.institutionId === currentInstitution.id);

  const deptMap = new Map(instDepts.map(d => [d.id, d.name]));
  const catMap = new Map(instCats.map(c => [c.id, c.name]));

  const total = instComplaints.length;
  const resolved = instComplaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  const unresolved = total - resolved;
  const overdue = instComplaints.filter(c => {
    if (c.status === 'resolved' || c.status === 'closed') return false;
    const ageDays = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return ageDays > currentInstitution.escalationDays;
  }).length;

  const rate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0';

  // Priority distribution
  const priorityStats = {
    critical: instComplaints.filter(c => c.priority === 'critical').length,
    high: instComplaints.filter(c => c.priority === 'high').length,
    medium: instComplaints.filter(c => c.priority === 'medium').length,
    low: instComplaints.filter(c => c.priority === 'low').length,
  };

  // Status distribution
  const statusStats = {
    submitted: instComplaints.filter(c => c.status === 'submitted' || c.status === 'pending').length,
    underReview: instComplaints.filter(c => c.status === 'under_review').length,
    inProgress: instComplaints.filter(c => c.status === 'in_progress' || c.status === 'assigned').length,
    resolved: instComplaints.filter(c => c.status === 'resolved').length,
    closed: instComplaints.filter(c => c.status === 'closed').length,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Statistical Audit & Performance Report</h1>
          <p className="text-xs text-slate-500">
            Official redressal report for {currentInstitution.name} · Generated {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Official Report</span>
          </button>
          <button
            onClick={() => exportReportToExcel(instComplaints, instDepts, instCats, currentInstitution)}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Report (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs space-y-8">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              INTERNAL QUALITY ASSURANCE & GRIEVANCE MONITORING
            </span>
            <h2 className="text-2xl font-bold text-slate-900">{currentInstitution.name}</h2>
            <p className="text-xs text-slate-600 font-medium">
              Student Grievances & Resolution Analytics Report
            </p>
          </div>

          <div className="text-right text-xs text-slate-500 font-mono">
            <div>Report Date: {new Date().toLocaleDateString()}</div>
            <div>Ref: {currentInstitution.ticketPrefix}-REP</div>
          </div>
        </div>

        {/* Executive Summary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 block">Total Complaints Logged</span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">{total}</span>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-medium text-emerald-700 block">Resolved / Closed</span>
            <span className="text-2xl font-bold font-mono text-emerald-800 mt-1 block">{resolved}</span>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-[11px] font-medium text-amber-700 block">Unresolved In Pipeline</span>
            <span className="text-2xl font-bold font-mono text-amber-800 mt-1 block">{unresolved}</span>
          </div>
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
            <span className="text-[11px] font-medium text-rose-700 block">Overdue Violating SLA</span>
            <span className="text-2xl font-bold font-mono text-rose-800 mt-1 block">{overdue}</span>
          </div>
        </div>

        {/* Secondary KPI Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Priority Distribution */}
          <div className="p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              By Priority Breakdown
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-rose-700 font-semibold">Critical Priority:</span>
                <span className="font-mono font-bold">{priorityStats.critical}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-800 font-medium">High Priority:</span>
                <span className="font-mono font-bold">{priorityStats.high}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Medium Priority:</span>
                <span className="font-mono font-bold">{priorityStats.medium}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Low Priority:</span>
                <span className="font-mono font-bold">{priorityStats.low}</span>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              By Workflow Status
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Submitted & Pending:</span>
                <span className="font-mono font-bold">{statusStats.submitted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Under Review:</span>
                <span className="font-mono font-bold">{statusStats.underReview}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-700">Assigned / In Progress:</span>
                <span className="font-mono font-bold">{statusStats.inProgress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700">Resolved Cases:</span>
                <span className="font-mono font-bold">{statusStats.resolved}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Archived / Closed:</span>
                <span className="font-mono font-bold">{statusStats.closed}</span>
              </div>
            </div>
          </div>

          {/* Turnaround Performance */}
          <div className="p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Turnaround Performance
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Overall Resolution Rate:</span>
                <span className="font-mono font-bold text-emerald-700">{rate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Configured SLA Window:</span>
                <span className="font-mono font-bold">{currentInstitution.escalationDays} Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Average Turnaround:</span>
                <span className="font-mono font-bold">2.4 Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Quality Compliance:</span>
                <span className="font-semibold text-emerald-700">Satisfactory</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Department Breakdown Table */}
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Departmental Grievance Inflow Breakdown
          </h3>
          <table className="w-full text-left border-collapse text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-2.5 px-3">Department Code</th>
                <th className="py-2.5 px-3">Department Unit Name</th>
                <th className="py-2.5 px-3">Complaints Received</th>
                <th className="py-2.5 px-3">Resolved</th>
                <th className="py-2.5 px-3">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {instDepts.map(dept => {
                const deptCmps = instComplaints.filter(c => c.departmentId === dept.id);
                const deptResolved = deptCmps.filter(c => c.status === 'resolved' || c.status === 'closed').length;
                const deptPending = deptCmps.length - deptResolved;

                return (
                  <tr key={dept.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-slate-800">{dept.code}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{dept.name}</td>
                    <td className="py-2 px-3 font-mono">{deptCmps.length}</td>
                    <td className="py-2 px-3 font-mono text-emerald-700 font-semibold">{deptResolved}</td>
                    <td className="py-2 px-3 font-mono text-amber-700">{deptPending}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Sign-off Footer */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500">
          <div>
            <div className="border-b border-slate-300 w-48 mb-2" />
            <span>Prepared By: Administrative Quality Officer</span>
          </div>
          <div className="text-right">
            <div className="border-b border-slate-300 w-48 ml-auto mb-2" />
            <span>Approved By: Dean of Student Affairs / Registry</span>
          </div>
        </div>
      </div>
    </div>
  );
};
