import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Cake, ArrowRight } from 'lucide-react';
import * as api from '../services/api';

export default function BakerySection({ onAddToCart, onToggleWishlist, wishlist, onQuickView, onSelectCategory }) {
  const [bakeryItems, setBakeryItems] = useState([]);

  useEffect(() => {
    api.getProducts({ category: 'cakes', limit: 10 })
      .then(res => {
        if (res.success) setBakeryItems(res.data.products || []);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="bakery-special" className="py-14 bg-gradient-to-b from-[#EFFFF0]/60 via-white to-white border-y border-[#E5E7E5]">
      <div className="container-custom">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="badge-light-green inline-flex items-center gap-1 text-xs">
              <Cake className="w-4 h-4 text-[#0B3D20]" />
              <span>ALPHONSA IN-HOUSE BAKERY</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B3D20] font-heading mt-2">
              Fresh From Our Bakery 🍰
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl font-medium">
              Freshly baked cakes, puffs, brownies and more — made to make your day sweeter.
            </p>
          </div>
          <button
            onClick={() => {
              onSelectCategory('cakes');
              const el = document.getElementById('popular-products');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-neon text-xs py-3 px-6 font-bold shrink-0 self-start text-[#111111]"
          >
            <span>Explore Bakery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-8 rounded-2xl bg-[#0B3D20] text-white p-6 md:p-8 relative shadow-md grid grid-cols-1 md:grid-cols-12 items-center gap-6">
          <div className="md:col-span-8 space-y-3">
            <span className="bg-[#39FF14] text-[#111111] font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase">
              BAKERY SPECIAL
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
              Fresh Cream Birthday Cakes &amp; Savory Puffs Baked Daily in Kattathurai
            </h3>
            <p className="text-slate-200 text-xs sm:text-sm max-w-xl">
              Order custom birthday cakes, chicken puffs, and fudgy brownies prepared fresh every morning by our expert bakery chefs.
            </p>
          </div>
          <div className="md:col-span-4 flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80"
              alt="Gourmet Cake Alphonsa Hypermarket"
              className="w-48 h-48 object-cover rounded-xl border-2 border-[#39FF14] shadow-lg rotate-2 hover:rotate-0 transition duration-300"
            />
          </div>
        </div>

        {bakeryItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {bakeryItems.map(product => (
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
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
