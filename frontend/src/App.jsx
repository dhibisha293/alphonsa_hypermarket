import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Storefront from './Storefront';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import OrdersManager from './pages/admin/OrdersManager';
import ProductsManager from './pages/admin/ProductsManager';
import CategoriesManager from './pages/admin/CategoriesManager';
import BrandsManager from './pages/admin/BrandsManager';
import PromotionsManager from './pages/admin/PromotionsManager';
import DeliveryManager from './pages/admin/DeliveryManager';
import SuppliersManager from './pages/admin/SuppliersManager';
import PosSyncManager from './pages/admin/PosSyncManager';
import ReportsManager from './pages/admin/ReportsManager';
import PlaceholderPage from './pages/admin/PlaceholderPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Storefront />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<OrdersManager />} />
          <Route path="products" element={<ProductsManager />} />
          
          {/* New Modules (Phase 4-13) */}
          <Route path="categories" element={<CategoriesManager />} />
          <Route path="brands" element={<BrandsManager />} />
          <Route path="inventory" element={<PlaceholderPage title="Inventory Management" />} />
          <Route path="promotions" element={<PromotionsManager />} />
          <Route path="delivery" element={<DeliveryManager />} />
          <Route path="suppliers" element={<SuppliersManager />} />
          <Route path="pos" element={<PosSyncManager />} />
          <Route path="reports" element={<ReportsManager />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
