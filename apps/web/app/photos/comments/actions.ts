'use server'
// Tip: We handle comment fetching and posting here.

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface PhotoComment {
    id: string
    photo_id: string
    profile_id: string
    content: string
    created_at: string
    profiles: {
        full_name: string | null
        avatar_url: string | null
    }
}

/**
 * Fetches comments for a specific photo.
 * Profiles are joined to show names and avatars.
 */
export async function getPhotoComments(photoId: string): Promise<PhotoComment[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('photo_comments')
        .select(`
            *,
            profiles:profile_id (
                full_name,
                avatar_url
            )
        `)
        .eq('photo_id', photoId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching comments:', error)
        return []
    }

    return data as unknown as PhotoComment[]
}

/**
 * Posts a new comment to a photo.
 */
export async function postPhotoComment(photoId: string, content: string) {
    if (!content.trim()) return { error: 'Comentário não pode ser vazio' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Usuário não autenticado' }

    const { error } = await supabase
        .from('photo_comments')
        .insert({
            photo_id: photoId,
            profile_id: user.id,
            content: content.trim()
        })

    if (error) {
        console.error('Error posting comment:', error)
        return { error: 'Erro ao postar comentário' }
    }

    // Revalidate the timeline/photo page if needed
    // revalidatePath('/timeline') 

    return { success: true }
}
