import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tag, Plus, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { ComplaintCategory } from '../../types';

export const CategoriesManagement: React.FC = () => {
  const {
    currentInstitution,
    categories,
    complaints,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ComplaintCategory | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!currentInstitution) return null;

  const instCats = categories.filter(c => c.institutionId === currentInstitution.id);
  const instComplaints = complaints.filter(c => c.institutionId === currentInstitution.id);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: ComplaintCategory) => {
    setEditingCat(cat);
    setName(cat.name);
    setDescription(cat.description);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCat) {
      updateCategory(editingCat.id, {
        name,
        description,
      });
    } else {
      addCategory({
        institutionId: currentInstitution.id,
        name,
        description,
        status: 'active',
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, catName: string) => {
    if (confirm(`Are you sure you want to remove complaint category "${catName}"?`)) {
      deleteCategory(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Complaint Categories</h1>
          <p className="text-xs text-slate-500">
            Define classification rules for student complaints in {currentInstitution.name}.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {instCats.map(cat => {
          const count = instComplaints.filter(c => c.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                  {cat.description || 'General complaints regarding this area.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono">{count} Filed Tickets</span>
                  <span className="text-emerald-700 font-medium">Active</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingCat ? 'Edit Complaint Category' : 'Create Custom Category'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Hostel & Facility Maintenance"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Scope</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Explain what complaints fall under this classification..."
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
                  {editingCat ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
