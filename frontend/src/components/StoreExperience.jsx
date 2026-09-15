import React from 'react';
import { Store, MapPin, Truck, Gift, ArrowRight, Clock } from 'lucide-react';

export default function StoreExperience({ onOpenLocation }) {
  return (
    <section className="py-14 bg-[#F5F7F5] border-b border-[#E5E7E5]">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <span className="badge-light-green inline-flex items-center gap-1.5 text-xs">
              <Store className="w-4 h-4 text-[#0B3D20]" />
              <span>ALPHONSA HYPERMARKET KATTATHURAI</span>
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0B3D20] leading-tight">
              Your Local Hypermarket in Kattathurai
            </h2>

            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
              Alphonsa Hypermarket brings your everyday essentials, fresh produce, bakery favorites, fashion, beauty products, toys, gifts and more under one roof.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1 text-xs font-extrabold text-[#0B3D20]">
              <span className="bg-white px-3.5 py-2 rounded-full border border-[#E5E7E5] shadow-xs flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0B3D20] fill-[#39FF14]" /> 📍 Kattathurai
              </span>
              <span className="bg-white px-3.5 py-2 rounded-full border border-[#E5E7E5] shadow-xs flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#0B3D20]" /> 🚚 Free Delivery up to 3 KM
              </span>
              <span className="bg-white px-3.5 py-2 rounded-full border border-[#E5E7E5] shadow-xs flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-[#0B3D20]" /> 🎁 Customized Gifts Available
              </span>
            </div>

            <div className="pt-2">
              <button 
                onClick={onOpenLocation}
                className="btn-neon text-xs py-3 px-7 font-bold flex items-center gap-2 text-[#111111]"
              >
                <MapPin className="w-4 h-4" />
                <span>Visit Our Store</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-[#E5E7E5] shadow-md group">
              <img 
                src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80" 
                alt="Store Experience Alphonsa Hypermarket Kattathurai"
                className="w-full h-72 object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B3D20]/80 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-3 left-3 right-3 p-3 bg-white/95 rounded-xl border border-[#E5E7E5] flex items-center justify-between text-xs">
                <div>
                  <div className="font-extrabold text-[#0B3D20]">Main Junction Store</div>
                  <div className="text-[10px] text-slate-500 font-medium">📍 Kattathurai • 8 AM - 10 PM</div>
                </div>
                <button 
                  onClick={onOpenLocation}
                  className="btn-dark-green text-[10px] py-1.5 px-3 rounded-full"
                >
                  Locate Store
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
