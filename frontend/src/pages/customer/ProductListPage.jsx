import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, Package, Star, ShoppingCart } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import * as api from '../../services/api';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'discount',   label: 'Biggest Discount' },
];

function createSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── Mini ProductCard ──────────────────────────────────────────────────────────
function GridCard({ product, onAddToCart, onToggleWishlist, isWishlisted }) {
  const navigate = useNavigate();
  const inStock = product.stock_qty > 0;

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col group overflow-hidden"
    >
      <div
        className="relative aspect-square bg-slate-50 overflow-hidden cursor-pointer"
        onClick={() => navigate(`/product/${product.id}/${createSlug(product.name)}`)}
      >
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            {product.discount}% OFF
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-full border">Out of Stock</span>
          </div>
        )}
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-slate-200" />
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] uppercase font-semibold text-primary/70 mb-1 tracking-wider">{product.categoryLabel}</p>
        <h3
          className="text-sm font-bold text-slate-900 leading-snug mb-2 line-clamp-2 cursor-pointer hover:text-primary transition"
          onClick={() => navigate(`/product/${product.id}/${createSlug(product.name)}`)}
        >
          {product.name}
        </h3>

        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-slate-600">{Number(product.rating).toFixed(1)}</span>
            {product.reviews > 0 && <span className="text-xs text-slate-400">({product.reviews})</span>}
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base font-extrabold text-slate-900">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">₹{product.originalPrice}</span>
            )}
          </div>
          <button
            disabled={!inStock}
            onClick={() => onAddToCart({ ...product, quantity: 1 })}
            className="w-full py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 disabled:bg-slate-200 disabled:text-slate-400 transition flex items-center justify-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-100" />
      <div className="p-3 space-y-2">
        <div className="h-2 bg-slate-100 rounded w-1/3" />
        <div className="h-3 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-8 bg-slate-100 rounded-xl mt-3" />
      </div>
    </div>
  );
}

// ── Filter Sidebar / Drawer ───────────────────────────────────────────────────
function FilterPanel({ filters, setFilters, categories, brands, onClose, isMobile }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const apply = () => {
    setFilters(localFilters);
    if (onClose) onClose();
  };

  const reset = () => {
    const cleared = { category: '', brand_id: '', min_price: '', max_price: '', min_discount: '', in_stock: false };
    setLocalFilters(cleared);
    setFilters(cleared);
    if (onClose) onClose();
  };

  return (
    <div className="bg-white h-full flex flex-col">
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-900 text-lg">Filters</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
      )}
      {!isMobile && <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Filters</h3>}

      <div className="flex-1 overflow-y-auto space-y-6 p-4">
        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
          <select
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={localFilters.category || ''}
            onChange={e => setLocalFilters(f => ({ ...f, category: e.target.value }))}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Brand */}
        {brands.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Brand</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={localFilters.brand_id || ''}
              onChange={e => setLocalFilters(f => ({ ...f, brand_id: e.target.value }))}
            >
              <option value="">All Brands</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Price range */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price Range (₹)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              min={0}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={localFilters.min_price || ''}
              onChange={e => setLocalFilters(f => ({ ...f, min_price: e.target.value }))}
            />
            <input
              type="number"
              placeholder="Max"
              min={0}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={localFilters.max_price || ''}
              onChange={e => setLocalFilters(f => ({ ...f, max_price: e.target.value }))}
            />
          </div>
        </div>

        {/* Min discount */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Min Discount: {localFilters.min_discount || 0}%
          </label>
          <input
            type="range"
            min={0} max={80} step={5}
            className="w-full accent-primary"
            value={localFilters.min_discount || 0}
            onChange={e => setLocalFilters(f => ({ ...f, min_discount: Number(e.target.value) || '' }))}
          />
        </div>

        {/* In stock */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`w-10 h-5 rounded-full transition-colors ${localFilters.in_stock ? 'bg-primary' : 'bg-slate-200'} relative`}
            onClick={() => setLocalFilters(f => ({ ...f, in_stock: !f.in_stock }))}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${localFilters.in_stock ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-semibold text-slate-700">In Stock Only</span>
        </label>
      </div>

      <div className="p-4 border-t border-slate-100 flex gap-2">
        <button onClick={reset} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
          Reset
        </button>
        <button onClick={apply} className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition">
          Apply
        </button>
      </div>
    </div>
  );
}

// ── Main ProductListPage (shared logic for /products, /search, /category/:slug) ─
export default function ProductListPage({ initialCategory = '', initialQuery = '', pageTitle = 'All Products', initialMinDiscount }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { handleAddToCart, handleToggleWishlist, wishlist } = useOutletContext();

  // Sync state FROM url params on mount
  const getInitialFilters = () => ({
    category:    searchParams.get('category') || initialCategory,
    brand_id:    searchParams.get('brand_id') || '',
    min_price:   searchParams.get('min_price') || '',
    max_price:   searchParams.get('max_price') || '',
    min_discount:searchParams.get('min_discount') || initialMinDiscount || '',
    in_stock:    searchParams.get('in_stock') === 'true',
  });

  const [filters, setFilters] = useState(getInitialFilters);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [query, setQuery] = useState(searchParams.get('q') || initialQuery);
  const [inputValue, setInputValue] = useState(searchParams.get('q') || initialQuery);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const debounceRef = useRef(null);
  const LIMIT = 24;

  // Load filter metadata
  useEffect(() => {
    api.getCategories().then(r => { if (r.success) setCategories(r.data || []); }).catch(() => {});
    api.getBrands().then(r => { if (r.success) setBrands(r.data || []); }).catch(() => {});
  }, []);

  // Sync URL params whenever filters / sort / query / page change
  useEffect(() => {
    const params = {};
    if (query)              params.q = query;
    if (filters.category)   params.category = filters.category;
    if (filters.brand_id)   params.brand_id = filters.brand_id;
    if (filters.min_price)  params.min_price = filters.min_price;
    if (filters.max_price)  params.max_price = filters.max_price;
    if (filters.min_discount && Number(filters.min_discount) > 0) params.min_discount = filters.min_discount;
    if (filters.in_stock)   params.in_stock = 'true';
    if (sort !== 'newest')  params.sort = sort;
    if (page > 1)           params.page = page;
    setSearchParams(params, { replace: true });
  }, [filters, sort, query, page]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getProducts({
        q: query || undefined,
        category: filters.category || undefined,
        brand_id: filters.brand_id || undefined,
        min_price: filters.min_price ? Number(filters.min_price) : undefined,
        max_price: filters.max_price ? Number(filters.max_price) : undefined,
        min_discount: filters.min_discount && Number(filters.min_discount) > 0 ? Number(filters.min_discount) : undefined,
        in_stock: filters.in_stock || undefined,
        sort,
        page,
        limit: LIMIT,
      });
      if (res.success) {
        setProducts(res.data.products);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [query, filters, sort, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Debounced search input
  const handleSearchChange = (val) => {
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(val);
      setPage(1);
    }, 400);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);
  const activeFilterCount = [
    filters.category, filters.brand_id, filters.min_price, filters.max_price,
    filters.min_discount && Number(filters.min_discount) > 0 ? '1' : '',
    filters.in_stock ? '1' : ''
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 max-w-7xl py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <h1 className="text-2xl font-extrabold font-heading text-slate-900">{pageTitle}</h1>
              {!loading && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {total} product{total !== 1 ? 's' : ''}{query ? ` for "${query}"` : ''}
                </p>
              )}
            </div>

            {/* Search bar */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={inputValue}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Search products, SKU, barcode..."
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
              />
              {inputValue && (
                <button
                  onClick={() => { setInputValue(''); setQuery(''); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-6">
        <div className="flex gap-6">

          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <FilterPanel
                filters={filters}
                setFilters={handleFiltersChange}
                categories={categories}
                brands={brands}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <button
                className="flex lg:hidden items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white shadow-sm relative"
                onClick={() => setDrawerOpen(true)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <label className="text-sm text-slate-500 font-medium whitespace-nowrap">Sort by:</label>
                <select
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={sort}
                  onChange={e => handleSortChange(e.target.value)}
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.category && (
                  <Chip label={`Category: ${categories.find(c => c.slug === filters.category)?.name || filters.category}`} onRemove={() => handleFiltersChange({ ...filters, category: '' })} />
                )}
                {filters.brand_id && (
                  <Chip label={`Brand: ${brands.find(b => b.id === filters.brand_id)?.name || 'Selected'}`} onRemove={() => handleFiltersChange({ ...filters, brand_id: '' })} />
                )}
                {filters.min_price && <Chip label={`Min ₹${filters.min_price}`} onRemove={() => handleFiltersChange({ ...filters, min_price: '' })} />}
                {filters.max_price && <Chip label={`Max ₹${filters.max_price}`} onRemove={() => handleFiltersChange({ ...filters, max_price: '' })} />}
                {filters.min_discount > 0 && <Chip label={`${filters.min_discount}%+ off`} onRemove={() => handleFiltersChange({ ...filters, min_discount: '' })} />}
                {filters.in_stock && <Chip label="In Stock" onRemove={() => handleFiltersChange({ ...filters, in_stock: false })} />}
                <button onClick={() => handleFiltersChange({ category: '', brand_id: '', min_price: '', max_price: '', min_discount: '', in_stock: false })} className="text-xs text-primary font-semibold hover:underline">
                  Clear all
                </button>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 px-6 space-y-4 bg-white rounded-3xl border border-slate-100 shadow-sm mt-4">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                  <Package className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-slate-800">No products found</h3>
                <p className="text-sm text-slate-500 pb-6 max-w-sm mx-auto">
                  We couldn't find anything matching your search. Try adjusting your filters or searching for something else.
                </p>
                <button
                  onClick={() => { handleFiltersChange({ category: '', brand_id: '', min_price: '', max_price: '', min_discount: '', in_stock: false }); setQuery(''); setInputValue(''); }}
                  className="btn-neon inline-block py-3.5 px-8 text-sm font-bold shadow-lg shadow-emerald-500/20 rounded-xl"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {products.map(product => (
                  <GridCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.some(w => w.id === product.id || w.product_id === product.id)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-slate-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = page <= 3 ? i + 1 : page - 2 + i;
                  if (pg < 1 || pg > totalPages) return null;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition ${pg === page ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] shadow-2xl flex flex-col">
            <FilterPanel
              filters={filters}
              setFilters={handleFiltersChange}
              categories={categories}
              brands={brands}
              isMobile
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-primary/60">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
