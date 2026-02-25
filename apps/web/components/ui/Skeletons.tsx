import React from 'react'

export function TimelineSkeleton() {
    return (
        <div className="space-y-6 animate-pulse mt-4 px-2">
            {[1, 2, 3].map((i) => (
                <div key={i} className="mb-8">
                    {/* Month Header Skeleton */}
                    <div className="h-6 w-32 bg-surface-2 rounded-md mb-4 ml-2"></div>

                    {/* Grid Skeleton */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="aspect-square bg-surface-2 rounded-2xl"></div>
                        <div className="flex flex-col gap-3">
                            <div className="flex-1 bg-surface-2 rounded-2xl"></div>
                            <div className="flex-1 bg-surface-2 rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function TreeSkeleton() {
    return (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-surface-2 border-2 border-border"></div>
                <div className="w-1 h-12 bg-surface-2"></div>
                <div className="flex gap-12">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-surface-2 border-2 border-border"></div>
                        <div className="w-20 h-4 bg-surface-2 rounded-md"></div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-surface-2 border-2 border-border"></div>
                        <div className="w-20 h-4 bg-surface-2 rounded-md"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function ProfileSkeleton() {
    return (
        <div className="flex flex-col w-full animate-pulse">
            <div className="flex flex-col items-center pt-8 pb-6 px-4">
                <div className="w-32 h-32 rounded-full bg-surface-2 mb-4"></div>
                <div className="h-6 w-48 bg-surface-2 rounded-md mb-2"></div>
                <div className="h-4 w-24 bg-surface-2 rounded-full mb-1"></div>
                <div className="h-3 w-36 bg-surface-2 rounded-md mt-2"></div>
            </div>
            <div className="px-4 mb-8">
                <div className="h-4 w-32 bg-surface-2 rounded-md mb-4 ml-1"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-28 bg-surface-2 rounded-xl"></div>
                    <div className="h-28 bg-surface-2 rounded-xl"></div>
                </div>
            </div>
            <div className="px-4 space-y-3">
                <div className="h-16 bg-surface-2 rounded-xl"></div>
                <div className="h-16 bg-surface-2 rounded-xl"></div>
                <div className="h-24 bg-surface-2 rounded-xl"></div>
            </div>
        </div>
    )
}
