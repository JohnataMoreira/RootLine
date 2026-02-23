'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createHash } from 'crypto'

export async function acceptInvite(token: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect(`/login?message=Sign in or create an account to accept the invitation&next=/invite/${token}`)
    }

    const tokenHash = createHash('sha256').update(token).digest('hex')

    // 1. Get the invite info before accepting (to know the family_id)
    const { data: invite, error: fetchError } = await supabase
        .from('invites')
        .select('family_id')
        .eq('token_hash', tokenHash)
        .single()

    if (fetchError || !invite) {
        redirect(`/invite/${token}?message=Invitation not found.`)
    }

    // 2. Accept the invite
    const { error: acceptError } = await supabase.rpc('accept_invite_by_token', {
        p_token_hash: tokenHash
    })

    if (acceptError) {
        console.error('Accept invite error:', acceptError)
        redirect(`/invite/${token}?message=${encodeURIComponent(acceptError.message)}`)
    }

    // 3. Set the newly joined family as active automatically
    const { error: setError } = await supabase.rpc('set_active_family', {
        p_family_id: invite.family_id
    })

    if (setError) {
        console.error('Failed to auto-set active family after joining:', setError)
    }

    redirect('/timeline')
}
