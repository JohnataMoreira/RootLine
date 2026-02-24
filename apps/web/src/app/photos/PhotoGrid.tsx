'use client'

import { useState } from 'react'
import { Lightbox } from './Lightbox'

type Photo = {
    id: string
    signedUrl: string
    original_filename: string | null
    taken_at: string | null
}

export function PhotoGrid({ photos }: { photos: Photo[] }) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    const lightboxPhotos = photos.map((p) => ({
        id: p.id,
        thumbUrl: p.signedUrl,
        originalFilename: p.original_filename,
        takenAt: p.taken_at,
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
                    <div className="flex items-center gap-3 mb-4 sticky top-[150px] z-20 bg-bg py-2">
                        <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/20"></div>
                        <h2 className="text-lg font-bold text-text">{monthStr}</h2>
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
                                    <div className="absolute bottom-4 left-4 flex flex-col gap-1">
                                        <span className="w-fit bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-black/20">
                                            Lembrança
                                        </span>
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
                                    <div className="absolute bottom-2 left-2">
                                        <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20">
                                            {displayDate}
                                        </span>
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
