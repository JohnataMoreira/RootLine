'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getFeedPhotos, type FeedPhoto, type FeedCursor } from './actions'
import { PhotoGrid } from '../photos/PhotoGrid'

export function MemoryFeed({ initialPhotos, initialHasMore, initialCursor }: {
    initialPhotos: FeedPhoto[]
    initialHasMore: boolean
    initialCursor: FeedCursor | null
}) {
    const [photos, setPhotos] = useState<FeedPhoto[]>(initialPhotos)
    const [hasMore, setHasMore] = useState(initialHasMore)
    const [cursor, setCursor] = useState<FeedCursor | null>(initialCursor)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const observerRef = useRef<HTMLDivElement | null>(null)
    const isFetching = useRef(false)

    const loadMore = useCallback(async () => {
        if (isFetching.current || !cursor) return
        isFetching.current = true
        setLoading(true)
        setError(null)

        const errorId = `feed-${Date.now()}`

        try {
            const res = await getFeedPhotos({ cursor })
            if ('error' in res) {
                console.error(`[ERROR][MemoryFeed][${errorId}] ${res.error}`)
                setError(`${res.error || 'Failed to load more photos'} (${errorId})`)
            } else {
                setPhotos(prev => {
                    // Zero-duplicate logic: filter out IDs that already exist in the state
                    const existingIds = new Set(prev.map(p => p.id))
                    const filteredNew = res.photos.filter(p => !existingIds.has(p.id))

                    if (filteredNew.length < res.photos.length) {
                        console.warn(`[WARN][MemoryFeed] Filtered out ${res.photos.length - filteredNew.length} duplicate photos.`)
                    }

                    return [...prev, ...filteredNew]
                })
                setHasMore(res.hasMore)
                setCursor(res.nextCursor || null)
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            console.error(`[ERROR][MemoryFeed][${errorId}] ${msg}`)
            setError(`An unexpected error occurred (${errorId})`)
        } finally {
            setLoading(false)
            isFetching.current = false
        }
    }, [cursor, setPhotos, setHasMore, setCursor])

    // Infinite Scroll Observer
    useEffect(() => {
        const currentTarget = observerRef.current
        if (!currentTarget || !hasMore || loading) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetching.current) {
                    loadMore()
                }
            },
            { threshold: 0.1, rootMargin: '400px' } // Load earlier for smoother feel
        )

        observer.observe(currentTarget)
        return () => observer.unobserve(currentTarget)
    }, [hasMore, loading, loadMore])

    if (photos.length === 0 && !loading) {
        return (
            <div className="bg-white p-12 rounded-xl border border-gray-200 border-dashed text-center">
                <p className="text-4xl mb-4">📸</p>
                <h3 className="text-lg font-medium text-gray-900">No memories yet</h3>
                <p className="text-gray-500 mt-2 max-w-xs mx-auto">
                    Start by uploading photos or connecting Google Photos to build your family archive.
                </p>
                <a
                    href="/photos"
                    className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                    Go to Photos
                </a>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-32">
            <PhotoGrid photos={photos} />

            {/* Sentry element for Intersection Observer */}
            <div ref={observerRef} className="h-4" />

            {hasMore ? (
                <div className="flex flex-col items-center pt-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {loading ? 'Fetching more memories...' : 'Scroll for more'}
                    </div>
                    {error && (
                        <div className="mt-4 text-center">
                            <p className="text-red-500 text-sm mb-2">{error}</p>
                            <button
                                onClick={loadMore}
                                className="text-indigo-600 hover:underline text-sm font-medium"
                            >
                                Try again
                            </button>
                        </div>
                    )}
                </div>
            ) : photos.length > 0 ? (
                <p className="text-center text-gray-400 text-sm italic pt-8 border-t border-gray-100">
                    You&apos;ve reached the beginning of your family history.
                </p>
            ) : null}
        </div>
    )
}
