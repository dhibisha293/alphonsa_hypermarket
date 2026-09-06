import React from 'react';
import { Home, Grid, Tag, ShoppingCart, Heart } from 'lucide-react';

export default function MobileNavigation({ 
  onSelectCategory, 
  onOpenCart, 
  onOpenWishlist, 
  cartCount,
  wishlistCount 
}) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-2xl backdrop-blur-md bg-white/95">
      
      <button 
        onClick={() => {
          onSelectCategory('all');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="flex flex-col items-center text-slate-600 hover:text-emerald-600 transition"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-1">Home</span>
      </button>

      <button 
        onClick={() => {
          const el = document.getElementById('popular-products');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className="flex flex-col items-center text-slate-600 hover:text-emerald-600 transition"
      >
        <Grid className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-1">Categories</span>
      </button>

      <button 
        onClick={() => {
          const el = document.getElementById('special-offers');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className="flex flex-col items-center text-slate-600 hover:text-emerald-600 transition"
      >
        <Tag className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-1">Offers</span>
      </button>

      <button 
        onClick={onOpenWishlist}
        className="flex flex-col items-center text-slate-600 hover:text-emerald-600 transition relative"
      >
        <Heart className="w-5 h-5" />
        {wishlistCount > 0 && (
          <span className="absolute -top-1 right-2 bg-rose-500 text-white font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
            {wishlistCount}
          </span>
        )}
        <span className="text-[10px] font-bold mt-1">Wishlist</span>
      </button>

      {/* Sticky Mobile Cart Floating Button */}
      <button 
        onClick={onOpenCart}
        className="flex flex-col items-center text-emerald-600 relative bg-emerald-50 p-2 rounded-2xl border border-emerald-300"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5 text-emerald-600" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-emerald-500 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-extrabold mt-0.5 text-emerald-700">Cart</span>
      </button>

    </div>
  );
}
