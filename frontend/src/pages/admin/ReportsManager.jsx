import React, { useState, useEffect } from 'react';
import { getSalesReport, getInventoryReport, getTopProductsReport } from '../../services/adminApi';
import { TrendingUp, Package, AlertTriangle, DollarSign, Loader2, Award } from 'lucide-react';
import { toast } from 'sonner';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#6366f1', '#ec4899', '#14b8a6'];

export default function ReportsManager() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryData, setInventoryData] = useState({
    total_value: 0,
    total_items: 0,
    low_stock_alerts: [],
    category_breakdown: []
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [salesRes, invRes, topRes] = await Promise.all([
        getSalesReport(30),
        getInventoryReport(),
        getTopProductsReport()
      ]);
      setSalesData(salesRes.data || []);
      setTopProducts(topRes.data || []);
      setInventoryData(invRes.data || {
        total_value: 0, total_items: 0, low_stock_alerts: [], category_breakdown: []
      });
    } catch (err) {
      toast.error(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  const totalSales30d = salesData.reduce((sum, item) => sum + item.revenue, 0);

  // Format data for PieChart
  const pieData = inventoryData.category_breakdown.map(cat => ({
    name: cat.category,
    value: cat.value
  }));

  return (
    <div className="space-y-6">
      
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">30d Revenue</h3>
          </div>
          <p className="text-3xl font-black text-slate-800">${totalSales30d.toFixed(2)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">Inventory Value</h3>
          </div>
          <p className="text-3xl font-black text-slate-800">${inventoryData.total_value.toFixed(2)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Package className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">Total Items</h3>
          </div>
          <p className="text-3xl font-black text-slate-800">{inventoryData.total_items}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">Low Stock</h3>
          </div>
          <p className="text-3xl font-black text-slate-800">{inventoryData.low_stock_alerts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales Chart (AreaChart) */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> 30-Day Sales Trend
          </h3>
          <div className="h-80 w-full">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="10%" minWidth="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">No sales data found.</div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" /> Needs Restocking
          </h3>
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
            {inventoryData.low_stock_alerts.length > 0 ? (
              inventoryData.low_stock_alerts.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-xs">{item.stock_quantity} left</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No low stock items! Great job.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Products Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Top Selling Products
          </h3>
          <div className="h-80 w-full">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="10%" minWidth="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={150} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="quantity_sold" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} name="Units Sold" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-400">No product sales yet.</div>
            )}
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-500" /> Inventory Value by Category
          </h3>
          <div className="h-80 w-full">
            {pieData.length > 0 ? (
               <ResponsiveContainer width="10%" minWidth="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={pieData}
                     cx="50%"
                     cy="50%"
                     innerRadius={80}
                     outerRadius={110}
                     paddingAngle={2}
                     dataKey="value"
                   >
                     {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <RechartsTooltip 
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Inventory Value']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   />
                   <Legend verticalAlign="bottom" height={36} iconType="circle" />
                 </PieChart>
               </ResponsiveContainer>
            ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-400">No categories found.</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
