import React, { useEffect } from 'react';
import { Outlet, NavLink, useOutletContext, useNavigate } from 'react-router-dom';
import { User, MapPin, Package, Heart, LogOut, LayoutDashboard, Bell } from 'lucide-react';
import * as api from '../../../services/api';

export default function AccountLayout() {
  const context = useOutletContext();
  const { currentUser, setIsAuthOpen } = context || {};
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if explicitly null (not loading)
    if (currentUser === null) {
      navigate('/');
      if (setIsAuthOpen) setIsAuthOpen(true);
    }
  }, [currentUser, navigate, setIsAuthOpen]);

  if (!currentUser) return null;

  const navItems = [
    { name: 'Dashboard', path: '/account', icon: LayoutDashboard, exact: true },
    { name: 'Orders', path: '/account/orders', icon: Package },
    { name: 'Addresses', path: '/account/addresses', icon: MapPin },
    { name: 'Wishlist', path: '/account/wishlist', icon: Heart },
    { name: 'Notifications', path: '/account/notifications', icon: Bell },
    { name: 'Profile', path: '/account/profile', icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 truncate">
                {currentUser.full_name || currentUser.email}
              </h2>
              <p className="text-sm text-slate-500 truncate mt-1">{currentUser.email}</p>
            </div>
            
            <nav className="p-2 flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
              
              <div className="my-2 border-t border-slate-200" />
              
              <button
                onClick={async () => {
                   await api.logout();
                   localStorage.removeItem('alphonsa_user');
                   window.location.href = '/';
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                Log Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[500px]">
            <Outlet context={context} />
          </div>
        </main>

      </div>
    </div>
  );
}
