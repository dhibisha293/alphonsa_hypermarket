-- ============================================================
-- MIGRATION: 002_loyalty_points
-- Description: Adds loyalty_points to the profiles table
-- ============================================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS loyalty_points INTEGER NOT NULL DEFAULT 0;

-- Optional: Add a check constraint to ensure points don't go negative
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_name = 'profiles_loyalty_points_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_loyalty_points_check CHECK (loyalty_points >= 0);
  END IF;
END $$;
