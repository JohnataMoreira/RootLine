-- Migration: 0014_add_photo_description
-- Created: 2026-02-24
-- Description: Adds description column to photos table.

ALTER TABLE public.photos ADD COLUMN description TEXT;
