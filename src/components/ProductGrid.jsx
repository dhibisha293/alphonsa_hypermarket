import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { PRODUCTS } from '../data/mockData';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

export default function ProductGrid({ 
  selectedCategory, 
  onSelectCategory, 
  searchQuery, 
  onAddToCart, 
  onToggleWishlist, 
  wishlist,
  onQuickView 
}) {
  const filterTabs = [
    { id: 'all', label: 'All Products' },
    { id: 'grocery', label: 'Grocery' },
    { id: 'cakes', label: 'Bakery' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'cosmetics', label: 'Cosmetics' },
    { id: 'toys', label: 'Toys' },
    { id: 'vessels', label: 'Home Essentials' },
    { id: 'shoes', label: 'Fashion' }
  ];

  // Filter products based on active category & search query
  const filteredProducts = PRODUCTS.filter(product => {
    const matchesCategory = selectedCategory === 'all' 
      ? true 
      : product.category === selectedCategory || 
        (selectedCategory === 'bakery' && ['cakes', 'puffs', 'brownies'].includes(product.category)) ||
        (selectedCategory === 'fresh' && ['vegetables', 'fruits'].includes(product.category));
    
    const matchesSearch = searchQuery === '' 
      ? true 
      : product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="popular-products" className="py-14 bg-white">
      <div className="container-custom">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Hypermarket Selection
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-heading mt-2">
              Popular Products
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              Showing top rated groceries, bakery items, cosmetics, toys and home items
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 self-start">
            <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
            <span>Showing {filteredProducts.length} items</span>
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-8 border-b border-slate-100">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onSelectCategory(tab.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === tab.id
                  ? 'bg-slate-900 text-emerald-400 shadow-md shadow-slate-900/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredProducts.map(product => (
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
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-slate-800">No products found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find any products matching your search "{searchQuery}". Try selecting a different category.
            </p>
            <button
              onClick={() => {
                onSelectCategory('all');
              }}
              className="mt-4 btn-neon text-xs py-2 px-5 font-bold"
            >
              Show All Products
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
