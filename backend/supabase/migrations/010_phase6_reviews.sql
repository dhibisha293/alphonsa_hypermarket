-- ============================================================
-- 010_phase6_reviews.sql
-- Alphonsa Hypermarket — Product Reviews & Ratings
-- Run this manually in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- TABLE: reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title       VARCHAR(150),
    body        TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- One review per product per customer
    UNIQUE(user_id, product_id)
);

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS: reviews
-- ============================================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can only read approved reviews
CREATE POLICY "reviews_public_read_approved"
    ON reviews FOR SELECT
    USING (status = 'approved');

-- Authenticated users can insert their own reviews
CREATE POLICY "reviews_own_insert"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews (e.g., edit before approval)
CREATE POLICY "reviews_own_update"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "reviews_own_delete"
    ON reviews FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- INDEX: reviews
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================================
-- NOTE: products.rating and products.reviews_count already exist.
-- These will be updated by the FastAPI backend after each review
-- status change (approve/reject). No trigger needed here.
-- ============================================================
