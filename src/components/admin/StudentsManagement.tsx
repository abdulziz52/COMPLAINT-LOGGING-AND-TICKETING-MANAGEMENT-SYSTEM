import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Search,
  Plus,
  Edit2,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { User } from '../../types';
import { exportStudentsToExcel } from '../../utils/excel';

export const StudentsManagement: React.FC = () => {
  const {
    currentInstitution,
    users,
    departments,
    addStudent,
    updateStudent,
    deleteStudent,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [programme, setProgramme] = useState('National Diploma');
  const [level, setLevel] = useState('ND I');

  if (!currentInstitution) return null;

  const instStudents = users.filter(u => u.institutionId === currentInstitution.id && u.role === 'student');
  const instDepts = departments.filter(d => d.institutionId === currentInstitution.id && d.status === 'active');
  const deptMap = new Map(instDepts.map(d => [d.id, d.name]));

  const filtered = instStudents.filter(s => {
    const query = searchQuery.toLowerCase().trim();
    const match =
      s.name.toLowerCase().includes(query) ||
      (s.studentId && s.studentId.toLowerCase().includes(query)) ||
      s.email.toLowerCase().includes(query);

    if (!match) return false;
    if (selectedDeptId !== 'all' && s.departmentId !== selectedDeptId) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setName('');
    setStudentId('');
    setEmail('');
    setPhone('');
    setDepartmentId(instDepts[0]?.id || '');
    setProgramme('National Diploma');
    setLevel('ND I');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (stu: User) => {
    setEditingStudent(stu);
    setName(stu.name);
    setStudentId(stu.studentId || '');
    setEmail(stu.email);
    setPhone(stu.phone || '');
    setDepartmentId(stu.departmentId || instDepts[0]?.id || '');
    setProgramme(stu.programme || 'National Diploma');
    setLevel(stu.level || 'ND I');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        name,
        studentId,
        email,
        phone,
        departmentId,
        programme,
        level,
      });
    } else {
      addStudent({
        institutionId: currentInstitution.id,
        name,
        studentId,
        email,
        phone,
        departmentId,
        programme,
        level,
        role: 'student',
        status: 'active',
      });
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (stu: User) => {
    const newStatus = stu.status === 'active' ? 'suspended' : 'active';
    updateStudent(stu.id, { status: newStatus });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove student "${name}" from this institutional database?`)) {
      deleteStudent(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Students Directory</h1>
          <p className="text-xs text-slate-500">
            {instStudents.length} registered students enrolled in {currentInstitution.name}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportStudentsToExcel(instStudents, instDepts, currentInstitution)}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Roster (.xlsx)</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by student name, matric number, or email..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        <select
          value={selectedDeptId}
          onChange={e => setSelectedDeptId(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white"
        >
          <option value="all">All Departments ({instDepts.length})</option>
          {instDepts.map(d => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No students match your query.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Student ID / Matric</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {s.studentId || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {s.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{s.email}</td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {s.departmentId ? deptMap.get(s.departmentId) || s.departmentId : 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-mono">
                      {s.level || '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          s.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleStatus(s)}
                          title={s.status === 'active' ? 'Suspend Student' : 'Activate Student'}
                          className={`p-1.5 rounded transition-colors ${
                            s.status === 'active'
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {s.status === 'active' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          title="Edit Student Profile"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          title="Delete Record"
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-lg w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingStudent ? 'Edit Student Record' : 'Register New Student'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Fatima Aliyu"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student / Matric ID *</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    placeholder="ATAP/CS/2024/0482"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+234..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@institution.edu.ng"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={departmentId}
                    onChange={e => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                    required
                  >
                    {instDepts.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Level</label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                  >
                    <option value="ND I">ND I</option>
                    <option value="ND II">ND II</option>
                    <option value="HND I">HND I</option>
                    <option value="HND II">HND II</option>
                    <option value="100 Level">100 Level</option>
                    <option value="200 Level">200 Level</option>
                    <option value="300 Level">300 Level</option>
                    <option value="400 Level">400 Level</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Programme / Course</label>
                <input
                  type="text"
                  value={programme}
                  onChange={e => setProgramme(e.target.value)}
                  placeholder="e.g. ND Computer Science"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
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
                  {editingStudent ? 'Save Changes' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
