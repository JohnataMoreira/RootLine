'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getActiveFamily } from '@/utils/active-family'
import { uploadPhotoSchema } from '@/lib/schemas'

// Max 10MB per file
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function uploadPhoto(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Find active family + verify contributor/admin role
    const { familyId, role } = await getActiveFamily(supabase)

    if (!['admin', 'contributor'].includes(role)) {
        return { error: 'You do not have permission to upload photos' }
    }

    const file = formData.get('photo') as File | null

    // Validate non-file fields with Zod
    const rawData = Object.fromEntries(formData.entries())
    const validated = uploadPhotoSchema.safeParse(rawData)

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const { description, taken_at: takenAt } = validated.data

    if (!file || file.size === 0) {
        return { error: 'No file provided' }
    }

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'].includes(file.type)) {
        return { error: 'Only JPEG, PNG, WebP and HEIC images are supported' }
    }

    if (file.size > MAX_FILE_SIZE) {
        return { error: 'File must be smaller than 10 MB' }
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const photoId = crypto.randomUUID()
    // Standard: families/<family_id>/full/<uuid>.<ext>
    // Thumbnail will be families/<family_id>/thumbs/<uuid>.<ext> (generated server-side in future)
    const storagePath = `families/${familyId}/full/${photoId}.${fileExt}`

    // Upload to Supabase Storage bucket 'family-photos'
    const { error: uploadError } = await supabase.storage
        .from('family-photos')
        .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
        })

    if (uploadError) {
        console.error('Storage upload error:', uploadError)
        return { error: 'Failed to upload photo. Please try again.' }
    }

    // Insert photo record
    const { error: insertError } = await supabase
        .from('photos')
        .insert({
            id: photoId,
            family_id: familyId,
            uploaded_by: user.id,
            storage_path: storagePath,
            original_filename: file.name,
            size_bytes: file.size,
            mime_type: file.type,
            taken_at: takenAt || null,
            description: description || null,
            source: 'manual'
        })

    if (insertError) {
        console.error('DB insert error:', insertError)
        // Clean up orphaned storage object
        await supabase.storage.from('family-photos').remove([storagePath])
        return { error: 'Failed to save photo record.' }
    }

    revalidatePath('/timeline')
    revalidatePath('/photos')

    return { success: true, photoId }
}
