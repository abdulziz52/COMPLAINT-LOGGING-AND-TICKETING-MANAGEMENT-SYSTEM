import React from 'react';
import { ComplaintStatus, ComplaintPriority } from '../../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const formatLabel = (s: string) => {
    return s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStyle = () => {
    switch (status) {
      case 'submitted':
        return { dot: 'bg-slate-400', text: 'text-slate-700' };
      case 'pending':
        return { dot: 'bg-amber-400', text: 'text-amber-800' };
      case 'under_review':
        return { dot: 'bg-blue-500', text: 'text-blue-700' };
      case 'assigned':
        return { dot: 'bg-indigo-500', text: 'text-indigo-700' };
      case 'in_progress':
        return { dot: 'bg-amber-500', text: 'text-amber-700' };
      case 'awaiting_student_response':
        return { dot: 'bg-purple-500', text: 'text-purple-700' };
      case 'resolved':
        return { dot: 'bg-emerald-500', text: 'text-emerald-700' };
      case 'rejected':
        return { dot: 'bg-rose-500', text: 'text-rose-700' };
      case 'closed':
        return { dot: 'bg-slate-400', text: 'text-slate-600' };
      default:
        return { dot: 'bg-slate-400', text: 'text-slate-700' };
    }
  };

  const { dot, text } = getStyle();

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium ${size === 'sm' ? 'text-xs' : 'text-xs'} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} aria-hidden="true" />
      <span>{formatLabel(status)}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: ComplaintPriority }> = ({ priority }) => {
  const getStyle = () => {
    switch (priority) {
      case 'critical':
        return { dot: 'bg-rose-600', text: 'text-rose-700 font-semibold' };
      case 'high':
        return { dot: 'bg-amber-600', text: 'text-amber-800 font-medium' };
      case 'medium':
        return { dot: 'bg-sky-500', text: 'text-sky-700 font-normal' };
      case 'low':
        return { dot: 'bg-slate-400', text: 'text-slate-600 font-normal' };
    }
  };

  const { dot, text } = getStyle();

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} aria-hidden="true" />
      <span className="capitalize">{priority} Priority</span>
    </span>
  );
};
