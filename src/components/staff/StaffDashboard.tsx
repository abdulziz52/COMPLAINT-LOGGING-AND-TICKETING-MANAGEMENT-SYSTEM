import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import {
  FolderOpen,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Filter,
  Building,
  User,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { formatDateTime } from '../../utils/ticket';

interface StaffDashboardProps {
  onSelectComplaint: (complaintId: string) => void;
  onTrackTicket: (ticketNumber: string) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  onSelectComplaint,
  onTrackTicket,
}) => {
  const { currentUser, currentInstitution, complaints, departments, categories } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewScope, setViewScope] = useState<'assigned' | 'department'>('assigned');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!currentUser) return null;

  const deptMap = new Map(departments.map(d => [d.id, d.name]));
  const catMap = new Map(categories.map(c => [c.id, c.name]));

  // Complaints in staff's institution
  const instComplaints = complaints.filter(c => c.institutionId === currentInstitution?.id);

  // Assigned to this staff officer vs all complaints in staff's department
  const scopeComplaints = instComplaints.filter(c => {
    if (viewScope === 'assigned') {
      return c.assignedStaffId === currentUser.id;
    }
    return c.departmentId === currentUser.departmentId;
  });

  const totalAssigned = instComplaints.filter(c => c.assignedStaffId === currentUser.id).length;
  const newAssigned = instComplaints.filter(
    c => c.assignedStaffId === currentUser.id && (c.status === 'assigned' || c.status === 'submitted')
  ).length;
  const inProgress = instComplaints.filter(
    c => c.assignedStaffId === currentUser.id && c.status === 'in_progress'
  ).length;
  const resolved = instComplaints.filter(
    c => c.assignedStaffId === currentUser.id && c.status === 'resolved'
  ).length;
  const closed = instComplaints.filter(
    c => c.assignedStaffId === currentUser.id && c.status === 'closed'
  ).length;

  const filtered = scopeComplaints.filter(c => {
    const matchesSearch =
      c.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      c.studentMatricNo.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase().trim());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Officer Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Desk Officer Workspace</span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-medium text-blue-600">{currentInstitution?.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{currentUser.name}</h1>
          <p className="text-xs text-slate-500">
            {currentUser.staffRole || 'Desk Officer'} · {currentUser.departmentId ? deptMap.get(currentUser.departmentId) : 'Academic Registry'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-700">
          <button
            onClick={() => setViewScope('assigned')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              viewScope === 'assigned' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Assigned to Me ({totalAssigned})
          </button>
          <button
            onClick={() => setViewScope('department')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              viewScope === 'department' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            My Department Cases
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {[
          { label: 'Assigned Complaints', count: totalAssigned, color: 'text-slate-900' },
          { label: 'New / Awaiting Review', count: newAssigned, color: 'text-blue-700' },
          { label: 'Active In Progress', count: inProgress, color: 'text-amber-700' },
          { label: 'Resolved Cases', count: resolved, color: 'text-emerald-700' },
          { label: 'Closed Cases', count: closed, color: 'text-slate-500' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500">{s.label}</span>
            <span className={`block text-2xl font-bold font-mono tabular-nums mt-1 ${s.color}`}>
              {s.count}
            </span>
          </div>
        ))}
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {viewScope === 'assigned' ? 'Complaints Assigned to You' : 'Department Complaint Queue'}
            </h2>
            <p className="text-xs text-slate-500">
              Select any ticket to respond, change status, add internal notes, or record formal resolution.
            </p>
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search student, matric, ticket #..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>
        </div>

        {/* Status Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold text-slate-600 pb-1">
          {['all', 'submitted', 'assigned', 'in_progress', 'resolved', 'closed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto pt-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No complaint tickets match your query.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Student & Matric</th>
                  <th className="py-3 px-4">Title & Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Logged</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(c => {
                  const cat = catMap.get(c.categoryId) || 'General';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                        {c.ticketNumber}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">{c.studentName}</span>
                        <span className="text-[11px] text-slate-400 font-mono block">{c.studentMatricNo}</span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-semibold text-slate-900 block truncate">{c.title}</span>
                        <span className="text-[11px] text-slate-500 block truncate">{cat}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {formatDateTime(c.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectComplaint(c.id)}
                          className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        >
                          Manage Case
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
