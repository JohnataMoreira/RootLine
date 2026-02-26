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
    const targetMemberId = formData.get('targetMemberId') as string || null

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
            status: 'pending',
            target_member_id: targetMemberId
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
    const origin = reqHeaders.get('origin') || process.env.NEXT_PUBLIC_APP_URL
    if (!origin) {
        console.error('sendInvite: Não foi possível determinar a URL base. Defina NEXT_PUBLIC_APP_URL.')
        return { error: 'Configuração do servidor incompleta. Contate o administrador.' }
    }
    const inviteLink = `${origin}/invite/${rawToken}`

    return {
        success: true,
        inviteLink: inviteLink,
        message: `Invite generated! In production, a background worker emails this to ${email}.`
    }
}

export type FeedPhotoAnalysis = {
    visual_description: string
    tags: string[]
    detected_objects: string[]
}

export type FeedPhoto = {
    id: string
    signedUrl: string
    original_filename: string | null
    taken_at: string | null
    created_at: string
    analysis?: FeedPhotoAnalysis | null
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
        .select('id, storage_path, thumbnail_path, original_filename, taken_at, source, created_at, photo_analysis(visual_description, tags, detected_objects)')
        .eq('family_id', familyId)
        .eq('is_deleted', false)
        .order('taken_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit + 1)

    if (params.cursor) {
        if (params.cursor.taken_at) {
            query = query.lt('taken_at', params.cursor.taken_at)
        } else {
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

    const itemsWithUrls = await Promise.all(
        items.map(async (photo) => {
            // Extract analysis (Supabase returns it as array from join, take first)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rawAnalysis = photo.photo_analysis as any
            const analysis: FeedPhotoAnalysis | null = Array.isArray(rawAnalysis) && rawAnalysis.length > 0
                ? rawAnalysis[0]
                : rawAnalysis && !Array.isArray(rawAnalysis)
                    ? rawAnalysis
                    : null

            if (photo.source === 'google_photos') {
                return {
                    id: photo.id,
                    signedUrl: photo.thumbnail_path ?? '',
                    original_filename: photo.original_filename,
                    taken_at: photo.taken_at,
                    created_at: photo.created_at,
                    analysis
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
                created_at: photo.created_at,
                analysis
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

export async function searchPhotos(query: string): Promise<{ photos: FeedPhoto[] } | { error: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { familyId } = await getActiveFamily(supabase)
    if (!familyId) return { error: 'No active family' }

    const term = query.trim().toLowerCase()
    if (!term) return { photos: [] }

    // Search in photo_analysis: tags array contains term OR description matches
    const { data: analysisMatches, error } = await supabase
        .from('photo_analysis')
        .select('photo_id, visual_description, tags, detected_objects')
        .eq('family_id', familyId)
        .or(`visual_description.ilike.%${term}%,tags.cs.{${term}}`)
        .limit(48)

    if (error) {
        console.error('Search error:', error)
        return { error: 'Falha na busca' }
    }

    if (!analysisMatches || analysisMatches.length === 0) return { photos: [] }

    const photoIds = analysisMatches.map(a => a.photo_id)

    const { data: photos, error: photoError } = await supabase
        .from('photos')
        .select('id, storage_path, thumbnail_path, original_filename, taken_at, source, created_at')
        .in('id', photoIds)
        .eq('is_deleted', false)
        .order('taken_at', { ascending: false, nullsFirst: false })

    if (photoError || !photos) return { error: 'Falha ao carregar fotos' }

    const analysisMap = Object.fromEntries(analysisMatches.map(a => [a.photo_id, a]))

    const itemsWithUrls = await Promise.all(
        photos.map(async (photo) => {
            const analysis = analysisMap[photo.id] ?? null

            if (photo.source === 'google_photos') {
                return { id: photo.id, signedUrl: photo.thumbnail_path ?? '', original_filename: photo.original_filename, taken_at: photo.taken_at, created_at: photo.created_at, analysis }
            }
            const srcPath = photo.thumbnail_path ?? photo.storage_path
            const { data } = await supabase.storage.from('family-photos').createSignedUrl(srcPath, 3600)
            return { id: photo.id, signedUrl: data?.signedUrl ?? '', original_filename: photo.original_filename, taken_at: photo.taken_at, created_at: photo.created_at, analysis }
        })
    )

    return { photos: itemsWithUrls }
}
