-- Migration: 0000_initial_schema
-- Created: 2026-02-23
-- Description: Sets up the base Foundation (Profiles, Families, Members) and Tenant RLS.

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
-- Maps to auth.users (Supabase native auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Families Table (Tenants)
CREATE TABLE public.families (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subscription_plan TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Members Table (Tenant Pivots)
-- Connects a profile to a family with a specific role
CREATE TYPE member_role AS ENUM ('admin', 'contributor', 'viewer');

CREATE TABLE public.members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Can be null if invited but not registered yet
    role member_role DEFAULT 'contributor' NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(family_id, profile_id)
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES FOR TENANT ISOLATION
-- ==========================================

-- PROFILES
-- Users can read profiles of anyone in the same family
CREATE POLICY "Profiles are viewable by family members" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members m1
            JOIN public.members m2 ON m1.family_id = m2.family_id
            WHERE m1.profile_id = auth.uid() AND m2.profile_id = profiles.id
        )
        OR id = auth.uid()
    );

-- Users can update their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- FAMILIES (TENANTS)
-- Users can select families they are a member of
CREATE POLICY "Families are viewable by members" ON public.families
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id = families.id AND members.profile_id = auth.uid()
        )
    );

-- Any authenticated user can create a family (they become creator)
CREATE POLICY "Authenticated users can create families" ON public.families
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only admins can update their family
CREATE POLICY "Admins can update family" ON public.families
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id = families.id 
            AND members.profile_id = auth.uid() 
            AND members.role = 'admin'
        )
    );

-- MEMBERS
-- Members can view other members in the same family
CREATE POLICY "Members are viewable by co-members" ON public.members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members m2
            WHERE m2.family_id = members.family_id AND m2.profile_id = auth.uid()
        )
    );

-- Only admins can insert/update/delete members in their family
CREATE POLICY "Admins can manage members" ON public.members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.members m2
            WHERE m2.family_id = members.family_id 
            AND m2.profile_id = auth.uid() 
            AND m2.role = 'admin'
        )
    );

-- Exception: A user can insert themselves as a creator when making a new family, 
-- or a trigger could handle this. For now, allow insert if they are the creator of the family.
CREATE POLICY "Family creators can insert themselves as admin" ON public.members
    FOR INSERT WITH CHECK (
        profile_id = auth.uid() AND role = 'admin' AND
        EXISTS (
            SELECT 1 FROM public.families
            WHERE id = family_id AND created_by = auth.uid()
        )
    );

-- Functions & Triggers: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_families_modtime BEFORE UPDATE ON public.families FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
