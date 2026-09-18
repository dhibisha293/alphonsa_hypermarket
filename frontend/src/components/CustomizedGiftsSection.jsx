import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Gift, Sparkles, Heart, ArrowRight } from 'lucide-react';
import * as api from '../services/api';

export default function CustomizedGiftsSection({ 
  onAddToCart, 
  onToggleWishlist, 
  wishlist, 
  onQuickView 
}) {
  const [gifts, setGifts] = useState([]);

  useEffect(() => {
    api.getProducts({ category: 'customized-gifts', limit: 12 })
      .then(res => { if (res.success) setGifts(res.data.products || []); })
      .catch(() => {});
  }, []);
  return (
    <section id="customized-gifts-section" className="py-14 bg-slate-50">
      <div className="container-custom">
        
        {/* Rounded Banner Container with Soft Green Gradient */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border border-slate-200 rounded-3xl p-6 sm:p-10 mb-10 shadow-sm relative overflow-hidden">
          
          {/* Floating Decorative Gifts */}
          <div className="absolute top-4 right-8 text-3xl animate-float opacity-30 pointer-events-none">🎁</div>
          <div className="absolute bottom-6 right-36 text-2xl animate-float opacity-20 pointer-events-none" style={{ animationDelay: '1.5s' }}>✨</div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Split Screen Left: Text & Badges */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <span className="badge-light-green inline-flex items-center gap-1.5 text-xs">
                <Gift className="w-4 h-4 text-primary-dark" />
                <span>🎁 CUSTOMIZED GIFTS AVAILABLE</span>
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary-dark font-heading leading-tight">
                Make Every Gift Special 🎁
              </h2>

              <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-xl">
                Looking for a special gift? We offer customized gifts for birthdays, anniversaries, celebrations and special occasions — right here at Alphonsa Hypermarket, Kattathurai.
              </p>

              <div className="flex flex-wrap gap-2 pt-1 justify-center lg:justify-start text-xs font-bold text-primary-dark">
                <span className="bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">✨ Custom Name Embroidery</span>
                <span className="bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">📸 High Res Photo Mugs</span>
                <span className="bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">🎀 Celebration Hampers</span>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => {
                    const el = document.getElementById('gift-products-grid');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-neon text-sm py-3 px-7 font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/30 mx-auto lg:mx-0"
                >
                  <Gift className="w-4 h-4" />
                  <span>Explore Customized Gifts</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split Screen Right: Gift Showcase Image */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 shadow-lg group">
                <img 
                  src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=600&q=80" 
                  alt="Customized Gifts Alphonsa Hypermarket" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 p-3 bg-white/95 rounded-xl border border-slate-200 flex justify-between items-center text-xs font-bold text-primary-dark">
                  <span>Personalized Birthday & Anniversary Gifts</span>
                  <span className="bg-primary text-slate-900 text-[10px] px-2 py-0.5 rounded-full">Kattathurai</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Customized Gift Products Grid */}
        <div id="gift-products-grid" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-primary-dark font-heading">
              Popular Customized Gifts
            </h3>
            <span className="text-xs font-bold text-slate-500">Handcrafted with Love</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {(gifts.length > 0 ? gifts : [...Array(6)]).map((product, i) =>
              gifts.length > 0 ? (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlist.some(item => item.id === product.id)}
                  onQuickView={onQuickView}
                />
              ) : (
                <div key={i} className="bg-slate-100 rounded-2xl h-52 animate-pulse" />
              )
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
