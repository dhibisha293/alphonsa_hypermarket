import React, { useEffect, useState } from 'react';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../../services/adminApi';
import { Loader2, Search, Plus, Edit3, Trash2, Tag, X } from 'lucide-react';

export default function BrandsManager() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', slug: '', logo_url: '', description: '', is_active: true });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await getBrands();
      if (res.success) setBrands(res.data);
    } catch (e) {
      console.error("Failed to fetch brands", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenModal = (brand = null) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        slug: brand.slug,
        logo_url: brand.logo_url || '',
        description: brand.description || '',
        is_active: brand.is_active
      });
    } else {
      setEditingBrand(null);
      setFormData({ name: '', slug: '', logo_url: '', description: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await updateBrand(editingBrand.id, formData);
      } else {
        await createBrand(formData);
      }
      fetchBrands();
      handleCloseModal();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await deleteBrand(id);
        fetchBrands();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Brands Manager</h2>
          <p className="text-xs text-slate-500 mt-1">Manage brand catalogs for products.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Brand</span>
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
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brands.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Tag className="w-12 h-12 mb-3 text-slate-300" />
                      <h3 className="text-base font-bold text-slate-700">No brands found</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                brands.map(brand => (
                  <tr key={brand.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{brand.name}</td>
                    <td className="px-6 py-4 text-slate-500">{brand.slug}</td>
                    <td className="px-6 py-4 text-center">
                      {brand.is_active ? (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Active</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(brand)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(brand.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{editingBrand ? 'Edit Brand' : 'Add Brand'}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Slug</label>
                <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Logo URL</label>
                <input type="text" value={formData.logo_url} onChange={e => setFormData({...formData, logo_url: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" rows="3"></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="brand-active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                <label htmlFor="brand-active" className="text-sm text-slate-700 font-medium">Active</label>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">Save Brand</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
