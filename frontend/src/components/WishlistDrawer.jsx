import React from 'react';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WishlistDrawer({ 
  isOpen, 
  onClose, 
  wishlist, 
  onRemoveWishlist, 
  onAddToCart 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden relative z-10"
          >
        
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
            <div className="text-center py-20 px-6 space-y-4">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Heart className="w-10 h-10 text-slate-300" />
              </motion.div>
              <h3 className="font-heading font-extrabold text-xl text-slate-800">Your wishlist is currently empty</h3>
              <p className="text-sm text-slate-500 pb-6">Click the heart icon on any product to save it for later.</p>
              <button onClick={onClose} className="btn-neon w-full py-3.5 text-sm font-bold shadow-lg shadow-emerald-500/20">
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

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
