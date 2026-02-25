'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getActiveFamily } from '@/utils/active-family'
import {
    refreshGoogleAccessToken,
    syncGooglePhotosBatch
} from '@/utils/google-photos'

const IMPORT_LIMIT = parseInt(process.env.GOOGLE_IMPORT_LIMIT ?? '100', 10)

export async function importFromGooglePhotos(): Promise<{
    success?: boolean
    imported?: number
    skipped?: number
    error?: string
}> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Get active family + contributor/admin check
    const { familyId, role } = await getActiveFamily(supabase)

    if (!['admin', 'contributor'].includes(role)) {
        return { error: 'You do not have permission to import photos' }
    }

    // 1. Fetch tokens and current cursor
    const { data: tokenRow } = await supabase
        .from('google_photo_tokens')
        .select('access_token, refresh_token, token_expiry')
        .eq('profile_id', user.id)
        .single()

    if (!tokenRow) {
        return { error: 'Google Photos not connected. Please connect first.' }
    }

    const { data: cursorRow } = await supabase
        .from('google_sync_cursors')
        .select('next_page_token')
        .eq('family_id', familyId)
        .eq('profile_id', user.id)
        .single()

    // 2. Refresh token if needed
    let accessToken = tokenRow.access_token
    const isExpired = new Date(tokenRow.token_expiry) <= new Date(Date.now() + 60_000)

    if (isExpired) {
        const refreshed = await refreshGoogleAccessToken(tokenRow.refresh_token)
        if (!refreshed) {
            return { error: 'Google session expired. Please reconnect Google Photos.' }
        }
        accessToken = refreshed.access_token
        const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()

        await supabase
            .from('google_photo_tokens')
            .update({ access_token: accessToken, token_expiry: newExpiry })
            .eq('profile_id', user.id)
    }

    // 3. Start Sync Run log
    const { data: run, error: runError } = await supabase
        .from('google_sync_runs')
        .insert({
            family_id: familyId,
            profile_id: user.id,
            status: 'running',
            metadata: { trigger: 'manual_ui' }
        })
        .select('id')
        .single()

    if (runError) {
        console.error('Failed to create sync run log:', runError)
    }

    // 4. Perform the sync batch
    const result = await syncGooglePhotosBatch(supabase, {
        profileId: user.id,
        familyId,
        accessToken,
        pageSize: IMPORT_LIMIT,
        pageToken: cursorRow?.next_page_token || undefined
    })

    // 5. Update cursor and finalize run log
    if (!result.error) {
        // Update cursor for next time
        await supabase
            .from('google_sync_cursors')
            .upsert({
                family_id: familyId,
                profile_id: user.id,
                next_page_token: result.nextPageToken,
                last_sync_at: new Date().toISOString()
            }, { onConflict: 'family_id, profile_id' })

        // Update run log to success
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
    } else if (run) {
        // Update run log to error
        await supabase
            .from('google_sync_runs')
            .update({
                status: 'error',
                finished_at: new Date().toISOString(),
                error_message: result.error
            })
            .eq('id', run.id)
    }

    revalidatePath('/photos')
    return result
}
