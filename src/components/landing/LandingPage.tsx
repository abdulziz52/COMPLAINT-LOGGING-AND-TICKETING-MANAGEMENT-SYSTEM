import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  FileSpreadsheet,
  Building2,
  ArrowRight,
  Send,
  MessageSquare,
  Users,
  BarChart,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../types';

interface LandingPageProps {
  onOpenLogin: (role?: UserRole) => void;
  onOpenRegister: () => void;
  onQuickTrack: (ticketNumber: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenRegister,
  onQuickTrack,
}) => {
  const { institutions, switchUser, users } = useApp();
  const [ticketInput, setTicketInput] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketInput.trim()) {
      onQuickTrack(ticketInput.trim());
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-12 sm:pb-16 bg-gradient-to-b from-blue-50/70 to-transparent rounded-2xl border border-blue-100/60 p-6 sm:p-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            <Shield className="w-3.5 h-3.5" />
            <span>Multi-Institution Academic Governance & Grievance Redressal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight text-balance">
            Student Complaint Logging and Ticketing Management System
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            &ldquo;A simple, transparent and efficient way to submit, track and resolve student complaints.&rdquo;
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenLogin('student')}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all hover:shadow flex items-center gap-2"
            >
              <span>Student Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenRegister}
              className="px-5 py-2.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              Student Registration
            </button>
            <button
              onClick={() => onOpenLogin('staff')}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              Staff Officer Login
            </button>
            <button
              onClick={() => onOpenLogin('institution_admin')}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              Institution Admin Login
            </button>
          </div>

          {/* Quick Track Ticket Box */}
          <div className="pt-6 max-w-xl mx-auto">
            <div className="bg-white p-2 rounded-xl shadow-md border border-slate-200">
              <form onSubmit={handleTrackSubmit} className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
                <input
                  type="text"
                  value={ticketInput}
                  onChange={e => setTicketInput(e.target.value)}
                  placeholder="Enter Ticket Number (e.g. ATAP-CMP-2026-000001)"
                  className="flex-1 px-2 py-2 text-xs bg-transparent focus:outline-none text-slate-800 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
                >
                  Track Ticket
                </button>
              </form>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Public tracking allows instant status verification without signing in.
            </p>
          </div>
        </div>
      </section>

      {/* Reviewer / Evaluator Quick Login Strip */}
      <section className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Project Reviewer & Demo Access</span>
            </div>
            <p className="text-xs text-amber-800">
              One-click instant login into any multi-institution persona to evaluate workflows, Excel imports/exports,
              and complaint lifecycles:
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {users.slice(0, 5).map(u => {
              const inst = institutions.find(i => i.id === u.institutionId);
              return (
                <button
                  key={u.id}
                  onClick={() => switchUser(u)}
                  className="px-2.5 py-1.5 bg-white hover:bg-amber-100 border border-amber-300 text-slate-800 text-[11px] font-semibold rounded-md shadow-xs transition-colors"
                >
                  {u.role.replace('_', ' ').toUpperCase()}: {u.name.split(' ')[0]} ({inst?.abbreviation || 'Global'})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works (Numbered Workflow) */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">How It Works</h2>
          <p className="text-xs text-slate-600">
            A structured, auditable six-step lifecycle designed to prevent lost grievances and ensure accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { step: '01', title: 'Register or Log In', desc: 'Create account with student matric number and secure login.', icon: Users },
            { step: '02', title: 'Select Institution', desc: 'Choose your university, polytechnic, or college from the registry.', icon: Building2 },
            { step: '03', title: 'Submit Complaint', desc: 'Provide title, category, priority, attachments, and course details.', icon: Send },
            { step: '04', title: 'Receive Ticket', desc: 'Auto-generated unique ticket code (e.g. ATAP-CMP-2026-000001).', icon: FileText },
            { step: '05', title: 'Track Complaint', desc: 'Monitor review, officer assignment, and live stage timeline.', icon: Clock },
            { step: '06', title: 'Receive Resolution', desc: 'Review formal resolution memo, closure notes, and feedback.', icon: CheckCircle2 },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-blue-600">{item.step}.</span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Participating Educational Institutions */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Supported Institutions</h2>
            <p className="text-xs text-slate-600">
              Each institution operates with strict data isolation, custom categories, and assigned staff desks.
            </p>
          </div>
          <button
            onClick={() => onOpenLogin('super_admin')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Platform Super Admin Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {institutions.map(inst => (
            <div
              key={inst.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs"
                    style={{ backgroundColor: inst.primaryColor }}
                  >
                    {inst.abbreviation}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{inst.name}</h3>
                    <span className="text-[11px] text-slate-500">{inst.type} · {inst.address.split(',')[1] || 'Nigeria'}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 py-3 border-y border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ticket Prefix:</span>
                    <span className="font-mono font-medium text-slate-800">{inst.ticketPrefix}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Escalation Window:</span>
                    <span className="font-medium text-slate-800">{inst.escalationDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-700 font-medium">Active & Operational</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => onOpenLogin('student')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Student Portal</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onOpenLogin('institution_admin')}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Admin Desk
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* System Features Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Key System Features</h2>
          <p className="text-xs text-slate-600">
            Engineered for real-world academic institutions with enterprise-grade data management and reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: 'Multi-Institution Partitioning',
              desc: 'Rigorous data separation ensures students, staff, and records from Institution A are never visible to Institution B.',
              icon: Building2,
            },
            {
              title: 'Automatic Ticket Generation',
              desc: 'Sequential institution-prefixed ticket identifiers generated dynamically upon submission.',
              icon: FileText,
            },
            {
              title: 'Complaint Communication Thread',
              desc: 'Two-way interactive messaging between students and officers with confidential staff notes.',
              icon: MessageSquare,
            },
            {
              title: 'Excel Data Management',
              desc: 'Export students, complaints, staff, and analytics to valid .xlsx spreadsheets, with bulk Excel import and validation.',
              icon: FileSpreadsheet,
            },
            {
              title: 'Escalation & Overdue System',
              desc: 'Automated warnings for tickets remaining unresolved past the configurable institutional threshold.',
              icon: Clock,
            },
            {
              title: 'Department & Category Controls',
              desc: 'Configurable academic and non-academic categories and department rosters customized per campus.',
              icon: Users,
            },
            {
              title: 'Audit Trail & Compliance',
              desc: 'Comprehensive timestamped audit logging for status changes, administrative actions, and data imports.',
              icon: Shield,
            },
            {
              title: 'Analytics & Reporting',
              desc: 'Executive summaries, resolution turnaround metrics, category distribution, and printable reports.',
              icon: BarChart,
            },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">{feat.title}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
