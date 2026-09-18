import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, User } from 'lucide-react';
import * as api from '../../../services/api';

export default function AccountProfile() {
  const { currentUser, triggerToast } = useOutletContext();
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        full_name: currentUser.full_name || '',
        phone: currentUser.phone || '', // Needs to be fetched if not returned in `getMe` initially. Wait, getMe was updated to return phone!
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.updateProfile(formData);
      if (res.success) {
        triggerToast("Profile updated successfully!");
        
        // Also update the local storage and state for seamless UX
        const updatedUser = { ...currentUser, ...formData };
        localStorage.setItem('alphonsa_user', JSON.stringify(updatedUser));
        
        // Ideally we'd call context.setCurrentUser but it's not exposed, 
        // a page reload or relying on the layout's fetch is fine, 
        // or just let it be until they reload. Let's just do a tiny reload for safety, 
        // or wait, since it's SPA, we can just leave it. The layout might not update until refresh.
        // For a perfect UX, we could just reload.
        window.location.reload();
      }
    } catch (err) {
      triggerToast(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-slate-900 mb-2">Account Security</h2>
        <p className="text-sm text-slate-600 mb-4">
          Your email address is managed securely via authentication. To change your login email or password, please contact support.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            value={currentUser?.email || ''}
            disabled
            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
