import React, { useState } from 'react';
import { X, Star, ShoppingCart, Heart, Plus, Minus, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function ProductQuickView({ 
  product, 
  onClose, 
  onAddToCart, 
  onToggleWishlist, 
  isWishlisted 
}) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart({ ...product, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 relative animate-fade-in max-h-[90vh] flex flex-col">
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white transition flex items-center justify-center text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Product Image Showcase */}
          <div className="relative aspect-square bg-slate-50 p-6 flex items-center justify-center">
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-slate-900 text-white font-extrabold text-xs px-3 py-1 rounded-full">
                {product.discount}% OFF
              </span>
            )}
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover rounded-2xl shadow-md"
            />
          </div>

          {/* Product Details Column */}
          <div className="p-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                {product.categoryLabel}
              </span>

              <h2 className="text-xl font-extrabold text-slate-900 font-heading mt-2 leading-snug">
                {product.name}
              </h2>

              <p className="text-xs text-slate-400 font-semibold mt-1">Pack Size: {product.unit}</p>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mt-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-slate-200'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-800">{product.rating}</span>
                <span className="text-xs text-slate-400">({product.reviews} customer reviews)</span>
              </div>

              {/* Price Display */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900 font-heading">
                  ₹{product.price}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-base text-slate-400 line-through font-medium">
                    ₹{product.originalPrice}
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-600">Save ₹{product.originalPrice - product.price}</span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                {product.description}
              </p>

              {/* Badges */}
              <div className="grid grid-cols-2 gap-2 mt-5 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>100% Authentic Quality</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <Truck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Same Day Delivery</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Sticky Actions Footer */}
        <div className="p-4 sm:p-6 bg-white border-t border-slate-100 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-700">Qty:</span>
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-slate-600 hover:text-slate-900 font-bold text-base"
              >
                -
              </button>
              <span className="text-xs font-extrabold text-slate-900 w-4 text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="text-slate-600 hover:text-slate-900 font-bold text-base"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 sm:flex-none justify-end">
            <button
              onClick={handleAdd}
              className="flex-1 sm:flex-none btn-neon py-2.5 px-6 text-xs font-bold flex items-center justify-center gap-2 min-w-[200px]"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart • ₹{product.price * quantity}</span>
                </>
              )}
            </button>

            <button
              onClick={() => onToggleWishlist(product)}
              className={`p-2.5 rounded-full border border-slate-200 transition shrink-0 ${
                isWishlisted ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-100 text-slate-700 hover:bg-rose-50'
              }`}
              title="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
