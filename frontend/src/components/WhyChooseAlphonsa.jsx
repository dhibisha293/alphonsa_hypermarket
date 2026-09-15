import React from 'react';
import { WHY_CHOOSE_ALPHONSA } from '../data/mockData';
import { CheckCircle2, Sparkles, Tag, Layers, Truck, Gift } from 'lucide-react';

export default function WhyChooseAlphonsa() {
  const iconList = [
    <Sparkles className="w-6 h-6 text-[#0B3D20]" />,
    <Tag className="w-6 h-6 text-[#0B3D20]" />,
    <Layers className="w-6 h-6 text-[#0B3D20]" />,
    <Truck className="w-6 h-6 text-[#0B3D20]" />,
    <Gift className="w-6 h-6 text-[#0B3D20]" />
  ];

  return (
    <section className="py-14 bg-white border-b border-[#E5E7E5]">
      <div className="container-custom">
        
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B3D20] bg-[#EFFFF0] px-3.5 py-1 rounded-full border border-[#39FF14]/40">
            Why Shop With Us
          </span>
          <h2 className="text-3xl font-extrabold text-[#0B3D20] font-heading mt-2">
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
              className="bg-white p-5 rounded-2xl border border-[#E5E7E5] shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-[#39FF14] transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#EFFFF0] border border-[#39FF14]/30 flex items-center justify-center mb-3 group-hover:bg-[#39FF14] transition duration-300">
                  {iconList[idx] || <CheckCircle2 className="w-6 h-6 text-[#0B3D20]" />}
                </div>
                <h3 className="font-extrabold text-sm text-[#111111] font-heading mb-1.5 group-hover:text-[#0B3D20] transition">
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
