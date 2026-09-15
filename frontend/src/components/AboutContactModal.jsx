import React from 'react';
import { X, MapPin, Phone, Mail, Clock, Store, ShieldCheck, Award } from 'lucide-react';

export default function AboutContactModal({ isOpen, onClose, mode = 'about' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 md:p-8 relative animate-fade-in space-y-6 max-h-[90vh] overflow-y-auto">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {mode === 'about' ? (
          /* About Us Tab Content */
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>About Alphonsa Hypermarket</span>
            </div>
            
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
              Everything You Need, All in One Place
            </h2>

            <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
              Founded with the vision to revolutionize family shopping, Alphonsa Hypermarket is your premier destination for farm-fresh groceries, artisanal bakery creations, modern fashion, beauty products, toys, and household essentials.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="font-extrabold text-lg text-emerald-600 font-heading">20,000+</div>
                <div className="text-xs text-slate-500 font-medium">Quality Checked Products</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="font-extrabold text-lg text-emerald-600 font-heading">15,000+</div>
                <div className="text-xs text-slate-500 font-medium">Happy Local Families</div>
              </div>
            </div>

            <div className="bg-emerald-950 text-white p-4 rounded-2xl border border-emerald-800 text-xs space-y-1">
              <div className="font-bold text-emerald-400">Our Brand Promise</div>
              <p className="text-slate-300">100% freshness guarantee, daily affordable prices, friendly staff, and rapid home delivery within 45 minutes.</p>
            </div>
          </div>
        ) : (
          /* Contact Us Tab Content */
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Customer Care & Contact</span>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
              We're Here to Help You 24/7
            </h2>

            <p className="text-slate-600 text-xs leading-relaxed">
              Have a question about an order, bakery custom cakes, or product availability? Reach out to our customer care team anytime.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Toll-Free Customer Care</div>
                  <div className="text-xs text-slate-500 font-mono">1800-123-4567 • (0484) 289-0000</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Email Support</div>
                  <div className="text-xs text-slate-500 font-mono">support@alphonsahypermarket.com</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Head Office Location</div>
                  <div className="text-xs text-slate-500">MG Road Flagship Superstore, City Center, Kochi, Kerala</div>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="w-full btn-neon text-xs py-3 font-bold">
              Close Contact Window
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
