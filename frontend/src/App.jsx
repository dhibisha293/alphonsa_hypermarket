import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PageLoader from './components/PageLoader';

// Layouts (Load these normally so the shell renders fast)
import CustomerLayout from './layouts/CustomerLayout';
import AccountLayout from './pages/customer/account/AccountLayout';
import AdminLayout from './pages/admin/AdminLayout';

// Customer Pages (Lazy Load)
const HomePage = React.lazy(() => import('./pages/customer/HomePage'));
const PlaceholderPage = React.lazy(() => import('./pages/customer/PlaceholderPage'));
const ProductDetailPage = React.lazy(() => import('./pages/customer/ProductDetailPage'));
const ProductListPage = React.lazy(() => import('./pages/customer/ProductListPage'));
const SearchPage = React.lazy(() => import('./pages/customer/SearchPage'));
const CategoryPage = React.lazy(() => import('./pages/customer/CategoryPage'));
const CheckoutPage = React.lazy(() => import('./pages/customer/CheckoutPage'));
const OrderConfirmationPage = React.lazy(() => import('./pages/customer/OrderConfirmationPage'));

// Account Pages (Lazy Load)
const AccountDashboard = React.lazy(() => import('./pages/customer/account/AccountDashboard'));
const AccountProfile = React.lazy(() => import('./pages/customer/account/AccountProfile'));
const AccountAddresses = React.lazy(() => import('./pages/customer/account/AccountAddresses'));
const AccountOrders = React.lazy(() => import('./pages/customer/account/AccountOrders'));
const AccountOrderDetail = React.lazy(() => import('./pages/customer/account/AccountOrderDetail'));
const AccountWishlist = React.lazy(() => import('./pages/customer/account/AccountWishlist'));
const AccountNotifications = React.lazy(() => import('./pages/customer/account/AccountNotifications'));

// Admin Pages (Lazy Load)
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const OrdersManager = React.lazy(() => import('./pages/admin/OrdersManager'));
const ProductsManager = React.lazy(() => import('./pages/admin/ProductsManager'));
const CategoriesManager = React.lazy(() => import('./pages/admin/CategoriesManager'));
const BrandsManager = React.lazy(() => import('./pages/admin/BrandsManager'));
const PromotionsManager = React.lazy(() => import('./pages/admin/PromotionsManager'));
const DeliveryManager = React.lazy(() => import('./pages/admin/DeliveryManager'));
const SuppliersManager = React.lazy(() => import('./pages/admin/SuppliersManager'));
const PosSyncManager = React.lazy(() => import('./pages/admin/PosSyncManager'));
const ReportsManager = React.lazy(() => import('./pages/admin/ReportsManager'));
const AdminPlaceholderPage = React.lazy(() => import('./pages/admin/PlaceholderPage'));
const InventoryManager = React.lazy(() => import('./pages/admin/InventoryManager'));
const InventoryMovements = React.lazy(() => import('./pages/admin/InventoryMovements'));
const ReviewsManager = React.lazy(() => import('./pages/admin/ReviewsManager'));
const RefundsManager = React.lazy(() => import('./pages/admin/RefundsManager'));

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="product/:id/:slug" element={<ProductDetailPage />} />
          <Route path="products" element={<ProductListPage pageTitle="All Products" />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="deals" element={<ProductListPage pageTitle="Deals & Offers" initialMinDiscount={5} />} />
          <Route path="account" element={<AccountLayout />}>
            <Route index element={<AccountDashboard />} />
            <Route path="profile" element={<AccountProfile />} />
            <Route path="addresses" element={<AccountAddresses />} />
            <Route path="orders" element={<AccountOrders />} />
            <Route path="orders/:id" element={<AccountOrderDetail />} />
            <Route path="wishlist" element={<AccountWishlist />} />
            <Route path="notifications" element={<AccountNotifications />} />
          </Route>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-confirmation/:id" element={<OrderConfirmationPage />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<OrdersManager />} />
          <Route path="products" element={<ProductsManager />} />
          
          {/* New Modules (Phase 4-13) */}
          <Route path="categories" element={<CategoriesManager />} />
          <Route path="brands" element={<BrandsManager />} />
          <Route path="inventory" element={<InventoryManager />} />
          <Route path="inventory/movements" element={<InventoryMovements />} />
          <Route path="promotions" element={<PromotionsManager />} />
          <Route path="delivery" element={<DeliveryManager />} />
          <Route path="suppliers" element={<SuppliersManager />} />
          <Route path="reviews" element={<ReviewsManager />} />
          <Route path="pos" element={<PosSyncManager />} />
          <Route path="reports" element={<ReportsManager />} />
          <Route path="settings" element={<AdminPlaceholderPage title="Settings" />} />
          <Route path="refunds" element={<RefundsManager />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
