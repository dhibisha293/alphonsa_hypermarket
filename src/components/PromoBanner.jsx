import React from 'react';
import { ArrowRight, Tag } from 'lucide-react';

export default function PromoBanner({ onSelectCategory }) {
  const shopOffers = () => {
    onSelectCategory('all');
    document.getElementById('popular-products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="promo-banner">
      <div className="container-custom promo-banner-inner">
        <div>
          <span className="promo-banner-kicker">THE ALPHONSA SAVINGS EDIT</span>
          <h2>Big savings<br />are here.</h2>
          <p>Everyday essentials, fresh produce and family favorites at prices worth bringing home.</p>
          <button onClick={shopOffers} className="btn-neon mt-5 text-sm py-3 px-6">
            <span>Shop Offers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="promo-banner-art" aria-hidden="true">
          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=85" alt="Fresh produce" />
          <img src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=85" alt="Chocolate cake" />
        </div>
        <div className="promo-banner-badge"><Tag className="w-4 h-4 mb-1" /> UP TO<br />30% OFF</div>
      </div>
    </section>
  );
}
