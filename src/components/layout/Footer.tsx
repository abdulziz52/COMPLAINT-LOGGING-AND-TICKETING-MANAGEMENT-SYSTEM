import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { currentInstitution } = useApp();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-xs text-slate-500 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: currentInstitution?.primaryColor || '#2563eb' }}
              >
                {currentInstitution?.abbreviation?.slice(0, 3) || 'SCL'}
              </div>
              <span className="font-bold text-slate-900">
                {currentInstitution?.name || 'Student Complaint Logging & Ticketing Platform'}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed max-w-md">
              A modern, transparent, and multi-institution ticketing platform for students to report academic,
              welfare, examination, and facility concerns with end-to-end status tracking and direct communication.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span>Data Isolation Verified</span>
              <span>·</span>
              <span>Audit Logging Active</span>
              <span>·</span>
              <span>Excel Export Ready</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Institution Contacts</h4>
            <ul className="space-y-2 text-slate-600 text-[11px]">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{currentInstitution?.email || 'complaints@institution.edu'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{currentInstitution?.phone || '+234 (0) 800 000 0000'}</span>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{currentInstitution?.address || 'Main Campus Secretariat'}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Escalation & Policy</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Complaints unresolved after {currentInstitution?.escalationDays || 7} days automatically flag an overdue
              alert to the Dean of Student Affairs and Internal Quality Assurance.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div>
            © {new Date().getFullYear()} Student Complaint Logging & Ticketing Management System. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-slate-400">Prefix: {currentInstitution?.ticketPrefix || 'CMP-2026'}</span>
            <span>·</span>
            <span className="text-slate-500">Academic Project Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
