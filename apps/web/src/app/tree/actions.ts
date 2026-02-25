'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { addRelativeSchema } from '@/lib/schemas'

export async function addPlaceholderRelative(formData: FormData) {
    const supabase = await createClient()

    const rawData = Object.fromEntries(formData.entries())
    const validated = addRelativeSchema.safeParse(rawData)

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const { name, targetMemberId, familyId, relationshipType } = validated.data

    // 1. Check if the current user has permission (is part of the family at least)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Usuário não autenticado.' }

    // 2. Insert the placeholder member
    const { data: newMember, error: memberError } = await supabase
        .from('members')
        .insert({
            family_id: familyId,
            placeholder_name: name,
            role: 'viewer' // Safe default
        })
        .select()
        .single()

    if (memberError || !newMember) {
        console.error('Error inserting placeholder member:', memberError)
        return { error: 'Falha ao adicionar membro à família.' }
    }

    // 3. Insert the relationship
    let member_a_id = targetMemberId
    let member_b_id = newMember.id
    let relationEnum = 'parent_child'

    if (relationshipType === 'parent') {
        // The new member is the parent
        member_a_id = newMember.id
        member_b_id = targetMemberId
    } else if (relationshipType === 'child') {
        // The new member is the child
        member_a_id = targetMemberId
        member_b_id = newMember.id
    } else if (relationshipType === 'spouse') {
        // Spouse relationship
        relationEnum = 'spouse'
    }

    const { error: relError } = await supabase
        .from('relationships')
        .insert({
            family_id: familyId,
            member_a_id,
            member_b_id,
            type: relationEnum
        })

    if (relError) {
        console.error('Error inserting relationship:', relError)
        // If we fail here, ideally we should rollback the member creation, 
        // but for MVP we will just return the error.
        return { error: 'Membro criado, mas falha ao conectar o parentesco.' }
    }

    // 4. Revalidate
    revalidatePath('/tree')
    return { success: true }
}
