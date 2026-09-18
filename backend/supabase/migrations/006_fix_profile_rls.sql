-- 006_fix_profile_rls.sql
-- Create a trigger to prevent unauthorized role escalation

-- 1. Create the function that validates role changes
CREATE OR REPLACE FUNCTION public.prevent_role_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If the role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Check if the current user has the service_role claim
    IF current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role' THEN
       -- Allow the change for service role
       RETURN NEW;
    END IF;
    -- Otherwise, reject the change
    RAISE EXCEPTION 'Not authorized to change role';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to the profiles table
DROP TRIGGER IF EXISTS tr_prevent_role_update ON public.profiles;

CREATE TRIGGER tr_prevent_role_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_update();
