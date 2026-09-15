import React, { useState, useEffect } from 'react';
import { Tag, Copy, Check, Sparkles, Clock, ArrowRight } from 'lucide-react';
import * as api from '../services/api';

export default function SpecialOffers({ onSelectCategory, onTriggerToast }) {
  const [copiedCode, setCopiedCode] = useState(null);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    api.getSpecialOffers()
      .then(res => { if (res.success) setOffers(res.data || []); })
      .catch(() => {});
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    onTriggerToast(`Promo code '${code}' copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section id="special-offers" className="py-14 bg-slate-900 text-white relative overflow-hidden">
      
      {/* Background Neon Glow Effects */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container-custom relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/30">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supermarket Hot Deals</span>
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white font-heading mt-3">
            Exclusive Offers & Promotions
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Unlock maximum savings with our daily refreshed discount codes and bundle deals
          </p>
        </div>

        {/* Offer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offers.map(offer => (
            <div 
              key={offer.id}
              className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700/80 hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:shadow-emerald-950/50 relative overflow-hidden"
            >
              {/* Card Header */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {offer.badge}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{offer.validTill}</span>
                  </div>
                </div>

                <h3 className="text-xl font-extrabold font-heading text-white group-hover:text-emerald-400 transition">
                  {offer.title}
                </h3>

                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 my-2">
                  {offer.discountText}
                </div>

                <p className="text-slate-300 text-xs leading-relaxed font-medium">
                  {offer.description}
                </p>
              </div>

              {/* Promo Code Copy Action Box */}
              <div className="mt-6 pt-4 border-t border-slate-700/80 flex items-center justify-between gap-2">
                <div className="bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-xs text-emerald-400 font-bold tracking-wider">
                  {offer.code}
                </div>

                <button
                  onClick={() => handleCopyCode(offer.code)}
                  className={`btn-neon text-xs py-1.5 px-3 rounded-xl font-bold flex items-center gap-1 transition ${
                    copiedCode === offer.code ? 'bg-white text-slate-900' : ''
                  }`}
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Use Code</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
