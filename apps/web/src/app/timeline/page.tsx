import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getActiveFamily } from '@/utils/active-family'
import { MemoryFeed } from './MemoryFeed'
import { getFeedPhotos } from './actions'
import { BottomNav } from '@/components/BottomNav'

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
            <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md px-4 pt-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-extrabold tracking-tight">Linha do Tempo</h1>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-2xl">search</span>
                    </button>
                </div>

                {/* Family Member Filter */}
                <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-2 -mx-4 px-4">
                    <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className="w-16 h-16 rounded-full border-2 border-primary p-0.5">
                            <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                <span className="material-symbols-outlined">groups</span>
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-primary">Todos</span>
                    </div>
                    {/* Placeholder for actual members */}
                    <div className="flex flex-col items-center gap-2 shrink-0 opacity-60">
                        <div className="w-16 h-16 rounded-full border-2 border-transparent p-0.5 bg-surface-2">
                            <div className="w-full h-full rounded-full bg-border flex items-center justify-center text-text">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                        </div>
                        <span className="text-xs font-medium">Você</span>
                    </div>
                </div>

                {/* Event Filter Chips */}
                <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-3 -mx-4 px-4">
                    <button className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium whitespace-nowrap">Eventos</button>
                    <button className="px-4 py-1.5 rounded-full bg-surface-2 text-text border border-border text-sm font-medium whitespace-nowrap flex items-center gap-1">
                        Aniversários <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                    </button>
                    <button className="px-4 py-1.5 rounded-full bg-surface-2 text-text border border-border text-sm font-medium whitespace-nowrap flex items-center gap-1">
                        Férias <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                    </button>
                    <button className="px-4 py-1.5 rounded-full bg-surface-2 text-text border border-border text-sm font-medium whitespace-nowrap flex items-center gap-1">
                        Datas <span className="material-symbols-outlined text-sm">calendar_today</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 px-4">
                <MemoryFeed
                    initialPhotos={initialPhotos}
                    initialHasMore={initialHasMore}
                    initialCursor={initialCursor}
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
