import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GraduationCap, Briefcase, Mail, Phone, Building, Calendar, CheckCircle2 } from 'lucide-react';
import { formatDateTime } from '../../utils/ticket';

export const ProfileView: React.FC = () => {
  const { currentUser, currentInstitution, departments, updateStudent } = useApp();
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!currentUser) return null;

  const deptMap = new Map(departments.map(d => [d.id, d.name]));
  const userDept = currentUser.departmentId ? deptMap.get(currentUser.departmentId) : 'General Unit';

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudent(currentUser.id, { phone });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">User Profile</h1>
          <p className="text-xs text-slate-500">
            Registered credentials in {currentInstitution?.name || 'Central Platform'}.
          </p>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full capitalize">
          {currentUser.status}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 text-xs">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xs"
            style={{ backgroundColor: currentInstitution?.primaryColor || '#2563eb' }}
          >
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{currentUser.name}</h2>
            <p className="text-xs text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              ID: {currentUser.studentId || currentUser.staffId || currentUser.id}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <span className="text-[11px] text-slate-400 block">Institution</span>
            <span className="font-semibold text-slate-900">{currentInstitution?.name}</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Department</span>
            <span className="font-semibold text-slate-900">{userDept}</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Official Email</span>
            <span className="text-slate-800">{currentUser.email}</span>
          </div>

          {currentUser.role === 'student' && (
            <>
              <div>
                <span className="text-[11px] text-slate-400 block">Programme / Course</span>
                <span className="text-slate-800">{currentUser.programme || 'General Studies'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Academic Level</span>
                <span className="font-mono text-slate-800">{currentUser.level || '100 Level'}</span>
              </div>
            </>
          )}

          {currentUser.role === 'staff' && (
            <div>
              <span className="text-[11px] text-slate-400 block">Designation</span>
              <span className="text-slate-800">{currentUser.staffRole || 'Desk Officer'}</span>
            </div>
          )}

          <div>
            <span className="text-[11px] text-slate-400 block">Registration Date</span>
            <span className="font-mono text-slate-700">{formatDateTime(currentUser.createdAt)}</span>
          </div>
        </div>

        {/* Update Contact Phone */}
        <form onSubmit={handleSavePhone} className="pt-4 border-t border-slate-100 space-y-3">
          <label className="block font-semibold text-slate-700">Update Contact Phone</label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-xs"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Update Phone
            </button>
          </div>
          {isSaved && (
            <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Contact phone updated.</span>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
