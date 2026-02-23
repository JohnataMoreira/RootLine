'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createFamily(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const familyName = formData.get('familyName') as string
    if (!familyName || familyName.trim() === '') {
        redirect('/onboarding?message=Family name is required')
    }

    // 1. Create family
    const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({ name: familyName.trim(), created_by: user.id })
        .select('id')
        .single()

    if (familyError || !family) {
        console.error('Family Error:', familyError)
        redirect('/onboarding?message=Failed to create family')
    }

    // 2. Add creator as admin
    const { error: memberError } = await supabase
        .from('members')
        .insert({
            family_id: family.id,
            profile_id: user.id,
            role: 'admin'
        })

    if (memberError) {
        console.error('Member Error:', memberError)
        redirect('/onboarding?message=Failed to assign owner to family')
    }

    redirect('/timeline') // temporary redirect, Task 2.4 builds the tree
}
