'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getPhotoViewUrl } from './view-url'

type LightboxPhoto = {
    id: string
    thumbUrl: string
    originalFilename: string | null
    takenAt: string | null
    analysis?: {
        description: string
        tags: string[]
    } | null
}

type LightboxProps = {
    photos: LightboxPhoto[]
    initialIndex: number
    onClose: () => void
}

export function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
    const [index, setIndex] = useState(initialIndex)
    const [fullUrl, setFullUrl] = useState<string | null>(null)
    const [fullLoaded, setFullLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [retryCount, setRetryCount] = useState(0)
    const [prevPhotoId, setPrevPhotoId] = useState(photos[initialIndex].id)
    const containerRef = useRef<HTMLDivElement>(null)

    const photo = photos[index]

    // Reset state during render when photo changes
    if (photo.id !== prevPhotoId) {
        setPrevPhotoId(photo.id)
        setFullUrl(null)
        setFullLoaded(false)
        setError(null)
        setRetryCount(0)
    }

    const fetchUrl = useCallback((photoId: string, isRetry = false) => {
        const errorId = `lb-url-${Date.now()}`

        const executeFetch = (id: string, retry: boolean) => {
            getPhotoViewUrl(id, 'full').then((result) => {
                if ('error' in result) {
                    console.error(`[ERROR][Lightbox][${errorId}] ${result.error}`)
                    if (!retry) {
                        console.log(`[Lightbox] Retrying URL fetch for ${id}...`)
                        setRetryCount(1)
                        executeFetch(id, true) // Recursive call to internal helper
                    } else {
                        setError(`${result.error} (${errorId})`)
                    }
                } else {
                    setFullUrl(result.url)
                }
            })
        }

        executeFetch(photoId, isRetry)
    }, [setRetryCount, setError, setFullUrl])

    // Fetch the full-res signed URL whenever the photo changes
    useEffect(() => {
        fetchUrl(photo.id)
    }, [photo.id, fetchUrl])

    const goNext = useCallback(() => {
        setIndex((i) => (i + 1) % photos.length)
    }, [photos.length])

    const goPrev = useCallback(() => {
        setIndex((i) => (i - 1 + photos.length) % photos.length)
        setFullUrl(null)
        setFullLoaded(false)
        setError(null)
    }, [photos.length])

    // Keyboard navigation
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowRight') goNext()
            if (e.key === 'ArrowLeft') goPrev()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose, goNext, goPrev])

    // Trap focus & prevent body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        containerRef.current?.focus()
        return () => { document.body.style.overflow = '' }
    }, [])

    return (
        <div
            ref={containerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Photo lightbox"
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center outline-none"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none z-10"
                aria-label="Close lightbox"
            >
                ×
            </button>

            {/* Prev / Next */}
            {photos.length > 1 && (
                <>
                    <button
                        onClick={goPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl z-10 px-3"
                        aria-label="Previous photo"
                    >
                        ‹
                    </button>
                    <button
                        onClick={goNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl z-10 px-3"
                        aria-label="Next photo"
                    >
                        ›
                    </button>
                </>
            )}

            {/* Image container */}
            <div className="relative max-h-[90vh] max-w-[90vw] flex items-center justify-center">
                {/* Thumb placeholder (always rendered while full loads) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={photo.thumbUrl}
                    alt={photo.originalFilename ?? 'Family photo'}
                    className={`max-h-[90vh] max-w-[90vw] object-contain rounded transition-opacity duration-300 ${fullLoaded ? 'opacity-0 absolute inset-0 w-full h-full' : 'opacity-100 blur-sm scale-[0.99]'
                        }`}
                    aria-hidden={fullLoaded}
                />

                {/* Full-res image: mounts hidden, reveals when loaded */}
                {fullUrl && !error && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        key={fullUrl} // Force re-render on URL change
                        src={fullUrl}
                        alt={photo.originalFilename ?? 'Family photo'}
                        className={`max-h-[90vh] max-w-[90vw] object-contain rounded transition-opacity duration-500 ${fullLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                        onLoad={() => setFullLoaded(true)}
                        onError={() => {
                            const errorId = `lb-img-${Date.now()}`
                            console.error(`[ERROR][Lightbox][${errorId}] Image load failed for ${fullUrl}`)
                            if (retryCount === 0) {
                                console.log('[Lightbox] Retrying image load...')
                                setRetryCount(1)
                                setFullUrl(prev => prev ? `${prev}&retry=1` : null) // Force a re-fetch/re-load
                            } else {
                                setError(`Image could not be rendered. (${errorId})`)
                            }
                        }}
                    />
                )}

                {/* Loading indicator while full-res is fetching */}
                {!fullUrl && !error && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded">
                        <div className="text-center text-white/80 p-6">
                            <p className="text-2xl mb-2">⚠️</p>
                            <p className="text-sm font-medium">{error}</p>
                            <div className="mt-4 flex flex-col gap-2">
                                <button
                                    onClick={() => {
                                        setError(null)
                                        setFullUrl(null)
                                        setFullLoaded(false)
                                        fetchUrl(photo.id)
                                    }}
                                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md text-xs font-medium transition-colors"
                                >
                                    Reload Photo
                                </button>
                                <p className="text-[10px] text-white/40">Try refreshing the page if the issue persists.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Caption bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 text-center text-white/60 space-y-2 pointer-events-none">
                {photo.analysis && (
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-4 pointer-events-auto">
                        <p className="text-white text-sm font-medium mb-2 leading-relaxed italic">
                            "{photo.analysis.description}"
                        </p>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                            {photo.analysis.tags.map(tag => (
                                <span key={tag} className="bg-primary/20 text-primary-foreground text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full border border-primary/30">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                <div className="text-xs opacity-70">
                    {photo.originalFilename && <p>{photo.originalFilename}</p>}
                    {photo.takenAt && <p>{new Date(photo.takenAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                    <p className="mt-1 font-bold">{index + 1} / {photos.length}</p>
                </div>
            </div>
        </div>
    )
}
