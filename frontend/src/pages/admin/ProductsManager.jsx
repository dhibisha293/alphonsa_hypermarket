import React, { useEffect, useState, useRef } from 'react';
import { getProducts, getCategories } from '../../services/api';
import { createProduct, updateProduct, deleteProduct, getBrands, getSubcategories, uploadProductsCsv } from '../../services/adminApi';
import { Loader2, Search, Plus, Edit3, Trash2, PackageOpen, X, Upload } from 'lucide-react';

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Data for dropdowns
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchCatalogData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, subRes, brandRes] = await Promise.all([
        getProducts({ limit: 100 }),
        getCategories(),
        getSubcategories(),
        getBrands()
      ]);
      if (prodRes.success) setProducts(prodRes.data.products || []);
      if (catRes.success) setCategories(catRes.data);
      if (subRes.success) setSubcategories(subRes.data);
      if (brandRes.success) setBrands(brandRes.data);
    } catch (error) {
      console.error("Failed to fetch products/catalog data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const result = await uploadProductsCsv(file);
      alert(result.message);
      fetchCatalogData();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku || '',
        barcode: product.barcode || '',
        description: product.description || '',
        category_slug: product.category,
        subcategory_id: product.subcategory_id || '',
        brand_id: product.brand_id || '',
        price: product.price,
        original_price: product.original_price || product.originalPrice || '',
        discount: product.discount || 0,
        tax_rate: product.tax_rate || 0,
        image_url: product.image || product.image_url || '',
        unit: product.unit || '',
        is_bestseller: product.is_bestseller || product.isBestseller,
        is_new: product.is_new || product.isNew,
        stock_qty: product.stock_qty,
        is_active: product.is_active !== false
      });
    } else {
      setFormData({
        name: '', sku: '', barcode: '', description: '',
        category_slug: categories[0]?.slug || '', subcategory_id: '', brand_id: '',
        price: '', original_price: '', discount: 0, tax_rate: 0,
        image_url: '', unit: '',
        is_bestseller: false, is_new: false, stock_qty: 0, is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Find category label based on slug
      const cat = categories.find(c => c.slug === formData.category_slug);
      const payload = {
        ...formData,
        category_label: cat ? cat.name : formData.category_slug,
        price: Number(formData.price),
        original_price: formData.original_price ? Number(formData.original_price) : null,
        discount: Number(formData.discount),
        tax_rate: Number(formData.tax_rate),
        stock_qty: Number(formData.stock_qty),
        brand_id: formData.brand_id || null,
        subcategory_id: formData.subcategory_id || null,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }
      fetchCatalogData();
      handleCloseModal();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        fetchCatalogData();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Products Catalog</h2>
          <p className="text-xs text-slate-500 mt-1">Manage inventory, prices, and product details.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full lg:w-48 focus:outline-none focus:border-emerald-500"
            />
          </div>
          
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button 
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()} 
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Brand</th>
              <th className="px-6 py-4 text-right">Price</th>
              <th className="px-6 py-4 text-right">Stock</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <PackageOpen className="w-12 h-12 mb-3 text-slate-300" />
                    <h3 className="text-base font-bold text-slate-700">No products found</h3>
                    <p className="text-sm mt-1">There are currently no products in the catalog.</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 max-w-[200px] truncate">{product.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{product.sku} {product.barcode ? ` | ${product.barcode}` : ''}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {product.categoryLabel}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {brands.find(b => b.id === product.brand_id)?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    ₹{Number(product.price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-mono font-medium ${product.stock_qty < 10 ? 'text-red-500' : 'text-slate-600'}`}>
                      {product.stock_qty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(product)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              <form id="productForm" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Basic Info */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" rows="3"></textarea>
                </div>
                
                {/* Organization */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select required value={formData.category_slug} onChange={e => setFormData({...formData, category_slug: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500">
                    <option value="" disabled>Select category...</option>
                    {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subcategory</label>
                  <select value={formData.subcategory_id || ''} onChange={e => setFormData({...formData, subcategory_id: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500">
                    <option value="">None</option>
                    {subcategories.filter(s => s.category_id === categories.find(c => c.slug === formData.category_slug)?.id).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
                  <select value={formData.brand_id || ''} onChange={e => setFormData({...formData, brand_id: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500">
                    <option value="">None</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                
                {/* Pricing & Stock */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input required type="number" value={formData.stock_qty} onChange={e => setFormData({...formData, stock_qty: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tax Rate (%)</label>
                  <input type="number" step="0.1" value={formData.tax_rate} onChange={e => setFormData({...formData, tax_rate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                </div>

                {/* Identifiers */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SKU</label>
                  <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Barcode</label>
                  <input type="text" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                </div>
                
                {/* Image */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                  <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                </div>
                
                {/* Flags */}
                <div className="md:col-span-2 flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_bestseller} onChange={e => setFormData({...formData, is_bestseller: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">Bestseller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_new} onChange={e => setFormData({...formData, is_new: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">New Arrival</span>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
              <button type="submit" form="productForm" className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
