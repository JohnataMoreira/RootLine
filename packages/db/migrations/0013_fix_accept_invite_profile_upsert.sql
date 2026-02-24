-- Migration: 0013_fix_accept_invite_profile_upsert
-- Created: 2026-02-24
-- Description: Fixes the foreign key constraint error when accepting an invite by ensuring a profile exists for the user.

CREATE OR REPLACE FUNCTION accept_invite_by_token(p_token_hash TEXT)
RETURNS UUID AS $$
DECLARE
    v_invite RECORD;
    v_profile_id UUID;
    v_existing_member BOOLEAN;
BEGIN
    v_profile_id := auth.uid();
    
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
        RAISE EXCEPTION 'Convite inválido, expirado ou já utilizado.';
    END IF;

    -- Ensure the profile exists to prevent foreign key errors on 'members'
    INSERT INTO public.profiles (id, full_name)
    SELECT v_profile_id, split_part(v_invite.invited_email, '@', 1)
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_profile_id);

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
$$ LANGUAGE plpgsql SECURITY DEFINER;
