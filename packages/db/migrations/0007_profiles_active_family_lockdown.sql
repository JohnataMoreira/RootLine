-- Migration: 0007_profiles_active_family_lockdown
-- Created: 2026-02-23
-- Description: Restrict direct updates to active_family_id, forcing use of set_active_family RPC.

-- 1. Revoke general update permission on the sensitive column from authenticated users
-- This prevents direct bypass via supabase.from('profiles').update({ active_family_id: '...' })
REVOKE UPDATE (active_family_id) ON public.profiles FROM authenticated, anon;

-- 2. Explicitly grant update permission on other profile fields to ensure functionality persists
-- (e.g., for future settings/profile edit page)
GRANT UPDATE (full_name, avatar_url, updated_at) ON public.profiles TO authenticated;

-- NOTE: The set_active_family RPC is defined with SECURITY DEFINER, 
-- so it bypasses these column-level restrictions by running as the owner (postgres).
