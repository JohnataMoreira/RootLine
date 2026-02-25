'use client'

import { useState } from 'react'
import { Lightbox } from './Lightbox'

type Photo = {
    id: string
    signedUrl: string
    original_filename: string | null
    taken_at: string | null
    analysis?: {
        visual_description: string
        tags: string[]
        detected_objects?: string[]
    } | null
}

export function PhotoGrid({ photos }: { photos: Photo[] }) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    const lightboxPhotos = photos.map((p) => ({
        id: p.id,
        thumbUrl: p.signedUrl,
        originalFilename: p.original_filename,
        takenAt: p.taken_at,
        analysis: p.analysis ? {
            description: p.analysis.visual_description,
            tags: p.analysis.tags
        } : null
    }))

    // Group photos by Month-Year
    const groupedPhotos = photos.reduce((acc, photo) => {
        const date = photo.taken_at ? new Date(photo.taken_at) : new Date()
        const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        const capitalized = monthYear.charAt(0).toUpperCase() + monthYear.slice(1)

        if (!acc[capitalized]) acc[capitalized] = []
        acc[capitalized].push(photo)
        return acc
    }, {} as Record<string, Photo[]>)

    // We also need the global index for the Lightbox to work correctly linearly
    let globalIndex = 0

    return (
        <div className="flex flex-col gap-6">
            {Object.entries(groupedPhotos).map(([monthStr, group]) => (
                <section key={monthStr} className="mt-4">
                    <div className="flex items-center gap-3 mb-4 sticky top-0 z-20 bg-bg/80 backdrop-blur-md p-4 -mx-4 border-b border-border/50 shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10"></div>
                        <h2 className="text-lg font-black text-text tracking-tight">{monthStr}</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {group.map((photo, i) => {
                            const isLarge = i === 0 || i % 3 === 0 // Make every 3rd item large for masonry feel
                            const currentIndex = globalIndex++
                            const displayDate = photo.taken_at ? new Date(photo.taken_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : 'Recente'

                            return isLarge ? (
                                // Large Card
                                <button
                                    key={photo.id}
                                    onClick={() => setLightboxIndex(currentIndex)}
                                    className="col-span-2 relative rounded-xl overflow-hidden group aspect-[2/1] bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary text-left"
                                >
                                    {photo.signedUrl && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={photo.signedUrl}
                                            alt={photo.original_filename ?? 'Family Photo'}
                                            className="w-full h-full object-cover transform transition duration-500 group-hover:scale-110"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="w-fit bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-black/20">
                                                Lembrança
                                            </span>
                                            {photo.analysis && (
                                                <div className="flex gap-1">
                                                    {photo.analysis.tags.slice(0, 3).map(tag => (
                                                        <span key={tag} className="text-[9px] font-bold text-white/50 uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {photo.analysis.tags.length > 3 && (
                                                        <span className="text-[9px] font-bold text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                                            +{photo.analysis.tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-white/90 text-xs font-medium ml-1">{displayDate}</span>
                                    </div>
                                </button>
                            ) : (
                                // Small Card
                                <button
                                    key={photo.id}
                                    onClick={() => setLightboxIndex(currentIndex)}
                                    className="relative rounded-xl overflow-hidden aspect-square group bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary text-left"
                                >
                                    {photo.signedUrl && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={photo.signedUrl}
                                            alt={photo.original_filename ?? 'Family Photo'}
                                            className="w-full h-full object-cover transform transition duration-500 group-hover:scale-110"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1.5">
                                        <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20">
                                            {displayDate}
                                        </span>
                                        {photo.analysis && (
                                            <div className="flex items-center gap-1 bg-primary/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-primary/30">
                                                <span className="material-symbols-outlined text-primary text-[12px] font-bold">auto_awesome</span>
                                                <span className="text-[9px] font-black text-primary-foreground">
                                                    {photo.analysis.tags.length}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </section>
            ))}

            {lightboxIndex !== null && (
                <Lightbox
                    photos={lightboxPhotos}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </div>
    )
}
