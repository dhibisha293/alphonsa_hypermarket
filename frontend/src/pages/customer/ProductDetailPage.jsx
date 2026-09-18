import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import { ChevronRight, Heart, ShoppingCart, Star, Check, Minus, Plus, Info, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import * as api from '../../services/api';
import ProductCard from '../../components/ProductCard';
import ProductReviews from '../../components/ProductReviews';

export default function ProductDetailPage() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const { 
    handleAddToCart, 
    handleToggleWishlist, 
    wishlist,
    setIsCartOpen 
  } = useOutletContext();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    // Reset state when id changes
    setLoading(true);
    setError(null);
    setQuantity(1);
    setActiveTab('description');
    
    // Fetch product
    const fetchProductData = async () => {
      try {
        const res = await api.getProduct(id);
        if (res.success && res.data) {
          setProduct(res.data);
          
          // Fetch related products in the same category
          const relRes = await api.getProducts({ category: res.data.category, limit: 5 });
          if (relRes.success && relRes.data && relRes.data.products) {
            // Filter out the current product from related products
            const filtered = relRes.data.products.filter(p => p.id !== res.data.id).slice(0, 4);
            setRelatedProducts(filtered);
          }
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        setError(err.message || 'Error loading product.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="animate-pulse flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 aspect-square bg-slate-200 rounded-2xl"></div>
          <div className="w-full md:w-1/2 flex flex-col gap-4 py-4">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/2 mt-4"></div>
            <div className="h-12 bg-slate-200 rounded w-full mt-6"></div>
            <div className="h-32 bg-slate-200 rounded w-full mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-2xl">
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xl">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-heading font-extrabold text-slate-900 mb-4">Product Not Found</h2>
          <p className="text-slate-500 mb-8">{error || "We couldn't find the product you're looking for."}</p>
          <Link to="/products" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-dark transition shadow-lg">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const inStock = product.stock_qty > 0;

  const handleAdd = () => {
    if (!inStock) return;
    handleAddToCart({ ...product, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    handleAddToCart({ ...product, quantity });
    setIsCartOpen(true);
  };

  // Convert product name to a slug string for breadcrumbs fallback
  const createSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 max-w-7xl py-3">
          <div className="flex items-center text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap hide-scrollbar">
            <Link to="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300 flex-shrink-0" />
            <Link to={`/category/${product.category}`} className="hover:text-primary transition uppercase">
              {product.categoryLabel}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300 flex-shrink-0" />
            <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8 pb-16 max-w-7xl">
        <div className="bg-white rounded-3xl p-6 md:p-8 lg:p-12 shadow-sm border border-slate-200 mb-12">
          <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
            
            {/* Left: Product Images */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-8 group">
                {product.discount > 0 && (
                  <span className="absolute top-4 left-4 z-10 bg-bright-red text-white font-extrabold text-sm px-3 py-1 rounded-full shadow-md">
                    {product.discount}% OFF
                  </span>
                )}
                {product.isBestseller && (
                  <span className="absolute top-4 left-24 z-10 bg-yellow text-slate-900 font-bold text-xs px-3 py-1 rounded-full uppercase shadow-sm">
                    BESTSELLER
                  </span>
                )}
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              {/* Optional thumbnails (just displaying the same image for demo if no gallery exists) */}
              <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                <div className="w-20 h-20 flex-shrink-0 rounded-xl border-2 border-primary overflow-hidden cursor-pointer bg-slate-50">
                  <img src={product.image} alt="thumbnail" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="w-full lg:w-1/2 flex flex-col">
              
              <div className="mb-2 flex items-center gap-2">
                <span className="uppercase text-primary font-extrabold bg-light-green px-2.5 py-1 rounded text-[10px] tracking-wider">
                  {product.categoryLabel}
                </span>
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                  {product.unit}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-slate-900 mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-700 ml-1">{product.rating}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                <span className="text-sm font-semibold text-slate-500 hover:text-primary transition cursor-pointer">
                  {product.reviews} Reviews
                </span>
                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                <span className="text-sm font-semibold text-slate-500">
                  SKU: {product.sku || 'N/A'}
                </span>
              </div>

              <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-heading font-extrabold text-slate-900">
                    ₹{product.price}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-lg font-bold text-slate-400 line-through mb-1">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500">Inclusive of all taxes</p>
              </div>

              <p className="text-slate-600 mb-8 leading-relaxed font-medium">
                {product.description || "High quality product available at Alphonsa Hypermarket. Order now and get it delivered fast and fresh."}
              </p>

              <div className="flex items-center gap-3 mb-8">
                <div className={`flex items-center gap-1.5 font-bold text-sm px-3 py-1.5 rounded-full ${inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                  {inStock ? <Check className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  <span>{inStock ? 'In Stock' : 'Out of Stock'}</span>
                </div>
                {inStock && (
                  <span className="text-sm font-semibold text-slate-500">
                    Hurry! Only {product.stock_qty} left.
                  </span>
                )}
              </div>

              {/* Quantity and Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center justify-between bg-slate-100 rounded-full px-2 py-1 w-full sm:w-32 border border-slate-200">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={!inStock}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm transition disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-slate-900 w-8 text-center select-none">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(product.stock_qty, q + 1))}
                    disabled={!inStock || quantity >= product.stock_qty}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm transition disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={handleAdd}
                  disabled={!inStock}
                  className={`flex-1 rounded-full font-bold transition flex items-center justify-center gap-2 py-4 px-6 ${
                    added 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl disabled:bg-slate-300 disabled:shadow-none'
                  }`}
                >
                  {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                  <span>{added ? 'Added to Cart' : 'Add to Cart'}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8 pb-8 border-b border-slate-200">
                <button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className="flex-1 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition py-4 px-6 shadow-md disabled:bg-slate-400 disabled:shadow-none"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => handleToggleWishlist(product)}
                  className={`h-[56px] w-full sm:w-[56px] rounded-full border-2 flex items-center justify-center font-bold transition gap-2 ${
                    isWishlisted 
                      ? 'border-rose-500 text-rose-500 bg-rose-50' 
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                  <span className="sm:hidden">{isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Genuine</h4>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">100% Authentic</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Fast Delivery</h4>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Same Day</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Easy Returns</h4>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">No Questions</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 mb-16 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-5 px-6 font-bold text-sm uppercase tracking-wider transition whitespace-nowrap ${
                  activeTab === tab 
                    ? 'text-primary border-b-4 border-primary bg-primary/5' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-b-4 border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="p-6 md:p-10 min-h-[300px]">
            {activeTab === 'description' && (
              <div className="prose prose-slate max-w-none">
                <h3 className="font-heading font-extrabold text-2xl text-slate-900 mb-4">Product Description</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {product.description || "Discover the premium quality of our selected items. Carefully sourced and packed to ensure maximum freshness and satisfaction. Alphonsa Hypermarket is committed to delivering the best products directly to your doorstep."}
                </p>
                <ul className="mt-6 space-y-2 text-slate-600 font-medium">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" /> 
                    <span>Premium quality guarantee</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" /> 
                    <span>Carefully sourced ingredients</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" /> 
                    <span>Freshly packed and delivered</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="font-heading font-extrabold text-2xl text-slate-900 mb-6">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div className="flex py-3 border-b border-slate-100">
                    <span className="w-1/3 text-slate-500 font-semibold text-sm">Brand</span>
                    <span className="w-2/3 text-slate-900 font-bold text-sm">{product.brand_id ? "Various" : "Alphonsa Select"}</span>
                  </div>
                  <div className="flex py-3 border-b border-slate-100">
                    <span className="w-1/3 text-slate-500 font-semibold text-sm">Unit</span>
                    <span className="w-2/3 text-slate-900 font-bold text-sm">{product.unit || "Pack"}</span>
                  </div>
                  <div className="flex py-3 border-b border-slate-100">
                    <span className="w-1/3 text-slate-500 font-semibold text-sm">SKU</span>
                    <span className="w-2/3 text-slate-900 font-bold text-sm">{product.sku || "N/A"}</span>
                  </div>
                  <div className="flex py-3 border-b border-slate-100">
                    <span className="w-1/3 text-slate-500 font-semibold text-sm">Category</span>
                    <span className="w-2/3 text-slate-900 font-bold text-sm">{product.categoryLabel}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <ProductReviews
                productId={product.id}
                productRating={product.rating}
                productReviewsCount={product.reviews}
              />
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-slate-900">
                You might also like
              </h2>
              <Link to={`/category/${product.category}`} className="text-primary font-bold hover:text-primary-dark transition flex items-center gap-1 text-sm">
                View Category <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(relProduct => (
                <ProductCard 
                  key={relProduct.id}
                  product={relProduct}
                  onAddToCart={(p) => handleAddToCart({ ...p, quantity: 1 })}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlisted={wishlist.some(w => w.id === relProduct.id)}
                  onQuickView={() => navigate(`/product/${relProduct.id}/${createSlug(relProduct.name)}`)}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
