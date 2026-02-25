'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { setActiveFamilyId } from '@/lib/family/active-family'

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

    // 1. Create family and join atomically via RPC
    const { data: familyId, error: rpcError } = await supabase
        .rpc('create_family_and_join', { p_name: familyName.trim() })

    if (rpcError || !familyId) {
        console.error('RPC Error:', rpcError)
        redirect('/onboarding?message=Failed to create family')
    }

    // 2. Persist the active family context via SSR cookie
    await setActiveFamilyId(familyId)

    // 3. Navigate directly to timeline
    redirect('/timeline')
}
