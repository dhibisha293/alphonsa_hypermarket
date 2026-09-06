import React from 'react';
import { Truck, MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function FreeDeliveryBanner({ onOpenLocation }) {
  return (
    <section className="py-8 bg-[#F5F7F5]">
      <div className="container-custom">
        {/* Dark Green Container with Rounded Corners */}
        <div className="bg-[#0B3D20] text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-lg border border-[#0B3D20]">
          
          {/* Animated Dashed Road Line */}
          <div className="w-full h-1 animated-road-line mb-6 opacity-80"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Truck Icon & Typography */}
            <div className="lg:col-span-8 space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39FF14]/20 border border-[#39FF14]/40 text-[#39FF14] font-extrabold text-xs tracking-wider uppercase">
                <Truck className="w-4 h-4 text-[#39FF14]" />
                <span>EXPRESS LOCAL DELIVERY</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading text-white leading-tight">
                Free Delivery Up to 3 KM <span className="text-[#39FF14]">🚚</span>
              </h2>

              <p className="text-slate-200 text-xs sm:text-base font-medium leading-relaxed max-w-2xl">
                Enjoy convenient home delivery within 3 km of Alphonsa Hypermarket, Kattathurai. Order your groceries, bakery treats and customized gifts in seconds!
              </p>

              <div className="flex flex-wrap gap-4 pt-1 justify-center lg:justify-start text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#39FF14]" /> 📍 Kattathurai & 3 KM Radius
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#39FF14]" /> Express 45 Min Delivery
                </span>
              </div>
            </div>

            {/* Action CTA */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <button 
                onClick={onOpenLocation}
                className="btn-neon text-sm py-3.5 px-8 font-bold flex items-center gap-2 shadow-md shadow-[#39FF14]/40"
              >
                <Truck className="w-4 h-4" />
                <span>Check Delivery Eligibility</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Bottom Dashed Line */}
          <div className="w-full h-1 animated-road-line mt-6 opacity-80"></div>

        </div>
      </div>
    </section>
  );
}
