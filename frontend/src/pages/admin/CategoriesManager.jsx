import React, { useEffect, useState } from 'react';
import { getAdminCategories, createCategory, updateCategory, deleteCategory, getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory } from '../../services/adminApi';
import { Loader2, Plus, Edit3, Trash2, FolderTree, X } from 'lucide-react';

export default function CategoriesManager() {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'subcategories'
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const catRes = await getAdminCategories();
      if (catRes.success) setCategories(catRes.data);
      
      const subRes = await getSubcategories();
      if (subRes.success) setSubcategories(subRes.data);
    } catch (e) {
      console.error("Failed to fetch catalog data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (activeTab === 'categories') {
      setFormData(item ? { ...item } : { name: '', slug: '', icon: '🛒', image_url: '', is_active: true, sort_order: 0 });
    } else {
      setFormData(item ? { ...item } : { category_id: categories[0]?.id || '', name: '', slug: '', description: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'categories') {
        if (editingItem) await updateCategory(editingItem.id, formData);
        else await createCategory(formData);
      } else {
        if (editingItem) await updateSubcategory(editingItem.id, formData);
        else await createSubcategory(formData);
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      try {
        if (activeTab === 'categories') await deleteCategory(id);
        else await deleteSubcategory(id);
        fetchData();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Categories & Subcategories</h2>
          <p className="text-xs text-slate-500 mt-1">Organize your product catalog hierarchy.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setActiveTab('categories')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'categories' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Categories</button>
          <button onClick={() => setActiveTab('subcategories')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'subcategories' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Subcategories</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add {activeTab === 'categories' ? 'Category' : 'Subcategory'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Slug</th>
                {activeTab === 'subcategories' && <th className="px-6 py-4">Parent Category</th>}
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(activeTab === 'categories' ? categories : subcategories).map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800 flex items-center gap-2">
                    {activeTab === 'categories' && <span className="text-xl">{item.icon}</span>}
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{item.slug}</td>
                  {activeTab === 'subcategories' && (
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {categories.find(c => c.id === item.category_id)?.name || 'Unknown'}
                    </td>
                  )}
                  <td className="px-6 py-4 text-center">
                    {item.is_active ? (
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Active</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{editingItem ? 'Edit' : 'Add'} {activeTab === 'categories' ? 'Category' : 'Subcategory'}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {activeTab === 'subcategories' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parent Category</label>
                  <select required value={formData.category_id || ''} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white">
                    <option value="" disabled>Select a category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
                <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Slug</label>
                <input required type="text" value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
              </div>

              {activeTab === 'categories' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Emoji Icon</label>
                    <input type="text" value={formData.icon || ''} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sort Order</label>
                    <input type="number" value={formData.sort_order || 0} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                </>
              )}

              {activeTab === 'subcategories' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" rows="3"></textarea>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <input type="checkbox" id="cat-active" checked={formData.is_active !== false} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                <label htmlFor="cat-active" className="text-sm text-slate-700 font-medium">Active</label>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
