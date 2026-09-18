import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Hero from '../../components/Hero';
import CategorySection from '../../components/CategorySection';
import PromoBanner from '../../components/PromoBanner';
import FeaturedCategories from '../../components/FeaturedCategories';
import BakerySection from '../../components/BakerySection';
import CustomizedGiftsSection from '../../components/CustomizedGiftsSection';
import FreeDeliveryBanner from '../../components/FreeDeliveryBanner';
import SpecialOffers from '../../components/SpecialOffers';
import NewArrivals from '../../components/NewArrivals';
import BestSellers from '../../components/BestSellers';
import WhyChooseAlphonsa from '../../components/WhyChooseAlphonsa';
import StoreExperience from '../../components/StoreExperience';
import TestimonialSection from '../../components/TestimonialSection';

export default function HomePage() {
  const {
    handleAddToCart,
    handleToggleWishlist,
    wishlist,
    setQuickViewProduct,
    triggerToast
  } = useOutletContext();

  return (
    <>
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

      <CategorySection />
      <PromoBanner />
      <FeaturedCategories />

      <BakerySection
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        wishlist={wishlist}
        onQuickView={setQuickViewProduct}
      />

      <CustomizedGiftsSection
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        wishlist={wishlist}
        onQuickView={setQuickViewProduct}
      />

      <FreeDeliveryBanner />

      <SpecialOffers onTriggerToast={triggerToast} />

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
      <StoreExperience />
      <TestimonialSection />
    </>
  );
}
