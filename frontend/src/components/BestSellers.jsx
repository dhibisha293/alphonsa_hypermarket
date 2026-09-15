import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Award, Flame } from 'lucide-react';
import * as api from '../services/api';

export default function BestSellers({ onAddToCart, onToggleWishlist, wishlist, onQuickView }) {
  const [bestsellerItems, setBestsellerItems] = useState([]);

  useEffect(() => {
    api.getProducts({ is_bestseller: true, limit: 10 })
      .then(res => { if (res.success) setBestsellerItems(res.data.products || []); })
      .catch(() => {});
  }, []);

  return (
    <section className="py-14 bg-white border-b border-slate-100">
      <div className="container-custom">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            <Flame className="w-4 h-4 text-emerald-600" />
            <span>Most Ordered Items</span>
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-heading mt-3">
            Customer Favorites
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Top picks loved by over 15,000+ local families every single week
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {bestsellerItems.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlist.some(item => item.id === product.id)}
              onQuickView={onQuickView}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
