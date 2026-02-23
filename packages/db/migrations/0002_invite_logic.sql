-- Migration: 0002_invite_logic
-- Created: 2026-02-23
-- Description: Adjustments for Task 2.3 (Join via Link)

-- 1. invites: avoid duplicated pending invites per family/email
CREATE UNIQUE INDEX invites_family_email_pending_idx ON public.invites (family_id, invited_email) WHERE status = 'pending';

-- 2. invites SELECT: restrict listing to admins
DROP POLICY IF EXISTS "View family invites" ON public.invites;
CREATE POLICY "View family invites" ON public.invites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id = invites.family_id 
            AND members.profile_id = auth.uid()
            AND members.role = 'admin'
        )
    );

-- 3. relationships RLS: replacing FOR ALL USING with explicit WITH CHECK
DROP POLICY IF EXISTS "Contributors and Admins can alter relationships" ON public.relationships;

CREATE POLICY "Contributors and Admins can insert relationships" ON public.relationships
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id = relationships.family_id 
            AND members.profile_id = auth.uid()
            AND members.role IN ('admin', 'contributor')
        )
    );

CREATE POLICY "Contributors and Admins can update relationships" ON public.relationships
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id = relationships.family_id 
            AND members.profile_id = auth.uid()
            AND members.role IN ('admin', 'contributor')
        )
    );

CREATE POLICY "Contributors and Admins can delete relationships" ON public.relationships
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id = relationships.family_id 
            AND members.profile_id = auth.uid()
            AND members.role IN ('admin', 'contributor')
        )
    );

-- 4. Atomic RPC to accept invite securely
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
        RAISE EXCEPTION 'Invalid, expired, or already used invite.';
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
