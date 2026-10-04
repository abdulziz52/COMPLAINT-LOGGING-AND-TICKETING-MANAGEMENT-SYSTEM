import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  User,
  Calendar,
  MessageSquare,
  Send,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { ComplaintStatus } from '../../types';
import { formatDateTime } from '../../utils/ticket';

interface TicketTrackerProps {
  initialTicketNumber?: string;
  onSelectComplaint?: (complaintId: string) => void;
}

export const TicketTracker: React.FC<TicketTrackerProps> = ({
  initialTicketNumber = '',
  onSelectComplaint,
}) => {
  const { complaints, institutions, departments, categories, statusHistory, messages, currentUser, sendComplaintMessage } = useApp();
  const [ticketInput, setTicketInput] = useState(initialTicketNumber);
  const [searchedTicket, setSearchedTicket] = useState(initialTicketNumber);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (initialTicketNumber) {
      setTicketInput(initialTicketNumber);
      setSearchedTicket(initialTicketNumber);
    }
  }, [initialTicketNumber]);

  // Find complaint
  const complaint = complaints.find(
    c => c.ticketNumber.toLowerCase().trim() === searchedTicket.toLowerCase().trim()
  );

  const institution = complaint
    ? institutions.find(i => i.id === complaint.institutionId)
    : null;

  const department = complaint
    ? departments.find(d => d.id === complaint.departmentId)
    : null;

  const category = complaint
    ? categories.find(c => c.id === complaint.categoryId)
    : null;

  const history = complaint
    ? statusHistory.filter(h => h.complaintId === complaint.id)
    : [];

  const complaintMessages = complaint
    ? messages.filter(m => m.complaintId === complaint.id && (!m.isInternal || currentUser?.role !== 'student'))
    : [];

  // Stages of workflow: Submitted -> Under Review -> Assigned -> In Progress -> Resolved -> Closed
  const WORKFLOW_STAGES: Array<{ key: ComplaintStatus; label: string }> = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'closed', label: 'Closed' },
  ];

  const getStageIndex = (st: ComplaintStatus) => {
    switch (st) {
      case 'submitted':
      case 'pending':
        return 0;
      case 'under_review':
        return 1;
      case 'assigned':
        return 2;
      case 'in_progress':
      case 'awaiting_student_response':
        return 3;
      case 'resolved':
        return 4;
      case 'closed':
        return 5;
      case 'rejected':
        return 1;
      default:
        return 0;
    }
  };

  const currentStageIndex = complaint ? getStageIndex(complaint.status) : 0;

  // Check if overdue
  const isOverdue = complaint && institution && complaint.status !== 'resolved' && complaint.status !== 'closed'
    ? (Date.now() - new Date(complaint.createdAt).getTime()) > institution.escalationDays * 24 * 60 * 60 * 1000
    : false;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedTicket(ticketInput.trim());
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !replyText.trim() || !currentUser) return;
    sendComplaintMessage(complaint.id, replyText);
    setReplyText('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Track Complaint Ticket</h1>
          <p className="text-xs text-slate-500">
            Enter your unique complaint tracking number to view real-time stage progress, officer notes, and timeline.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={ticketInput}
              onChange={e => setTicketInput(e.target.value)}
              placeholder="e.g. ATAP-CMP-2026-000001 or UA-CMP-2026-000001"
              className="w-full pl-9 pr-3 py-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            Track Status
          </button>
        </form>
      </div>

      {searchedTicket && !complaint && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Ticket Not Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            No complaint record matched <span className="font-mono font-bold text-slate-700">&ldquo;{searchedTicket}&rdquo;</span>.
            Please double-check the ticket number received during submission, including the institution prefix.
          </p>
        </div>
      )}

      {complaint && (
        <div className="space-y-6">
          {/* Overdue Alert banner if escalated */}
          {isOverdue && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-800">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold block">Escalation Notice: Ticket Marked as Overdue</span>
                  <span className="text-[11px] text-rose-700">
                    This ticket has exceeded the {institution?.escalationDays || 7}-day SLA threshold and has been prioritized
                    to Quality Assurance & Dean of Student Affairs.
                  </span>
                </div>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 bg-rose-100 font-bold text-rose-800 rounded">
                OVERDUE
              </span>
            </div>
          )}

          {/* Ticket Summary Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-blue-600">{complaint.ticketNumber}</span>
                  <span className="text-slate-300">·</span>
                  <PriorityBadge priority={complaint.priority} />
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">{complaint.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            {/* Visual Workflow Stepper Timeline */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider">
                Visual Resolution Progress
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {WORKFLOW_STAGES.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex || complaint.status === 'resolved' || complaint.status === 'closed';
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div
                      key={stage.key}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                          : isCompleted
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-slate-200 bg-slate-50/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <span className="block text-xs font-bold text-slate-900 truncate">{stage.label}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {isCompleted ? 'Completed' : isCurrent ? 'Active Stage' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Institution</span>
                <span className="font-semibold text-slate-900">{institution?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Department</span>
                <span className="font-semibold text-slate-900">{department?.name || 'Academic Unit'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Staff Officer</span>
                <span className="font-semibold text-slate-900">
                  {complaint.assignedStaffName || 'Under Initial Screening'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Last Updated</span>
                <span className="font-mono text-slate-700">{formatDateTime(complaint.updatedAt)}</span>
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Complaint Statement
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-lg border border-slate-200">
                {complaint.description}
              </p>
            </div>

            {/* Resolution Box (if resolved) */}
            {complaint.resolution && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Official Resolution Summary</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">{complaint.resolution}</p>
                {complaint.resolvedAt && (
                  <span className="block text-[10px] text-emerald-600 font-mono pt-1">
                    Resolved on {formatDateTime(complaint.resolvedAt)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Audit History Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Status Change History Log
            </h3>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {history.map(item => (
                <div key={item.id} className="relative group text-xs">
                  <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">
                      Status changed to &ldquo;{item.newStatus.replace(/_/g, ' ').toUpperCase()}&rdquo;
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{item.comment || 'Status progression updated by authorized personnel.'}</p>
                  <span className="text-[11px] text-slate-400">By: {item.changedByName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Communication / Discussion Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Ticket Communication Thread ({complaintMessages.length})</span>
              </h3>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {complaintMessages.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No messages exchanged on this complaint yet.
                </div>
              ) : (
                complaintMessages.map(msg => {
                  const isMyMessage = currentUser && msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-xl text-xs max-w-xl ${
                        isMyMessage
                          ? 'ml-auto bg-blue-600 text-white'
                          : msg.isInternal
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1 text-[11px] opacity-80">
                        <span className="font-bold">
                          {msg.senderName} ({msg.senderRole.replace('_', ' ')})
                        </span>
                        <span className="font-mono text-[10px]">{formatDateTime(msg.createdAt)}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Input Form (Only for logged in users) */}
            {currentUser ? (
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Send a response or update regarding this ticket..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 text-center">
                Please log in to reply directly to desk officers.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
