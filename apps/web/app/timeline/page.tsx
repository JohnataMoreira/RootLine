import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getActiveFamily } from '@/utils/active-family'
import { MemoryFeed } from './MemoryFeed'
import { MemoriesOfTodayBanner } from './MemoriesOfTodayBanner'
import { FeaturedMemory } from './FeaturedMemory'
import { getFeedPhotos } from './actions'
import { BottomNav } from '@/components/BottomNav'
import { PremiumHeader } from '@/components/PremiumHeader'

export default async function TimelinePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Resolve active family via utility
    const { familyId } = await getActiveFamily(supabase)

    if (!familyId) {
        redirect('/onboarding')
    }

    // Fetch initial feed data
    const feedRes = await getFeedPhotos({ limit: 24 })

    // Type-safe extraction of feed data
    const initialPhotos = 'photos' in feedRes ? feedRes.photos : []
    const initialHasMore = 'hasMore' in feedRes ? feedRes.hasMore ?? false : false
    const initialCursor = 'nextCursor' in feedRes ? feedRes.nextCursor ?? null : null

    return (
        <div className="min-h-screen bg-bg text-text max-w-md mx-auto shadow-2xl relative flex flex-col">
            <PremiumHeader title="Linha do Tempo" showSwitcher={true} hideActions={true} />

            <main className="flex-1 px-4 pt-2">
                {/* Memories of Today — appears only when photos exist for this day in past years */}
                <MemoriesOfTodayBanner />

                {/* Featured Memory — Highlights the best AI-analyzed moment of the week */}
                <FeaturedMemory />

                <MemoryFeed
                    initialPhotos={initialPhotos}
                    initialHasMore={initialHasMore}
                    initialCursor={initialCursor}
                    familyId={familyId}
                />
            </main>

            {/* Floating Action Button */}
            <a
                href="/photos"
                className="fixed bottom-[100px] right-[calc(50%-10rem)] md:right-[calc(50%-13rem)] w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-40 transition-transform hover:scale-105 active:scale-95"
            >
                <span className="material-symbols-outlined text-3xl">add</span>
            </a>

            <BottomNav />
        </div>
    )
}
