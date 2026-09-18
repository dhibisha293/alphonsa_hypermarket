-- ============================================================
-- 008_phase2_rbac_rls.sql
-- Alphonsa Hypermarket — Phase 2 RBAC & RLS
-- ============================================================

-- ============================================================
-- brands & subcategories — PUBLIC READ, admin write (via service role)
-- ============================================================
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brands_public_read"
    ON brands FOR SELECT
    USING (is_active = TRUE);

ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subcategories_public_read"
    ON subcategories FOR SELECT
    USING (is_active = TRUE);

-- ============================================================
-- staff_roles — INTERNAL (Service role only), users can read their own
-- ============================================================
ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_roles_own_read"
    ON staff_roles FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================================
-- inventory & stock_movements — INTERNAL ONLY
-- (Service role only, no public reads)
-- ============================================================
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
-- Default behavior with RLS enabled and no policies is DENY ALL.

-- ============================================================
-- suppliers, purchase_orders, goods_received — INTERNAL ONLY
-- ============================================================
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_received ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_received_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- delivery_assignments — STAFF ONLY
-- Delivery staff can read their own assignments.
-- ============================================================
ALTER TABLE delivery_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "delivery_assignments_own_read"
    ON delivery_assignments FOR SELECT
    USING (auth.uid() = staff_user_id);
-- Writing happens via FastAPI (service role).

-- ============================================================
-- coupons — PUBLIC READ (only active ones), to allow frontend
-- validation or display of available offers. 
-- Wait, backend validates coupons. Better to keep it INTERNAL ONLY
-- to prevent scraping of all coupon codes.
-- ============================================================
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
-- DENY ALL by default.

-- ============================================================
-- pos_sync_logs & audit_logs — INTERNAL ONLY
-- ============================================================
ALTER TABLE pos_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
