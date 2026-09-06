import React, { useState } from 'react';
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
import { PRODUCTS, LOCATIONS, CUSTOMIZED_GIFTS } from './data/mockData';

export default function App() {
  // Demo initial cart items
  const [cartItems, setCartItems] = useState([
    { ...PRODUCTS[0], quantity: 1 },
    { ...PRODUCTS[12], quantity: 1 }
  ]);
  const [wishlist, setWishlist] = useState([PRODUCTS[6], CUSTOMIZED_GIFTS[0]]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAboutContactOpen, setIsAboutContactOpen] = useState(false);
  const [aboutContactMode, setAboutContactMode] = useState('about');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
  };

  const handleAddToCart = (product) => {
    const qtyToAdd = product.quantity || 1;
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + qtyToAdd } : item
        );
      } else {
        return [...prev, { ...product, quantity: qtyToAdd }];
      }
    });
    triggerToast(`Added '${product.name}' to Cart!`);
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCartItems(prev => 
        prev.map(item => item.id === productId ? { ...item, quantity: newQty } : item)
      );
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleToggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        triggerToast(`Removed '${product.name}' from Wishlist`);
        return prev.filter(item => item.id !== product.id);
      } else {
        triggerToast(`Saved '${product.name}' to Wishlist!`);
        return [...prev, product];
      }
    });
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
        onOpenAbout={() => {
          setAboutContactMode('about');
          setIsAboutContactOpen(true);
        }}
        onOpenContact={() => {
          setAboutContactMode('contact');
          setIsAboutContactOpen(true);
        }}
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="flex-1">
        {/* Large Hero Banner */}
        <Hero 
          onShopNow={() => {
            const el = document.getElementById('popular-products');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onExploreCategories={() => {
            const el = document.getElementById('popular-products');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
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

        {/* 18 Categories Responsive Grid */}
        <CategorySection
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <PromoBanner onSelectCategory={setSelectedCategory} />

        {/* Featured Category Clusters */}
        <FeaturedCategories
          onSelectCategory={setSelectedCategory}
        />

        {/* Popular Products Section */}
        <ProductGrid
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlist={wishlist}
          onQuickView={setQuickViewProduct}
        />

        {/* Fresh Bakery Special Section */}
        <BakerySection
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlist={wishlist}
          onQuickView={setQuickViewProduct}
          onSelectCategory={setSelectedCategory}
        />

        {/* Customized Gifts Major Showcase */}
        <CustomizedGiftsSection
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlist={wishlist}
          onQuickView={setQuickViewProduct}
        />

        {/* Free Delivery Dedicated Banner (Up to 3 KM) */}
        <FreeDeliveryBanner
          onOpenLocation={() => setIsLocationOpen(true)}
        />

        {/* Special Promotional Offers */}
        <SpecialOffers
          onSelectCategory={setSelectedCategory}
          onTriggerToast={triggerToast}
        />

        {/* New Arrivals Carousel */}
        <NewArrivals
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlist={wishlist}
          onQuickView={setQuickViewProduct}
        />

        {/* Customer Favorites Best Sellers */}
        <BestSellers
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlist={wishlist}
          onQuickView={setQuickViewProduct}
        />

        {/* 5 Feature Cards - Why Choose Alphonsa */}
        <WhyChooseAlphonsa />

        {/* Store Experience Section */}
        <StoreExperience
          onOpenLocation={() => setIsLocationOpen(true)}
        />

        {/* Customer Reviews */}
        <TestimonialSection />
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={setSelectedCategory}
        onOpenAbout={() => {
          setAboutContactMode('about');
          setIsAboutContactOpen(true);
        }}
        onOpenContact={() => {
          setAboutContactMode('contact');
          setIsAboutContactOpen(true);
        }}
      />

      {/* Mobile Bottom Sticky Navigation */}
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
        onClearCart={() => setCartItems([])}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveWishlist={(id) => setWishlist(prev => prev.filter(item => item.id !== id))}
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
        onSelectLocation={(loc) => {
          setSelectedLocation(loc);
          triggerToast(`Selected ${loc.name}`);
        }}
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
      />

      {/* Toast Notification Popup */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

    </div>
  );
}
