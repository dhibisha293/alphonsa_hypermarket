-- ============================================================
-- 003_rls.sql
-- Alphonsa Hypermarket — Row Level Security Policies
-- ============================================================

-- ============================================================
-- categories — PUBLIC READ, admin write (via service role)
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read"
    ON categories FOR SELECT
    USING (is_active = TRUE);

-- ============================================================
-- products — PUBLIC READ (active only), admin write
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read"
    ON products FOR SELECT
    USING (is_active = TRUE);

-- ============================================================
-- special_offers — PUBLIC READ (active only)
-- ============================================================
ALTER TABLE special_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "special_offers_public_read"
    ON special_offers FOR SELECT
    USING (is_active = TRUE);

-- ============================================================
-- testimonials — PUBLIC READ (active only)
-- ============================================================
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials_public_read"
    ON testimonials FOR SELECT
    USING (is_active = TRUE);

-- ============================================================
-- profiles — user sees/updates only their own profile
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own_read"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "profiles_own_update"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "profiles_own_insert"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================
-- cart_items — user manages only their own cart
-- ============================================================
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_own_select"
    ON cart_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "cart_own_insert"
    ON cart_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_own_update"
    ON cart_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "cart_own_delete"
    ON cart_items FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- wishlist_items — user manages only their own wishlist
-- ============================================================
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wishlist_own_select"
    ON wishlist_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "wishlist_own_insert"
    ON wishlist_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlist_own_delete"
    ON wishlist_items FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- orders — user sees only their own orders
-- ============================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_own_select"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "orders_own_insert"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- order_items — user sees items for their own orders
-- ============================================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_own_select"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "order_items_own_insert"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- ============================================================
-- contact_messages — anyone can insert, nobody can read via RLS
-- (reads only via service role in FastAPI)
-- ============================================================
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_messages_public_insert"
    ON contact_messages FOR INSERT
    WITH CHECK (TRUE);

-- ============================================================
-- GRANT service role bypass (FastAPI uses service role key)
-- The service role bypasses all RLS by default in Supabase.
-- No additional grants needed — this file documents intent only.
-- ============================================================
