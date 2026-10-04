import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FilePlus2,
  Upload,
  CheckCircle2,
  Search,
  ArrowRight,
  AlertCircle,
  FileText,
  Copy,
  Check,
  Building,
} from 'lucide-react';
import { Complaint, ComplaintPriority } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { formatDateTime } from '../../utils/ticket';

interface SubmitComplaintProps {
  onNavigate: (view: string) => void;
  onSelectComplaint: (complaintId: string) => void;
}

export const SubmitComplaint: React.FC<SubmitComplaintProps> = ({
  onNavigate,
  onSelectComplaint,
}) => {
  const { currentUser, currentInstitution, departments, categories, createComplaint } = useApp();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [relatedCourse, setRelatedCourse] = useState('');
  const [semesterSession, setSemesterSession] = useState('2025/2026 First Semester');
  const [description, setDescription] = useState('');
  const [confirmedAccuracy, setConfirmedAccuracy] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string; type: string; size: number }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [copied, setCopied] = useState(false);

  // Institution-specific active departments and categories
  const instDepts = departments.filter(
    d => d.institutionId === currentInstitution?.id && d.status === 'active'
  );
  const instCats = categories.filter(
    c => c.institutionId === currentInstitution?.id && c.status === 'active'
  );

  // Set initial department and category defaults
  React.useEffect(() => {
    if (!departmentId && instDepts.length > 0) {
      setDepartmentId(currentUser?.departmentId || instDepts[0].id);
    }
    if (!categoryId && instCats.length > 0) {
      setCategoryId(instCats[0].id);
    }
  }, [instDepts, instCats, currentUser, departmentId, categoryId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newAttachment = {
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type || 'application/octet-stream',
        size: file.size,
      };
      setAttachments(prev => [...prev, newAttachment]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError('Please provide a complaint title and comprehensive description.');
      return;
    }

    if (!categoryId) {
      setError('Please select a valid complaint category.');
      return;
    }

    if (!departmentId) {
      setError('Please select the responsible academic or administrative department.');
      return;
    }

    if (!confirmedAccuracy) {
      setError('Please check the accuracy confirmation declaration before submitting.');
      return;
    }

    const complaint = createComplaint({
      title,
      description,
      categoryId,
      departmentId,
      priority,
      relatedCourse,
      semesterSession,
      attachments,
    });

    if (complaint) {
      setSubmittedComplaint(complaint);
    } else {
      setError('Failed to submit complaint. Please check your session.');
    }
  };

  const handleCopyTicket = (ticket: string) => {
    navigator.clipboard.writeText(ticket);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submission Success View
  if (submittedComplaint) {
    const selectedCat = instCats.find(c => c.id === submittedComplaint.categoryId);
    const selectedDept = instDepts.find(d => d.id === submittedComplaint.departmentId);

    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Complaint Submitted Successfully</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your grievance has been safely registered into {currentInstitution?.name}. An automated ticket number
              has been generated for tracking.
            </p>
          </div>

          {/* Ticket Information Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 block uppercase font-medium tracking-wider">
                  Official Ticket Number
                </span>
                <span className="text-xl font-bold font-mono text-blue-600">
                  {submittedComplaint.ticketNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyTicket(submittedComplaint.ticketNumber)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Ticket'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Complaint Title</span>
                <span className="font-semibold text-slate-900">{submittedComplaint.title}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Institution</span>
                <span className="font-medium text-slate-800">{currentInstitution?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <span className="font-medium text-slate-800">{selectedCat?.name || 'General'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Department</span>
                <span className="font-medium text-slate-800">{selectedDept?.name || 'Academic'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Date Submitted</span>
                <span className="font-mono text-slate-800">{formatDateTime(submittedComplaint.createdAt)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Current Status</span>
                <StatusBadge status={submittedComplaint.status} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onSelectComplaint(submittedComplaint.id)}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>View Complaint & Discussion</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('track-ticket')}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Track Complaint</span>
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FilePlus2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Submit New Student Complaint</h1>
            <p className="text-xs text-slate-500">
              Provide thorough details to expedite investigation by the appropriate department officer.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Complaint Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Complaint Title / Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Missing Examination CA Score for COM 211 / Hostel Water Disruption"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
            />
          </div>

          {/* Category & Department (Dynamic from institution) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Complaint Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                required
              >
                {instCats.length === 0 ? (
                  <option value="">No categories configured</option>
                ) : (
                  instCats.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Concerned Department / Unit <span className="text-rose-500">*</span>
              </label>
              <select
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                required
              >
                {instDepts.length === 0 ? (
                  <option value="">No departments available</option>
                ) : (
                  instDepts.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Priority & Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Level <span className="text-rose-500">*</span>
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as ComplaintPriority)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium"
              >
                <option value="low">Low (General Inquiry)</option>
                <option value="medium">Medium (Standard Issue)</option>
                <option value="high">High (Impacting Academics/Exam)</option>
                <option value="critical">Critical (Safety/Emergency/Expulsion)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Related Course Code (Optional)
              </label>
              <input
                type="text"
                value={relatedCourse}
                onChange={e => setRelatedCourse(e.target.value)}
                placeholder="e.g. COM 211, MTH 101"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester / Session
              </label>
              <input
                type="text"
                value={semesterSession}
                onChange={e => setSemesterSession(e.target.value)}
                placeholder="2025/2026 First Semester"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Complaint Narrative & Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="State the facts clearly: What occurred? Where did it happen? Who was involved? What specific resolution or correction are you seeking?"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 leading-relaxed"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Be specific with dates, venues, payment receipt numbers, or lecture hours where applicable.
            </p>
          </div>

          {/* Supporting Documents & File Uploads */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Supporting Documents or Images (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center transition-colors bg-slate-50/50">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs text-slate-600 font-medium">
                Upload image evidence, stamped scripts, payment slips, or PDF documents
              </p>
              <p className="text-[11px] text-slate-400 mb-2">Permitted formats: JPG, PNG, PDF up to 10MB</p>
              <label className="inline-block px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 cursor-pointer shadow-xs">
                Browse Files
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-slate-500">Attached Files:</span>
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-slate-100 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-slate-800 font-medium truncate">{att.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({Math.round(att.size / 1024)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-xs text-rose-600 hover:text-rose-800 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accuracy Confirmation Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedAccuracy}
                onChange={e => setConfirmedAccuracy(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                required
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I confirm that the information provided is accurate and truthful. I understand that submitting false or
                malicious complaints violates the institution&apos;s code of conduct.
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Submit Complaint</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
