import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Download,
} from 'lucide-react';
import { User } from '../../types';
import { exportStaffToExcel } from '../../utils/excel';

export const StaffManagement: React.FC = () => {
  const {
    currentInstitution,
    users,
    departments,
    addStaff,
    updateStaff,
    deleteStaff,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [staffRole, setStaffRole] = useState('Examination Officer');

  if (!currentInstitution) return null;

  const instStaff = users.filter(u => u.institutionId === currentInstitution.id && u.role === 'staff');
  const instDepts = departments.filter(d => d.institutionId === currentInstitution.id && d.status === 'active');
  const deptMap = new Map(instDepts.map(d => [d.id, d.name]));

  const filtered = instStaff.filter(s => {
    const query = searchQuery.toLowerCase().trim();
    const match =
      s.name.toLowerCase().includes(query) ||
      (s.staffId && s.staffId.toLowerCase().includes(query)) ||
      s.email.toLowerCase().includes(query) ||
      (s.staffRole && s.staffRole.toLowerCase().includes(query));

    if (!match) return false;
    if (selectedDeptId !== 'all' && s.departmentId !== selectedDeptId) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setName('');
    setStaffId(`ATAP-STF-${Math.floor(100 + Math.random() * 900)}`);
    setEmail('');
    setPhone('');
    setDepartmentId(instDepts[0]?.id || '');
    setStaffRole('Examination Officer');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st: User) => {
    setEditingStaff(st);
    setName(st.name);
    setStaffId(st.staffId || '');
    setEmail(st.email);
    setPhone(st.phone || '');
    setDepartmentId(st.departmentId || instDepts[0]?.id || '');
    setStaffRole(st.staffRole || 'Desk Officer');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        name,
        staffId,
        email,
        phone,
        departmentId,
        staffRole,
      });
    } else {
      addStaff({
        institutionId: currentInstitution.id,
        name,
        staffId,
        email,
        phone,
        departmentId,
        staffRole,
        role: 'staff',
        status: 'active',
      });
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (st: User) => {
    const newStatus = st.status === 'active' ? 'suspended' : 'active';
    updateStaff(st.id, { status: newStatus });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to deactivate and remove staff member "${name}"?`)) {
      deleteStaff(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Staff & Desk Officers Roster</h1>
          <p className="text-xs text-slate-500">
            {instStaff.length} authorized officers handling complaints across departments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportStaffToExcel(instStaff, instDepts, currentInstitution)}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Staff Roster (.xlsx)</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
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
            placeholder="Search by staff name, staff ID, designation, or email..."
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

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No staff officers found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Officer Name</th>
                  <th className="py-3 px-4">Designation / Role</th>
                  <th className="py-3 px-4">Department Unit</th>
                  <th className="py-3 px-4">Official Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {st.staffId || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {st.name}
                    </td>
                    <td className="py-3 px-4 font-medium text-blue-700 whitespace-nowrap">
                      {st.staffRole || 'Desk Officer'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {st.departmentId ? deptMap.get(st.departmentId) || st.departmentId : 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{st.email}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          st.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleStatus(st)}
                          title={st.status === 'active' ? 'Deactivate Staff' : 'Activate Staff'}
                          className={`p-1.5 rounded transition-colors ${
                            st.status === 'active'
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {st.status === 'active' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(st)}
                          title="Edit Staff Info"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(st.id, st.name)}
                          title="Remove Staff"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-lg w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingStaff ? 'Edit Staff Officer' : 'Register New Staff Member'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Dr. Ibrahim Sani"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Staff ID *</label>
                  <input
                    type="text"
                    value={staffId}
                    onChange={e => setStaffId(e.target.value)}
                    placeholder="ATAP-STF-019"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation / Role *</label>
                  <input
                    type="text"
                    value={staffRole}
                    onChange={e => setStaffRole(e.target.value)}
                    placeholder="e.g. Chief Examination Officer"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institutional Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="officer@institution.edu.ng"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department Unit *</label>
                  <select
                    value={departmentId}
                    onChange={e => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                    required
                  >
                    {instDepts.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
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
                  {editingStaff ? 'Save Changes' : 'Register Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
