import { TimelineSkeleton } from '@/components/ui/Skeletons'
import { BottomNav } from '@/components/BottomNav'

export default function TimelineLoading() {
    return (
        <div className="min-h-screen bg-bg text-text max-w-md mx-auto shadow-2xl relative flex flex-col">
            <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/60 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-32 bg-slate-200 rounded-md animate-pulse"></div>
                </div>
            </header>

            <main className="flex-1 px-4">
                <TimelineSkeleton />
            </main>

            {/* Floating Action Button (Disabled during load) */}
            <div className="fixed bottom-[100px] right-[calc(50%-10rem)] md:right-[calc(50%-13rem)] w-14 h-14 bg-blue-400 text-white rounded-full shadow-lg flex items-center justify-center z-40 opacity-70">
                <span className="material-symbols-outlined text-3xl">add</span>
            </div>

            <BottomNav />
        </div>
    )
}
