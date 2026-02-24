import { TimelineSkeleton } from '@/components/ui/Skeletons'
import { BottomNav } from '@/components/BottomNav'

export default function TimelineLoading() {
    return (
        <div className="min-h-screen bg-bg text-text max-w-md mx-auto shadow-2xl relative flex flex-col">
            <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md px-4 pt-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-extrabold tracking-tight">Linha do Tempo</h1>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-2xl">search</span>
                    </button>
                </div>

                {/* Fake Filters Shell */}
                <div className="flex gap-4 overflow-x-auto py-2 -mx-4 px-4 animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-surface-2 border-2 border-border shrink-0"></div>
                    <div className="w-16 h-16 rounded-full bg-surface-2 border-2 border-border shrink-0"></div>
                    <div className="w-16 h-16 rounded-full bg-surface-2 border-2 border-border shrink-0"></div>
                </div>

                <div className="flex gap-2 overflow-x-auto py-3 -mx-4 px-4 animate-pulse">
                    <div className="h-8 w-20 bg-surface-2 rounded-full shadow-sm"></div>
                    <div className="h-8 w-24 bg-surface-2 rounded-full shadow-sm"></div>
                    <div className="h-8 w-24 bg-surface-2 rounded-full shadow-sm"></div>
                </div>
            </header>

            <main className="flex-1 px-4">
                <TimelineSkeleton />
            </main>

            <BottomNav />
        </div>
    )
}
