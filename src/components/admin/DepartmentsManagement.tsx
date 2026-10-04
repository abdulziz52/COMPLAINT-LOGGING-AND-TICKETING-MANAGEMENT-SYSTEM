import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building, Plus, Edit2, Trash2, Download, FolderOpen, Users } from 'lucide-react';
import { Department } from '../../types';
import { exportDepartmentsToExcel } from '../../utils/excel';

export const DepartmentsManagement: React.FC = () => {
  const {
    currentInstitution,
    departments,
    complaints,
    users,
    addDepartment,
    updateDepartment,
    deleteDepartment,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [faculty, setFaculty] = useState('');

  if (!currentInstitution) return null;

  const instDepts = departments.filter(d => d.institutionId === currentInstitution.id);
  const instComplaints = complaints.filter(c => c.institutionId === currentInstitution.id);
  const instStaff = users.filter(u => u.institutionId === currentInstitution.id && u.role === 'staff');

  const handleOpenAdd = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setFaculty('School of Science and Technology');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setFaculty(dept.faculty || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingDept) {
      updateDepartment(editingDept.id, {
        name,
        code: code.toUpperCase(),
        faculty,
      });
    } else {
      addDepartment({
        institutionId: currentInstitution.id,
        name,
        code: code.toUpperCase(),
        faculty,
        status: 'active',
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove department "${name}"?`)) {
      deleteDepartment(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Academic & Administrative Departments</h1>
          <p className="text-xs text-slate-500">
            {instDepts.length} units configured for {currentInstitution.name}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportDepartmentsToExcel(instDepts, currentInstitution)}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Departments (.xlsx)</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {instDepts.map(dept => {
          const deptComplaintsCount = instComplaints.filter(c => c.departmentId === dept.id).length;
          const deptStaffCount = instStaff.filter(s => s.departmentId === dept.id).length;

          return (
            <div
              key={dept.id}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                    {dept.code}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id, dept.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">{dept.name}</h3>
                <span className="text-xs text-slate-500 block truncate">
                  {dept.faculty || 'Central Faculty'}
                </span>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>{deptComplaintsCount} Complaints</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{deptStaffCount} Staff</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingDept ? 'Edit Department' : 'Create Department'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Electrical & Electronic Engineering"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="e.g. EEE, CS, LAW"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Faculty / School</label>
                <input
                  type="text"
                  value={faculty}
                  onChange={e => setFaculty(e.target.value)}
                  placeholder="e.g. School of Engineering"
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
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
