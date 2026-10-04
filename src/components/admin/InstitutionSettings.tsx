import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, RotateCcw, Building2, Shield, Bell } from 'lucide-react';

export const InstitutionSettings: React.FC = () => {
  const { currentInstitution, updateInstitution, resetDemoData } = useApp();

  const [name, setName] = useState(currentInstitution?.name || '');
  const [abbreviation, setAbbreviation] = useState(currentInstitution?.abbreviation || '');
  const [address, setAddress] = useState(currentInstitution?.address || '');
  const [phone, setPhone] = useState(currentInstitution?.phone || '');
  const [email, setEmail] = useState(currentInstitution?.email || '');
  const [ticketPrefix, setTicketPrefix] = useState(currentInstitution?.ticketPrefix || '');
  const [escalationDays, setEscalationDays] = useState(currentInstitution?.escalationDays || 7);
  const [primaryColor, setPrimaryColor] = useState(currentInstitution?.primaryColor || '#2563eb');
  const [isSaved, setIsSaved] = useState(false);

  if (!currentInstitution) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateInstitution(currentInstitution.id, {
      name,
      abbreviation,
      address,
      phone,
      email,
      ticketPrefix,
      escalationDays: Number(escalationDays),
      primaryColor,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all test data to initial defaults?')) {
      resetDemoData();
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Institution & Branding Settings</h1>
          <p className="text-xs text-slate-500">
            Configure {currentInstitution.name} portal identity, ticket numbering, and escalation SLA windows.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Database</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 text-xs">
        {/* General Identity */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            1. Institutional Identity & Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institution Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Acronym / Abbreviation</label>
              <input
                type="text"
                value={abbreviation}
                onChange={e => setAbbreviation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono uppercase"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Support Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Helpdesk Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Secretariat / Campus Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>
        </div>

        {/* Complaint & SLA Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            2. Ticket Generation & Escalation Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unique Ticket Prefix
              </label>
              <input
                type="text"
                value={ticketPrefix}
                onChange={e => setTicketPrefix(e.target.value)}
                placeholder="e.g. ATAP-CMP-2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono uppercase"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tickets are numbered sequentially using this prefix (e.g. {ticketPrefix || 'CMP'}-000001).
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Escalation / Overdue Period (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={escalationDays}
                onChange={e => setEscalationDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Complaints unresolved after this threshold trigger urgent supervisor notifications.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Branding Colors */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            3. Dynamic Theme Branding Color
          </h3>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-slate-300"
              />
              <span className="font-mono text-slate-700">{primaryColor}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Header logos, avatars, and badge highlights dynamically update across students and staff for this institution.
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {isSaved ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <span>Settings saved successfully.</span>
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
