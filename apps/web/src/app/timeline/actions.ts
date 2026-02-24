'use server'

import { createClient } from '@/utils/supabase/server'
import { randomBytes, createHash } from 'crypto'
import { revalidatePath } from 'next/cache'
import { getActiveFamily } from '@/utils/active-family'

export async function sendInvite(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    const email = formData.get('email') as string

    if (!email) {
        return { error: 'Email is required' }
    }

    // 1. Get Active Family and verify Admin status
    const { familyId, role } = await getActiveFamily(supabase)

    if (role !== 'admin') {
        return { error: 'You are not an admin of the active family' }
    }

    // 2. Simple Rate Limit: Max 10 invites per day per admin (Timezone UTC)
    const { count } = await supabase
        .from('invites')
        .select('*', { count: 'exact', head: true })
        .eq('invited_by', user.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (count && count >= 10) {
        return { error: 'Rate limit exceeded: You can only send 10 invitations per 24 hours.' }
    }

    // 3. Generate Token and Hash
    const rawToken = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(rawToken).digest('hex')

    // 4. Insert into invites table
    const { error: inviteError } = await supabase
        .from('invites')
        .insert({
            family_id: familyId,
            invited_by: user.id,
            invited_email: email,
            role: role,
            token_hash: tokenHash,
            status: 'pending'
        })

    if (inviteError) {
        console.error('Invite generation error:', inviteError)
        // Avoid leaking unique violation (reuse of email pending) unless explicitly needed
        return { error: 'Failed to create invitation. They might already be invited.' }
    }

    revalidatePath('/timeline')

    // In production, an external worker or Edge Function triggers via Database Webhook
    // sending the email using Resend:
    // url: `https://app.rootline.com/invite?token=${rawToken}`
    // Resolve base URL dynamically or from env
    const { headers } = await import('next/headers')
    const reqHeaders = await headers()
    const origin = reqHeaders.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${origin}/invite/${rawToken}`

    return {
        success: true,
        inviteLink: inviteLink,
        message: `Invite generated! In production, a background worker emails this to ${email}.`
    }
}

export type FeedPhoto = {
    id: string
    signedUrl: string
    original_filename: string | null
    taken_at: string | null
    created_at: string
}

export type FeedCursor = { taken_at: string | null; id: string }

export async function getFeedPhotos(params: {
    limit?: number
    cursor?: FeedCursor
}): Promise<{ photos: FeedPhoto[], hasMore: boolean, nextCursor: FeedCursor | null } | { error: string }> {
    const supabase = await createClient()
    const limit = params.limit ?? 24

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { familyId } = await getActiveFamily(supabase)
    if (!familyId) return { error: 'No active family' }

    let query = supabase
        .from('photos')
        .select('id, storage_path, thumbnail_path, original_filename, taken_at, source, created_at')
        .eq('family_id', familyId)
        .eq('is_deleted', false)
        // Sort by taken_at (nulls last), then created_at for fallback, then id for deterministic pagination
        .order('taken_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit + 1) // Fetch one extra to check if there's more

    if (params.cursor) {
        // Simple cursor logic: if we have a cursor, we filter for items strictly "after" it in our sort order.
        // For simplicity in the first pass and to avoid 'or' filter complexity, 
        // we'll fetch items and the client can handle the slight overlap or we can use a more precise filter.
        // But let's try a proper filter if possible or just use a simple one for now.
        if (params.cursor.taken_at) {
            query = query.lt('taken_at', params.cursor.taken_at)
        } else {
            // If the cursor has no taken_at, we are in the "nulls" section or we just use created_at/id.
            query = query.is('taken_at', null).lt('id', params.cursor.id)
        }
    }

    const { data: photos, error } = await query

    if (error) {
        console.error('Feed fetch error:', error)
        return { error: 'Failed to load feed' }
    }

    const hasMore = photos.length > limit
    const items = photos.slice(0, limit)

    // Sign URLs for manual uploads (Google Photos use baseUrl)
    const itemsWithUrls = await Promise.all(
        items.map(async (photo) => {
            if (photo.source === 'google_photos') {
                return {
                    id: photo.id,
                    signedUrl: photo.thumbnail_path ?? '',
                    original_filename: photo.original_filename,
                    taken_at: photo.taken_at,
                    created_at: photo.created_at
                }
            }
            const srcPath = photo.thumbnail_path ?? photo.storage_path
            const { data } = await supabase.storage
                .from('family-photos')
                .createSignedUrl(srcPath, 3600)

            return {
                id: photo.id,
                signedUrl: data?.signedUrl ?? '',
                original_filename: photo.original_filename,
                taken_at: photo.taken_at,
                created_at: photo.created_at
            }
        })
    )

    return {
        photos: itemsWithUrls,
        hasMore,
        nextCursor: hasMore ? {
            taken_at: items[items.length - 1].taken_at,
            id: items[items.length - 1].id
        } : null
    }
}
