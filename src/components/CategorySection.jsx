import React from 'react';
import { CATEGORIES } from '../data/mockData';

export default function CategorySection({ selectedCategory, onSelectCategory }) {
  return (
    <section className="py-12 bg-white border-b border-[#E5E7E5]">
      <div className="container-custom">
        
        {/* Heading */}
        <div className="category-heading mb-8">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B3D20] bg-[#EFFFF0] px-3.5 py-1 rounded-full border border-[#39FF14]/40">
            Departments
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B3D20] font-heading mt-2">
            Shop By Category
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse our wide selection of hypermarket departments in Kattathurai
          </p>
          <button className="category-view-all" onClick={() => onSelectCategory('all')}>
            View All Categories <span>→</span>
          </button>
        </div>

        {/* Responsive Grid: 6 per row desktop, 4 tablet, 2 mobile */}
        <div className="category-rail no-scrollbar">
          
          {/* All Categories Option */}
          <button
            onClick={() => {
              onSelectCategory('all');
              const el = document.getElementById('popular-products');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`category-card p-3.5 rounded-2xl bg-white border transition-all duration-300 flex flex-col items-center justify-center group hover:-translate-y-1 hover:border-[#39FF14] hover:shadow-md ${
              selectedCategory === 'all' 
                ? 'border-[#39FF14] bg-[#EFFFF0] ring-2 ring-[#39FF14]/20' 
                : 'border-[#E5E7E5]'
            }`}
          >
            <div className="w-14 h-14 rounded-xl bg-[#0B3D20] text-white flex items-center justify-center text-2xl mb-2 group-hover:scale-105 transition duration-300">
              🏬
            </div>
            <span className="text-xs font-bold text-[#111111] group-hover:text-[#0B3D20]">All Categories</span>
            <span className="text-[10px] text-slate-400">View All</span>
          </button>

          {/* 18 Categories */}
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  const el = document.getElementById('popular-products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`category-card p-3.5 rounded-2xl bg-white border transition-all duration-300 flex flex-col items-center justify-center group hover:-translate-y-1 hover:border-[#39FF14] hover:shadow-md ${
                  isActive 
                    ? 'border-[#39FF14] bg-[#EFFFF0] ring-2 ring-[#39FF14]/20' 
                    : 'border-[#E5E7E5]'
                }`}
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden mb-2 bg-[#F5F7F5]">
                  <img 
                    src={cat.image} 
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-[#111111]/20 flex items-center justify-center text-xl">
                    {cat.icon}
                  </div>
                </div>
                <span className="text-xs font-bold text-[#111111] group-hover:text-[#0B3D20] truncate max-w-full">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-full">
                  {cat.count}
                </span>
              </button>
            );
          })}

        </div>

      </div>
    </section>
  );
}
