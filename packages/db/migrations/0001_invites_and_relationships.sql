-- Migration: 0001_invites_and_relationships
-- Created: 2026-02-23
-- Description: Adds invites and relationships tables defined in ADR 005.

-- 4. Invites Table
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'expired');

CREATE TABLE public.invites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
    invited_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    invited_email TEXT NOT NULL,
    role member_role DEFAULT 'contributor' NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    status invite_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now() + interval '7 days') NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

-- 5. Relationships Table (Minimal Tree Logic)
CREATE TYPE relation_type AS ENUM ('parent_child', 'spouse');

CREATE TABLE public.relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
    member_a_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    member_b_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    type relation_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Prevent exact duplicates
    UNIQUE(member_a_id, member_b_id, type)
);

-- RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

-- Invites: users can insert invites for their family if admin
CREATE POLICY "Admins can create invites" ON public.invites
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id = invites.family_id 
            AND members.profile_id = auth.uid() 
            AND members.role = 'admin'
        )
    );

-- Invites: users can view invites for their family
CREATE POLICY "View family invites" ON public.invites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id = invites.family_id 
            AND members.profile_id = auth.uid()
        )
    );

-- Relationships: Anyone in the family can view relationships
CREATE POLICY "View family relationships" ON public.relationships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id = relationships.family_id 
            AND members.profile_id = auth.uid()
        )
    );

-- Relationships: Only Contributors and Admins can mutate relationships (Tree building)
CREATE POLICY "Contributors and Admins can alter relationships" ON public.relationships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id = relationships.family_id 
            AND members.profile_id = auth.uid()
            AND members.role IN ('admin', 'contributor')
        )
    );
