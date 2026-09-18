import React, { useState, useEffect } from 'react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder } from '../../services/adminApi';
import { getProducts } from '../../services/api';
import { Users, FileText, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SuppliersManager() {
  const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' | 'pos'
  const [loading, setLoading] = useState(true);
  
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Modals
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierForm, setSupplierForm] = useState({ name: '', contact_person: '', phone: '', email: '', address: '', tax_id: '', is_active: true });

  const [showPOModal, setShowPOModal] = useState(false);
  const [poForm, setPoForm] = useState({ supplier_id: '', expected_date: '', notes: '', items: [] });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'suppliers') {
        const res = await getSuppliers();
        setSuppliers(res.data || []);
      } else {
        const [poRes, supRes, prodRes] = await Promise.all([
          getPurchaseOrders(),
          getSuppliers(),
          getProducts(1, 1000) // fetch all for dropdown
        ]);
        setPurchaseOrders(poRes.data || []);
        setSuppliers(supRes.data || []);
        setProducts(prodRes.data?.items || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Supplier handlers
  const openSupplierModal = (sup = null) => {
    setEditingSupplier(sup);
    if (sup) {
      setSupplierForm({ ...sup });
    } else {
      setSupplierForm({ name: '', contact_person: '', phone: '', email: '', address: '', tax_id: '', is_active: true });
    }
    setShowSupplierModal(true);
  };

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, supplierForm);
        toast.success("Supplier updated");
      } else {
        await createSupplier(supplierForm);
        toast.success("Supplier created");
      }
      setShowSupplierModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to save supplier");
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    try {
      await deleteSupplier(id);
      toast.success("Supplier deleted");
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to delete supplier");
    }
  };

  // PO handlers
  const openPOModal = () => {
    setPoForm({ supplier_id: '', expected_date: '', notes: '', items: [] });
    setShowPOModal(true);
  };

  const addPOItem = () => {
    setPoForm(prev => ({ ...prev, items: [...prev.items, { product_id: '', quantity: 1, unit_cost: 0 }] }));
  };

  const updatePOItem = (index, field, value) => {
    const newItems = [...poForm.items];
    newItems[index][field] = field === 'product_id' ? value : Number(value);
    setPoForm({ ...poForm, items: newItems });
  };

  const removePOItem = (index) => {
    const newItems = poForm.items.filter((_, i) => i !== index);
    setPoForm({ ...poForm, items: newItems });
  };

  const handlePOSubmit = async (e) => {
    e.preventDefault();
    if (poForm.items.length === 0) return toast.error("Add at least one item");
    try {
      await createPurchaseOrder(poForm);
      toast.success("Purchase order created");
      setShowPOModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to create PO");
    }
  };

  const updatePOStatus = async (id, status) => {
    try {
      await updatePurchaseOrder(id, { status });
      toast.success("Status updated");
      setPurchaseOrders(prev => prev.map(po => po.id === id ? { ...po, status } : po));
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[500px]">
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Suppliers & Purchases</h2>
          <p className="text-xs text-slate-500 mt-1">Manage vendor database and purchase orders.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${activeTab === 'suppliers' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Users className="w-4 h-4" /> Suppliers
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${activeTab === 'pos' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FileText className="w-4 h-4" /> Purchase Orders
          </button>
        </div>
        <button
          onClick={() => activeTab === 'suppliers' ? openSupplierModal() : openPOModal()}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add {activeTab === 'suppliers' ? 'Supplier' : 'PO'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="p-6 overflow-x-auto">
          {activeTab === 'suppliers' ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact Person</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-500">No suppliers found.</td>
                  </tr>
                ) : suppliers.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold">{s.name}</td>
                    <td className="px-4 py-3 text-slate-600">{s.contact_person || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.phone || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.email || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => openSupplierModal(s)} className="text-blue-500 hover:text-blue-700"><Edit className="w-4 h-4 inline"/></button>
                      <button onClick={() => handleDeleteSupplier(s.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4 inline"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">PO Number</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Expected Date</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-500">No purchase orders found.</td>
                  </tr>
                ) : purchaseOrders.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold font-mono text-slate-800">{po.po_number}</td>
                    <td className="px-4 py-3 text-slate-600 font-semibold">{po.suppliers?.name}</td>
                    <td className="px-4 py-3 text-slate-600">{po.expected_date || '-'}</td>
                    <td className="px-4 py-3 text-emerald-600 font-bold">₹{po.total_amount}</td>
                    <td className="px-4 py-3">
                      <select 
                        className={`text-xs font-bold rounded-lg px-2 py-1.5 border-0 ring-1 ring-inset cursor-pointer focus:ring-2 focus:ring-emerald-500`}
                        value={po.status}
                        onChange={(e) => updatePOStatus(po.id, e.target.value)}
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="SENT">Sent</option>
                        <option value="RECEIVED">Received</option>
                        <option value="PARTIAL">Partial</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">{editingSupplier ? 'Edit' : 'Add'} Supplier</h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <form id="supplierForm" onSubmit={handleSupplierSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
                  <input required type="text" value={supplierForm.name} onChange={e=>setSupplierForm({...supplierForm, name: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
                    <input type="text" value={supplierForm.contact_person} onChange={e=>setSupplierForm({...supplierForm, contact_person: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                    <input type="text" value={supplierForm.phone} onChange={e=>setSupplierForm({...supplierForm, phone: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input type="email" value={supplierForm.email} onChange={e=>setSupplierForm({...supplierForm, email: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tax ID</label>
                    <input type="text" value={supplierForm.tax_id} onChange={e=>setSupplierForm({...supplierForm, tax_id: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                  <textarea value={supplierForm.address} onChange={e=>setSupplierForm({...supplierForm, address: e.target.value})} className="w-full p-2 border rounded text-sm" rows="2"></textarea>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" checked={supplierForm.is_active} onChange={e=>setSupplierForm({...supplierForm, is_active: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded" />
                  <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Is Active</label>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setShowSupplierModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button form="supplierForm" type="submit" className="px-4 py-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* PO Modal */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Create Purchase Order</h3>
              <button onClick={() => setShowPOModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <form id="poForm" onSubmit={handlePOSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Supplier *</label>
                    <select required value={poForm.supplier_id} onChange={e=>setPoForm({...poForm, supplier_id: e.target.value})} className="w-full p-2 border rounded text-sm">
                      <option value="">Select Supplier</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Expected Date</label>
                    <input type="date" value={poForm.expected_date} onChange={e=>setPoForm({...poForm, expected_date: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                  <textarea value={poForm.notes} onChange={e=>setPoForm({...poForm, notes: e.target.value})} className="w-full p-2 border rounded text-sm" rows="1"></textarea>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-slate-700">Order Items *</label>
                    <button type="button" onClick={addPOItem} className="text-xs text-emerald-600 font-bold hover:underline">+ Add Item</button>
                  </div>
                  {poForm.items.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2 items-center">
                      <select required value={item.product_id} onChange={e=>updatePOItem(index, 'product_id', e.target.value)} className="flex-1 p-2 border rounded text-sm">
                        <option value="">Select Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                      <input required type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e=>updatePOItem(index, 'quantity', e.target.value)} className="w-24 p-2 border rounded text-sm"/>
                      <input required type="number" min="0" step="0.01" placeholder="Unit Cost" value={item.unit_cost} onChange={e=>updatePOItem(index, 'unit_cost', e.target.value)} className="w-24 p-2 border rounded text-sm"/>
                      <button type="button" onClick={()=>removePOItem(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  ))}
                  {poForm.items.length === 0 && <div className="text-xs text-slate-500 italic p-4 text-center bg-slate-50 rounded">No items added. Click + Add Item</div>}
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setShowPOModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button form="poForm" type="submit" className="px-4 py-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">Create PO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
