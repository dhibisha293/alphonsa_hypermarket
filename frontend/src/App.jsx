import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategorySection from './components/CategorySection';
import PromoBanner from './components/PromoBanner';
import FeaturedCategories from './components/FeaturedCategories';
import ProductGrid from './components/ProductGrid';
import BakerySection from './components/BakerySection';
import CustomizedGiftsSection from './components/CustomizedGiftsSection';
import FreeDeliveryBanner from './components/FreeDeliveryBanner';
import SpecialOffers from './components/SpecialOffers';
import NewArrivals from './components/NewArrivals';
import BestSellers from './components/BestSellers';
import WhyChooseAlphonsa from './components/WhyChooseAlphonsa';
import StoreExperience from './components/StoreExperience';
import TestimonialSection from './components/TestimonialSection';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import ProductQuickView from './components/ProductQuickView';
import LocationModal from './components/LocationModal';
import MobileNavigation from './components/MobileNavigation';
import Toast from './components/Toast';
import AboutContactModal from './components/AboutContactModal';
import AuthModal from './components/AuthModal';
import { LOCATIONS } from './data/mockData';

// API service — all backend calls go through here
import * as api from './services/api';

export default function App() {
  // ─── Auth state ────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null); // { user_id, email, full_name }

  // ─── Categories (for Navbar dropdown) ───────────────────────────────────
  const [navCategories, setNavCategories] = useState([]);

  // ─── Cart & Wishlist ───────────────────────────────────────────────────────
  // Shape of each item matches what ProductCard/CartDrawer expect:
  // { id, product_id, name, price, image, unit, category, categoryLabel, quantity }
  const [cartItems, setCartItems]   = useState([]);
  const [wishlist,  setWishlist]    = useState([]);

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [selectedCategory,    setSelectedCategory]    = useState('all');
  const [searchQuery,         setSearchQuery]         = useState('');
  const [selectedLocation,    setSelectedLocation]    = useState(LOCATIONS[0]);
  const [isCartOpen,          setIsCartOpen]          = useState(false);
  const [isWishlistOpen,      setIsWishlistOpen]      = useState(false);
  const [isLocationOpen,      setIsLocationOpen]      = useState(false);
  const [isAuthOpen,          setIsAuthOpen]          = useState(false);
  const [isAboutContactOpen,  setIsAboutContactOpen]  = useState(false);
  const [aboutContactMode,    setAboutContactMode]    = useState('about');
  const [quickViewProduct,    setQuickViewProduct]    = useState(null);
  const [toastMessage,        setToastMessage]        = useState(null);

  const triggerToast = (msg) => setToastMessage(msg);

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
        // Normalize: backend returns product_id; UI also needs id for keying
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
      // Logged-in: sync to backend
      try {
        await api.addToCart(product.id, qtyToAdd);
        await loadCartFromBackend();
      } catch (err) {
        triggerToast('Failed to add to cart');
        return;
      }
    } else {
      // Guest: local state only
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
      // Guest: local state only
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

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F5F7F5] text-[#111111] flex flex-col justify-between font-sans selection:bg-[#39FF14] selection:text-[#111111]">

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
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        onLogout={handleLogout}
        categories={navCategories}
      />

      <main className="flex-1">
        <Hero
          onShopNow={() => { const el = document.getElementById('popular-products'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
          onExploreCategories={() => { const el = document.getElementById('popular-products'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
        />

        <section className="market-ribbon" aria-label="Alphonsa store highlights">
          <div className="container-custom market-ribbon-inner">
            <span className="market-ribbon-kicker">A LOCAL STORE WITH A BIG HEART</span>
            <div className="market-ribbon-items">
              <div><strong>22+</strong><span>departments</span></div>
              <div><strong>3 KM</strong><span>free delivery</span></div>
              <div><strong>7 DAYS</strong><span>fresh bakery</span></div>
              <div><strong>1 STOP</strong><span>happy shopping</span></div>
            </div>
          </div>
        </section>

        <CategorySection selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        <PromoBanner onSelectCategory={setSelectedCategory} />
        <FeaturedCategories onSelectCategory={setSelectedCategory} />

        <ProductGrid
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlist={wishlist}
          onQuickView={setQuickViewProduct}
        />

        <BakerySection
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlist={wishlist}
          onQuickView={setQuickViewProduct}
          onSelectCategory={setSelectedCategory}
        />

        <CustomizedGiftsSection
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlist={wishlist}
          onQuickView={setQuickViewProduct}
        />

        <FreeDeliveryBanner onOpenLocation={() => setIsLocationOpen(true)} />

        <SpecialOffers onSelectCategory={setSelectedCategory} onTriggerToast={triggerToast} />

        <NewArrivals
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlist={wishlist}
          onQuickView={setQuickViewProduct}
        />

        <BestSellers
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlist={wishlist}
          onQuickView={setQuickViewProduct}
        />

        <WhyChooseAlphonsa />
        <StoreExperience onOpenLocation={() => setIsLocationOpen(true)} />
        <TestimonialSection />
      </main>

      <Footer
        onSelectCategory={setSelectedCategory}
        onOpenAbout={() => { setAboutContactMode('about'); setIsAboutContactOpen(true); }}
        onOpenContact={() => { setAboutContactMode('contact'); setIsAboutContactOpen(true); }}
      />

      <MobileNavigation
        onSelectCategory={setSelectedCategory}
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
        onOrderPlaced={loadCartFromBackend}
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

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
