/**
 * Alphonsa Hypermarket — Frontend API Service
 *
 * All communication with the FastAPI backend goes through this file.
 * The React UI never talks to Supabase directly.
 *
 * Environment variable:
 *   VITE_API_URL=http://localhost:8080   (set in frontend/.env)
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// ─── Auth token helpers ──────────────────────────────────────────────────────
const TOKEN_KEY = "alphonsa_token";

export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const getToken  = ()      => localStorage.getItem(TOKEN_KEY);
export const clearToken = ()     => localStorage.removeItem(TOKEN_KEY);

// ─── Core fetch wrapper ──────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok) {
    let message = "Something went wrong";
    if (Array.isArray(json?.detail)) {
      message = json.detail[0]?.msg || message;
    } else if (json?.detail) {
      message = typeof json.detail === 'string' ? json.detail : JSON.stringify(json.detail);
    } else if (json?.message) {
      message = json.message;
    }
    throw new Error(message);
  }
  return json; // { success, data, message }
}

// ─── Health ──────────────────────────────────────────────────────────────────
export const checkHealth = () => request("/api/health");

// ─── Products ────────────────────────────────────────────────────────────────
export const getProducts = ({
  q, category, brand_id, subcategory_id,
  min_price, max_price, min_discount,
  is_bestseller, is_new, in_stock,
  sort = 'newest', page = 1, limit = 24
} = {}) => {
  const params = new URLSearchParams();
  if (q)               params.set('q', q);
  if (category && category !== 'all') params.set('category', category);
  if (brand_id)        params.set('brand_id', brand_id);
  if (subcategory_id)  params.set('subcategory_id', subcategory_id);
  if (min_price != null) params.set('min_price', min_price);
  if (max_price != null) params.set('max_price', max_price);
  if (min_discount != null) params.set('min_discount', min_discount);
  if (is_bestseller !== undefined) params.set('is_bestseller', is_bestseller);
  if (is_new !== undefined)        params.set('is_new', is_new);
  if (in_stock !== undefined)      params.set('in_stock', in_stock);
  params.set('sort', sort);
  params.set('page', page);
  params.set('limit', limit);
  return request(`/api/products?${params}`);
};

export const getProduct = (id) => request(`/api/products/${id}`);

// ─── Categories / Brands / Subcategories ─────────────────────────────────────
export const getCategories = () => request("/api/categories");
export const getBrands = () => request("/api/categories/brands");
export const getSubcategories = (categoryId) => {
  const params = categoryId ? `?category_id=${categoryId}` : '';
  return request(`/api/categories/subcategories${params}`);
};

// ─── Special Offers ──────────────────────────────────────────────────────────
export const getSpecialOffers = () => request("/api/special-offers");

// ─── Testimonials ────────────────────────────────────────────────────────────
export const getTestimonials = () => request("/api/testimonials");

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const register = (email, password, full_name) =>
  request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name }),
  });

export const login = (email, password) =>
  request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const logout = () => {
  clearToken();
  return request("/api/auth/logout", { method: "POST" });
};

export const getMe = () => request("/api/auth/me");

export const updateProfile = (data) =>
  request("/api/auth/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });

// 🛒 Cart ─────────────────────────────────────────────────────────────────────
export const getCart = () => request("/api/cart");

export const addToCart = (product_id, quantity = 1) =>
  request("/api/cart", {
    method: "POST",
    body: JSON.stringify({ product_id, quantity }),
  });

export const updateCartItem = (cart_item_id, quantity) =>
  request(`/api/cart/${cart_item_id}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });

export const removeCartItem = (cart_item_id) =>
  request(`/api/cart/${cart_item_id}`, { method: "DELETE" });

export const clearCart = () => request("/api/cart", { method: "DELETE" });

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const getWishlist = () => request("/api/wishlist");

export const addToWishlist = (product_id) =>
  request("/api/wishlist", {
    method: "POST",
    body: JSON.stringify({ product_id }),
  });

export const removeFromWishlist = (product_id) =>
  request(`/api/wishlist/${product_id}`, { method: "DELETE" });

// ─── Orders ───────────────────────────────────────────────────────────────────
export const placeOrder = (orderPayload) =>
  request("/api/orders", {
    method: "POST",
    body: JSON.stringify(orderPayload),
  });

export const getOrders = () => request("/api/orders");

export const getOrder = (order_id) => request(`/api/orders/${order_id}`);

export const cancelOrder = (order_id) =>
  request(`/api/orders/${order_id}/cancel`, {
    method: "POST",
  });

// ─── Promo ────────────────────────────────────────────────────────────────────
export const validatePromo = (code) =>
  request("/api/promo/validate", {
    method: "POST",
    body: JSON.stringify({ code }),
  });

// ─── Contact ──────────────────────────────────────────────────────────────────
export const submitContact = (name, email, phone, message) =>
  request("/api/contact", {
    method: "POST",
    body: JSON.stringify({ name, email, phone, message }),
  });

// ─── Addresses ────────────────────────────────────────────────────────────────
export const getAddresses = () => request("/api/addresses");

export const addAddress = (data) =>
  request("/api/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateAddress = (id, data) =>
  request(`/api/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteAddress = (id) =>
  request(`/api/addresses/${id}`, { method: "DELETE" });

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const getProductReviews = (productId, page = 1, pageSize = 10) =>
  request(`/api/reviews/product/${productId}?page=${page}&page_size=${pageSize}`);

export const checkReviewEligibility = (productId) =>
  request(`/api/reviews/eligible/${productId}`);

export const submitReview = (data) =>
  request("/api/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteReview = (reviewId) =>
  request(`/api/reviews/${reviewId}`, { method: "DELETE" });

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotifications = (page = 1, pageSize = 20) =>
  request(`/api/notifications?page=${page}&page_size=${pageSize}`);

export const getUnreadNotificationsCount = () =>
  request(`/api/notifications/unread-count`);

export const markNotificationAsRead = (id) =>
  request(`/api/notifications/${id}/read`, { method: "PATCH" });

export const markAllNotificationsAsRead = () =>
  request(`/api/notifications/read-all`, { method: "PATCH" });

