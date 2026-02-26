'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getPhotoViewUrl } from './view-url'
import { CommentSection } from '@/components/CommentSection'

type LightboxPhoto = {
    id: string
    thumbUrl: string
    originalFilename: string | null
    takenAt: string | null
    analysis?: {
        description: string
        tags: string[]
        detected_objects?: string[]
    } | null
}

type LightboxProps = {
    photos: LightboxPhoto[]
    initialIndex: number
    onClose: () => void
}

export function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
    const router = useRouter()
    const pathname = usePathname()
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
                        executeFetch(id, true)
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

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowRight') goNext()
            if (e.key === 'ArrowLeft') goPrev()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose, goNext, goPrev])

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        containerRef.current?.focus()
        return () => { document.body.style.overflow = '' }
    }, [])

    const handleTagClick = (tag: string) => {
        onClose()
        router.push(`${pathname}?q=${encodeURIComponent(tag)}`)
    }

    return (
        <div
            ref={containerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Photo lightbox"
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center outline-none animate-in fade-in duration-300"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50 p-2"
                aria-label="Close lightbox"
            >
                <span className="material-symbols-outlined text-3xl">close</span>
            </button>

            {/* Prev / Next */}
            {photos.length > 1 && (
                <>
                    <button
                        onClick={goPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all z-10 p-4 hover:scale-110 active:scale-95"
                        aria-label="Previous photo"
                    >
                        <span className="material-symbols-outlined text-5xl font-light">chevron_left</span>
                    </button>
                    <button
                        onClick={goNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all z-10 p-4 hover:scale-110 active:scale-95"
                        aria-label="Next photo"
                    >
                        <span className="material-symbols-outlined text-5xl font-light">chevron_right</span>
                    </button>
                </>
            )}

            {/* Image container */}
            <div className="relative max-h-screen max-w-screen flex items-center justify-center">
                {/* Thumb placeholder */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={photo.thumbUrl}
                    alt={photo.originalFilename ?? 'Family photo'}
                    className={`max-h-[85vh] max-w-[95vw] object-contain rounded-lg transition-all duration-500 ${fullLoaded ? 'opacity-0 absolute inset-0 w-full h-full scale-105 blur-lg' : 'opacity-100 blur-sm scale-100 px-4'
                        }`}
                    aria-hidden={fullLoaded}
                />

                {/* Full-res image */}
                {fullUrl && !error && (
                    <img
                        key={fullUrl}
                        src={fullUrl}
                        alt={photo.originalFilename ?? 'Family photo'}
                        className={`max-h-[85vh] max-w-[95vw] object-contain rounded-lg transition-all duration-700 shadow-2xl ${fullLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            }`}
                        onLoad={() => setFullLoaded(true)}
                        onError={() => {
                            const errorId = `lb-img-${Date.now()}`
                            if (retryCount === 0) {
                                setRetryCount(1)
                                setFullUrl(prev => prev ? `${prev}&retry=1` : null)
                            } else {
                                setError(`Não foi possível carregar a imagem em alta resolução. (${errorId})`)
                            }
                        }}
                    />
                )}

                {!fullUrl && !error && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl px-10">
                        <div className="text-center text-white/80 max-w-xs">
                            <span className="material-symbols-outlined text-5xl mb-4 text-white/30 font-light">image_not_supported</span>
                            <p className="text-sm font-medium mb-6 leading-relaxed">{error}</p>
                            <button
                                onClick={() => {
                                    setError(null)
                                    setFullUrl(null)
                                    setFullLoaded(false)
                                    fetchUrl(photo.id)
                                }}
                                className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-bold hover:bg-white/90 active:scale-95 transition-all shadow-xl"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Insights Panel, Comments & Info */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 flex flex-col items-center gap-4 pointer-events-auto overflow-y-auto max-h-[60vh] pb-4 no-scrollbar">
                {photo.analysis && (
                    <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5 mb-2 w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">IA Insights</span>
                        </div>

                        <p className="text-white text-[14px] font-medium mb-4 leading-relaxed line-clamp-3">
                            {photo.analysis.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {(photo.analysis.tags || []).map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className="bg-white/10 hover:bg-primary hover:text-primary-foreground transition-all text-white/80 text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full border border-white/10 active:scale-95"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Comment Section */}
                <CommentSection photoId={photo.id} />

                <div className="flex flex-col items-center gap-1 text-white/40 text-[10px] font-medium pointer-events-none">
                    <div className="flex items-center gap-3">
                        {photo.originalFilename && <span className="opacity-60">{photo.originalFilename}</span>}
                        {photo.takenAt && (
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                                {new Date(photo.takenAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        )}
                    </div>
                    <p className="mt-1 font-black text-white/20 tracking-widest">{index + 1} / {photos.length}</p>
                </div>
            </div>
        </div>
    )
}
