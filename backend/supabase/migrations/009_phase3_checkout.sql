-- ============================================================
-- 009_phase3_checkout.sql
-- Alphonsa Hypermarket — Phase 3 Checkout Schema
-- ============================================================

-- 1. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS addresses (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name               VARCHAR(150) NOT NULL,
    phone                   VARCHAR(20) NOT NULL,
    address_line            TEXT NOT NULL,
    area                    VARCHAR(150) NOT NULL,
    city                    VARCHAR(100) NOT NULL,
    state                   VARCHAR(100) NOT NULL,
    pincode                 VARCHAR(20) NOT NULL,
    delivery_instructions   TEXT,
    is_default              BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_addresses_updated_at ON addresses;
CREATE TRIGGER trg_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "addresses_own_all" ON addresses;
CREATE POLICY "addresses_own_all" ON addresses
    FOR ALL USING (auth.uid() = user_id);

-- 2. MODIFY ORDERS TABLE
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'COD';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(50) DEFAULT 'DELIVERY' CHECK (delivery_method IN ('DELIVERY', 'PICKUP'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_slot VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0;
