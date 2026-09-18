import { getToken } from './api';

const API_BASE = 'http://localhost:8080/api';

async function adminRequest(endpoint, options = {}) {
  const token = getToken();
  if (!token) throw new Error("No admin token");
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    }
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "Request failed");
  return json;
}

export async function getStats() {
  return adminRequest('/admin/stats');
}

export const getOrders = async (page = 1, pageSize = 20) => {
  return await adminRequest(`/admin/orders?page=${page}&page_size=${pageSize}`);
};

export const updateOrderStatus = async (orderId, status) => {
  return await adminRequest(`/admin/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
};

export const getRefunds = async (status = "REQUESTED") => {
  return await adminRequest(`/admin/refunds?status=${status}`);
};

export const processRefund = async (orderId, action, reason = null) => {
  return await adminRequest(`/admin/orders/${orderId}/refund`, {
    method: 'PATCH',
    body: JSON.stringify({ action, refund_reason: reason })
  });
};

export const updatePaymentStatus = async (orderId, paymentStatus) => {
  return await adminRequest(`/admin/orders/${orderId}/payment-status`, {
    method: 'PATCH',
    body: JSON.stringify({ payment_status: paymentStatus })
  });
};

export const adminCancelOrder = async (orderId, reason = null) => {
  return await adminRequest(`/admin/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
};

// --- PROMOTIONS (Coupons & Offers) ---

export const getCoupons = async () => {
  return await adminRequest('/admin/coupons');
};

export const createCoupon = async (data) => {
  return await adminRequest('/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateCoupon = async (id, data) => {
  return await adminRequest(`/admin/coupons/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const deleteCoupon = async (id) => {
  return await adminRequest(`/admin/coupons/${id}`, { method: 'DELETE' });
};

export const getOffers = async () => {
  return await adminRequest('/admin/offers');
};

export const createOffer = async (data) => {
  return await adminRequest('/admin/offers', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateOffer = async (id, data) => {
  return await adminRequest(`/admin/offers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const deleteOffer = async (id) => {
  return await adminRequest(`/admin/offers/${id}`, { method: 'DELETE' });
};

// --- DELIVERY ---

export const getDeliveryAssignments = async () => {
  return await adminRequest('/admin/delivery');
};

export const getDeliveryStaff = async () => {
  return await adminRequest('/admin/delivery/staff');
};

export const assignDelivery = async (data) => {
  return await adminRequest('/admin/delivery', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateDelivery = async (id, data) => {
  return await adminRequest(`/admin/delivery/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const unassignDelivery = async (id) => {
  return await adminRequest(`/admin/delivery/${id}`, { method: 'DELETE' });
};

// --- SUPPLIERS & POs ---

export const getSuppliers = async () => {
  return await adminRequest('/admin/suppliers');
};

export const createSupplier = async (data) => {
  return await adminRequest('/admin/suppliers', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateSupplier = async (id, data) => {
  return await adminRequest(`/admin/suppliers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const deleteSupplier = async (id) => {
  return await adminRequest(`/admin/suppliers/${id}`, { method: 'DELETE' });
};

export const getPurchaseOrders = async () => {
  return await adminRequest('/admin/purchase-orders');
};

export const createPurchaseOrder = async (data) => {
  return await adminRequest('/admin/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updatePurchaseOrder = async (id, data) => {
  return await adminRequest(`/admin/purchase-orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

// --- POS SYNC ---

export const getPosExportOrders = async () => {
  return await adminRequest('/admin/pos/export-orders');
};

export const syncPosInventory = async (data) => {
  return await adminRequest('/admin/pos/sync', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const importPosCsv = async (formData) => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:8080/admin/pos/import-csv', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!res.ok) {
    let err = 'Upload failed';
    try { const data = await res.json(); err = data.detail || err; } catch(e){}
    throw new Error(err);
  }
  return await res.json();
};

// --- REPORTS ---

export const getSalesReport = async (days = 30) => {
  return await adminRequest(`/admin/reports/sales?days=${days}`);
};

export const getInventoryReport = async () => {
  return await adminRequest('/admin/reports/inventory');
};

export const getTopProductsReport = async () => {
  return await adminRequest('/admin/reports/top-products');
};

// ─── CATALOG ──────────────────────────────────────────────────────────────────

// Brands
export const getBrands = () => adminRequest("/admin/brands");
export const createBrand = (data) => adminRequest("/admin/brands", { method: "POST", body: JSON.stringify(data) });
export const updateBrand = (id, data) => adminRequest(`/admin/brands/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteBrand = (id) => adminRequest(`/admin/brands/${id}`, { method: "DELETE" });

// Categories
export const getAdminCategories = () => adminRequest("/admin/categories");
export const createCategory = (data) => adminRequest("/admin/categories", { method: "POST", body: JSON.stringify(data) });
export const updateCategory = (id, data) => adminRequest(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCategory = (id) => adminRequest(`/admin/categories/${id}`, { method: "DELETE" });

// Subcategories
export const getSubcategories = () => adminRequest("/admin/subcategories");
export const createSubcategory = (data) => adminRequest("/admin/subcategories", { method: "POST", body: JSON.stringify(data) });
export const updateSubcategory = (id, data) => adminRequest(`/admin/subcategories/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteSubcategory = (id) => adminRequest(`/admin/subcategories/${id}`, { method: "DELETE" });

// Products (Admin specific actions)
export const createProduct = (data) => adminRequest("/admin/products", { method: "POST", body: JSON.stringify(data) });
export const updateProduct = (id, data) => adminRequest(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProduct = (id) => adminRequest(`/admin/products/${id}`, { method: "DELETE" });

export const uploadProductsCsv = async (file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/admin/products/bulk`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "Upload failed");
  return json;
};

// ─── INVENTORY ────────────────────────────────────────────────────────────────

export const getInventoryStats = () => adminRequest("/admin/inventory/stats");

export const getInventory = (page = 1, pageSize = 20, search = '', status = '', categoryId = '') => {
  let query = `?page=${page}&page_size=${pageSize}`;
  if (search) query += `&search=${encodeURIComponent(search)}`;
  if (status) query += `&status=${status}`;
  if (categoryId) query += `&category_id=${categoryId}`;
  return adminRequest(`/admin/inventory${query}`);
};

export const adjustStock = (productId, data) => 
  adminRequest(`/admin/inventory/${productId}/adjust`, { 
    method: "POST", 
    body: JSON.stringify(data) 
  });

export const getInventoryMovements = (page = 1, pageSize = 20, productId = '', type = '') => {
  let query = `?page=${page}&page_size=${pageSize}`;
  if (productId) query += `&product_id=${productId}`;
  if (type) query += `&type=${type}`;
  return adminRequest(`/admin/inventory/movements${query}`);
};

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

export const getAdminReviews = (page = 1, pageSize = 20, status = '', productId = '') => {
  let query = `?page=${page}&page_size=${pageSize}`;
  if (status) query += `&status=${status}`;
  if (productId) query += `&product_id=${productId}`;
  return adminRequest(`/admin/reviews${query}`);
};

export const moderateReview = (reviewId, status) =>
  adminRequest(`/admin/reviews/${reviewId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });

export const adminDeleteReview = (reviewId) =>
  adminRequest(`/admin/reviews/${reviewId}`, { method: 'DELETE' });

