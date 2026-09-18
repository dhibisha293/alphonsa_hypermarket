-- ============================================================
-- 007_phase1_architecture.sql
-- Alphonsa Hypermarket — Phase 1 Schema Upgrades
-- ============================================================

-- 1. BRANDS
CREATE TABLE IF NOT EXISTS brands (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(150) NOT NULL,
    slug        VARCHAR(150) NOT NULL UNIQUE,
    logo_url    TEXT,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. SUBCATEGORIES
CREATE TABLE IF NOT EXISTS subcategories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name        VARCHAR(150) NOT NULL,
    slug        VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    image_url   TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_subcategories_updated_at BEFORE UPDATE ON subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. STAFF ROLES (RBAC)
CREATE TABLE IF NOT EXISTS staff_roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role        VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'INVENTORY_MANAGER', 'ORDER_MANAGER', 'DELIVERY_STAFF', 'CONTENT_MANAGER')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);
CREATE TRIGGER trg_staff_roles_updated_at BEFORE UPDATE ON staff_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    current_stock   INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    reserved_stock  INTEGER NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
    minimum_stock   INTEGER NOT NULL DEFAULT 10 CHECK (minimum_stock >= 0),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id)
);
CREATE TRIGGER trg_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. STOCK MOVEMENTS
CREATE TABLE IF NOT EXISTS stock_movements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type            VARCHAR(50) NOT NULL CHECK (type IN ('PURCHASE', 'SALE', 'ONLINE_ORDER', 'RETURN', 'DAMAGE', 'EXPIRY', 'MANUAL_ADJUSTMENT', 'STOCK_TRANSFER')),
    quantity        INTEGER NOT NULL, -- Can be negative for sale/damage, positive for purchase/return
    reference_id    VARCHAR(100), -- E.g., Order ID, PO ID
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name    VARCHAR(200) NOT NULL,
    contact_person  VARCHAR(150),
    phone           VARCHAR(20),
    email           VARCHAR(255),
    gst_number      VARCHAR(50),
    address         TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS purchase_orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id     UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    status          VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'PARTIAL', 'COMPLETED', 'CANCELLED')),
    total_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
    expected_date   DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id   UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    unit_price          NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    line_total          NUMERIC(12,2) NOT NULL CHECK (line_total >= 0),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. GOODS RECEIVED
CREATE TABLE IF NOT EXISTS goods_received (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id   UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE RESTRICT,
    received_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    received_date       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goods_received_items (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goods_received_id   UUID NOT NULL REFERENCES goods_received(id) ON DELETE CASCADE,
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity_received   INTEGER NOT NULL CHECK (quantity_received > 0),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. DELIVERY ASSIGNMENTS
CREATE TABLE IF NOT EXISTS delivery_assignments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    staff_user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    status          VARCHAR(50) NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED')),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(order_id)
);
CREATE TRIGGER trg_delivery_assignments_updated_at BEFORE UPDATE ON delivery_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                VARCHAR(30) NOT NULL UNIQUE,
    type                VARCHAR(30) NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED')),
    discount_value      NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
    min_order_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
    max_discount        NUMERIC(10,2),
    start_date          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date            TIMESTAMPTZ,
    usage_limit         INTEGER,
    per_user_limit      INTEGER,
    current_usage       INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. POS SYNC LOGS
CREATE TABLE IF NOT EXISTS pos_sync_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status          VARCHAR(30) NOT NULL CHECK (status IN ('STARTED', 'SUCCESS', 'FAILED', 'PARTIAL')),
    type            VARCHAR(30) NOT NULL CHECK (type IN ('MANUAL', 'API', 'CSV')),
    items_synced    INTEGER NOT NULL DEFAULT 0,
    errors          JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    entity      VARCHAR(100) NOT NULL,
    entity_id   VARCHAR(255),
    old_value   JSONB,
    new_value   JSONB,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. ALTER PRODUCTS TABLE
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100) UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5,2) DEFAULT 0;

-- Optional: Initial data migration for inventory from products.stock_qty if safe to do so
INSERT INTO inventory (product_id, current_stock, minimum_stock)
SELECT id, stock_qty, 10 FROM products
ON CONFLICT (product_id) DO NOTHING;

-- Note: We are keeping products.stock_qty for backwards compatibility for now until Phase 5.
