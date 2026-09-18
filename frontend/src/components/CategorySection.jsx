import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getCategories()
      .then(res => { if (res.success) setCategories(res.data || []); })
      .catch(() => {});
  }, []);
  
  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="container-custom">
        
        {/* Heading */}
        <div className="category-heading mb-8">
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary-dark bg-emerald-50 px-3.5 py-1 rounded-full border border-primary/40">
            Departments
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary-dark font-heading mt-2">
            Shop By Category
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse our wide selection of hypermarket departments in Kattathurai
          </p>
          <button className="category-view-all" onClick={() => navigate('/products')}>
            View All Categories <span>→</span>
          </button>
        </div>

        {/* Responsive Grid: 6 per row desktop, 4 tablet, 2 mobile */}
        <div className="category-rail no-scrollbar">
          
          {/* All Categories Option */}
          <button
            onClick={() => navigate('/products')}
            className={`category-card p-3.5 rounded-2xl bg-white border transition-all duration-300 flex flex-col items-center justify-center group hover:-translate-y-1 hover:border-primary hover:shadow-md border-slate-200`}
          >
            <div className="w-14 h-14 rounded-xl bg-primary-dark text-white flex items-center justify-center text-2xl mb-2 group-hover:scale-105 transition duration-300">
              🏬
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-primary-dark">All Categories</span>
            <span className="text-[10px] text-slate-400">View All</span>
          </button>

          {/* 18 Categories */}
          {categories.map(cat => {
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/category/${cat.slug}`)}
                className={`category-card p-3.5 rounded-2xl bg-white border transition-all duration-300 flex flex-col items-center justify-center group hover:-translate-y-1 hover:border-primary hover:shadow-md border-slate-200`}
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden mb-2 bg-slate-50">
                  <img 
                    src={cat.image} 
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center text-xl">
                    {cat.icon}
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-primary-dark truncate max-w-full">
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
