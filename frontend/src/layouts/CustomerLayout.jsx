import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import WishlistDrawer from '../components/WishlistDrawer';
import ProductQuickView from '../components/ProductQuickView';
import LocationModal from '../components/LocationModal';
import MobileNavigation from '../components/MobileNavigation';
import AboutContactModal from '../components/AboutContactModal';
import AuthModal from '../components/AuthModal';
import { Toaster, toast } from 'sonner';
import { LOCATIONS } from '../data/mockData';
import * as api from '../services/api';

export default function CustomerLayout() {
  const navigate = useNavigate();

  // ─── Auth state ────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null); // { user_id, email, full_name }

  // ─── Categories (for Navbar dropdown) ───────────────────────────────────
  const [navCategories, setNavCategories] = useState([]);

  // ─── Cart & Wishlist ───────────────────────────────────────────────────────
  const [cartItems, setCartItems]   = useState([]);
  const [wishlist,  setWishlist]    = useState([]);

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [searchQuery,         setSearchQuery]         = useState('');
  const [selectedLocation,    setSelectedLocation]    = useState(LOCATIONS[0]);
  const [isCartOpen,          setIsCartOpen]          = useState(false);
  const [isWishlistOpen,      setIsWishlistOpen]      = useState(false);
  const [isLocationOpen,      setIsLocationOpen]      = useState(false);
  const [isAuthOpen,          setIsAuthOpen]          = useState(false);
  const [isAboutContactOpen,  setIsAboutContactOpen]  = useState(false);
  const [aboutContactMode,    setAboutContactMode]    = useState('about');
  const [quickViewProduct,    setQuickViewProduct]    = useState(null);

  const triggerToast = (msg) => toast.success(msg);

  // ─── Load persisted auth + cart/wishlist on mount ─────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('alphonsa_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);
      } catch (_) {}
    }
    // Load categories for Navbar
    api.getCategories().then(res => { if (res.success) setNavCategories(res.data || []); }).catch(() => {});
  }, []);

  // When user logs in/out, refresh cart and wishlist from backend
  useEffect(() => {
    if (currentUser) {
      loadCartFromBackend();
      loadWishlistFromBackend();
    } else {
      // Clear cart/wishlist for guests
      setCartItems([]);
      setWishlist([]);
    }
  }, [currentUser]);

  const loadCartFromBackend = async () => {
    try {
      const res = await api.getCart();
      if (res.success) {
        const items = (res.data || []).map(item => ({
          ...item,
          id: item.product_id, // keep id = product_id for compatibility
        }));
        setCartItems(items);
      }
    } catch (_) {}
  };

  const loadWishlistFromBackend = async () => {
    try {
      const res = await api.getWishlist();
      if (res.success) {
        const items = (res.data || []).map(item => ({
          ...item,
          id: item.product_id,
        }));
        setWishlist(items);
      }
    } catch (_) {}
  };

  // ─── Auth handlers ────────────────────────────────────────────────────────
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('alphonsa_user', JSON.stringify(user));
    triggerToast(`Welcome back, ${user.full_name || user.email}!`);
  };

  const handleOrderPlaced = async () => {
    await loadCartFromBackend();
    if (currentUser) {
      try {
        const res = await api.getMe();
        if (res.success && res.data) {
          setCurrentUser(res.data);
          localStorage.setItem('alphonsa_user', JSON.stringify(res.data));
        }
      } catch (_) {}
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    localStorage.removeItem('alphonsa_user');
    triggerToast('Logged out successfully');
  };

  // ─── Cart handlers ────────────────────────────────────────────────────────
  const handleAddToCart = async (product) => {
    const qtyToAdd = product.quantity || 1;

    if (currentUser) {
      try {
        await api.addToCart(product.id, qtyToAdd);
        await loadCartFromBackend();
      } catch (err) {
        triggerToast('Failed to add to cart');
        return;
      }
    } else {
      setCartItems(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + qtyToAdd } : item
          );
        }
        return [...prev, { ...product, quantity: qtyToAdd }];
      });
    }
    triggerToast(`Added '${product.name}' to Cart!`);
  };

  const handleUpdateQuantity = async (productId, newQty) => {
    if (newQty <= 0) { handleRemoveFromCart(productId); return; }

    if (currentUser) {
      const item = cartItems.find(i => i.id === productId || i.product_id === productId);
      if (item) {
        try {
          await api.updateCartItem(item.id, newQty);
          await loadCartFromBackend();
        } catch (_) {}
      }
    } else {
      setCartItems(prev =>
        prev.map(item => item.id === productId ? { ...item, quantity: newQty } : item)
      );
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (currentUser) {
      const item = cartItems.find(i => i.id === productId || i.product_id === productId);
      if (item) {
        try {
          await api.removeCartItem(item.id);
          await loadCartFromBackend();
        } catch (_) {}
      }
    } else {
      setCartItems(prev => prev.filter(item => item.id !== productId));
    }
  };

  const handleClearCart = async () => {
    if (currentUser) {
      try { await api.clearCart(); } catch (_) {}
    }
    setCartItems([]);
  };

  // ─── Wishlist handlers ────────────────────────────────────────────────────
  const handleToggleWishlist = async (product) => {
    const exists = wishlist.some(item => item.id === product.id || item.product_id === product.id);

    if (currentUser) {
      try {
        if (exists) {
          await api.removeFromWishlist(product.id);
          triggerToast(`Removed '${product.name}' from Wishlist`);
        } else {
          await api.addToWishlist(product.id);
          triggerToast(`Saved '${product.name}' to Wishlist!`);
        }
        await loadWishlistFromBackend();
      } catch (_) {
        triggerToast('Failed to update wishlist');
      }
    } else {
      setWishlist(prev => {
        if (exists) {
          triggerToast(`Removed '${product.name}' from Wishlist`);
          return prev.filter(item => item.id !== product.id);
        }
        triggerToast(`Saved '${product.name}' to Wishlist!`);
        return [...prev, product];
      });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Context value to be provided to all child routes
  const outletContext = {
    currentUser,
    cartItems,
    wishlist,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveFromCart,
    handleClearCart,
    handleToggleWishlist,
    setQuickViewProduct,
    triggerToast,
    setIsCartOpen,
    setIsAuthOpen
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-primary selection:text-slate-900">
      
      {/* Sticky Navbar */}
      <Navbar
        cartItems={cartItems}
        wishlist={wishlist}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenLocation={() => setIsLocationOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAbout={() => { setAboutContactMode('about'); setIsAboutContactOpen(true); }}
        onOpenContact={() => { setAboutContactMode('contact'); setIsAboutContactOpen(true); }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        currentUser={currentUser}
        onLogout={handleLogout}
        categories={navCategories}
      />

      <main className="flex-1">
        {/* Child routes render here */}
        <Outlet context={outletContext} />
      </main>

      <Footer
        onOpenAbout={() => { setAboutContactMode('about'); setIsAboutContactOpen(true); }}
        onOpenContact={() => { setAboutContactMode('contact'); setIsAboutContactOpen(true); }}
      />

      <MobileNavigation
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
      />

      {/* Drawers & Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        currentUser={currentUser}
        onOrderPlaced={handleOrderPlaced}
        triggerToast={triggerToast}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveWishlist={(id) => handleToggleWishlist({ id, name: '' })}
        onAddToCart={handleAddToCart}
      />

      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? wishlist.some(item => item.id === quickViewProduct.id) : false}
      />

      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        selectedLocation={selectedLocation}
        onSelectLocation={(loc) => { setSelectedLocation(loc); triggerToast(`Selected ${loc.name}`); }}
      />

      <AboutContactModal
        isOpen={isAboutContactOpen}
        onClose={() => setIsAboutContactOpen(false)}
        mode={aboutContactMode}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onTriggerToast={triggerToast}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
