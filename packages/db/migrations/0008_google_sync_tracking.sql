-- Migration: 0008_google_sync_tracking
-- Created: 2026-02-23
-- Description: Tracking for Google Photos synchronization runs and pagination cursors.

-- 1. Table to track each synchronization attempt
CREATE TABLE public.google_sync_runs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    status TEXT NOT NULL CHECK (status IN ('running', 'success', 'error', 'partial')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE,
    
    imported_count INTEGER DEFAULT 0 NOT NULL,
    skipped_count INTEGER DEFAULT 0 NOT NULL,
    error_message TEXT,
    
    -- Metadata about the run (e.g. batch size, reason)
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Table to store the pagination cursor (nextPageToken) for incremental sync
-- We store this per profile/family combo (since tokens are user-scoped but context is family-scoped)
CREATE TABLE public.google_sync_cursors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    next_page_token TEXT,
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure one cursor per family+profile
    UNIQUE(family_id, profile_id)
);

-- Index for performance
CREATE INDEX idx_google_sync_runs_family ON public.google_sync_runs(family_id);
CREATE INDEX idx_google_sync_runs_profile ON public.google_sync_runs(profile_id);

-- Enable RLS
ALTER TABLE public.google_sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_sync_cursors ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see their own runs and cursors
CREATE POLICY "Users can view their own sync runs" ON public.google_sync_runs
    FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can view their own sync cursors" ON public.google_sync_cursors
    FOR SELECT USING (profile_id = auth.uid());

-- Worker/System will likely run with service_role, bypassing RLS. 
-- In the app/UI, we only allow SELECT. Any writes should happen via RPC/Actions.
