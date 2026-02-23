import type { SupabaseClient } from '@supabase/supabase-js'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

export type GoogleMediaItem = {
    id: string
    filename: string
    mimeType: string
    mediaMetadata?: {
        creationTime?: string
        width?: string
        height?: string
        photo?: object
    }
    baseUrl: string
}

export type SyncResult = {
    imported: number
    skipped: number
    nextPageToken?: string
    error?: string
}

/**
 * Refreshes the Google OAuth access token using the refresh token.
 */
export async function refreshGoogleAccessToken(refreshToken: string) {
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
    })

    if (!res.ok) {
        const err = await res.text()
        console.error('Failed to refresh Google token:', err)
        return null
    }

    return res.json() as Promise<{ access_token: string; expires_in: number }>
}

/**
 * Fetches a batch of media items from Google Photos.
 */
export async function fetchGoogleMediaItems(accessToken: string, pageSize: number = 100, pageToken?: string) {
    const url = new URL('https://photoslibrary.googleapis.com/v1/mediaItems')
    url.searchParams.set('pageSize', pageSize.toString())
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
        const err = await res.text()
        console.error('Google Photos API error:', err)
        throw new Error(`Google Photos API error: ${res.status}`)
    }

    return res.json() as Promise<{ mediaItems?: GoogleMediaItem[]; nextPageToken?: string }>
}

/**
 * Core synchronization logic for a single batch.
 * Can be called by Server Actions or the Background Worker.
 */
export async function syncGooglePhotosBatch(
    supabase: SupabaseClient,
    params: {
        profileId: string
        familyId: string
        accessToken: string
        pageSize: number
        pageToken?: string
    }
): Promise<SyncResult> {
    const { profileId, familyId, accessToken, pageSize, pageToken } = params

    try {
        const data = await fetchGoogleMediaItems(accessToken, pageSize, pageToken)
        const items = data.mediaItems ?? []

        if (items.length === 0) {
            return { imported: 0, skipped: 0, nextPageToken: data.nextPageToken }
        }

        // Filter images only
        const imageItems = items.filter((item) => item.mimeType.startsWith('image/'))

        let imported = 0
        let skipped = 0

        for (const item of imageItems) {
            const taken = item.mediaMetadata?.creationTime ?? null

            const { error: insertError } = await supabase.from('photos').insert({
                family_id: familyId,
                uploaded_by: profileId,
                storage_path: item.baseUrl,
                thumbnail_path: `${item.baseUrl}=w400-h300-c`,
                original_filename: item.filename,
                width: item.mediaMetadata?.width ? parseInt(item.mediaMetadata.width) : null,
                height: item.mediaMetadata?.height ? parseInt(item.mediaMetadata.height) : null,
                mime_type: item.mimeType,
                taken_at: taken,
                source: 'google_photos',
                google_photos_id: item.id,
            })

            if (insertError) {
                if (insertError.code === '23505') {
                    skipped++
                } else {
                    console.error('Insert error for item', item.id, insertError)
                }
            } else {
                imported++
            }
        }

        return {
            imported,
            skipped,
            nextPageToken: data.nextPageToken
        }
    } catch (error: unknown) {
        return { imported: 0, skipped: 0, error: error instanceof Error ? error.message : String(error) }
    }
}
