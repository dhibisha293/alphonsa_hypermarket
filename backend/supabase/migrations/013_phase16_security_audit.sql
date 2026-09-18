-- ==============================================================================
-- 013_phase16_security_audit.sql
-- 
-- Drops all permissive public/authenticated RLS policies on the database.
-- Because the FastAPI backend uses the Supabase Service Role Key for all database
-- interactions (which inherently bypasses RLS), no RLS policies are actually 
-- required for normal application functionality. 
-- 
-- Dropping these policies secures the database against direct manipulation via 
-- the Supabase REST API (PostgREST) by users who extract their JWT token and 
-- the Supabase Anon Key.
-- ==============================================================================

-- DROP ALL PUBLIC/AUTHENTICATED POLICIES
DROP POLICY IF EXISTS "categories_public_read" ON categories;
DROP POLICY IF EXISTS "products_public_read" ON products;
DROP POLICY IF EXISTS "special_offers_public_read" ON special_offers;
DROP POLICY IF EXISTS "testimonials_public_read" ON testimonials;

DROP POLICY IF EXISTS "profiles_own_read" ON profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON profiles;
DROP POLICY IF EXISTS "profiles_own_insert" ON profiles;

DROP POLICY IF EXISTS "cart_own_select" ON cart_items;
DROP POLICY IF EXISTS "cart_own_insert" ON cart_items;
DROP POLICY IF EXISTS "cart_own_update" ON cart_items;
DROP POLICY IF EXISTS "cart_own_delete" ON cart_items;

DROP POLICY IF EXISTS "wishlist_own_select" ON wishlist_items;
DROP POLICY IF EXISTS "wishlist_own_insert" ON wishlist_items;
DROP POLICY IF EXISTS "wishlist_own_delete" ON wishlist_items;

DROP POLICY IF EXISTS "orders_own_select" ON orders;
DROP POLICY IF EXISTS "orders_own_insert" ON orders;

DROP POLICY IF EXISTS "order_items_own_select" ON order_items;
DROP POLICY IF EXISTS "order_items_own_insert" ON order_items;

DROP POLICY IF EXISTS "contact_messages_public_insert" ON contact_messages;

DROP POLICY IF EXISTS "brands_public_read" ON brands;
DROP POLICY IF EXISTS "subcategories_public_read" ON subcategories;

DROP POLICY IF EXISTS "staff_roles_own_read" ON staff_roles;
DROP POLICY IF EXISTS "delivery_assignments_own_read" ON delivery_assignments;

DROP POLICY IF EXISTS "addresses_own_all" ON addresses;

DROP POLICY IF EXISTS "reviews_public_read_approved" ON reviews;
DROP POLICY IF EXISTS "reviews_own_insert" ON reviews;
DROP POLICY IF EXISTS "reviews_own_update" ON reviews;
DROP POLICY IF EXISTS "reviews_own_delete" ON reviews;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;

-- Explicitly ensure RLS is enabled on ALL tables. 
-- Since there are no policies left, PostgREST will DENY ALL operations to 
-- anon and authenticated users by default. The Service Role key remains unaffected.
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_received ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_received_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
