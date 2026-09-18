import React, { useState, useEffect } from 'react';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, getOffers, createOffer, updateOffer, deleteOffer } from '../../services/adminApi';
import { Tag, Image, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PromotionsManager() {
  const [activeTab, setActiveTab] = useState('coupons'); // 'coupons' | 'offers'
  
  const [coupons, setCoupons] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Coupon Form State
  const [couponForm, setCouponForm] = useState({
    code: '', type: 'PERCENTAGE', discount_value: 0, min_order_amount: 0, 
    max_discount: '', usage_limit: '', start_date: '', end_date: '', is_active: true
  });

  // Offer Form State
  const [offerForm, setOfferForm] = useState({
    title: '', discount_text: '', description: '', code: '', discount_pct: 0, 
    valid_till_text: '', badge: '', is_active: true
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'coupons') {
        const res = await getCoupons();
        setCoupons(res.data || []);
      } else {
        const res = await getOffers();
        setOffers(res.data || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    if (activeTab === 'coupons') {
      if (item) {
        setCouponForm({
          code: item.code, type: item.type, discount_value: item.discount_value, 
          min_order_amount: item.min_order_amount, max_discount: item.max_discount || '',
          usage_limit: item.usage_limit || '', start_date: item.start_date ? item.start_date.split('T')[0] : '', 
          end_date: item.end_date ? item.end_date.split('T')[0] : '', is_active: item.is_active
        });
      } else {
        setCouponForm({
          code: '', type: 'PERCENTAGE', discount_value: 0, min_order_amount: 0, 
          max_discount: '', usage_limit: '', start_date: '', end_date: '', is_active: true
        });
      }
    } else {
      if (item) {
        setOfferForm({
          title: item.title, discount_text: item.discount_text, description: item.description || '', 
          code: item.code, discount_pct: item.discount_pct, valid_till_text: item.valid_till_text || '', 
          badge: item.badge || '', is_active: item.is_active
        });
      } else {
        setOfferForm({
          title: '', discount_text: '', description: '', code: '', discount_pct: 0, 
          valid_till_text: '', badge: '', is_active: true
        });
      }
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'coupons') {
        const payload = { ...couponForm };
        payload.max_discount = payload.max_discount ? Number(payload.max_discount) : null;
        payload.usage_limit = payload.usage_limit ? Number(payload.usage_limit) : null;
        payload.start_date = payload.start_date || null;
        payload.end_date = payload.end_date || null;

        if (editingItem) {
          await updateCoupon(editingItem.id, payload);
          toast.success("Coupon updated");
        } else {
          await createCoupon(payload);
          toast.success("Coupon created");
        }
      } else {
        const payload = { ...offerForm };
        if (editingItem) {
          await updateOffer(editingItem.id, payload);
          toast.success("Offer updated");
        } else {
          await createOffer(payload);
          toast.success("Offer created");
        }
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to save");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      if (activeTab === 'coupons') {
        await deleteCoupon(id);
        toast.success("Coupon deleted");
      } else {
        await deleteOffer(id);
        toast.success("Offer deleted");
      }
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[500px]">
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Promotions Management</h2>
          <p className="text-xs text-slate-500 mt-1">Manage coupons and special offers/banners.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${activeTab === 'coupons' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Tag className="w-4 h-4" /> Coupons
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${activeTab === 'offers' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Image className="w-4 h-4" /> Special Offers (Banners)
          </button>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add {activeTab === 'coupons' ? 'Coupon' : 'Offer'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="p-6 overflow-x-auto">
          {activeTab === 'coupons' ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-500">No coupons found.</td>
                  </tr>
                ) : coupons.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold">{c.code}</td>
                    <td className="px-4 py-3 text-slate-600">{c.type}</td>
                    <td className="px-4 py-3 text-emerald-600 font-bold">
                      {c.type === 'PERCENTAGE' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.current_usage} {c.usage_limit ? `/ ${c.usage_limit}` : ''}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => openModal(c)} className="text-blue-500 hover:text-blue-700"><Edit className="w-4 h-4 inline"/></button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4 inline"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Discount Text</th>
                  <th className="px-4 py-3">Badge</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-500">No offers found.</td>
                  </tr>
                ) : offers.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">{o.title}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{o.code}</td>
                    <td className="px-4 py-3 text-emerald-600 font-bold">{o.discount_text}</td>
                    <td className="px-4 py-3 text-slate-600">{o.badge || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${o.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {o.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => openModal(o)} className="text-blue-500 hover:text-blue-700"><Edit className="w-4 h-4 inline"/></button>
                      <button onClick={() => handleDelete(o.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4 inline"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">
                {editingItem ? 'Edit' : 'Add'} {activeTab === 'coupons' ? 'Coupon' : 'Offer'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <form id="promoForm" onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'coupons' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Code *</label>
                        <input required type="text" value={couponForm.code} onChange={e=>setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} className="w-full p-2 border rounded text-sm uppercase"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Type *</label>
                        <select value={couponForm.type} onChange={e=>setCouponForm({...couponForm, type: e.target.value})} className="w-full p-2 border rounded text-sm">
                          <option value="PERCENTAGE">Percentage</option>
                          <option value="FIXED">Fixed Amount</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Discount Value *</label>
                        <input required type="number" min="0" step="0.01" value={couponForm.discount_value} onChange={e=>setCouponForm({...couponForm, discount_value: parseFloat(e.target.value)})} className="w-full p-2 border rounded text-sm"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Min Order Amount</label>
                        <input type="number" min="0" value={couponForm.min_order_amount} onChange={e=>setCouponForm({...couponForm, min_order_amount: parseFloat(e.target.value)})} className="w-full p-2 border rounded text-sm"/>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                        <input type="date" value={couponForm.start_date} onChange={e=>setCouponForm({...couponForm, start_date: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                        <input type="date" value={couponForm.end_date} onChange={e=>setCouponForm({...couponForm, end_date: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="isActiveC" checked={couponForm.is_active} onChange={e=>setCouponForm({...couponForm, is_active: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded" />
                      <label htmlFor="isActiveC" className="text-sm font-bold text-slate-700">Is Active</label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
                        <input required type="text" value={offerForm.title} onChange={e=>setOfferForm({...offerForm, title: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Code *</label>
                        <input required type="text" value={offerForm.code} onChange={e=>setOfferForm({...offerForm, code: e.target.value.toUpperCase()})} className="w-full p-2 border rounded text-sm uppercase"/>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Discount Text (e.g. 50% OFF) *</label>
                        <input required type="text" value={offerForm.discount_text} onChange={e=>setOfferForm({...offerForm, discount_text: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Discount Percentage *</label>
                        <input required type="number" min="0" max="100" value={offerForm.discount_pct} onChange={e=>setOfferForm({...offerForm, discount_pct: parseInt(e.target.value)})} className="w-full p-2 border rounded text-sm"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                      <textarea value={offerForm.description} onChange={e=>setOfferForm({...offerForm, description: e.target.value})} className="w-full p-2 border rounded text-sm" rows="2"></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Valid Till Text (e.g. Nov 30)</label>
                        <input type="text" value={offerForm.valid_till_text} onChange={e=>setOfferForm({...offerForm, valid_till_text: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Badge (e.g. HOT)</label>
                        <input type="text" value={offerForm.badge} onChange={e=>setOfferForm({...offerForm, badge: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="isActiveO" checked={offerForm.is_active} onChange={e=>setOfferForm({...offerForm, is_active: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded" />
                      <label htmlFor="isActiveO" className="text-sm font-bold text-slate-700">Is Active</label>
                    </div>
                  </>
                )}
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button form="promoForm" type="submit" className="px-4 py-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
