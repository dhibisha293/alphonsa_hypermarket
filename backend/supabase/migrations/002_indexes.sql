-- ============================================================
-- 002_indexes.sql
-- Alphonsa Hypermarket — Performance Indexes
-- ============================================================

-- Products: most queried columns
CREATE INDEX IF NOT EXISTS idx_products_category_slug ON products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active     ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON products(is_bestseller) WHERE is_bestseller = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_is_new        ON products(is_new)        WHERE is_new = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_price         ON products(price);
-- Full-text search on name + description
CREATE INDEX IF NOT EXISTS idx_products_fts ON products USING gin(
    to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || category_label)
);

-- Categories: sort order
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_is_active  ON categories(is_active);

-- Cart: per-user lookups
CREATE INDEX IF NOT EXISTS idx_cart_user_id    ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON cart_items(product_id);

-- Wishlist: per-user lookups
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id    ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist_items(product_id);

-- Orders: per-user
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders(status);

-- Order items: per-order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Special offers: active only
CREATE INDEX IF NOT EXISTS idx_special_offers_is_active ON special_offers(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_special_offers_code      ON special_offers(code);

-- Testimonials: active + sort
CREATE INDEX IF NOT EXISTS idx_testimonials_is_active ON testimonials(is_active, sort_order);
