import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, LogOut, ArrowLeft } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function AdminLayout() {
  const [isAdmin, setIsAdmin] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('alphonsa_user');
    if (!userStr) {
      setIsAdmin(false);
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);

  if (isAdmin === null) return <div className="p-8">Loading Admin...</div>;
  if (isAdmin === false) {
    toast.error("Unauthorized. Admin access required.");
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Products', path: '/admin/products', icon: Package },
    // New modules
    { name: 'Categories', path: '/admin/categories', icon: Package },
    { name: 'Brands', path: '/admin/brands', icon: Package },
    { name: 'Inventory', path: '/admin/inventory', icon: Package },
    { name: 'Promotions', path: '/admin/promotions', icon: Package },
    { name: 'Delivery', path: '/admin/delivery', icon: Package },
    { name: 'Refunds', path: '/admin/refunds', icon: Package },
    { name: 'Suppliers', path: '/admin/suppliers', icon: Package },
    { name: 'POS Sync', path: '/admin/pos', icon: Package },
    { name: 'Reports', path: '/admin/reports', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans selection:bg-emerald-500 selection:text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-auto md:h-screen z-20 shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <Link to="/admin" className="flex items-center gap-3 text-emerald-400">
            <span className="text-2xl font-heading font-extrabold tracking-tight">AdminPanel</span>
          </Link>
          <p className="text-slate-400 text-xs mt-1 font-medium">Alphonsa Hypermarket</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold ${
                  isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 shadow-sm border border-emerald-500/20' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-sm font-semibold"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
            Back to Store
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-10 shadow-sm">
          <h1 className="text-xl font-bold font-heading text-slate-800">
            {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">Admin Mode</span>
          </div>
        </header>
        
        <div className="p-6 lg:p-8 flex-1">
          <Outlet />
        </div>
      </main>
      
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
