'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { type FeedPhoto, type FeedCursor } from './actions'
import { PhotoGrid } from '../photos/PhotoGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import { TimelineSkeleton } from '@/components/ui/Skeletons'

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
            const res = await fetch(`/api/photos?cursor=${encodeURIComponent(JSON.stringify(cursor))}`)

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                const errMsg = errData.error || 'Falha ao carregar mais fotos'
                console.error(`[ERROR][MemoryFeed][${errorId}] ${errMsg}`)
                setError(`${errMsg} (${errorId})`)
            } else {
                const data = await res.json()
                setPhotos(prev => {
                    // Zero-duplicate logic: filter out IDs that already exist in the state
                    const existingIds = new Set(prev.map(p => p.id))
                    const filteredNew = data.photos.filter((p: FeedPhoto) => !existingIds.has(p.id))

                    if (filteredNew.length < data.photos.length) {
                        console.warn(`[WARN][MemoryFeed] Filtered out ${data.photos.length - filteredNew.length} duplicate photos.`)
                    }

                    return [...prev, ...filteredNew]
                })
                setHasMore(data.hasMore)
                setCursor(data.nextCursor || null)
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            console.error(`[ERROR][MemoryFeed][${errorId}] ${msg}`)
            setError(`Ocorreu um erro inesperado (${errorId})`)
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

    if (photos.length === 0 && !loading && !hasMore) {
        return (
            <EmptyState
                icon="photo_library"
                title="Sua linha do tempo está vazia"
                description="Comece a adicionar fotos do seu dispositivo ou importe do Google Photos para construir o arquivo da sua família."
                actionLabel="Adicionar Fotos"
                actionHref="/photos"
            />
        )
    }

    if (photos.length === 0 && loading) {
        return <TimelineSkeleton />
    }

    return (
        <div className="space-y-4 pb-32">
            <PhotoGrid photos={photos} />

            {/* Sentry element for Intersection Observer */}
            <div ref={observerRef} className="h-4" />

            {hasMore ? (
                <div className="flex flex-col items-center pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {loading ? 'Buscando mais memórias...' : 'Role para ver mais'}
                    </div>
                    {error && (
                        <div className="mt-4 text-center">
                            <p className="text-destructive text-sm mb-2">{error}</p>
                            <button
                                onClick={loadMore}
                                className="text-primary hover:underline text-sm font-medium"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    )}
                </div>
            ) : photos.length > 0 ? (
                <p className="text-center text-muted-foreground text-sm italic pt-8 border-t border-border">
                    Você chegou ao início da história da sua família.
                </p>
            ) : null}
        </div>
    )
}
