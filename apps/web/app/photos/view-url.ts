'use server'

import { createClient } from '@/utils/supabase/server'

export type PhotoVariant = 'thumb' | 'full'

export async function getPhotoViewUrl(
    photoId: string,
    variant: PhotoVariant = 'full'
): Promise<{ url: string; source: string } | { error: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Fetch photo and validate tenant membership in one query
    const { data: photo, error: photoError } = await supabase
        .from('photos')
        .select('id, family_id, storage_path, thumbnail_path, source, is_deleted')
        .eq('id', photoId)
        .single()

    if (photoError || !photo) {
        return { error: 'Photo not found' }
    }

    if (photo.is_deleted) {
        return { error: 'This photo has been removed' }
    }

    // Validate the user is a member of the photo's family
    const { data: membership } = await supabase
        .from('members')
        .select('family_id')
        .eq('profile_id', user.id)
        .eq('family_id', photo.family_id)
        .single()

    if (!membership) {
        return { error: 'Access denied: you are not a member of this family' }
    }

    // If the photo is from Google Photos, return the original URL directly
    // (3C will populate storage_path with proxy URL or the Google media URL)
    if (photo.source === 'google_photos') {
        // For Google Photos, storage_path holds the google media URL with size suffix
        // "full" appends '=d' to download original, "thumb" is the URL as-is
        const baseUrl = photo.storage_path
        const url = variant === 'full' ? `${baseUrl}=d` : baseUrl
        return { url, source: 'google_photos' }
    }

    // For manual uploads: generate a signed URL from Supabase Storage
    // variant=full → original storage_path, variant=thumb → thumbnail_path or storage_path
    const SIGNED_URL_EXPIRY = variant === 'full' ? 300 : 3600 // 5min for full, 1h for thumb
    const storagePath = variant === 'thumb'
        ? (photo.thumbnail_path ?? photo.storage_path)
        : photo.storage_path

    const { data: signedData, error: signedError } = await supabase.storage
        .from('family-photos')
        .createSignedUrl(storagePath, SIGNED_URL_EXPIRY)

    if (signedError || !signedData?.signedUrl) {
        return { error: 'Failed to generate photo URL. It may have expired or been removed.' }
    }

    return { url: signedData.signedUrl, source: 'manual' }
}
