import React from 'react';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function WishlistDrawer({ 
  isOpen, 
  onClose, 
  wishlist, 
  onRemoveWishlist, 
  onAddToCart 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base font-heading text-white">Your Saved Wishlist</h3>
              <p className="text-[11px] text-rose-300 font-semibold">{wishlist.length} saved favorites</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {wishlist.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <Heart className="w-16 h-16 mx-auto stroke-1 text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">Your wishlist is currently empty</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Click the heart icon on any product to save it for later.</p>
              <button onClick={onClose} className="btn-neon text-xs py-2 px-5 font-bold mt-2">
                Discover Products
              </button>
            </div>
          ) : (
            wishlist.map(item => (
              <div key={item.id} className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 items-center justify-between">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-slate-800 truncate">{item.name}</h4>
                  <div className="font-extrabold text-sm text-slate-900 font-heading">₹{item.price}</div>
                </div>

                <button 
                  onClick={() => {
                    onAddToCart(item);
                    onRemoveWishlist(item.id);
                  }}
                  className="btn-neon text-xs py-1.5 px-3 rounded-full font-bold flex items-center gap-1 shrink-0"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>

                <button 
                  onClick={() => onRemoveWishlist(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-500"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
