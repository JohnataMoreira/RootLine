-- Migration: 0003_rpc_hardening
-- Created: 2026-02-23
-- Description: Security hardening for accept_invite_by_token RPC.
-- Applies:
--   1) search_path fixed on SECURITY DEFINER function
--   2) invited_email match against JWT email checked (see ADR note below)

-- NOTE on email match feasibility:
-- auth.email() is NOT available in Supabase PG by default in all plan tiers.
-- JWT email is accessible via: (auth.jwt() ->> 'email')
-- This is available and we CAN validate it.

CREATE OR REPLACE FUNCTION accept_invite_by_token(p_token_hash TEXT)
RETURNS UUID AS $$
DECLARE
    v_invite RECORD;
    v_profile_id UUID;
    v_user_email TEXT;
    v_existing_member BOOLEAN;
BEGIN
    v_profile_id := auth.uid();
    v_user_email := (auth.jwt() ->> 'email');
    
    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Select the pending invite and lock it for update
    SELECT * INTO v_invite 
    FROM public.invites 
    WHERE token_hash = p_token_hash 
      AND status = 'pending' 
      AND expires_at > timezone('utc'::text, now())
      AND used_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid, expired, or already used invite.';
    END IF;

    -- SECURITY: Validate that the authenticated user email matches the invited email
    -- This prevents token-forwarding attacks where user A forwards their invite link to user B
    IF lower(v_user_email) != lower(v_invite.invited_email) THEN
        RAISE EXCEPTION 'This invitation was sent to a different email address. Please sign in with the correct account.';
    END IF;

    -- Check if user is already a member of this family
    SELECT EXISTS (
        SELECT 1 FROM public.members 
        WHERE family_id = v_invite.family_id AND profile_id = v_profile_id
    ) INTO v_existing_member;

    IF v_existing_member THEN
        -- Already a member, just expire the invite
        UPDATE public.invites 
        SET status = 'accepted', used_at = timezone('utc'::text, now()) 
        WHERE id = v_invite.id;
        RETURN v_invite.family_id;
    END IF;

    -- Insert new member
    INSERT INTO public.members (family_id, profile_id, role)
    VALUES (v_invite.family_id, v_profile_id, v_invite.role);

    -- Mark invite as used
    UPDATE public.invites 
    SET status = 'accepted', used_at = timezone('utc'::text, now()) 
    WHERE id = v_invite.id;

    RETURN v_invite.family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
