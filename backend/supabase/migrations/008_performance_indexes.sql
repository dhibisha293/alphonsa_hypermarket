-- Performance optimization indexes for Alphonsa Hypermarket

-- Products
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Order Items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Cart Items
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Wishlist
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);

-- Delivery
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_order_id ON delivery_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_staff_id ON delivery_assignments(staff_user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_status ON delivery_assignments(status);
