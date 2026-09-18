import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Package, Heart, MapPin, ArrowRight } from 'lucide-react';
import * as api from '../../../services/api';

export default function AccountDashboard() {
  const { currentUser, wishlist } = useOutletContext();
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.getOrders();
        if (res.success && res.data) {
          const orders = res.data;
          setStats({
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => ['pending', 'confirmed', 'packing'].includes(o.status)).length
          });
          // Show only top 3 recent orders
          setRecentOrders(orders.slice(0, 3));
        }
      } catch (err) {
        // Silent error
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '-' : stats.totalOrders}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pending Orders</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '-' : stats.pendingOrders}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Saved Items</p>
            <p className="text-2xl font-bold text-slate-900">{wishlist.length}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
          <Link to="/account/orders" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading orders...</div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
            You haven't placed any orders yet.
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map(order => (
              <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 rounded-xl p-5 gap-4">
                <div>
                  <p className="font-bold text-slate-900">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                    ${['delivered'].includes(order.status) ? 'bg-green-100 text-green-700' : ''}
                    ${['cancelled'].includes(order.status) ? 'bg-red-100 text-red-700' : ''}
                    ${['pending', 'confirmed', 'packing', 'dispatched'].includes(order.status) ? 'bg-blue-100 text-blue-700' : ''}
                  `}>
                    {order.status}
                  </span>
                  <p className="font-bold text-slate-900">₹{order.total_amount.toFixed(2)}</p>
                  <Link 
                    to={`/account/orders/${order.id}`}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
