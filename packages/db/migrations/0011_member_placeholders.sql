-- Migration: 0011_member_placeholders
-- Created: 2026-02-24
-- Description: Adds support for placeholder members (relatives without app accounts)

-- 1. Add placeholder_name to members
ALTER TABLE public.members ADD COLUMN placeholder_name TEXT;

-- 2. Update the policy to allow inserting placeholder members.
-- We want to allow contributors and admins to add placeholder members (profile_id IS NULL) to their family.
-- If it's a real user join, it usually has profile_id = auth.uid() OR is done by an admin.

CREATE POLICY "Members can insert placeholders" ON public.members
    FOR INSERT WITH CHECK (
        profile_id IS NULL AND
        EXISTS (
            SELECT 1 FROM public.members admin_check
            WHERE admin_check.family_id = members.family_id 
            AND admin_check.profile_id = auth.uid() 
            AND admin_check.role IN ('admin', 'contributor')
        )
    );
