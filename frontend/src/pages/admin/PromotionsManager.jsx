import React, { useState, useEffect, useCallback } from 'react';
import {
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
  getOffers, createOffer, updateOffer, deleteOffer
} from '../../services/adminApi';
import { Tag, Image, Plus, Trash2, Edit2, X, ToggleLeft, ToggleRight,
  BarChart2, CalendarClock, Users, TrendingUp, AlertTriangle, Copy } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border
      ${active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

// ── Usage progress bar ────────────────────────────────────────────────────────
function UsageBar({ current, limit }) {
  if (!limit) return <span className="text-xs text-slate-500">{current} uses</span>;
  const pct = Math.min(100, Math.round((current / limit) * 100));
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-400' : pct >= 75 ? 'bg-amber-400' : 'bg-emerald-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 whitespace-nowrap font-medium">{current}/{limit}</span>
    </div>
  );
}

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Modal for create/edit coupon ──────────────────────────────────────────────
function CouponModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    code: item?.code || '',
    type: item?.type || 'PERCENTAGE',
    discount_value: item?.discount_value || '',
    min_order_amount: item?.min_order_amount || 0,
    max_discount: item?.max_discount || '',
    usage_limit: item?.usage_limit || '',
    per_user_limit: item?.per_user_limit || '',
    start_date: item?.start_date ? item.start_date.split('T')[0] : '',
    end_date: item?.end_date ? item.end_date.split('T')[0] : '',
    is_active: item?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        discount_value: parseFloat(form.discount_value),
        min_order_amount: parseFloat(form.min_order_amount) || 0,
        max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        per_user_limit: form.per_user_limit ? parseInt(form.per_user_limit) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      if (item) {
        await updateCoupon(item.id, payload);
        toast.success('Coupon updated');
      } else {
        await createCoupon(payload);
        toast.success('Coupon created');
      }
      onSave();
    } catch (err) {
      toast.error(err.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, props = {}) => (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      <input
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        {...props}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="font-bold text-slate-900 text-lg">{item ? 'Edit Coupon' : 'New Coupon'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {field('Coupon Code *', 'code', { required: true, placeholder: 'SUMMER20', className: 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/20' })}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Type *</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form.type}
                onChange={e => set('type', e.target.value)}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field(`Discount Value * ${form.type === 'PERCENTAGE' ? '(%)' : '(₹)'}`, 'discount_value', { type: 'number', required: true, min: 0, step: '0.01' })}
            {field('Min Order Amount (₹)', 'min_order_amount', { type: 'number', min: 0, step: '0.01', placeholder: '0' })}
          </div>
          {form.type === 'PERCENTAGE' && (
            field('Max Discount Cap (₹)', 'max_discount', { type: 'number', min: 0, step: '0.01', placeholder: 'No cap' })
          )}
          <div className="grid grid-cols-2 gap-3">
            {field('Usage Limit (total)', 'usage_limit', { type: 'number', min: 0, placeholder: 'Unlimited' })}
            {field('Per-User Limit', 'per_user_limit', { type: 'number', min: 0, placeholder: 'Unlimited' })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('Start Date', 'start_date', { type: 'date' })}
            {field('End Date', 'end_date', { type: 'date' })}
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <button type="button" onClick={() => set('is_active', !form.is_active)}>
              {form.is_active
                ? <ToggleRight className="w-7 h-7 text-primary" />
                : <ToggleLeft className="w-7 h-7 text-slate-300" />}
            </button>
            <span className="text-sm font-semibold text-slate-700">Active</span>
          </label>
        </form>
        <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 transition text-sm">Cancel</button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition text-sm"
          >
            {saving ? 'Saving…' : (item ? 'Update' : 'Create')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal for create/edit offer banner ────────────────────────────────────────
function OfferModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    title: item?.title || '',
    discount_text: item?.discount_text || '',
    description: item?.description || '',
    code: item?.code || '',
    discount_pct: item?.discount_pct || 0,
    valid_till_text: item?.valid_till_text || '',
    badge: item?.badge || '',
    is_active: item?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = { ...form, code: form.code.toUpperCase().trim(), discount_pct: parseInt(form.discount_pct) || 0 };
      if (item) {
        await updateOffer(item.id, payload);
        toast.success('Offer updated');
      } else {
        await createOffer(payload);
        toast.success('Offer created');
      }
      onSave();
    } catch (err) {
      toast.error(err.message || 'Failed to save offer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="font-bold text-slate-900 text-lg">{item ? 'Edit Offer Banner' : 'New Offer Banner'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Code *</label>
              <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Discount Label *</label>
              <input value={form.discount_text} onChange={e => set('discount_text', e.target.value)} placeholder="e.g. 50% OFF" required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Discount % (for sorting)</label>
              <input type="number" min={0} max={100} value={form.discount_pct} onChange={e => set('discount_pct', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Valid Till Text</label>
              <input value={form.valid_till_text} onChange={e => set('valid_till_text', e.target.value)} placeholder="e.g. Nov 30" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Badge Label</label>
              <input value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="HOT / NEW / FLASH" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <button type="button" onClick={() => set('is_active', !form.is_active)}>
              {form.is_active ? <ToggleRight className="w-7 h-7 text-primary" /> : <ToggleLeft className="w-7 h-7 text-slate-300" />}
            </button>
            <span className="text-sm font-semibold text-slate-700">Active (visible on homepage)</span>
          </label>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 transition text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition text-sm">
            {saving ? 'Saving…' : (item ? 'Update' : 'Create')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PromotionsManager() {
  const [tab, setTab] = useState('coupons');
  const [coupons, setCoupons] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { type:'coupon'|'offer', item }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'coupons') {
        const res = await getCoupons();
        setCoupons(res.data || []);
      } else {
        const res = await getOffers();
        setOffers(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    try {
      if (tab === 'coupons') { await deleteCoupon(id); toast.success('Coupon deleted'); }
      else { await deleteOffer(id); toast.success('Offer deleted'); }
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleToggle = async (item) => {
    try {
      if (tab === 'coupons') await updateCoupon(item.id, { is_active: !item.is_active });
      else await updateOffer(item.id, { is_active: !item.is_active });
      toast.success(`${item.is_active ? 'Deactivated' : 'Activated'} successfully`);
      load();
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  // ── Coupon summary cards ──────────────────────────────────────────────────
  const activeCoupons = coupons.filter(c => c.is_active).length;
  const totalUses = coupons.reduce((s, c) => s + (c.current_usage || 0), 0);
  const expiringSoon = coupons.filter(c => {
    if (!c.end_date) return false;
    const days = (new Date(c.end_date) - new Date()) / 86400000;
    return days >= 0 && days <= 7;
  }).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Toaster position="bottom-right" richColors />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Promotions</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage coupons and homepage offer banners.</p>
        </div>
        <button
          onClick={() => setModal({ type: tab === 'coupons' ? 'coupon' : 'offer', item: null })}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New {tab === 'coupons' ? 'Coupon' : 'Offer'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[{ id: 'coupons', icon: Tag, label: 'Coupons' }, { id: 'offers', icon: Image, label: 'Offer Banners' }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Coupon stats */}
      {tab === 'coupons' && !loading && coupons.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Coupons', value: coupons.length, icon: Tag, color: 'text-blue-600 bg-blue-50' },
            { label: 'Active', value: activeCoupons, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Total Uses', value: totalUses, icon: Users, color: 'text-purple-600 bg-purple-50' },
            { label: 'Expiring Soon', value: expiringSoon, icon: CalendarClock, color: expiringSoon > 0 ? 'text-amber-600 bg-amber-50' : 'text-slate-600 bg-slate-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">Loading...</div>
        ) : tab === 'coupons' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Code</th>
                  <th className="p-4">Type / Value</th>
                  <th className="p-4">Min Order</th>
                  <th className="p-4">Usage</th>
                  <th className="p-4">Valid Period</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.length === 0 ? (
                  <tr><td colSpan="7" className="py-12 text-center text-slate-400">No coupons yet. Create your first one!</td></tr>
                ) : coupons.map(c => {
                  const isExpired = c.end_date && new Date(c.end_date) < new Date();
                  const expiresIn = c.end_date ? Math.ceil((new Date(c.end_date) - new Date()) / 86400000) : null;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-sm bg-slate-100 px-2 py-0.5 rounded">{c.code}</span>
                          <button
                            onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Copied!'); }}
                            className="text-slate-400 hover:text-slate-600"
                          ><Copy className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-sm font-bold ${c.type === 'PERCENTAGE' ? 'text-purple-700' : 'text-blue-700'}`}>
                          {c.type === 'PERCENTAGE' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                        </span>
                        {c.max_discount && <span className="text-xs text-slate-400 ml-1">(max ₹{c.max_discount})</span>}
                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase">{c.type}</p>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {c.min_order_amount > 0 ? `₹${c.min_order_amount}` : 'No min'}
                      </td>
                      <td className="p-4">
                        <UsageBar current={c.current_usage || 0} limit={c.usage_limit} />
                        {c.per_user_limit && <p className="text-[10px] text-slate-400 mt-1">{c.per_user_limit}x per user</p>}
                      </td>
                      <td className="p-4">
                        <p className="text-xs text-slate-600">{formatDate(c.start_date)}</p>
                        <p className="text-xs text-slate-400">→ {c.end_date ? formatDate(c.end_date) : 'No expiry'}</p>
                        {expiresIn !== null && !isExpired && expiresIn <= 7 && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold mt-0.5">
                            <AlertTriangle className="w-3 h-3" /> {expiresIn}d left
                          </span>
                        )}
                        {isExpired && <span className="text-[10px] text-red-500 font-bold">Expired</span>}
                      </td>
                      <td className="p-4"><StatusBadge active={c.is_active} /></td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleToggle(c)} title={c.is_active ? 'Deactivate' : 'Activate'}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition">
                            {c.is_active ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setModal({ type: 'coupon', item: c })}
                            className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(c.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          // Offer Banners table
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Title</th>
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount Label</th>
                  <th className="p-4">Badge</th>
                  <th className="p-4">Valid Till</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offers.length === 0 ? (
                  <tr><td colSpan="7" className="py-12 text-center text-slate-400">No offer banners yet.</td></tr>
                ) : offers.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-bold text-slate-900 text-sm">{o.title}</td>
                    <td className="p-4">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded font-bold">{o.code}</span>
                    </td>
                    <td className="p-4 text-sm font-bold text-emerald-600">{o.discount_text}</td>
                    <td className="p-4">
                      {o.badge
                        ? <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{o.badge}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="p-4 text-sm text-slate-500">{o.valid_till_text || '—'}</td>
                    <td className="p-4"><StatusBadge active={o.is_active} /></td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleToggle(o)} title="Toggle"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition">
                          {o.is_active ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setModal({ type: 'offer', item: o })}
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(o.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition">
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
      </div>

      {/* Modals */}
      {modal?.type === 'coupon' && (
        <CouponModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
      {modal?.type === 'offer' && (
        <OfferModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
