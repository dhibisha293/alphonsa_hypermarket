import React, { useState } from 'react';
import { ShoppingCart, Heart, Search, MapPin, User, Menu, X, ChevronDown, Sparkles, Gift } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import NotificationBell from './NotificationBell';

export default function Navbar({ 
  cartItems, 
  wishlist, 
  onOpenCart, 
  onOpenLocation, 
  onOpenWishlist,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onOpenAuth,
  onOpenAbout,
  onOpenContact,
  currentUser,
  onLogout,
  categories = [],
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/products' },
    { label: 'Categories', isDropdown: true },
    { label: 'Offers', path: '/deals' },
    { label: 'Bakery', path: '/category/bakery-sweets' },
    { label: 'Customized Gifts', path: '/category/customized-gifts' },
    { label: 'About Us', action: () => onOpenAbout() },
    { label: 'Contact', action: () => onOpenContact() }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 h-[72px] sm:h-auto">
      {/* Top Banner Announcement */}
      <div className="announcement-bar bg-primary-dark text-white text-xs py-1.5 px-4 hidden sm:block">
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
          <Link to="/" className="brand-lockup flex items-center gap-2.5 cursor-pointer shrink-0">
            <div className="brand-mark transform hover:scale-105 transition duration-300">
              <img src={logo} alt="Alphonsa Hypermarket logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1 leading-none">
                <span className="font-black text-lg sm:text-xl tracking-tight text-primary-dark font-heading">
                  Alphonsa
                </span>
                <span className="text-slate-900 font-extrabold text-lg sm:text-xl font-heading">
                  Hypermarket
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5 hidden sm:block">
                Kattathurai • "Everything You Need, All in One Place"
              </p>
            </div>
          </Link>

          {/* Center: Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-lg relative mx-4">
            <form onSubmit={onSearchSubmit} className={`main-search w-full flex items-center bg-slate-50 rounded-full border transition-all duration-300 ${
              isSearchFocused ? 'border-primary ring-4 ring-primary/10 bg-white shadow-md' : 'border-slate-200 hover:border-slate-300'
            }`}>
              <Search className="w-4 h-4 text-primary ml-4 shrink-0 stroke-[2.5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search groceries, cakes, cosmetics, gifts, toys..."
                className="w-full py-2.5 px-3 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mr-2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
              <button 
                type="submit"
                className="btn-neon text-xs py-1.5 px-5 mr-1.5 font-bold rounded-full shadow-md shadow-primary/20"
              >
                Search
              </button>
            </form>

            {/* Quick Autocomplete Suggestions */}
            {isSearchFocused && searchQuery.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 p-2 animate-fade-in">
                <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">Suggestions</div>
                {['Atta 5kg', 'Customized Teddy Bear', 'Chocolate Cake', 'Lipstick', 'Remote Car', 'Chicken Puff']
                  .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item, idx) => (
                    <div 
                      key={idx}
                      onMouseDown={() => {
                        setSearchQuery(item);
                        navigate(`/search?q=${encodeURIComponent(item)}`);
                      }}
                      className="px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="w-3 h-3 text-primary" /> {item}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold">In Kattathurai</span>
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
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-emerald-50 transition text-slate-800 text-xs font-bold border border-slate-200"
              title="Location: Kattathurai"
              aria-label="Change location"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <div className="text-left leading-tight hidden sm:block">
                <span className="block text-[9px] text-slate-400 font-normal">Location</span>
                <span className="text-xs font-extrabold text-emerald-800">📍 Kattathurai</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {/* Notification Bell */}
            <NotificationBell user={currentUser} />

            {/* Wishlist */}
            <button 
              onClick={onOpenWishlist}
              className="relative p-2 rounded-full hover:bg-slate-100 transition text-slate-700"
              title="Wishlist"
              aria-label="Open wishlist"
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
              className="flex items-center gap-2 py-1.5 px-4 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition shadow-md group"
              aria-label="Open cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition text-white" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-900">
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
              onClick={currentUser ? () => navigate('/account') : onOpenAuth}
              className="p-2 rounded-full hover:bg-slate-100 transition text-slate-700 border border-slate-200 hidden sm:flex"
              title="Profile Account"
              aria-label="Open user menu"
            >
              <User className="w-4 h-4 text-slate-700" />
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mobile-search lg:hidden mt-2">
          <form onSubmit={onSearchSubmit} className="flex items-center bg-slate-50 rounded-full border border-slate-200 px-3 py-1.5">
            <Search className="w-4 h-4 text-primary mr-2 stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groceries, cakes, cosmetics, gifts..."
              className="w-full text-xs bg-transparent focus:outline-none text-slate-900"
            />
          </form>
        </div>
      </div>

      {/* Navigation Bar Links */}
      <nav className="nav-links-row hidden lg:block bg-white border-t border-slate-200 py-2">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-7">
            
            {/* Category Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-800 font-bold px-4 py-1.5 rounded-full hover:bg-emerald-100 transition text-xs border border-emerald-200"
              >
                <Menu className="w-3.5 h-3.5 text-emerald-700" />
                <span>All Categories</span>
                <ChevronDown className="w-3 h-3 text-emerald-700" />
              </button>

              {showCategoryDropdown && (
                <div 
                  className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-fade-in"
                  onMouseLeave={() => setShowCategoryDropdown(false)}
                >
                  <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex justify-between">
                    <span>Explore Categories</span>
                    <span className="text-primary-dark font-extrabold">Kattathurai</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto py-1">
                    {categories.map(cat => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        onClick={() => setShowCategoryDropdown(false)}
                        className={`w-full px-4 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-emerald-50 hover:text-primary-dark transition text-slate-700`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-base">{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">{cat.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Navigation Links */}
            <ul className="flex items-center gap-6">
              {navLinks.filter(l => !l.isDropdown).map((link, idx) => (
                <li key={idx}>
                  {link.path ? (
                    <Link
                      to={link.path}
                      className="text-xs font-bold text-slate-700 hover:text-primary transition flex items-center gap-1 py-1 relative group"
                    >
                      <span>{link.label}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  ) : (
                    <button
                      onClick={link.action}
                      className="text-xs font-bold text-slate-700 hover:text-primary transition flex items-center gap-1 py-1 relative group"
                    >
                      <span>{link.label}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-600" />
              <span>🎁 Customized Gifts Available</span>
            </span>
          </div>

        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto animate-fade-in">
            <div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-slate-900 font-bold">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-base text-primary-dark">Alphonsa</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400" aria-label="Close mobile menu">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-emerald-50 p-3 rounded-2xl border border-primary/40 mb-4 text-xs font-bold text-primary-dark">
                📍 Location: Kattathurai<br/>
                <span className="font-normal text-[11px] text-slate-600">🚚 Free Delivery up to 3 KM</span>
              </div>

              <div className="space-y-1">
                {navLinks.filter(l => !l.isDropdown).map((link, idx) => (
                  <React.Fragment key={idx}>
                    {link.path ? (
                      <Link
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:text-primary-dark flex justify-between items-center"
                      >
                        <span>{link.label}</span>
                        <span className="text-slate-300">→</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          if (link.action) link.action();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:text-primary-dark flex justify-between items-center"
                      >
                        <span>{link.label}</span>
                        <span className="text-slate-300">→</span>
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6">
              <button 
                onClick={() => {
                  if (currentUser) {
                    navigate('/account');
                  } else {
                    onOpenAuth();
                  }
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
