import { TreeSkeleton } from '@/components/ui/Skeletons'
import { BottomNav } from '@/components/BottomNav'

export default function TreeLoading() {
    return (
        <div className="bg-bg text-text min-h-screen flex flex-col max-w-md mx-auto shadow-2xl relative">
            <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur-md px-4 py-4 border-b border-border/50">
                <h1 className="text-2xl font-extrabold tracking-tight">Árvore Genealógica</h1>
            </header>

            <main className="flex-1 relative w-full overflow-hidden flex items-center justify-center bg-surface-2/30">
                <TreeSkeleton />
            </main>

            <BottomNav />
        </div>
    )
}
