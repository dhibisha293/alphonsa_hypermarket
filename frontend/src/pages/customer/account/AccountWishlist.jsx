import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export default function AccountWishlist() {
  const { wishlist, handleToggleWishlist, handleAddToCart, triggerToast } = useOutletContext();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-slate-900">My Wishlist</h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Your wishlist is empty</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Save items you like in your wishlist. Review them anytime and easily move them to your cart.
          </p>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Start Shopping <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <div key={product.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group flex flex-col">
              <Link to={`/product/${product.id}/slug`} className="relative aspect-square block bg-slate-100 overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Heart className="w-12 h-12 text-slate-300" />
                  </div>
                )}
                {product.discount_price && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                    SALE
                  </div>
                )}
              </Link>
              <div className="p-4 flex flex-col flex-1">
                <Link to={`/product/${product.id}/slug`}>
                  <h3 className="font-bold text-slate-900 mb-1 hover:text-primary transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-end gap-2 mb-4 mt-auto">
                  {product.discount_price ? (
                    <>
                      <span className="text-lg font-bold text-primary">₹{product.discount_price.toFixed(2)}</span>
                      <span className="text-sm text-slate-500 line-through mb-0.5">₹{product.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-primary">₹{(product.price || 0).toFixed(2)}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button
                    onClick={() => handleToggleWishlist(product)}
                    className="flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                  <button
                    onClick={() => {
                      handleAddToCart(product);
                      handleToggleWishlist(product); // Remove from wishlist when added to cart
                    }}
                    className="flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" /> Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
