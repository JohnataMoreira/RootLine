-- Migration: 0012_storage_bucket
-- Created: 2026-02-24
-- Description: Creates the 'family-photos' storage bucket and sets up RLS policies for it.

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('family-photos', 'family-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Objects RLS

-- Family members can view photos
CREATE POLICY "Family members can view photos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'family-photos' AND
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id::text = (string_to_array(name, '/'))[2]
            AND members.profile_id = auth.uid()
        )
    );

-- Contributors and Admins can upload photos
CREATE POLICY "Contributors can upload photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'family-photos' AND
        EXISTS (
            SELECT 1 FROM public.members
            WHERE members.family_id::text = (string_to_array(name, '/'))[2]
            AND members.profile_id = auth.uid()
            AND members.role IN ('admin', 'contributor')
        )
    );

-- Uploader or admin can update photos
CREATE POLICY "Uploader or admin can update photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'family-photos' AND
        (
            owner = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.members
                WHERE members.family_id::text = (string_to_array(name, '/'))[2]
                AND members.profile_id = auth.uid()
                AND members.role = 'admin'
            )
        )
    );

-- Uploader or admin can delete photos
CREATE POLICY "Uploader or admin can delete photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'family-photos' AND
        (
            owner = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.members
                WHERE members.family_id::text = (string_to_array(name, '/'))[2]
                AND members.profile_id = auth.uid()
                AND members.role = 'admin'
            )
        )
    );
