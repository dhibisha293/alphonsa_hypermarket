import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import * as api from '../services/api';

export default function NewArrivals({ onAddToCart, onToggleWishlist, wishlist, onQuickView }) {
  const scrollRef = React.useRef(null);
  const [newArrivalItems, setNewArrivalItems] = useState([]);

  useEffect(() => {
    api.getProducts({ is_new: true, limit: 15 })
      .then(res => { if (res.success) setNewArrivalItems(res.data.products || []); })
      .catch(() => {});
  }, []);

  const handleScroll = (dir) => {
    if (scrollRef.current) {
      const amount = dir === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section id="new-arrivals" className="py-14 bg-slate-50 border-b border-slate-200/80">
      <div className="container-custom">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Just In Stock</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-heading mt-2">
              New Arrivals
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              Fresh additions in fashion, beauty, toys, watches and home accessories
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleScroll('left')}
              className="p-2.5 rounded-full bg-white border border-slate-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 text-slate-600 transition shadow-sm"
              title="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleScroll('right')}
              className="p-2.5 rounded-full bg-white border border-slate-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 text-slate-600 transition shadow-sm"
              title="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div 
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto no-scrollbar py-2 scroll-smooth"
        >
          {newArrivalItems.map(product => (
            <div key={product.id} className="w-64 shrink-0">
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.some(item => item.id === product.id)}
                onQuickView={onQuickView}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
