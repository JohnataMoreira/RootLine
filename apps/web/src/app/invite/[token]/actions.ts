'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createHash } from 'crypto'
import { setActiveFamilyId } from '@/lib/family/active-family'

export async function acceptInvite(token: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect(`/login?message=Sign in or create an account to accept the invitation&next=/invite/${token}`)
    }

    const tokenHash = createHash('sha256').update(token).digest('hex')

    // 1. Accept the invite via secure RPC (bypasses RLS internally and validates safely)
    const { data: familyId, error: acceptError } = await supabase.rpc('accept_invite_by_token', {
        p_token_hash: tokenHash
    })

    if (acceptError || !familyId) {
        console.error('Accept invite error:', acceptError)
        redirect(`/invite/${token}?message=${encodeURIComponent(acceptError?.message || 'Invalid invitation')}`)
    }

    // 2. Set the newly joined family as active automatically via cookie
    await setActiveFamilyId(familyId)

    redirect('/timeline')
}
