-- Migration: 0009_fix_rls_recursion
-- Created: 2026-02-23
-- Description: Replaces recursive RLS policies on family tables with SECURITY DEFINER functions to prevent infinite recursion bugs during member insertion/verification.

-- 1. Create SECURITY DEFINER functions
-- These run as the schema owner and bypass RLS on the members table itself.
CREATE OR REPLACE FUNCTION public.get_user_family_ids()
RETURNS TABLE (family_id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT m.family_id FROM public.members m WHERE m.profile_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_admin_family_ids()
RETURNS TABLE (family_id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT m.family_id FROM public.members m WHERE m.profile_id = auth.uid() AND m.role = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.get_user_contributor_family_ids()
RETURNS TABLE (family_id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT m.family_id FROM public.members m WHERE m.profile_id = auth.uid() AND m.role IN ('admin', 'contributor');
$$;

-- 2. Refactor `families` policies
DROP POLICY IF EXISTS "Families are viewable by members" ON public.families;
DROP POLICY IF EXISTS "Admins can update family" ON public.families;

CREATE POLICY "Families are viewable by members v2" ON public.families
    FOR SELECT USING (
        id IN (SELECT f.family_id FROM public.get_user_family_ids() f)
        OR created_by = auth.uid() -- Allows creator to see the family immediately after creation (before member row exists)
    );

CREATE POLICY "Admins can update family v2" ON public.families
    FOR UPDATE USING (
        id IN (SELECT f.family_id FROM public.get_user_admin_family_ids() f)
    );

-- 3. Refactor `members` policies
DROP POLICY IF EXISTS "Members are viewable by co-members" ON public.members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.members;
DROP POLICY IF EXISTS "Family creators can insert themselves as admin" ON public.members;

CREATE POLICY "Members are viewable by co-members v2" ON public.members
    FOR SELECT USING (
        family_id IN (SELECT f.family_id FROM public.get_user_family_ids() f)
    );

CREATE POLICY "Admins can manage members v2" ON public.members
    FOR ALL USING (
        family_id IN (SELECT f.family_id FROM public.get_user_admin_family_ids() f)
    );

CREATE POLICY "Family creators can insert themselves as admin v2" ON public.members
    FOR INSERT WITH CHECK (
        profile_id = auth.uid() 
        AND role = 'admin' 
        AND exists (
            SELECT 1 FROM public.families f
            WHERE f.id = members.family_id 
            AND f.created_by = auth.uid()
        )
    );

-- 4. Refactor `invites` policies
DROP POLICY IF EXISTS "Admins can create invites" ON public.invites;
DROP POLICY IF EXISTS "View family invites" ON public.invites;

CREATE POLICY "Admins can create invites v2" ON public.invites
    FOR INSERT WITH CHECK (
        family_id IN (SELECT f.family_id FROM public.get_user_admin_family_ids() f)
    );

CREATE POLICY "View family invites v2" ON public.invites
    FOR SELECT USING (
        family_id IN (SELECT f.family_id FROM public.get_user_family_ids() f)
    );

-- 5. Refactor `relationships` policies
DROP POLICY IF EXISTS "View family relationships" ON public.relationships;
DROP POLICY IF EXISTS "Contributors and Admins can alter relationships" ON public.relationships;

CREATE POLICY "View family relationships v2" ON public.relationships
    FOR SELECT USING (
        family_id IN (SELECT f.family_id FROM public.get_user_family_ids() f)
    );

CREATE POLICY "Contributors and Admins can alter relationships v2" ON public.relationships
    FOR ALL USING (
        family_id IN (SELECT f.family_id FROM public.get_user_contributor_family_ids() f)
    );
