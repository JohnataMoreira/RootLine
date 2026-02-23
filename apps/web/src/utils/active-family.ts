import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ActiveFamilyMembership = {
    familyId: string
    familyName: string
    role: string
    allFamilies: Array<{ familyId: string; familyName: string; role: string }>
}

/**
 * Resolves the "active family" for the currently authenticated user.
 *
 * Strategy:
 * 1. Read profiles.active_family_id.
 * 2. Validate we are still a member of that family (guard against removal).
 * 3. If null/invalid → fall back to oldest membership (joined_at ASC), persist via RPC.
 * 4. If no families → redirect to /onboarding.
 * 5. Return active context + full list for the family switcher.
 */
export async function getActiveFamily(
    supabase?: SupabaseClient
): Promise<ActiveFamilyMembership> {
    const client = supabase ?? (await createClient())

    const { data: { user } } = await client.auth.getUser()
    if (!user) redirect('/login')

    // Fetch profile + all memberships in one join
    const { data: profile } = await client
        .from('profiles')
        .select('active_family_id')
        .eq('id', user.id)
        .single()

    const { data: memberships } = await client
        .from('members')
        .select('family_id, role, joined_at, families(id, name)')
        .eq('profile_id', user.id)
        .order('joined_at', { ascending: true })

    if (!memberships || memberships.length === 0) {
        redirect('/onboarding')
    }

    const allFamilies = memberships.map((m) => ({
        familyId: m.family_id,
        familyName: (m.families as unknown as { name: string })?.name ?? 'Unnamed',
        role: m.role,
    }))

    // Check if the stored active_family_id is still valid (user might have been removed)
    const activeFamilyId = profile?.active_family_id
    const isActiveValid = activeFamilyId
        ? allFamilies.some((f) => f.familyId === activeFamilyId)
        : false

    // Determine the resolved active family
    const resolved = isActiveValid
        ? allFamilies.find((f) => f.familyId === activeFamilyId)!
        : allFamilies[0] // oldest membership as deterministic fallback

    // Persist if we auto-selected a fallback
    if (!isActiveValid) {
        // Fire-and-forget — non-blocking; page still loads
        client.rpc('set_active_family', { p_family_id: resolved.familyId }).then(({ error }) => {
            if (error) console.error('Failed to auto-set active family:', error)
        })
    }

    return {
        familyId: resolved.familyId,
        familyName: resolved.familyName,
        role: resolved.role,
        allFamilies,
    }
}
