import React, { useState, useEffect, useCallback } from 'react';
import { Package, AlertTriangle, XCircle, Search, Filter, Plus, Minus, History, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as adminApi from '../../services/adminApi';

export default function InventoryManager() {
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Adjustment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustType, setAdjustType] = useState('MANUAL_ADJUSTMENT');
  const [adjustAction, setAdjustAction] = useState('INCREASE'); // INCREASE or DECREASE
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on search change
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, invRes, catRes] = await Promise.all([
        adminApi.getInventoryStats(),
        adminApi.getInventory(page, pageSize, debouncedSearch, statusFilter, categoryFilter),
        adminApi.getAdminCategories().catch(() => ({ data: [] }))
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (invRes.success) {
        setInventory(invRes.data.items);
        setTotal(invRes.data.total);
      }
      if (catRes && catRes.success) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error("Failed to load inventory data:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, statusFilter, categoryFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !adjustQty || isNaN(adjustQty) || Number(adjustQty) <= 0) {
      alert("Please enter a valid positive quantity.");
      return;
    }
    
    let finalQty = Number(adjustQty);
    if (adjustAction === 'DECREASE') {
      finalQty = -finalQty;
      if (selectedProduct.current_stock + finalQty < 0) {
        alert("Insufficient stock. Cannot reduce below 0.");
        return;
      }
      const confirmReduce = window.confirm(`Are you sure you want to reduce stock by ${Math.abs(finalQty)} units?`);
      if (!confirmReduce) return;
    }

    setAdjusting(true);
    try {
      await adminApi.adjustStock(selectedProduct.product_id, {
        quantity: finalQty,
        type: adjustType,
        notes: adjustNotes
      });
      setIsModalOpen(false);
      loadData(); // refresh data
    } catch (err) {
      alert(err.message || "Failed to adjust stock.");
    } finally {
      setAdjusting(false);
    }
  };

  const getStatusDisplay = (current, minimum) => {
    if (current <= 0) return { label: 'OUT OF STOCK', className: 'bg-red-100 text-red-700' };
    if (current <= minimum) return { label: 'LOW STOCK', className: 'bg-yellow-100 text-yellow-700' };
    return { label: 'IN STOCK', className: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage product stock levels and view movements.</p>
        </div>
        <Link 
          to="/admin/inventory/movements"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
        >
          <History className="w-4 h-4" />
          Movement History
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Total Products</h3>
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats?.total_products || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">In Stock</h3>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              <Check className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats?.in_stock || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Low Stock</h3>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats?.low_stock || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Out of Stock</h3>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats?.out_of_stock || 0}</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search product, SKU, or barcode..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
            <select 
              className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">SKU / Barcode</th>
                <th className="p-4 font-medium text-right">Available Stock</th>
                <th className="p-4 font-medium text-right">Min. Stock</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    Loading inventory data...
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No products found in inventory.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const product = item.products || {};
                  const available = item.current_stock - item.reserved_stock;
                  const statusInfo = getStatusDisplay(item.current_stock, item.minimum_stock);
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center overflow-hidden shrink-0">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{product.name || 'Unknown Product'}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Updated: {new Date(item.updated_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-slate-700">{product.sku || 'N/A'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{product.barcode || 'N/A'}</p>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`font-bold text-lg ${available <= 0 ? 'text-red-600' : 'text-slate-900'}`}>
                          {available}
                        </span>
                        {item.reserved_stock > 0 && (
                          <span className="block text-xs text-slate-500 mt-0.5">({item.current_stock} total - {item.reserved_stock} reserved)</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-slate-600">{item.minimum_stock}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => {
                            setSelectedProduct(item);
                            setAdjustAction('INCREASE');
                            setAdjustQty('');
                            setAdjustNotes('');
                            setAdjustType('MANUAL_ADJUSTMENT');
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded hover:bg-slate-50 hover:text-primary transition-colors text-sm font-medium whitespace-nowrap"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-600">
              Showing <span className="font-semibold">{(page - 1) * pageSize + 1}</span> to <span className="font-semibold">{Math.min(page * pageSize, total)}</span> of <span className="font-semibold">{total}</span> entries
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                disabled={page * pageSize >= total}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-900 text-lg">Adjust Stock</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-5">
              <div>
                <p className="text-sm text-slate-500 mb-1">Product</p>
                <p className="font-semibold text-slate-900">{selectedProduct.products?.name}</p>
                <p className="text-xs text-slate-500">Current Available: {selectedProduct.current_stock - selectedProduct.reserved_stock}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustAction('INCREASE')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg font-medium border transition-colors ${
                    adjustAction === 'INCREASE' 
                      ? 'border-green-600 bg-green-50 text-green-700' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Plus className="w-4 h-4" /> Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustAction('DECREASE')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg font-medium border transition-colors ${
                    adjustAction === 'DECREASE' 
                      ? 'border-red-600 bg-red-50 text-red-700' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Minus className="w-4 h-4" /> Reduce Stock
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason / Type</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  required
                >
                  <option value="MANUAL_ADJUSTMENT">Manual Count Adjustment</option>
                  <option value="PURCHASE">Purchase / Received Stock</option>
                  <option value="RETURN">Customer Return</option>
                  <option value="DAMAGE">Damaged Goods</option>
                  <option value="EXPIRY">Expired Items</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter amount to adjust"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                <textarea 
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Reason for adjustment..."
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                ></textarea>
              </div>
              
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={adjusting}
                  className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {adjusting ? 'Saving...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
