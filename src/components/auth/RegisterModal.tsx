import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { UserPlus, Building2, AlertCircle, Sparkles } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const { institutions, departments, registerStudent } = useApp();

  const [institutionId, setInstitutionId] = useState<string>(institutions[0]?.id || 'inst-atap');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [programme, setProgramme] = useState('National Diploma');
  const [level, setLevel] = useState('ND I');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Filter departments for the selected institution
  const institutionDepartments = useMemo(() => {
    return departments.filter(d => d.institutionId === institutionId && d.status === 'active');
  }, [departments, institutionId]);

  // Set default department when institution changes
  React.useEffect(() => {
    if (institutionDepartments.length > 0 && !institutionDepartments.some(d => d.id === departmentId)) {
      setDepartmentId(institutionDepartments[0].id);
    }
  }, [institutionDepartments, departmentId]);

  const selectedDeptObj = institutionDepartments.find(d => d.id === departmentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password && confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!departmentId) {
      setError('Please select your academic department.');
      return;
    }

    const res = registerStudent({
      name,
      studentId,
      email,
      phone,
      institutionId,
      departmentId,
      faculty: selectedDeptObj?.faculty,
      programme,
      level,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  const handlePreFill = () => {
    const random = Math.floor(100 + Math.random() * 900);
    const chosenInst = institutions[0];
    setInstitutionId(chosenInst.id);
    setName('Amina Dahiru');
    setStudentId(`ATAP/CS/2025/${random}`);
    setEmail(`amina.dahiru${random}@student.atap.edu.ng`);
    setPhone('+234 812 345 6789');
    setProgramme('National Diploma in Computer Science');
    setLevel('ND I');
    setPassword('student123');
    setConfirmPassword('student123');
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Account Registration"
      subtitle="Join your institution's complaint logging and resolution network"
      maxWidth="2xl"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Institution selection */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <label className="block text-xs font-bold text-slate-900 mb-1">
            Step 1: Select Educational Institution <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              value={institutionId}
              onChange={e => {
                setInstitutionId(e.target.value);
                setDepartmentId('');
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800"
              required
            >
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.abbreviation}) — {inst.type}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Department and faculty choices dynamically reload based on the selected institution.
          </p>
        </div>

        {/* Personal Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Amina Dahiru"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Student ID / Matriculation No <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              placeholder="e.g. ATAP/CS/2024/0482"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Institutional Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="student@institution.edu.ng"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              required
            />
          </div>
        </div>

        {/* Academic Details (Loaded dynamically) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Academic Department <span className="text-rose-500">*</span>
            </label>
            <select
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
              required
            >
              {institutionDepartments.length === 0 ? (
                <option value="">No departments registered yet</option>
              ) : (
                institutionDepartments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))
              )}
            </select>
            {selectedDeptObj?.faculty && (
              <span className="block text-[11px] text-slate-400 mt-0.5">
                Faculty: {selectedDeptObj.faculty}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Programme / Course
            </label>
            <input
              type="text"
              value={programme}
              onChange={e => setProgramme(e.target.value)}
              placeholder="e.g. ND Computer Science, B.Sc Economics"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Academic Level
            </label>
            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
            >
              <option value="ND I">ND I</option>
              <option value="ND II">ND II</option>
              <option value="HND I">HND I</option>
              <option value="HND II">HND II</option>
              <option value="100 Level">100 Level</option>
              <option value="200 Level">200 Level</option>
              <option value="300 Level">300 Level</option>
              <option value="400 Level">400 Level</option>
              <option value="500 Level">500 Level</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                required
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePreFill}
            className="flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Pre-fill Sample Data</span>
          </button>

          <button
            type="submit"
            className="py-2.5 px-6 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Complete Registration</span>
          </button>
        </div>
      </form>

      <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
        Already registered?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-blue-600 font-semibold hover:underline"
        >
          Sign in here
        </button>
      </div>
    </Modal>
  );
};
