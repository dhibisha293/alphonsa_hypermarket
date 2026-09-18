-- ============================================================
-- 005_admin_roles.sql
-- Add role column to profiles table for Admin Dashboard
-- ============================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer'
CHECK (role IN ('customer', 'admin'));
