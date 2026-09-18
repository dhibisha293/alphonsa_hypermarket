import React, { useEffect, useState } from 'react';
import { getStats, getSalesReport } from '../../services/adminApi';
import { ShoppingBag, DollarSign, Package, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getStats(),
      getSalesReport(7)
    ])
      .then(([statsRes, salesRes]) => {
        setStats(statsRes.data);
        setSalesData(salesRes.data || []);
      })
      .catch(err => {
        toast.error(err.message || 'Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Revenue', value: `₹${(stats?.total_revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Total Orders', value: stats?.total_orders || 0, icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Total Products', value: stats?.total_products || 0, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Total Customers', value: stats?.total_customers || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`p-6 rounded-2xl border ${card.border} bg-white shadow-sm flex items-center gap-4`}>
              <div className={`p-4 rounded-xl ${card.bg} ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{card.label}</p>
                <h3 className="text-2xl font-bold font-heading text-slate-800 mt-1">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold font-heading text-slate-800">Revenue Overview (7 Days)</h3>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDashboard" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDashboard)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <p>No recent sales data</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity / Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold font-heading text-slate-800 mb-4">Quick Actions</h3>
          <div className="flex-1 space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium text-sm">
              <span className="flex items-center gap-2"><Package className="w-4 h-4" /> Add New Product</span>
              <span>&rarr;</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium text-sm">
              <span className="flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> View Pending Orders</span>
              <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs">{(stats?.total_orders || 0) > 0 ? 'New' : '0'}</span>
            </button>
          </div>

          <h3 className="text-lg font-bold font-heading text-slate-800 mt-6 mb-4">System Status</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500">POS Sync</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-500">Database</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Connected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
