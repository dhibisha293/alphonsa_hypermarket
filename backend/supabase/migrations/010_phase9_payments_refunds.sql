-- ============================================================
-- Migration 010: Phase 9 — Payments & Refunds
-- Adds refund tracking columns to orders table
-- Safe to run multiple times (IF NOT EXISTS / IF column does not exist)
-- ============================================================

-- Add refund/payment tracking columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_status  VARCHAR(30) CHECK (refund_status IN ('NONE','REQUESTED','PROCESSING','COMPLETED','REJECTED')) DEFAULT 'NONE';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_reason  TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at    TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount  NUMERIC(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_by   VARCHAR(30) CHECK (cancelled_by IN ('CUSTOMER','ADMIN'));

-- Index for admin refund queue
CREATE INDEX IF NOT EXISTS idx_orders_refund_status ON orders(refund_status) WHERE refund_status != 'NONE';
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
