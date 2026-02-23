-- Migration: 0004_photos_schema
-- Created: 2026-02-23
-- Description: Task 3A — Photos table + Supabase Storage bucket setup

-- Photos table: core media entity
CREATE TABLE public.photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Storage paths in Supabase Storage
    storage_path TEXT NOT NULL,          -- e.g. family-photos/{family_id}/{uuid}.jpg
    thumbnail_path TEXT,                 -- e.g. family-thumbs/{family_id}/{uuid}_thumb.jpg

    -- Rich metadata
    original_filename TEXT,
    width INTEGER,
    height INTEGER,
    size_bytes INTEGER,
    mime_type TEXT DEFAULT 'image/jpeg',

    -- EXIF / temporal
    taken_at TIMESTAMP WITH TIME ZONE,   -- from EXIF or user input
    captured_year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM taken_at)::INTEGER) STORED,

    -- Source
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'google_photos')),
    google_photos_id TEXT,               -- idempotency for 3C
    
    -- Soft delete / archival
    is_deleted BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Prevent duplicate Google Photos imports
    UNIQUE(family_id, google_photos_id)
);

-- updated_at trigger
CREATE TRIGGER update_photos_modtime 
    BEFORE UPDATE ON public.photos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Members can view photos from their family
CREATE POLICY "Family members can view photos" ON public.photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id = photos.family_id 
            AND members.profile_id = auth.uid()
        )
    );

-- Contributors and Admins can upload photos
CREATE POLICY "Contributors can insert photos" ON public.photos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id = photos.family_id 
            AND members.profile_id = auth.uid()
            AND members.role IN ('admin', 'contributor')
        )
    );

-- Only uploader or admin can soft-delete/update
CREATE POLICY "Uploader or admin can update photos" ON public.photos
    FOR UPDATE USING (
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id = photos.family_id 
            AND members.profile_id = auth.uid()
            AND members.role = 'admin'
        )
    );

-- Useful indexes
CREATE INDEX photos_family_id_taken_at_idx ON public.photos (family_id, taken_at DESC NULLS LAST);
CREATE INDEX photos_source_idx ON public.photos (source) WHERE source = 'google_photos';

CREATE OR REPLACE FUNCTION public.photos_set_captured_year()
RETURNS TRIGGER AS $$
BEGIN
  NEW.captured_year := CASE
    WHEN NEW.taken_at IS NULL THEN NULL
    ELSE EXTRACT(YEAR FROM NEW.taken_at)::INT
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_photos_set_captured_year ON public.photos;
CREATE TRIGGER trg_photos_set_captured_year
BEFORE INSERT OR UPDATE OF taken_at ON public.photos
FOR EACH ROW
EXECUTE FUNCTION public.photos_set_captured_year();
