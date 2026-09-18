import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as adminApi from '../../services/adminApi';

export default function InventoryMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const fetchMovements = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getInventoryMovements(page, pageSize, '', typeFilter);
        if (res.success) {
          setMovements(res.data.items);
          setTotal(res.data.total);
        }
      } catch (err) {
        console.error("Failed to load movements:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovements();
  }, [page, pageSize, typeFilter]);

  const getMovementIcon = (qty) => {
    if (qty > 0) return <ArrowDownRight className="w-4 h-4 text-green-600" />;
    return <ArrowUpRight className="w-4 h-4 text-red-600" />;
  };

  const getMovementStyle = (type, qty) => {
    if (qty > 0) return 'text-green-700 bg-green-50 border-green-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link to="/admin/inventory" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock Movements</h1>
          <p className="text-slate-500 text-sm mt-1">Audit trail of all inventory changes.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <select 
              className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white min-w-[200px]"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Movement Types</option>
              <option value="PURCHASE">Purchase (In)</option>
              <option value="SALE">Sale (Out)</option>
              <option value="ONLINE_ORDER">Online Order (Out)</option>
              <option value="RETURN">Return (In)</option>
              <option value="DAMAGE">Damage (Out)</option>
              <option value="EXPIRY">Expiry (Out)</option>
              <option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium text-right">Quantity</th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Notes / Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    Loading movements...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No movements found.
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const p = m.products || {};
                  const userEmail = m.auth?.users?.email || 'System / Guest';
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(m.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                              <Package className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-slate-900 line-clamp-1">{p.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{p.sku || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded uppercase">
                          {m.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {getMovementIcon(m.quantity)}
                          <span className={`text-sm font-bold px-2 py-0.5 border rounded ${getMovementStyle(m.type, m.quantity)}`}>
                            {m.quantity > 0 ? '+' : ''}{m.quantity}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-600 line-clamp-1">{userEmail}</span>
                      </td>
                      <td className="p-4 text-sm text-slate-600 max-w-[200px] truncate">
                        {m.reference_id && <span className="font-medium">Ref: {m.reference_id}</span>}
                        {m.reference_id && m.notes && <br/>}
                        <span className="text-slate-500 text-xs">{m.notes || '-'}</span>
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
    </div>
  );
}
