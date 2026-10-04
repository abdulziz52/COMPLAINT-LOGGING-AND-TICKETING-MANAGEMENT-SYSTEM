import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  FileDown,
  Clock,
  CheckCircle2,
  FilePlus2,
  ExternalLink,
} from 'lucide-react';
import { ComplaintStatus } from '../../types';
import { formatDateTime } from '../../utils/ticket';

interface MyComplaintsProps {
  onNavigate: (view: string) => void;
  onSelectComplaint: (complaintId: string) => void;
  onTrackTicket: (ticketNumber: string) => void;
}

export const MyComplaints: React.FC<MyComplaintsProps> = ({
  onNavigate,
  onSelectComplaint,
  onTrackTicket,
}) => {
  const { currentUser, currentInstitution, complaints, departments, categories } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!currentUser) return null;

  const deptMap = new Map(departments.map(d => [d.id, d.name]));
  const catMap = new Map(categories.map(c => [c.id, c.name]));

  // Get student's complaints in current institution
  const studentComplaints = complaints.filter(
    c => c.studentId === currentUser.id && c.institutionId === currentInstitution?.id
  );

  const filtered = studentComplaints.filter(c => {
    const matchesSearch =
      c.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase().trim());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return c.status === 'pending' || c.status === 'submitted';
    return c.status === statusFilter;
  });

  const handlePrintSlip = (c: any) => {
    const catName = catMap.get(c.categoryId) || 'General';
    const deptName = deptMap.get(c.departmentId) || 'General';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Complaint Acknowledgment Slip - ${c.ticketNumber}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; }
            .title { font-size: 20px; font-weight: bold; color: #0f172a; margin: 0; }
            .institution { font-size: 14px; color: #475569; margin-top: 4px; }
            .ticket-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 20px 0; }
            .ticket-num { font-size: 22px; font-family: monospace; font-weight: bold; color: #2563eb; }
            .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; font-size: 13px; }
            .field label { display: block; font-size: 11px; color: #64748b; text-transform: uppercase; }
            .field value { font-weight: 600; }
            .narrative { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; }
            .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">OFFICIAL STUDENT COMPLAINT ACKNOWLEDGMENT</h1>
            <div class="institution">${currentInstitution?.name}</div>
          </div>
          <div class="ticket-box">
            <div style="font-size: 11px; color: #64748b;">OFFICIAL TICKET NUMBER</div>
            <div class="ticket-num">${c.ticketNumber}</div>
          </div>
          <div class="field-grid">
            <div class="field"><label>Student Name</label><div>${c.studentName}</div></div>
            <div class="field"><label>Student Matric / ID</label><div>${c.studentMatricNo}</div></div>
            <div class="field"><label>Category</label><div>${catName}</div></div>
            <div class="field"><label>Department</label><div>${deptName}</div></div>
            <div class="field"><label>Date Logged</label><div>${new Date(c.createdAt).toLocaleString()}</div></div>
            <div class="field"><label>Current Status</label><div style="text-transform: capitalize;">${c.status.replace(/_/g, ' ')}</div></div>
            <div class="field"><label>Assigned Staff</label><div>${c.assignedStaffName || 'Under Initial Review'}</div></div>
            <div class="field"><label>Priority</label><div style="text-transform: capitalize;">${c.priority} Priority</div></div>
          </div>
          <div class="narrative">
            <label style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold;">Subject & Description</label>
            <div style="font-weight: bold; margin: 4px 0 8px 0;">${c.title}</div>
            <p>${c.description}</p>
          </div>
          ${c.resolution ? `
            <div style="margin-top: 20px; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; border-radius: 6px;">
              <strong style="color: #065f46; display: block; margin-bottom: 5px;">Resolution Summary:</strong>
              <p style="margin: 0; font-size: 13px; color: #047857;">${c.resolution}</p>
            </div>
          ` : ''}
          <div class="footer">
            Printed on ${new Date().toLocaleString()} · Student Complaint Logging & Ticketing System · Verify at portal using Ticket Number.
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Search/Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Complaints Record</h1>
            <p className="text-xs text-slate-500">
              Track status transitions, message desk officers, and download formal complaint slips.
            </p>
          </div>
          <button
            onClick={() => onNavigate('submit-complaint')}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>Submit New Complaint</span>
          </button>
        </div>

        {/* Filter tabs & Search input */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2">
          {/* Status Filter Segmented Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto text-xs font-semibold text-slate-600">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending / Review' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'resolved', label: 'Resolved' },
              { id: 'closed', label: 'Closed' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  statusFilter === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by ticket # or title..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Complaints Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">No Complaints Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'No complaints match your active filter criteria. Try resetting filters.'
                : 'You have not submitted any complaints yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket Number</th>
                  <th className="py-3 px-4">Complaint Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Officer</th>
                  <th className="py-3 px-4">Date Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(c => {
                  const catName = catMap.get(c.categoryId) || 'General';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                        {c.ticketNumber}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-semibold text-slate-900 block truncate">{c.title}</span>
                        <span className="text-[11px] text-slate-400 block truncate">{c.description}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">{catName}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                        {c.assignedStaffName || (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {formatDateTime(c.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectComplaint(c.id)}
                            title="View Full Discussion & Details"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onTrackTicket(c.ticketNumber)}
                            title="Interactive Visual Tracker"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrintSlip(c)}
                            title="Download / Print Complaint Slip"
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
