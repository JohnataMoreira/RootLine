-- Migration: Add description to photos table
ALTER TABLE public.photos ADD COLUMN description TEXT;
