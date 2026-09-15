/**
 * Alphonsa Hypermarket — Frontend API Service
 *
 * All communication with the FastAPI backend goes through this file.
 * The React UI never talks to Supabase directly.
 *
 * Environment variable:
 *   VITE_API_URL=http://localhost:8000   (set in frontend/.env)
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
    const message = json?.detail || json?.message || "Something went wrong";
    throw new Error(message);
  }
  return json; // { success, data, message }
}

// ─── Health ──────────────────────────────────────────────────────────────────
export const checkHealth = () => request("/api/health");

// ─── Products ────────────────────────────────────────────────────────────────
export const getProducts = ({ category, search, is_bestseller, is_new, page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (search)        params.set("search", search);
  if (is_bestseller !== undefined) params.set("is_bestseller", is_bestseller);
  if (is_new !== undefined)        params.set("is_new", is_new);
  params.set("page",  page);
  params.set("limit", limit);
  return request(`/api/products?${params}`);
};

export const getProduct = (id) => request(`/api/products/${id}`);

// ─── Categories ──────────────────────────────────────────────────────────────
export const getCategories = () => request("/api/categories");

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

// ─── Cart ─────────────────────────────────────────────────────────────────────
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
