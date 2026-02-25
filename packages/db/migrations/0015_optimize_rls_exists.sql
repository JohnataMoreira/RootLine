-- Migration: 0015_optimize_rls_exists
-- Description: Optimizes RLS policies mapping to using EXISTS for better performance at scale.

-- 1. Redefine verification functions to be even leaner
CREATE OR REPLACE FUNCTION public.is_member_of(f_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.members 
        WHERE family_id = f_id AND profile_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_of(f_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.members 
        WHERE family_id = f_id AND profile_id = auth.uid() AND role = 'admin'
    );
$$;

-- 2. Apply Optimized Policies to Photos
DROP POLICY IF EXISTS "Photos are viewable by family members" ON public.photos;
CREATE POLICY "Photos are viewable by family members v2" ON public.photos
    FOR SELECT USING (public.is_member_of(family_id));

DROP POLICY IF EXISTS "Members can upload photos" ON public.photos;
CREATE POLICY "Members can upload photos v2" ON public.photos
    FOR INSERT WITH CHECK (
        public.is_member_of(family_id) 
        AND (SELECT role FROM public.members WHERE family_id = photos.family_id AND profile_id = auth.uid()) IN ('admin', 'contributor')
    );

-- 3. Optimized Profiles View Policy
DROP POLICY IF EXISTS "Profiles are viewable by co-members" ON public.profiles;
CREATE POLICY "Profiles are viewable by co-members v2" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members m1
            JOIN public.members m2 ON m1.family_id = m2.family_id
            WHERE m1.profile_id = auth.uid() AND m2.profile_id = profiles.id
        )
    );
