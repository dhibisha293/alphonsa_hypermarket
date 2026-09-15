import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Sparkles, SlidersHorizontal, Loader2 } from 'lucide-react';
import * as api from '../services/api';

export default function ProductGrid({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  onQuickView
}) {
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [total,     setTotal]     = useState(0);

  const filterTabs = [
    { id: 'all',       label: 'All Products' },
    { id: 'grocery',   label: 'Grocery' },
    { id: 'cakes',     label: 'Bakery' },
    { id: 'vegetables',label: 'Vegetables' },
    { id: 'fruits',    label: 'Fruits' },
    { id: 'cosmetics', label: 'Cosmetics' },
    { id: 'toys',      label: 'Toys' },
    { id: 'vessels',   label: 'Home Essentials' },
    { id: 'shoes',     label: 'Fashion' },
  ];

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.getProducts({ category: selectedCategory, search: searchQuery });
        if (!cancelled && res.success) {
          setProducts(res.data.products || []);
          setTotal(res.data.total || 0);
        }
      } catch (_) {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();
    return () => { cancelled = true; };
  }, [selectedCategory, searchQuery]);

  return (
    <section id="popular-products" className="py-14 bg-white">
      <div className="container-custom">

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
            <span>Showing {loading ? '…' : products.length} items</span>
          </div>
        </div>

        {/* Filter Tabs */}
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

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map(product => (
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
              onClick={() => onSelectCategory('all')}
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
