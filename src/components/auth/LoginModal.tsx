import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { LogIn, Building2, AlertCircle, Sparkles } from 'lucide-react';
import { UserRole } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  defaultRole?: UserRole;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  defaultRole = 'student',
}) => {
  const { institutions, login, users, switchUser } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('inst-atap');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your email address or ID number.');
      return;
    }

    const res = login(
      identifier,
      selectedRole === 'super_admin' ? undefined : selectedInstitutionId
    );

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Authentication failed.');
    }
  };

  const handleQuickFill = (email: string, instId?: string) => {
    setIdentifier(email);
    if (instId) setSelectedInstitutionId(instId);
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign In to Complaint Management Portal"
      subtitle="Select your role and institution to access your authorized workspace"
      maxWidth="md"
    >
      {/* Role Selector Tabs (Segmented control) */}
      <div className="flex p-1 bg-slate-100 rounded-lg mb-5 text-xs font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => {
            setSelectedRole('student');
            setError(null);
          }}
          className={`flex-1 py-1.5 rounded-md transition-colors ${
            selectedRole === 'student' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedRole('staff');
            setError(null);
          }}
          className={`flex-1 py-1.5 rounded-md transition-colors ${
            selectedRole === 'staff' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Staff Officer
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedRole('institution_admin');
            setError(null);
          }}
          className={`flex-1 py-1.5 rounded-md transition-colors ${
            selectedRole === 'institution_admin' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Institution Admin
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedRole('super_admin');
            setError(null);
          }}
          className={`flex-1 py-1.5 rounded-md transition-colors ${
            selectedRole === 'super_admin' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Super Admin
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Institution selection (hidden for super admin) */}
        {selectedRole !== 'super_admin' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Educational Institution <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={selectedInstitutionId}
                onChange={e => setSelectedInstitutionId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              >
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.abbreviation})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Institutions manage independent rosters, departments, and complaints.
            </p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {selectedRole === 'student'
              ? 'Student ID / Matric No or Email'
              : selectedRole === 'staff'
              ? 'Staff ID or Email Address'
              : 'Administrative Email'} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder={
              selectedRole === 'student'
                ? 'e.g. ATAP/CS/2024/0482 or m.abdul@student.atap.edu.ng'
                : selectedRole === 'staff'
                ? 'e.g. ATAP-STF-019 or atap.exams@atap.edu.ng'
                : selectedRole === 'institution_admin'
                ? 'atap.admin@atap.edu.ng'
                : 'superadmin@platform.edu'
            }
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Password <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => alert('Password recovery: A reset link has been simulated to your registered institutional email.')}
              className="text-[11px] text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <label htmlFor="remember-me" className="ml-2 text-xs text-slate-600">
            Remember this device for 30 days
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In as {selectedRole.replace('_', ' ').toUpperCase()}</span>
        </button>
      </form>

      {/* Demo Quick Fill helper */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Demo Auto-Fill:</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickFill('m.abdul@student.atap.edu.ng', 'inst-atap')}
            className="text-left p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-700 truncate"
          >
            <span className="font-semibold block truncate">ATAP Student</span>
            <span className="text-[10px] text-slate-500 truncate">m.abdul@student.atap.edu.ng</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('atap.exams@atap.edu.ng', 'inst-atap')}
            className="text-left p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-700 truncate"
          >
            <span className="font-semibold block truncate">ATAP Staff (Exam)</span>
            <span className="text-[10px] text-slate-500 truncate">atap.exams@atap.edu.ng</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('atap.admin@atap.edu.ng', 'inst-atap')}
            className="text-left p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-700 truncate"
          >
            <span className="font-semibold block truncate">ATAP Admin</span>
            <span className="text-[10px] text-slate-500 truncate">atap.admin@atap.edu.ng</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('superadmin@platform.edu')}
            className="text-left p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-700 truncate"
          >
            <span className="font-semibold block truncate">Super Admin</span>
            <span className="text-[10px] text-slate-500 truncate">superadmin@platform.edu</span>
          </button>
        </div>
      </div>

      {selectedRole === 'student' && (
        <div className="mt-4 text-center text-xs text-slate-500">
          New student?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 font-semibold hover:underline"
          >
            Create an account
          </button>
        </div>
      )}
    </Modal>
  );
};
