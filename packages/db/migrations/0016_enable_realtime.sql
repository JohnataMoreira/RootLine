-- Migration: 0016_enable_realtime
-- Description: Enables Supabase Realtime for the photos table to support instant timeline updates.

-- 1. Create the publication if it doesn't exist (Supabase usually has 'supabase_realtime')
-- 2. Add the photos table to the publication
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;

-- 3. Ensure REPLICA IDENTITY is set to DEFAULT (or FULL if we need old values, but DEFAULT is enough for INSERTS)
ALTER TABLE public.photos REPLICA IDENTITY DEFAULT;
