-- Migration: 0006_multi_family
-- Created: 2026-02-23
-- Description: Multi-family support — profiles.active_family_id + RPC set_active_family

-- 1. Add active_family_id to profiles
ALTER TABLE public.profiles
    ADD COLUMN active_family_id UUID REFERENCES public.families(id) ON DELETE SET NULL;

-- 2. Secure RPC to switch active family with membership validation
CREATE OR REPLACE FUNCTION set_active_family(p_family_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Validate the requesting user is a member of the target family
    IF NOT EXISTS (
        SELECT 1 FROM public.members
        WHERE family_id = p_family_id AND profile_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Not a member of this family';
    END IF;

    UPDATE public.profiles
        SET active_family_id = p_family_id,
            updated_at = timezone('utc'::text, now())
        WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 3. Update the existing "own profile" RLS policies to allow reading active_family_id
-- (already covered by existing profiles SELECT policy — no change needed)

-- 4. Allow users to update their own active_family_id ONLY via the RPC above.
-- Direct UPDATE via client should remain blocked. No new policy needed since
-- the SECURITY DEFINER RPC bypasses RLS with elevated rights.

-- Index for fast lookup
CREATE INDEX profiles_active_family_idx ON public.profiles (active_family_id) WHERE active_family_id IS NOT NULL;
