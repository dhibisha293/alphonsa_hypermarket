import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Package, Search, ChevronRight } from 'lucide-react';
import * as api from '../../../services/api';

export default function AccountOrders() {
  const { triggerToast } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      triggerToast("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['pending', 'confirmed'].includes(order.status);
    if (filter === 'processing') return ['packing', 'dispatched'].includes(order.status);
    if (filter === 'completed') return order.status === 'delivered';
    if (filter === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  const getStatusColor = (status) => {
    if (['delivered'].includes(status)) return 'bg-green-100 text-green-700';
    if (['cancelled'].includes(status)) return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700'; // pending, confirmed, packing, dispatched
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Package className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-slate-900">Order History</h1>
      </div>

      {/* Filters */}
      <div className="flex overflow-x-auto gap-2 pb-2 mb-6 scrollbar-hide">
        {['all', 'pending', 'processing', 'completed', 'cancelled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading your orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 px-6 space-y-4 bg-slate-50 rounded-3xl border border-slate-200/60 shadow-sm">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
            <Package className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-800">
            {filter === 'all' ? "No orders yet" : `No ${filter} orders`}
          </h3>
          <p className="text-sm text-slate-500 pb-6 max-w-sm mx-auto">
            {filter === 'all' 
              ? "Looks like you haven't made your first purchase. Discover our fresh groceries and exclusive offers!"
              : `You currently don't have any orders with a ${filter} status.`}
          </p>
          <Link to="/" className="btn-neon inline-block py-3.5 px-8 text-sm font-bold shadow-lg shadow-emerald-500/20 rounded-xl">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <Link 
              key={order.id} 
              to={`/account/orders/${order.id}`}
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-primary/50 hover:shadow-sm transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900 text-lg">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    {order.refund_status && order.refund_status !== 'NONE' && (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-200">
                        REFUND: {order.refund_status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-slate-500 font-medium">Total Amount</p>
                    <p className="text-xl font-bold text-slate-900">₹{order.total_amount.toFixed(2)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-colors shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
