-- Migration: 0005_google_tokens
-- Created: 2026-02-23
-- Description: Task 3C — Secure vault for Google Photos OAuth tokens per user

-- Store Google OAuth tokens per profile (NOT per family — tokens are user-scoped)
CREATE TABLE public.google_photo_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Encrypted tokens (note: Supabase does NOT encrypt at rest by default;
    -- production hardening should use PG pgcrypto or a secrets manager.
    -- For MVP, tokens are protected by RLS only — no user can read another's tokens.)
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
    
    scope TEXT,                          -- recorded scope granted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.google_photo_tokens ENABLE ROW LEVEL SECURITY;

-- Each user can only read and write their own tokens
CREATE POLICY "Own token access only" ON public.google_photo_tokens
    FOR ALL USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

CREATE TRIGGER update_google_tokens_modtime 
    BEFORE UPDATE ON public.google_photo_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
