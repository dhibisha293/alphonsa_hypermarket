import React, { useState } from 'react';
import { ShoppingCart, Heart, Search, MapPin, User, Menu, X, ChevronDown, Sparkles, Gift } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import logo from '../assets/logo.png';

export default function Navbar({ 
  cartItems, 
  wishlist, 
  onOpenCart, 
  onOpenLocation, 
  onOpenWishlist,
  onSelectCategory,
  selectedCategory,
  searchQuery,
  setSearchQuery,
  onOpenAuth,
  onOpenAbout,
  onOpenContact
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { label: 'Home', action: () => onSelectCategory('all') },
    { label: 'Shop', action: () => {
        const el = document.getElementById('popular-products');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    { label: 'Categories', isDropdown: true },
    { label: 'Offers', action: () => {
        const el = document.getElementById('special-offers');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } 
    },
    { label: 'Bakery', action: () => {
        const el = document.getElementById('bakery-special');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } 
    },
    { label: 'Customized Gifts', action: () => {
        const el = document.getElementById('customized-gifts-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } 
    },
    { label: 'New Arrivals', action: () => {
        const el = document.getElementById('new-arrivals');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } 
    },
    { label: 'About Us', action: () => onOpenAbout() },
    { label: 'Contact', action: () => onOpenContact() }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm border-b border-[#E5E7E5] h-[72px] sm:h-auto">
      {/* Top Banner Announcement */}
      <div className="announcement-bar bg-[#8E1B1B] text-white text-xs py-1.5 px-4 hidden sm:block">
        <div className="container-custom flex justify-between items-center w-full">
          <div className="announcement-message flex items-center gap-3">
            <span className="announcement-pill">🚚 FREE DELIVERY UP TO 3 KM</span>
            <span className="announcement-gift">🎁 Customized gifts available</span>
          </div>
          <div className="announcement-contact flex items-center gap-4">
            <span>📍 Kattathurai</span>
            <button className="announcement-phone" onClick={onOpenContact}>☎ 8754944296</button>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <div className="main-navbar py-2.5 px-4 bg-white">
        <div className="container-custom flex items-center justify-between gap-4 h-[52px]">
          
          {/* Left: Brand Logo & Icon */}
          <div className="brand-lockup flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => onSelectCategory('all')}>
            <div className="brand-mark transform hover:scale-105 transition duration-300">
              <img src={logo} alt="Alphonsa Hypermarket logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1 leading-none">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#0B3D20]">
                  Alphonsa
                </span>
                <span className="text-[#111111] font-extrabold text-lg sm:text-xl">
                  Hypermarket
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5 hidden sm:block">
                Kattathurai • "Everything You Need, All in One Place"
              </p>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-lg relative mx-4">
            <div className={`main-search w-full flex items-center bg-[#F5F7F5] rounded-full border transition-all duration-300 ${
              isSearchFocused ? 'border-[#39FF14] ring-2 ring-[#39FF14]/20 bg-white shadow-md' : 'border-[#E5E7E5] hover:border-slate-300'
            }`}>
              <Search className="w-4 h-4 text-[#39FF14] ml-4 shrink-0 stroke-[2.5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search groceries, cakes, cosmetics, gifts, toys..."
                className="w-full py-2 px-3 bg-transparent text-xs text-[#111111] placeholder-slate-400 focus:outline-none font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mr-2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
              <button 
                onClick={() => {
                  const el = document.getElementById('popular-products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-neon text-xs py-1.5 px-4 mr-1 font-bold rounded-full text-[#111111]"
              >
                Search
              </button>
            </div>

            {/* Quick Autocomplete Suggestions */}
            {isSearchFocused && searchQuery.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#E5E7E5] overflow-hidden z-50 p-2 animate-fade-in">
                <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">Suggestions</div>
                {['Atta 5kg', 'Customized Teddy Bear', 'Chocolate Cake', 'Lipstick', 'Remote Car', 'Chicken Puff']
                  .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item, idx) => (
                    <div 
                      key={idx}
                      onMouseDown={() => setSearchQuery(item)}
                      className="px-3 py-2 text-xs text-slate-700 hover:bg-[#EFFFF0] hover:text-[#0B3D20] rounded-xl cursor-pointer flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="w-3 h-3 text-[#39FF14]" /> {item}
                      </span>
                      <span className="text-[10px] text-[#0B3D20] font-bold">In Kattathurai</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* Right Actions: Location, Wishlist, Cart, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 📍 Kattathurai Location Badge */}
            <button 
              onClick={onOpenLocation}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-[#EFFFF0] transition text-slate-800 text-xs font-bold border border-[#E5E7E5]"
              title="Location: Kattathurai"
            >
              <MapPin className="w-4 h-4 text-[#0B3D20] fill-[#39FF14]" />
              <div className="text-left leading-tight hidden sm:block">
                <span className="block text-[9px] text-slate-400 font-normal">Location</span>
                <span className="text-xs font-extrabold text-[#0B3D20]">📍 Kattathurai</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {/* Wishlist */}
            <button 
              onClick={onOpenWishlist}
              className="relative p-2 rounded-full hover:bg-slate-100 transition text-slate-700"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart with Green Badge */}
            <button 
              onClick={onOpenCart}
              className="flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-[#8E1B1B] text-white hover:bg-[#C62828] transition shadow-sm group"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition text-[#39FF14]" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#39FF14] text-[#111111] font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#0B3D20]">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline font-bold text-xs">
                Cart
              </span>
            </button>

            {/* Profile */}
            <button 
              onClick={onOpenAuth}
              className="p-2 rounded-full hover:bg-slate-100 transition text-slate-700 border border-[#E5E7E5] hidden sm:flex"
              title="Profile Account"
            >
              <User className="w-4 h-4 text-slate-700" />
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mobile-search lg:hidden mt-2">
          <div className="flex items-center bg-[#F5F7F5] rounded-full border border-[#E5E7E5] px-3 py-1.5">
            <Search className="w-4 h-4 text-[#39FF14] mr-2 stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groceries, cakes, cosmetics, gifts..."
              className="w-full text-xs bg-transparent focus:outline-none text-[#111111]"
            />
          </div>
        </div>
      </div>

      {/* Navigation Bar Links */}
      <nav className="nav-links-row hidden lg:block bg-white border-t border-[#E5E7E5] py-2">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-7">
            
            {/* Category Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center gap-2 bg-[#EFFFF0] text-[#0B3D20] font-bold px-3.5 py-1.5 rounded-full hover:bg-[#39FF14]/20 transition text-xs border border-[#39FF14]/40"
              >
                <Menu className="w-3.5 h-3.5 text-[#0B3D20]" />
                <span>All Categories</span>
                <ChevronDown className="w-3 h-3 text-[#0B3D20]" />
              </button>

              {showCategoryDropdown && (
                <div 
                  className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#E5E7E5] py-3 z-50 animate-fade-in"
                  onMouseLeave={() => setShowCategoryDropdown(false)}
                >
                  <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex justify-between">
                    <span>Explore Categories</span>
                    <span className="text-[#0B3D20] font-extrabold">Kattathurai</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto py-1">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.id);
                          setShowCategoryDropdown(false);
                          const el = document.getElementById('popular-products');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-[#EFFFF0] hover:text-[#0B3D20] transition ${
                          selectedCategory === cat.id ? 'bg-[#EFFFF0] text-[#0B3D20] font-bold border-l-4 border-[#39FF14]' : 'text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-base">{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">{cat.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Navigation Links */}
            <ul className="flex items-center gap-6">
              {navLinks.filter(l => !l.isDropdown).map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={link.action}
                    className="text-xs font-bold text-slate-700 hover:text-[#0B3D20] transition flex items-center gap-1 py-1 relative group"
                  >
                    <span>{link.label}</span>
                    {/* Active neon green underline */}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#39FF14] group-hover:w-full transition-all duration-300"></span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#0B3D20] bg-[#EFFFF0] px-3 py-1 rounded-full border border-[#39FF14]/40 flex items-center gap-1">
              <Gift className="w-3.5 h-3.5 text-[#0B3D20]" />
              <span>🎁 Customized Gifts Available</span>
            </span>
          </div>

        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-sm flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto animate-fade-in">
            <div>
              <div className="flex justify-between items-center border-b border-[#E5E7E5] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#39FF14] flex items-center justify-center text-[#111111] font-bold">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-base text-[#0B3D20]">Alphonsa</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-[#EFFFF0] p-3 rounded-2xl border border-[#39FF14]/40 mb-4 text-xs font-bold text-[#0B3D20]">
                📍 Location: Kattathurai<br/>
                <span className="font-normal text-[11px] text-slate-600">🚚 Free Delivery up to 3 KM</span>
              </div>

              <div className="space-y-1">
                {navLinks.filter(l => !l.isDropdown).map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (link.action) link.action();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-800 hover:bg-[#EFFFF0] hover:text-[#0B3D20] flex justify-between items-center"
                  >
                    <span>{link.label}</span>
                    <span className="text-slate-300">→</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6">
              <button 
                onClick={() => {
                  onOpenAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full btn-neon py-3 text-xs font-bold text-center"
              >
                User Profile / Account
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
