import { createClient } from '@/utils/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // User denied access
    if (error || !code) {
        return NextResponse.redirect(new URL('/photos?google_error=access_denied', request.url))
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
        }),
    })

    if (!tokenRes.ok) {
        console.error('Token exchange failed:', await tokenRes.text())
        return NextResponse.redirect(new URL('/photos?google_error=token_exchange_failed', request.url))
    }

    const tokens = await tokenRes.json() as {
        access_token: string
        refresh_token?: string
        expires_in: number
        scope: string
    }

    const expiryTs = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    // Upsert tokens into vault (scoped to this user only)
    const { error: upsertError } = await supabase
        .from('google_photo_tokens')
        .upsert({
            profile_id: user.id,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token ?? '',  // may not be returned if not first consent
            token_expiry: expiryTs,
            scope: tokens.scope,
        }, { onConflict: 'profile_id' })

    if (upsertError) {
        console.error('Token upsert error:', upsertError)
        return NextResponse.redirect(new URL('/photos?google_error=token_save_failed', request.url))
    }

    // Redirect to photos page — user will trigger import from there
    return NextResponse.redirect(new URL('/photos?google_connected=1', request.url))
}
