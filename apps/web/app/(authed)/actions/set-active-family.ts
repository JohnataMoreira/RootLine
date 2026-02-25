'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { setActiveFamilyId, getActiveFamilyId } from '@/lib/family/active-family'

/**
 * Ensures the user has an active family set correctly via cookie.
 * - If 0 families -> redirect /onboarding
 * - If 1 family -> set cookie automatically
 * - If > 1 family & no cookie -> redirect /families (to select one)
 * 
 * Returns the resolved active family ID, or redirects if intervention is needed.
 */
export async function resolveAndGetActiveFamilyId(): Promise<string> {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/login')
    }

    const currentCookieId = await getActiveFamilyId()

    // Query user's memberships
    const { data: memberships } = await supabase
        .from('members')
        .select('family_id')
        .eq('profile_id', user.id)

    if (!memberships || memberships.length === 0) {
        redirect('/onboarding')
    }

    // Validate if current cookie is still valid
    const isCookieValid = currentCookieId && memberships.some(m => m.family_id === currentCookieId)

    if (isCookieValid) {
        return currentCookieId
    }

    // Cookie is invalid or missing
    if (memberships.length === 1) {
        const familyId = memberships[0].family_id
        await setActiveFamilyId(familyId)
        return familyId
    }

    // User has multiple families but no valid active selection
    redirect('/families')
}

/**
 * Explicitly sets the active family (e.g. from the /families selector UI)
 * and navigates to the timeline.
 */
export async function userSelectsActiveFamily(familyId: string, redirectTo: string = '/timeline') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Optional: verify membership to prevent spoofing
    const { data: membership } = await supabase
        .from('members')
        .select('id')
        .eq('profile_id', user.id)
        .eq('family_id', familyId)
        .single()

    if (membership) {
        await setActiveFamilyId(familyId)
        redirect(redirectTo)
    } else {
        throw new Error("User does not belong to this family")
    }
}
