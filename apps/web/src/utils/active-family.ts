import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getActiveFamilyId, setActiveFamilyId } from '@/lib/family/active-family'

export type ActiveFamilyMembership = {
    familyId: string
    familyName: string
    role: string
    allFamilies: Array<{ familyId: string; familyName: string; role: string }>
}

/**
 * Resolves the "active family" for the currently authenticated user based ONLY on the SSR Cookie.
 *
 * Strategy (T9.1):
 * 1. Read 'rootline_active_family_id' cookie.
 * 2. Fetch all user memberships.
 * 3. Validate cookie vs memberships.
 * 4. If 0 families â†’ redirect to /onboarding.
 * 5. If > 1 family & invalid cookie â†’ redirect to /families selector.
 * 6. If 1 family â†’ auto-set cookie and use it.
 */
export async function getActiveFamily(
    supabase?: SupabaseClient
): Promise<ActiveFamilyMembership> {
    const client = supabase ?? (await createClient())

    const { data: { user } } = await client.auth.getUser()
    if (!user) redirect('/login')

    const currentCookieId = await getActiveFamilyId()

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

    // Determine the resolved active family
    const isCookieValid = currentCookieId
        ? allFamilies.some((f) => f.familyId === currentCookieId)
        : false

    let resolved = null

    if (isCookieValid) {
        resolved = allFamilies.find((f) => f.familyId === currentCookieId)!
    } else {
        if (memberships.length === 1) {
            // Auto select if only 1
            await setActiveFamilyId(allFamilies[0].familyId)
            resolved = allFamilies[0]
        } else {
            // No valid cookie, multiple options -> user must select
            redirect('/families')
        }
    }

    return {
        familyId: resolved.familyId,
        familyName: resolved.familyName,
        role: resolved.role,
        allFamilies,
    }
}


