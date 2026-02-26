/**
 * Supabase public configuration.
 *
 * These values are PUBLIC by design — the anon key is meant to be exposed
 * in the browser and is safe to commit. They gate access via RLS policies,
 * not by secrecy.
 *
 * Environment variables take precedence when available (local dev, CI, etc.).
 * The hardcoded fallbacks guarantee the client works inside Docker builds
 * that don't inject NEXT_PUBLIC_ build args.
 */

export const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://epjdtzthclreymdlboyl.supabase.co'

export const SUPABASE_ANON_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwamR0enRoY2xyZXltZGxib3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjM0OTUsImV4cCI6MjA4NzQzOTQ5NX0.f3KDmUC7eD9_taGEnjlOPWWEEf7DEuYfD-2g0sXZKuU'
