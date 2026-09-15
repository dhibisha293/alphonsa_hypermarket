import React from 'react';
import { FEATURED_CLUSTERS } from '../data/mockData';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FeaturedCategories({ onSelectCategory }) {
  return (
    <section className="py-14 bg-slate-50 border-b border-slate-200/80">
      <div className="container-custom">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-300">
            Curated Collections
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-heading mt-3">
            Featured Categories
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Explore our themed hypermarket departments designed for your family’s lifestyle
          </p>
        </div>

        {/* Category Clusters Grid */}
        <div className="department-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_CLUSTERS.map((cluster, idx) => (
            <div 
              key={cluster.id}
              className={`department-card group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-500 border border-slate-200 flex flex-col justify-between ${
                idx === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              {/* Background Cover Image with Soft Overlay */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={cluster.image} 
                  alt={cluster.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20"></div>
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between h-full min-h-[300px]">
                
                {/* Top Badge */}
                <div className="flex justify-between items-start">
                  <span className="bg-emerald-500 text-slate-950 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    {cluster.badge}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>

                {/* Main Titles & Tags */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
                    {cluster.title}
                  </h3>
                  <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-md font-medium">
                    {cluster.subtitle}
                  </p>

                  {/* Sub-category tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {cluster.tags.map((tag, tIdx) => (
                      <span 
                        key={tIdx}
                        onClick={() => {
                          const catId = tag.toLowerCase().replace(/ /g, '-');
                          onSelectCategory(catId);
                          const el = document.getElementById('popular-products');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-white/15 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/20 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 transition cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Explore Link CTA */}
                  <button 
                    onClick={() => {
                      const firstCat = cluster.tags[0].toLowerCase().replace(/ /g, '-');
                      onSelectCategory(firstCat);
                      const el = document.getElementById('popular-products');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-6 inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold text-xs uppercase tracking-wider group-hover:translate-x-1 transition"
                  >
                    <span>Shop Collection</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
