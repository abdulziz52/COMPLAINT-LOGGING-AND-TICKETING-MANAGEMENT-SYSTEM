import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import {
  Search,
  Filter,
  Eye,
  UserCheck,
  Clock,
  AlertTriangle,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { ComplaintStatus, ComplaintPriority } from '../../types';
import { exportComplaintsToExcel } from '../../utils/excel';
import { formatDateTime } from '../../utils/ticket';

interface ComplaintsManagementProps {
  onSelectComplaint: (complaintId: string) => void;
  onTrackTicket: (ticketNumber: string) => void;
}

export const ComplaintsManagement: React.FC<ComplaintsManagementProps> = ({
  onSelectComplaint,
  onTrackTicket,
}) => {
  const {
    currentInstitution,
    complaints,
    departments,
    categories,
    users,
    assignComplaint,
    updateComplaintStatus,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('all');
  const [selectedCatId, setSelectedCatId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Quick Assignment state
  const [assigningComplaintId, setAssigningComplaintId] = useState<string | null>(null);
  const [targetStaffId, setTargetStaffId] = useState('');

  if (!currentInstitution) return null;

  const instComplaints = complaints.filter(c => c.institutionId === currentInstitution.id);
  const instDepts = departments.filter(d => d.institutionId === currentInstitution.id);
  const instCats = categories.filter(c => c.institutionId === currentInstitution.id);
  const instStaff = users.filter(u => u.institutionId === currentInstitution.id && u.role === 'staff');

  const deptMap = new Map(instDepts.map(d => [d.id, d.name]));
  const catMap = new Map(instCats.map(c => [c.id, c.name]));

  const filtered = instComplaints.filter(c => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      c.ticketNumber.toLowerCase().includes(query) ||
      c.studentName.toLowerCase().includes(query) ||
      c.studentMatricNo.toLowerCase().includes(query) ||
      c.title.toLowerCase().includes(query);

    if (!matchesSearch) return false;
    if (selectedDeptId !== 'all' && c.departmentId !== selectedDeptId) return false;
    if (selectedCatId !== 'all' && c.categoryId !== selectedCatId) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && c.priority !== selectedPriority) return false;

    if (showOverdueOnly) {
      if (c.status === 'resolved' || c.status === 'closed') return false;
      const ageDays = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays <= currentInstitution.escalationDays) return false;
    }

    return true;
  });

  const handleQuickAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningComplaintId || !targetStaffId) return;
    assignComplaint(assigningComplaintId, targetStaffId);
    setAssigningComplaintId(null);
    setTargetStaffId('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Complaints Central Directory</h1>
          <p className="text-xs text-slate-500">
            Total {instComplaints.length} registered grievances · Filter by unit, category, SLA status, or assign officers.
          </p>
        </div>

        <button
          onClick={() => exportComplaintsToExcel(instComplaints, instDepts, instCats, currentInstitution)}
          className="px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Export All Complaints (.xlsx)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, student name, matric no, or subject..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDeptId}
              onChange={e => setSelectedDeptId(e.target.value)}
              className="px-2.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white"
            >
              <option value="all">All Departments</option>
              {instDepts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCatId}
              onChange={e => setSelectedCatId(e.target.value)}
              className="px-2.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white"
            >
              <option value="all">All Categories</option>
              {instCats.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-2.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="awaiting_student_response">Awaiting Response</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="px-2.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <label className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-800 cursor-pointer">
              <input
                type="checkbox"
                checked={showOverdueOnly}
                onChange={e => setShowOverdueOnly(e.target.checked)}
                className="w-3.5 h-3.5 text-rose-600 rounded"
              />
              <span>Overdue Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No complaint tickets match the filter criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Student & Matric</th>
                  <th className="py-3 px-4">Title & Unit</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Staff</th>
                  <th className="py-3 px-4">Logged</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(c => {
                  const dept = deptMap.get(c.departmentId) || 'Academic';
                  const cat = catMap.get(c.categoryId) || 'General';
                  const isOverdue = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24) > currentInstitution.escalationDays && c.status !== 'resolved' && c.status !== 'closed';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{c.ticketNumber}</span>
                          {isOverdue && (
                            <span className="w-2 h-2 rounded-full bg-rose-600" title="Overdue Escalation SLA" />
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">{c.studentName}</span>
                        <span className="text-[11px] text-slate-500 font-mono block">{c.studentMatricNo}</span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-semibold text-slate-900 block truncate">{c.title}</span>
                        <span className="text-[11px] text-slate-400 block truncate">{dept}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">{cat}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {c.assignedStaffName ? (
                          <span className="font-medium text-slate-800">{c.assignedStaffName}</span>
                        ) : (
                          <button
                            onClick={() => {
                              setAssigningComplaintId(c.id);
                              setTargetStaffId(instStaff[0]?.id || '');
                            }}
                            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Assign Officer</span>
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {formatDateTime(c.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectComplaint(c.id)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Manage & View Case"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onTrackTicket(c.ticketNumber)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Track Timeline"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Assign Modal */}
      {assigningComplaintId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Assign Complaint to Desk Officer</h3>
            <p className="text-xs text-slate-500">
              Select an authorized staff member to investigate this grievance.
            </p>
            <form onSubmit={handleQuickAssign} className="space-y-4">
              <select
                value={targetStaffId}
                onChange={e => setTargetStaffId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800"
                required
              >
                <option value="">Select staff officer...</option>
                {instStaff.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.staffRole || 'Desk Officer'} · {deptMap.get(st.departmentId || '') || 'General'})
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningComplaintId(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
