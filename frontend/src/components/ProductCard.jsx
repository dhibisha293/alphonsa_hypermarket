import React from 'react';
import { Heart, ShoppingCart, Eye, Star, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  isWishlisted,
  onQuickView 
}) {
  const [added, setAdded] = React.useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  
  const createSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const productUrl = `/product/${product.id}/${createSlug(product.name)}`;

  return (
    <div className="product-card group bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:border-primary">
      
      {/* Product Image Area */}
      <Link 
        to={productUrl}
        className="product-img-container aspect-square bg-slate-50 relative overflow-hidden block"
      >
        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-bright-red text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm max-w-[calc(100%-45px)] truncate inline-block">
            {product.discount}% OFF
          </span>
        )}

        {/* Bestseller Badge */}
        {product.isBestseller && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-yellow text-slate-900 font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase max-w-[calc(100%-45px)] truncate inline-block">
            BESTSELLER
          </span>
        )}

        {/* Wishlist Heart */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-full backdrop-blur-sm transition ${
            isWishlisted 
              ? 'bg-rose-500 text-white shadow-md' 
              : 'bg-white/80 text-slate-600 hover:bg-rose-500 hover:text-white'
          }`}
          title="Wishlist"
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 bg-white/95 text-slate-800 hover:bg-primary hover:text-white font-bold text-[11px] px-4 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 backdrop-blur-sm"
          aria-label={`Quick view ${product.name}`}
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
      </Link>

      {/* Details */}
      <div className="p-3.5 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
            <span className="uppercase text-primary font-extrabold bg-light-green px-2 py-0.5 rounded">
              {product.categoryLabel}
            </span>
            <span>{product.unit}</span>
          </div>

          <Link to={productUrl}>
            <h3 className="font-bold text-slate-900 text-sm hover:text-primary transition cursor-pointer line-clamp-2 min-h-[38px] leading-snug font-heading">
              {product.name}
            </h3>
          </Link>

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
        <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-base text-slate-900 font-heading">
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
            className={`btn-add-cart text-xs py-1.5 px-4 rounded-full font-bold transition flex items-center gap-1.5 ${
              added ? 'bg-primary-dark text-white' : 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30'
            }`}
            aria-label={`Add ${product.name} to cart`}
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
