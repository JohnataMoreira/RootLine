import { createClient } from '@/utils/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const familyId = body?.family_id as string | undefined

    if (!familyId) {
        return NextResponse.json({ error: 'family_id is required' }, { status: 400 })
    }

    const { error } = await supabase.rpc('set_active_family', { p_family_id: familyId })

    if (error) {
        console.error('set_active_family error:', error)
        return NextResponse.json(
            { error: error.message ?? 'Failed to switch family' },
            { status: 403 }
        )
    }

    return NextResponse.json({ success: true })
}
