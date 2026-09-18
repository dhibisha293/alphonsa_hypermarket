import React from 'react';
import { ShoppingCart, Phone, Mail, MapPin, MessageCircle, ArrowUp, Truck, Gift } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Footer({ onSelectCategory, onOpenAbout, onOpenContact }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-primary-dark text-slate-200 pt-14 pb-10 border-t border-primary-dark relative">
      <div className="container-custom">
        
        {/* Top Scroll Back Up Button */}
        <div className="flex justify-end mb-6">
          <button 
            onClick={scrollToTop}
            className="p-2.5 rounded-full bg-white/10 hover:bg-primary hover:text-slate-900 text-white transition flex items-center gap-2 text-xs font-bold border border-white/20"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/15">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-bold shadow-md overflow-hidden">
                <img src={logo} alt="Alphonsa Hypermarket logo" className="w-full h-full object-contain" />
              </div>
              <div className="font-black text-xl text-white font-heading">
                Alphonsa <span className="text-primary">Hypermarket</span>
              </div>
            </div>

            <p className="text-primary font-bold text-xs">
              "Everything You Need, All in One Place"
            </p>

            <div className="space-y-1.5 text-xs text-slate-300 font-medium pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>📍 Kattathurai, Kanyakumari Dist.</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary shrink-0" />
                <span>🚚 Free Delivery up to 3 KM</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-primary shrink-0" />
                <span>🎁 Customized Gifts Available</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a href="#instagram" className="w-8 h-8 rounded-full bg-white/10 hover:bg-primary hover:text-slate-900 flex items-center justify-center transition text-white">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#facebook" className="w-8 h-8 rounded-full bg-white/10 hover:bg-primary hover:text-slate-900 flex items-center justify-center transition text-white">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/>
                </svg>
              </a>
              <a href="#whatsapp" className="w-8 h-8 rounded-full bg-white/10 hover:bg-primary hover:text-slate-900 flex items-center justify-center transition text-white">
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li>
                <button onClick={scrollToTop} className="hover:text-primary transition">Home</button>
              </li>
              <li>
                <button onClick={() => {
                  const el = document.getElementById('popular-products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} className="hover:text-primary transition">Categories</button>
              </li>
              <li>
                <button onClick={() => {
                  const el = document.getElementById('special-offers');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} className="hover:text-primary transition">Offers</button>
              </li>
              <li>
                <button onClick={() => {
                  const el = document.getElementById('bakery-special');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} className="hover:text-primary transition">Bakery</button>
              </li>
              <li>
                <button onClick={() => {
                  const el = document.getElementById('customized-gifts-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} className="hover:text-primary transition">Customized Gifts</button>
              </li>
              <li>
                <button onClick={onOpenContact} className="hover:text-primary transition">Contact</button>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              {['Grocery', 'Fresh Produce', 'Bakery', 'Beauty', 'Fashion', 'Toys', 'Home Essentials'].map((cat, idx) => (
                <li key={idx}>
                  <button 
                    onClick={() => {
                      onSelectCategory(cat.toLowerCase().split(' ')[0]);
                      const el = document.getElementById('popular-products');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="hover:text-primary transition"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Customer Support */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li>
                <button onClick={onOpenContact} className="hover:text-primary transition">Contact Us</button>
              </li>
              <li>
                <button onClick={onOpenAbout} className="hover:text-primary transition">FAQs</button>
              </li>
              <li>
                <a href="#delivery" className="hover:text-primary transition">Delivery Information (3 KM)</a>
              </li>
              <li>
                <a href="#returns" className="hover:text-primary transition">Returns & Refund Policy</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-primary transition">Terms & Conditions</a>
              </li>
            </ul>

            <div className="pt-2">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-[11px] text-slate-300">
                <span className="text-primary font-bold block mb-0.5">Kattathurai Helpline</span>
                Call us at <span className="text-white font-mono font-bold">1800-123-4567</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium">
          <div>
            © 2026 Alphonsa Hypermarket. All Rights Reserved.
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Kattathurai Branch</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
