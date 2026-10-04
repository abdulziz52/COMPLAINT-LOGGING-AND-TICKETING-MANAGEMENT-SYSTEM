import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import {
  MessageSquare,
  Send,
  FileText,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { ComplaintStatus } from '../../types';
import { formatDateTime } from '../../utils/ticket';

interface ComplaintDetailModalProps {
  complaintId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackTicket?: (ticketNumber: string) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaintId,
  isOpen,
  onClose,
  onTrackTicket,
}) => {
  const {
    complaints,
    departments,
    categories,
    institutions,
    messages,
    statusHistory,
    currentUser,
    users,
    sendComplaintMessage,
    updateComplaintStatus,
    assignComplaint,
  } = useApp();

  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('in_progress');
  const [statusComment, setStatusComment] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');

  if (!complaintId) return null;

  const complaint = complaints.find(c => c.id === complaintId);
  if (!complaint) return null;

  const institution = institutions.find(i => i.id === complaint.institutionId);
  const department = departments.find(d => d.id === complaint.departmentId);
  const category = categories.find(c => c.id === complaint.categoryId);
  const history = statusHistory.filter(h => h.complaintId === complaint.id);
  const complaintMessages = messages.filter(
    m => m.complaintId === complaint.id && (!m.isInternal || currentUser?.role !== 'student')
  );

  const canManage = currentUser?.role === 'institution_admin' || currentUser?.role === 'staff' || currentUser?.role === 'super_admin';

  // Available staff for assignment in this institution
  const staffOfficers = users.filter(
    u => u.role === 'staff' && u.institutionId === complaint.institutionId && u.status === 'active'
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendComplaintMessage(complaint.id, replyText, isInternal);
    setReplyText('');
    setIsInternal(false);
  };

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateComplaintStatus(
      complaint.id,
      newStatus,
      statusComment || undefined,
      newStatus === 'resolved' ? resolutionText || undefined : undefined
    );
    setStatusComment('');
    setResolutionText('');
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    assignComplaint(complaint.id, selectedStaffId);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ticket: ${complaint.ticketNumber}`}
      subtitle={`${complaint.title} · ${institution?.name || ''}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={complaint.status} />
            <span className="text-slate-300">·</span>
            <PriorityBadge priority={complaint.priority} />
            <span className="text-slate-300">·</span>
            <span className="text-slate-600 font-medium">{category?.name || 'General Category'}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600 font-medium">{department?.name || 'Academic Unit'}</span>
          </div>

          {onTrackTicket && (
            <button
              onClick={() => {
                onClose();
                onTrackTicket(complaint.ticketNumber);
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Open Stepper Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Student & Course Context Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-white border border-slate-200 rounded-xl text-xs">
          <div>
            <span className="text-[11px] text-slate-400 block">Complainant Student</span>
            <span className="font-semibold text-slate-900">{complaint.studentName}</span>
            <span className="font-mono text-[11px] text-slate-500 block">{complaint.studentMatricNo}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Student Contact</span>
            <span className="text-slate-800 block">{complaint.studentEmail}</span>
            <span className="text-slate-500 text-[11px]">{complaint.studentPhone || 'No phone recorded'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Course & Semester</span>
            <span className="font-medium text-slate-800">
              {complaint.relatedCourse || 'General'}
            </span>
            <span className="text-slate-500 text-[11px] block">{complaint.semesterSession || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Assigned Staff Desk</span>
            <span className="font-semibold text-slate-900">
              {complaint.assignedStaffName || 'Unassigned / Under Review'}
            </span>
          </div>
        </div>

        {/* Complaint Statement */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Detailed Grievance Narrative
          </h4>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
            {complaint.description}
          </div>
        </div>

        {/* Attachments */}
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Supporting Attachments ({complaint.attachments.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {complaint.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{att.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({Math.round(att.size / 1024)} KB)
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 hover:underline">
                    Download
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolution section */}
        {complaint.resolution && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Official Resolution Memo</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">{complaint.resolution}</p>
            {complaint.resolvedAt && (
              <span className="block text-[10px] text-emerald-600 font-mono pt-1">
                Resolved: {formatDateTime(complaint.resolvedAt)}
              </span>
            )}
          </div>
        )}

        {/* Officer Management Controls (If Staff or Admin) */}
        {canManage && (
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Officer Actions & Status Progression</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Assign to Staff */}
              <form onSubmit={handleAssign} className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700">Assign to Officer</label>
                <div className="flex gap-2">
                  <select
                    value={selectedStaffId}
                    onChange={e => setSelectedStaffId(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select staff member...</option>
                    {staffOfficers.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.staffRole || 'Officer'})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md whitespace-nowrap"
                  >
                    Assign
                  </button>
                </div>
              </form>

              {/* Update Status */}
              <form onSubmit={handleStatusUpdate} className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700">Change Status</label>
                <div className="space-y-2">
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as ComplaintStatus)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    <option value="under_review">Under Review</option>
                    <option value="in_progress">In Progress</option>
                    <option value="awaiting_student_response">Awaiting Student Response</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                    <option value="closed">Closed</option>
                  </select>

                  <input
                    type="text"
                    value={statusComment}
                    onChange={e => setStatusComment(e.target.value)}
                    placeholder="Status update note or reason..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  {newStatus === 'resolved' && (
                    <textarea
                      rows={2}
                      value={resolutionText}
                      onChange={e => setResolutionText(e.target.value)}
                      placeholder="Official resolution summary (memo number, grade correction details, bursary refund notes, etc.)..."
                      className="w-full px-2.5 py-1.5 text-xs border border-emerald-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-emerald-50/20"
                      required
                    />
                  )}

                  <button
                    type="submit"
                    className="w-full py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Save Status Change
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Communication Thread */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Conversation & Case History ({complaintMessages.length})</span>
            </h4>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto p-1">
            {complaintMessages.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No conversation history yet. Send a response below.
              </div>
            ) : (
              complaintMessages.map(msg => {
                const isMe = currentUser && msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl text-xs max-w-xl ${
                      isMe
                        ? 'ml-auto bg-blue-600 text-white'
                        : msg.isInternal
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1 text-[11px] opacity-80">
                      <span className="font-bold flex items-center gap-1">
                        {msg.isInternal && <Lock className="w-3 h-3 text-amber-700" />}
                        {msg.senderName} ({msg.senderRole.replace('_', ' ')})
                        {msg.isInternal && <span className="font-semibold text-amber-800">[Confidential Note]</span>}
                      </span>
                      <span className="font-mono text-[10px]">{formatDateTime(msg.createdAt)}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Form */}
          {currentUser && (
            <form onSubmit={handleSendMessage} className="space-y-2 pt-2 border-t border-slate-100">
              {canManage && (
                <label className="flex items-center gap-1.5 text-xs text-amber-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={e => setIsInternal(e.target.checked)}
                    className="w-3.5 h-3.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <span className="font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Internal Staff Note (Hidden from Student)
                  </span>
                </label>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={
                    isInternal
                      ? 'Add confidential note for colleagues and administrative audit...'
                      : 'Write a response to the student or desk officer...'
                  }
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
};
