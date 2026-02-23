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

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((photo, i) => (
                    <button
                        key={photo.id}
                        onClick={() => setLightboxIndex(i)}
                        className="group relative aspect-square rounded-lg overflow-hidden bg-gray-200 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label={`Open ${photo.original_filename ?? 'photo'}`}
                    >
                        {photo.signedUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={photo.signedUrl}
                                alt={photo.original_filename ?? 'Family photo'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No preview
                            </div>
                        )}
                        {photo.taken_at && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-xs">{new Date(photo.taken_at).toLocaleDateString()}</p>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {lightboxIndex !== null && (
                <Lightbox
                    photos={lightboxPhotos}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </>
    )
}
