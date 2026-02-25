import { createClient } from '@/utils/supabase/server'
import { getActiveFamily } from '@/utils/active-family'

export async function FeaturedMemory() {
    const supabase = await createClient()
    const { familyId } = await getActiveFamily(supabase)
    if (!familyId) return null

    // Fetch photos with analysis from the last 7 days
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { data: analysisData } = await supabase
        .from('photo_analysis')
        .select('photo_id, visual_description, tags')
        .order('id', { ascending: false })
        .limit(20)

    if (!analysisData || analysisData.length === 0) return null

    // Find the one with the most descriptive text
    const bestAnalysis = analysisData
        .sort((a, b) => b.visual_description.length - a.visual_description.length)[0]

    // Fetch the actual photo
    const { data: photo } = await supabase
        .from('photos')
        .select('id, storage_path, thumbnail_path, original_filename, taken_at')
        .eq('id', bestAnalysis.photo_id)
        .eq('family_id', familyId)
        .single()

    if (!photo) return null

    // Sign URL
    const srcPath = photo.thumbnail_path ?? photo.storage_path
    const { data: signed } = await supabase.storage.from('family-photos').createSignedUrl(srcPath, 3600)
    const url = signed?.signedUrl ?? ''

    const dateStr = photo.taken_at ? new Date(photo.taken_at).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' }) : 'Recente'

    return (
        <div className="mb-8 relative rounded-3xl overflow-hidden shadow-2xl group border border-white/10">
            {/* Background Image with Parallax-like effect */}
            <div className="absolute inset-0 bg-surface-2">
                <img
                    src={url}
                    alt="Featured Memory"
                    className="w-full h-full object-cover transform transition duration-1000 group-hover:scale-110 opacity-60"
                />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 p-6 pt-24 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                        Destaque da Semana
                    </span>
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{dateStr}</span>
                </div>

                <h2 className="text-xl font-black text-white leading-tight drop-shadow-md">
                    {bestAnalysis.visual_description}
                </h2>

                <div className="flex flex-wrap gap-1.5 mt-2">
                    {bestAnalysis.tags.slice(0, 4).map((tag: string) => (
                        <span key={tag} className="text-[10px] font-bold text-white/80 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-md border border-white/10">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Sparkle effects */}
            <div className="absolute top-4 right-4 animate-bounce">
                <span className="material-symbols-outlined text-primary text-2xl drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]">auto_awesome</span>
            </div>
        </div>
    )
}
