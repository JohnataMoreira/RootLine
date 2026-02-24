import { createClient } from '@/utils/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { getActiveFamilyId } from '@/lib/family/active-family'

export async function GET(request: NextRequest) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const familyId = await getActiveFamilyId()
    if (!familyId) {
        return NextResponse.json({ error: 'No active family' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '24')
    const cursorStr = searchParams.get('cursor')

    let query = supabase
        .from('photos')
        .select('id, storage_path, thumbnail_path, original_filename, taken_at, source, created_at')
        .eq('family_id', familyId)
        .eq('is_deleted', false)
        .order('taken_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit + 1)

    if (cursorStr) {
        try {
            const cursor = JSON.parse(decodeURIComponent(cursorStr))
            if (cursor.taken_at) {
                query = query.lt('taken_at', cursor.taken_at)
            } else {
                query = query.is('taken_at', null).lt('id', cursor.id)
            }
        } catch (e) {
            console.error('Invalid cursor', e)
        }
    }

    const { data: photos, error } = await query

    if (error) {
        console.error('API /photos feed error:', error)
        return NextResponse.json({ error: 'Failed to load feed' }, { status: 500 })
    }

    const hasMore = photos.length > limit
    const items = photos.slice(0, limit)

    // Sign URLs for manual uploads
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

    return NextResponse.json({
        photos: itemsWithUrls,
        hasMore,
        nextCursor: hasMore ? {
            taken_at: items[items.length - 1].taken_at,
            id: items[items.length - 1].id
        } : null
    })
}
