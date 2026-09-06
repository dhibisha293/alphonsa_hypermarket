import React from 'react';
import { Heart, ShoppingCart, Eye, Star, Check } from 'lucide-react';

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  isWishlisted,
  onQuickView 
}) {
  const [added, setAdded] = React.useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card group bg-white border border-[#E5E7E5] rounded-[18px] overflow-hidden transition-all duration-300 flex flex-col justify-between hover:-translate-y-[7px] hover:shadow-xl hover:border-[#39FF14]">
      
      {/* Product Image Area */}
      <div 
        className="product-img-container aspect-square bg-[#F5F7F5] relative overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-[#39FF14] text-[#111111] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">
            {product.discount}% OFF
          </span>
        )}

        {/* Bestseller Badge */}
        {product.isBestseller && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-[#0B3D20] text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase">
            BESTSELLER
          </span>
        )}

        {/* Wishlist Heart */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-sm transition ${
            isWishlisted 
              ? 'bg-rose-500 text-white shadow-md' 
              : 'bg-white/80 text-slate-600 hover:bg-rose-500 hover:text-white'
          }`}
          title="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 bg-white/90 text-[#111111] hover:bg-[#0B3D20] hover:text-white font-bold text-[11px] px-3 py-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1"
        >
          <Eye className="w-3 h-3" />
          <span>Quick View</span>
        </button>

        {/* Product Image */}
        <img 
          src={product.image} 
          alt={product.name}
          className="product-img w-full h-full object-cover group-hover:scale-105 transition duration-400"
          loading="lazy"
        />
      </div>

      {/* Details */}
      <div className="p-3.5 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
            <span className="uppercase text-[#0B3D20] font-extrabold bg-[#EFFFF0] px-2 py-0.5 rounded">
              {product.categoryLabel}
            </span>
            <span>{product.unit}</span>
          </div>

          <h3 
            onClick={() => onQuickView(product)}
            className="font-bold text-[#111111] text-xs hover:text-[#0B3D20] transition cursor-pointer line-clamp-2 min-h-[36px] leading-snug"
          >
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-slate-200'}`} 
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-700 ml-1">{product.rating}</span>
            <span className="text-[9px] text-slate-400">({product.reviews})</span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-3 mt-3 border-t border-[#E5E7E5] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-base text-[#111111]">
                ₹{product.price}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-[11px] text-slate-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAdd}
            className={`btn-add-cart text-xs py-1.5 px-3 rounded-full font-bold transition flex items-center gap-1 ${
              added ? 'bg-[#0B3D20] text-white' : 'bg-[#39FF14] text-[#111111] hover:bg-[#0B3D20] hover:text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
