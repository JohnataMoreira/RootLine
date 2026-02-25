'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { type FeedPhoto, type FeedCursor } from './actions'
import { PhotoGrid } from '../photos/PhotoGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import { TimelineSkeleton } from '@/components/ui/Skeletons'
import { useTimelineRealtime } from '@/hooks/useTimelineRealtime'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

export function MemoryFeed({ initialPhotos, initialHasMore, initialCursor, familyId }: {
    initialPhotos: FeedPhoto[]
    initialHasMore: boolean
    initialCursor: FeedCursor | null
    familyId: string
}) {
    const queryClient = useQueryClient()
    const [showNewPhotoToast, setShowNewPhotoToast] = useState(false)
    const observerRef = useRef<HTMLDivElement | null>(null)

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isPending,
        error: queryError
    } = useInfiniteQuery({
        queryKey: ['timeline', familyId],
        queryFn: async ({ pageParam }) => {
            const cursor = pageParam ? `&cursor=${encodeURIComponent(JSON.stringify(pageParam))}` : ''
            const res = await fetch(`/api/photos?limit=24${cursor}`)
            if (!res.ok) throw new Error('Falha ao carregar fotos')
            return res.json()
        },
        initialPageParam: null as FeedCursor | null,
        getNextPageParam: (lastPage) => lastPage.nextCursor || null,
        initialData: {
            pages: [{ photos: initialPhotos, hasMore: initialHasMore, nextCursor: initialCursor }],
            pageParams: [null],
        },
    })

    // Flatten pages for the grid
    const allPhotos = data?.pages.flatMap(page => page.photos) ?? []

    // Real-time integration: Prepend to the first page of the cache
    useTimelineRealtime(familyId, useCallback((newPhoto) => {
        queryClient.setQueryData(['timeline', familyId], (old: any) => {
            if (!old) return old
            // Check for duplicates
            const exists = old.pages.some((page: any) =>
                page.photos.some((p: any) => p.id === newPhoto.id)
            )
            if (exists) return old

            const newPages = [...old.pages]
            newPages[0] = {
                ...newPages[0],
                photos: [newPhoto, ...newPages[0].photos]
            }
            return { ...old, pages: newPages }
        })
        setShowNewPhotoToast(true)
    }, [familyId, queryClient]))

    // Infinite Scroll Observer
    useEffect(() => {
        const currentTarget = observerRef.current
        if (!currentTarget || !hasNextPage || isFetchingNextPage) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage()
                }
            },
            { threshold: 0.1, rootMargin: '400px' }
        )

        observer.observe(currentTarget)
        return () => observer.unobserve(currentTarget)
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    if (allPhotos.length === 0 && !isPending && !hasNextPage) {
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

    if (allPhotos.length === 0 && isPending) {
        return <TimelineSkeleton />
    }

    return (
        <div className="space-y-4 pb-32 relative">
            {showNewPhotoToast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <button
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                            setShowNewPhotoToast(false)
                        }}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-semibold hover:scale-105 active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_upward</span>
                        Novas memórias adicionadas!
                        <span
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowNewPhotoToast(false)
                            }}
                            className="material-symbols-outlined text-lg ml-2 opacity-70 hover:opacity-100"
                        >
                            close
                        </span>
                    </button>
                </div>
            )}
            <PhotoGrid photos={allPhotos} />

            {/* Sentry element for Intersection Observer */}
            <div ref={observerRef} className="h-4" />

            {hasNextPage ? (
                <div className="flex flex-col items-center pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isFetchingNextPage ? 'Buscando mais memórias...' : 'Role para ver mais'}
                    </div>
                    {queryError && (
                        <div className="mt-4 text-center">
                            <p className="text-destructive text-sm mb-2">{(queryError as Error).message}</p>
                            <button
                                onClick={() => fetchNextPage()}
                                className="text-primary hover:underline text-sm font-medium"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    )}
                </div>
            ) : allPhotos.length > 0 ? (
                <p className="text-center text-muted-foreground text-sm italic pt-8 border-t border-border">
                    Você chegou ao início da história da sua família.
                </p>
            ) : null}
        </div>
    )
}
