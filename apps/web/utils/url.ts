import { type NextRequest } from 'next/server'

export function getAbsoluteUrl(request: Request | NextRequest, path: string) {
    const { origin } = new URL(request.url)
    const forwardedHost = request.headers.get('x-forwarded-host')
    const hostHeader = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const isLocalEnv = process.env.NODE_ENV === 'development'

    // Debugging logs for production troubleshooting
    console.log(`[getAbsoluteUrl] Path: ${path}, Origin: ${origin}, ForwardedHost: ${forwardedHost}, HostHeader: ${hostHeader}, Protocol: ${protocol}`)

    if (isLocalEnv) {
        return `${origin}${path}`
    }

    if (forwardedHost) {
        return `${protocol}://${forwardedHost}${path}`
    }

    if (hostHeader && !hostHeader.includes('0.0.0.0') && !hostHeader.includes('localhost')) {
        return `${protocol}://${hostHeader}${path}`
    }

    return `${origin}${path}`
}
