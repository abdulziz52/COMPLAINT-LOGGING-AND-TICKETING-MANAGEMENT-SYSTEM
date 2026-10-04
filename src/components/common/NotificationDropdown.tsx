import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Clock, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../utils/ticket';

export const NotificationDropdown: React.FC<{ onSelectComplaint?: (complaintId: string) => void }> = ({
  onSelectComplaint,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, currentUser, unreadNotifsCount, markNotificationRead, markAllNotificationsRead } = useApp();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userNotifs = currentUser
    ? notifications.filter(n => n.userId === currentUser.id)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'warning':
        return <Clock className="w-4 h-4 text-amber-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadNotifsCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full font-mono">
            {unreadNotifsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Notifications</span>
              {unreadNotifsCount > 0 && (
                <span className="text-xs text-slate-500 font-mono">({unreadNotifsCount} unread)</span>
              )}
            </div>
            {unreadNotifsCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {userNotifs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No notifications at this time
              </div>
            ) : (
              userNotifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.complaintId && onSelectComplaint) {
                      onSelectComplaint(n.complaintId);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                    !n.readStatus ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                    {n.ticketNumber && (
                      <span className="inline-block mt-1 text-[11px] font-mono font-medium text-blue-600">
                        {n.ticketNumber}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
