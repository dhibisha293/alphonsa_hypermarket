import React from 'react';
import { WHY_CHOOSE_ALPHONSA } from '../data/mockData';
import { CheckCircle2, Sparkles, Tag, Layers, Truck, Gift } from 'lucide-react';

export default function WhyChooseAlphonsa() {
  const iconList = [
    <Sparkles className="w-6 h-6 text-primary-dark" />,
    <Tag className="w-6 h-6 text-primary-dark" />,
    <Layers className="w-6 h-6 text-primary-dark" />,
    <Truck className="w-6 h-6 text-primary-dark" />,
    <Gift className="w-6 h-6 text-primary-dark" />
  ];

  return (
    <section className="py-14 bg-white border-b border-slate-200">
      <div className="container-custom">
        
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary-dark bg-emerald-50 px-3.5 py-1 rounded-full border border-primary/40">
            Why Shop With Us
          </span>
          <h2 className="text-3xl font-extrabold text-primary-dark font-heading mt-2">
            Why Choose Alphonsa Hypermarket?
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Your trusted local hypermarket destination in Kattathurai
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {WHY_CHOOSE_ALPHONSA.map((item, idx) => (
            <div 
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-primary transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-primary/30 flex items-center justify-center mb-3 group-hover:bg-primary transition duration-300">
                  {iconList[idx] || <CheckCircle2 className="w-6 h-6 text-primary-dark" />}
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 font-heading mb-1.5 group-hover:text-primary-dark transition">
                  ✓ {item.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
