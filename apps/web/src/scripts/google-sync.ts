import { createClient } from '@supabase/supabase-js'
import {
    refreshGoogleAccessToken,
    syncGooglePhotosBatch
} from '../utils/google-photos'

/**
 * Background Sync Worker for Google Photos
 * 
 * Usage: npx tsx src/scripts/google-sync.ts
 * 
 * This script runs with the SUPABASE_SERVICE_ROLE_KEY to perform system-level
 * synchronization for all connected Google Photos accounts.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function runSync() {
    console.log('--- Starting Google Photos Background Sync ---')

    // 1. Fetch all profiles that have Google tokens
    const { data: accounts, error: accountError } = await supabase
        .from('google_photo_tokens')
        .select('profile_id, access_token, refresh_token, token_expiry')

    if (accountError) {
        console.error('Failed to fetch connected accounts:', accountError)
        return
    }

    console.log(`Found ${accounts.length} connected accounts.`)

    for (const account of accounts) {
        const profileId = account.profile_id
        console.log(`\n[Profile: ${profileId}] Processing...`)

        // 2. Fetch all families this user belongs to as admin/contributor
        const { data: memberships } = await supabase
            .from('members')
            .select('family_id, role')
            .eq('profile_id', profileId)
            .in('role', ['admin', 'contributor'])

        if (!memberships || memberships.length === 0) {
            console.log(`[Profile: ${profileId}] No eligible family memberships found. Skipping.`)
            continue
        }

        // 3. Refresh token if needed
        let accessToken = account.access_token
        const isExpired = new Date(account.token_expiry) <= new Date(Date.now() + 60_000)

        if (isExpired) {
            console.log(`[Profile: ${profileId}] Token expired. Refreshing...`)
            const refreshed = await refreshGoogleAccessToken(account.refresh_token)
            if (!refreshed) {
                console.error(`[Profile: ${profileId}] Failed to refresh token. User might have revoked access.`)
                continue
            }
            accessToken = refreshed.access_token
            const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()

            await supabase
                .from('google_photo_tokens')
                .update({ access_token: accessToken, token_expiry: newExpiry })
                .eq('profile_id', profileId)
        }

        // 4. Sync for each family
        for (const membership of memberships) {
            const familyId = membership.family_id
            console.log(`  [Family: ${familyId}] Syncing batch...`)

            // Get current cursor
            const { data: cursor } = await supabase
                .from('google_sync_cursors')
                .select('next_page_token')
                .eq('family_id', familyId)
                .eq('profile_id', profileId)
                .single()

            // Start Run log
            const { data: run } = await supabase
                .from('google_sync_runs')
                .insert({
                    family_id: familyId,
                    profile_id: profileId,
                    status: 'running',
                    metadata: { trigger: 'background_worker' }
                })
                .select('id')
                .single()

            // Perform Sync
            const result = await syncGooglePhotosBatch(supabase, {
                profileId,
                familyId,
                accessToken,
                pageSize: 100, // standard batch size
                pageToken: cursor?.next_page_token || undefined
            })

            // Update state
            if (!result.error) {
                await supabase
                    .from('google_sync_cursors')
                    .upsert({
                        family_id: familyId,
                        profile_id: profileId,
                        next_page_token: result.nextPageToken,
                        last_sync_at: new Date().toISOString()
                    }, { onConflict: 'family_id, profile_id' })

                if (run) {
                    await supabase
                        .from('google_sync_runs')
                        .update({
                            status: 'success',
                            finished_at: new Date().toISOString(),
                            imported_count: result.imported,
                            skipped_count: result.skipped
                        })
                        .eq('id', run.id)
                }
                console.log(`    Successfully imported ${result.imported} items (${result.skipped} skipped).`)
            } else {
                if (run) {
                    await supabase
                        .from('google_sync_runs')
                        .update({
                            status: 'error',
                            finished_at: new Date().toISOString(),
                            error_message: result.error
                        })
                        .eq('id', run.id)
                }
                console.error(`    Sync failed for family ${familyId}:`, result.error)
            }

            // Subtle backoff between families/batches to avoid rate limiting
            await new Promise(r => setTimeout(r, 1000))
        }
    }

    console.log('\n--- Sync complete ---')
}

runSync().catch((err) => {
    console.error('Fatal worker error:', err)
    process.exit(1)
})
