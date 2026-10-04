import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Building2,
  Users,
  FolderOpen,
  Plus,
  ExternalLink,
  Edit2,
  ShieldAlert,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { Institution } from '../../types';

export const SuperAdminDashboard: React.FC = () => {
  const {
    institutions,
    users,
    complaints,
    addInstitution,
    updateInstitution,
    switchInstitutionContext,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<Institution | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [type, setType] = useState<Institution['type']>('Polytechnic');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [ticketPrefix, setTicketPrefix] = useState('');
  const [escalationDays, setEscalationDays] = useState(7);
  const [primaryColor, setPrimaryColor] = useState('#059669');

  const totalComplaints = complaints.length;
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalStaff = users.filter(u => u.role === 'staff' || u.role === 'institution_admin').length;

  const handleOpenAdd = () => {
    setEditingInst(null);
    setName('');
    setAbbreviation('');
    setType('University');
    setAddress('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setTicketPrefix('NEW-CMP-2026');
    setEscalationDays(7);
    setPrimaryColor('#2563eb');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inst: Institution) => {
    setEditingInst(inst);
    setName(inst.name);
    setAbbreviation(inst.abbreviation);
    setType(inst.type);
    setAddress(inst.address);
    setPhone(inst.phone);
    setEmail(inst.email);
    setWebsite(inst.website);
    setTicketPrefix(inst.ticketPrefix);
    setEscalationDays(inst.escalationDays);
    setPrimaryColor(inst.primaryColor);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !abbreviation.trim()) return;

    if (editingInst) {
      updateInstitution(editingInst.id, {
        name,
        abbreviation,
        type,
        address,
        phone,
        email,
        website,
        ticketPrefix,
        escalationDays: Number(escalationDays),
        primaryColor,
      });
    } else {
      addInstitution({
        name,
        abbreviation,
        type,
        address,
        phone,
        email,
        website,
        status: 'active',
        primaryColor,
        secondaryColor: '#0f172a',
        ticketPrefix,
        escalationDays: Number(escalationDays),
      });
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (inst: Institution) => {
    const nextStatus = inst.status === 'active' ? 'suspended' : 'active';
    updateInstitution(inst.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Central Platform Governance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Multi-Institution Platform Control</h1>
          <p className="text-xs text-slate-500">
            Provision new universities, polytechnics, colleges and monitor global grievance metrics.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Institution</span>
        </button>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Institutions', value: institutions.length, text: 'text-slate-900' },
          { label: 'Platform Students', value: totalStudents, text: 'text-blue-700' },
          { label: 'Officers & Admins', value: totalStaff, text: 'text-emerald-700' },
          { label: 'Total Complaints Logged', value: totalComplaints, text: 'text-indigo-700' },
        ].map((m, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">{m.label}</span>
            <span className={`text-2xl font-bold font-mono tabular-nums mt-1 block ${m.text}`}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Institutions Directory */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Registered Educational Institutions</h2>
          <span className="text-xs text-slate-400 font-mono">Count: {institutions.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {institutions.map(inst => {
            const instCmpCount = complaints.filter(c => c.institutionId === inst.id).length;
            const instStuCount = users.filter(u => u.institutionId === inst.id && u.role === 'student').length;

            return (
              <div
                key={inst.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs"
                        style={{ backgroundColor: inst.primaryColor }}
                      >
                        {inst.abbreviation}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-snug">{inst.name}</h3>
                        <span className="text-[11px] text-slate-500">{inst.type}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        inst.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {inst.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 py-3 border-y border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Prefix:</span>
                      <span className="font-mono font-medium text-slate-800">{inst.ticketPrefix}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Enrolled Students:</span>
                      <span className="font-mono text-slate-800">{instStuCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Logged Complaints:</span>
                      <span className="font-mono text-slate-800">{instCmpCount}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(inst)}
                      className="p-1 text-slate-500 hover:text-blue-600 rounded"
                      title="Edit Settings"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleStatus(inst)}
                      className={`p-1 rounded ${
                        inst.status === 'active'
                          ? 'text-slate-500 hover:text-rose-600'
                          : 'text-slate-500 hover:text-emerald-600'
                      }`}
                      title={inst.status === 'active' ? 'Suspend Institution' : 'Activate Institution'}
                    >
                      {inst.status === 'active' ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    onClick={() => switchInstitutionContext(inst.id)}
                    className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>View Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-lg w-full space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">
              {editingInst ? 'Edit Educational Institution' : 'Provision New Institution'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institution Legal Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Abubakar Tatari Ali Polytechnic"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Acronym / Abbreviation *</label>
                  <input
                    type="text"
                    value={abbreviation}
                    onChange={e => setAbbreviation(e.target.value)}
                    placeholder="e.g. ATAP"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institution Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                  >
                    <option value="Polytechnic">Polytechnic</option>
                    <option value="University">University</option>
                    <option value="College of Education">College of Education</option>
                    <option value="College of Health">College of Health</option>
                    <option value="Other">Other Tertiary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ticket Prefix *</label>
                  <input
                    type="text"
                    value={ticketPrefix}
                    onChange={e => setTicketPrefix(e.target.value)}
                    placeholder="ATAP-CMP-2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Escalation Window (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={escalationDays}
                    onChange={e => setEscalationDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Support Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="complaints@inst.edu.ng"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Helpdesk Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campus Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Jos Road, Bauchi, Nigeria"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                    />
                    <span className="font-mono text-slate-700">{primaryColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  {editingInst ? 'Update Institution' : 'Provision Institution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
