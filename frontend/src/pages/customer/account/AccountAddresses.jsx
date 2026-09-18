import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapPin, Plus, Trash2, Edit2 } from 'lucide-react';
import * as api from '../../../services/api';

export default function AccountAddresses() {
  const { triggerToast } = useOutletContext();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', address_line1: '', address_line2: '',
    city: '', state: '', postal_code: '', phone: '', is_default: false
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await api.getAddresses();
      if (res.success) {
        setAddresses(res.data);
      }
    } catch (err) {
      triggerToast("Failed to fetch addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (address = null) => {
    if (address) {
      setEditingId(address.id);
      setFormData({
        title: address.title || '',
        address_line1: address.address_line1 || '',
        address_line2: address.address_line2 || '',
        city: address.city || '',
        state: address.state || '',
        postal_code: address.postal_code || '',
        phone: address.phone || '',
        is_default: address.is_default || false,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '', address_line1: '', address_line2: '',
        city: '', state: '', postal_code: '', phone: '', is_default: false
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        await api.updateAddress(editingId, formData);
        triggerToast("Address updated successfully");
      } else {
        await api.addAddress(formData);
        triggerToast("Address added successfully");
      }
      setShowForm(false);
      fetchAddresses();
    } catch (err) {
      triggerToast(err.message || "Failed to save address");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.deleteAddress(id);
      triggerToast("Address deleted");
      fetchAddresses();
    } catch (err) {
      triggerToast("Failed to delete address");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-slate-900">Saved Addresses</h1>
        </div>
        {!showForm && (
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title (e.g., Home, Work)</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 1</label>
              <input type="text" name="address_line1" value={formData.address_line1} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 2 (Optional)</label>
              <input type="text" name="address_line2" value={formData.address_line2} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
                <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" name="is_default" id="is_default" checked={formData.is_default} onChange={handleChange} className="w-4 h-4 text-primary focus:ring-primary border-slate-300 rounded" />
              <label htmlFor="is_default" className="text-sm text-slate-700">Set as default address</label>
            </div>
            
            <div className="flex gap-4 pt-4 border-t border-slate-200 mt-6">
              <button type="submit" disabled={formLoading} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
                {formLoading ? 'Saving...' : 'Save Address'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-20 px-6 space-y-4 bg-slate-50 rounded-3xl border border-slate-200/60 shadow-sm">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                <MapPin className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="font-heading font-extrabold text-2xl text-slate-800">No addresses saved</h3>
              <p className="text-sm text-slate-500 pb-6 max-w-sm mx-auto">
                Add your home or office addresses so you can check out faster during your next purchase.
              </p>
              <button onClick={() => handleOpenForm()} className="btn-neon inline-flex items-center gap-2 py-3.5 px-8 text-sm font-bold shadow-lg shadow-emerald-500/20 rounded-xl">
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map(addr => (
                <div key={addr.id} className="border border-slate-200 rounded-xl p-5 hover:border-primary/50 transition-colors relative bg-white shadow-sm">
                  {addr.is_default && (
                    <span className="absolute top-4 right-4 bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                      Default
                    </span>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-slate-900">{addr.title}</h3>
                      <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                        {addr.address_line1}<br />
                        {addr.address_line2 && <>{addr.address_line2}<br /></>}
                        {addr.city}, {addr.state} {addr.postal_code}
                      </p>
                      <p className="text-slate-500 text-sm mt-2">📞 {addr.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                    <button onClick={() => handleOpenForm(addr)} className="text-sm font-medium text-slate-600 hover:text-primary flex items-center gap-1">
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => handleDelete(addr.id)} className="text-sm font-medium text-slate-600 hover:text-red-600 flex items-center gap-1">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
