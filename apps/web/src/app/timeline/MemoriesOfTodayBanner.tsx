import { createClient } from '@/utils/supabase/server'
import { getActiveFamily } from '@/utils/active-family'
import Image from 'next/image'

export async function MemoriesOfTodayBanner() {
    const supabase = await createClient()
    const { familyId } = await getActiveFamily(supabase)
    if (!familyId) return null

    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentDay = today.getDate()
    const currentYear = today.getFullYear()

    // Photos taken on this exact month+day in previous years
    const { data: photos } = await supabase
        .from('photos')
        .select('id, storage_path, thumbnail_path, taken_at, source, original_filename')
        .eq('family_id', familyId)
        .eq('is_deleted', false)
        .not('taken_at', 'is', null)
        .limit(10)

    if (!photos || photos.length === 0) return null

    // Client-side filter for day/month match and previous years
    const memories = photos.filter((p) => {
        if (!p.taken_at) return false
        const d = new Date(p.taken_at)
        return d.getMonth() + 1 === currentMonth && d.getDate() === currentDay && d.getFullYear() < currentYear
    })

    if (memories.length === 0) return null

    // Sign URLs
    const memoriesWithUrls = await Promise.all(
        memories.map(async (photo) => {
            if (photo.source === 'google_photos') {
                return { ...photo, url: photo.thumbnail_path ?? '' }
            }
            const srcPath = photo.thumbnail_path ?? photo.storage_path
            const { data } = await supabase.storage.from('family-photos').createSignedUrl(srcPath, 3600)
            return { ...photo, url: data?.signedUrl ?? '' }
        })
    )

    // Find the years featured
    const years = [...new Set(memoriesWithUrls.map(p => new Date(p.taken_at!).getFullYear()))].sort()
    const oldestYear = years[0]
    const yearsAgo = currentYear - oldestYear

    return (
        <div className="mb-4 rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 via-surface to-primary/10">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-[16px]">history</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide">Memórias de Hoje</p>
                    <p className="text-sm font-bold text-text leading-tight">
                        {yearsAgo} ano{yearsAgo !== 1 ? 's' : ''} atrás — {memories.length} foto{memories.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Horizontal scroll of photos */}
            <div className="flex gap-2 px-4 pb-4 overflow-x-auto hide-scrollbar">
                {memoriesWithUrls.map((photo) => {
                    const year = new Date(photo.taken_at!).getFullYear()
                    return (
                        <div
                            key={photo.id}
                            className="relative flex-shrink-0 w-[120px] h-[90px] rounded-xl overflow-hidden group"
                        >
                            {photo.url ? (
                                <img
                                    src={photo.url}
                                    alt={photo.original_filename ?? 'Memória'}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-muted-foreground text-3xl">image</span>
                                </div>
                            )}
                            {/* Year badge */}
                            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                                {year}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
