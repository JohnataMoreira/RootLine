import { NextResponse } from 'next/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!

// Scopes: read-only access to Google Photos library
const SCOPES = [
    'https://www.googleapis.com/auth/photoslibrary.readonly',
    'openid',
    'email',
].join(' ')

export async function GET() {
    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: SCOPES,
        access_type: 'offline',  // get refresh_token
        prompt: 'consent',       // force consent to always get refresh_token
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

    return NextResponse.redirect(authUrl)
}
