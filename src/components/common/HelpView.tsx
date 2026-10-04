import React from 'react';
import { useApp } from '../../context/AppContext';
import { HelpCircle, FileText, Clock, ShieldCheck, Mail, Phone } from 'lucide-react';

export const HelpView: React.FC = () => {
  const { currentInstitution } = useApp();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Student Grievance Guidelines & FAQ</h1>
            <p className="text-xs text-slate-500">
              Procedures for submitting, escalating, and resolving complaints at {currentInstitution?.name}.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {[
          {
            q: 'How do I log a complaint?',
            a: 'Sign into your student account, click "Submit Complaint", choose the appropriate category (e.g. Examination, Fees, Hostel), select the responsible department, explain the facts clearly, and attach any receipts or test attendance sheets before confirming.',
          },
          {
            q: 'How does the unique ticket number work?',
            a: `Every complaint automatically receives a unique identifier matching your institution prefix (e.g. ${currentInstitution?.ticketPrefix || 'ATAP-CMP-2026'}-000001). You can use this code to track progress publicly or review past correspondence.`,
          },
          {
            q: 'What is the institutional escalation threshold?',
            a: `Complaints that remain unattended or unresolved beyond ${currentInstitution?.escalationDays || 7} working days are automatically flagged as "OVERDUE" in red and escalated to the Dean of Student Affairs and Internal Quality Assurance.`,
          },
          {
            q: 'Can other students see my complaints?',
            a: 'No. Strict multi-institution data isolation ensures your complaints are private and only visible to you, the assigned desk officer, and the authorized institution administrator.',
          },
          {
            q: 'Can I communicate directly with the officer handling my case?',
            a: 'Yes! Inside each complaint ticket is a live two-way discussion thread where you can respond to requests for clarification and receive direct updates from the officer.',
          },
        ].map((faq, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 space-y-1.5 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">{faq.q}</h3>
            <p className="text-slate-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 uppercase tracking-wider">Need Further Assistance?</h3>
        <p className="text-slate-600">
          If you encounter technical issues or urgent emergencies, contact the campus student affairs secretariat:
        </p>
        <div className="flex flex-wrap items-center gap-6 text-slate-700 pt-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Mail className="w-4 h-4 text-slate-400" />
            {currentInstitution?.email}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Phone className="w-4 h-4 text-slate-400" />
            {currentInstitution?.phone}
          </span>
        </div>
      </div>
    </div>
  );
};
