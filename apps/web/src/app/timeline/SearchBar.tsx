'use client'

import { useState, useCallback, useTransition } from 'react'
import { searchPhotos, FeedPhoto } from './actions'

interface SearchBarProps {
    onResults: (photos: FeedPhoto[] | null, query: string) => void
}

export function SearchBar({ onResults }: SearchBarProps) {
    const [query, setQuery] = useState('')
    const [isPending, startTransition] = useTransition()

    const debounceRef = { current: null as ReturnType<typeof setTimeout> | null }

    const handleChange = useCallback((value: string) => {
        setQuery(value)

        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (!value.trim()) {
            onResults(null, '')
            return
        }

        debounceRef.current = setTimeout(() => {
            startTransition(async () => {
                const result = await searchPhotos(value)
                if ('photos' in result) {
                    onResults(result.photos, value)
                } else {
                    onResults([], value)
                }
            })
        }, 350)
    }, [onResults])

    const handleClear = () => {
        setQuery('')
        onResults(null, '')
    }

    return (
        <div className="relative flex items-center w-full">
            <div className="absolute left-3 text-muted-foreground flex items-center pointer-events-none">
                {isPending ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin" style={{ animationDuration: '0.8s' }}>
                        progress_activity
                    </span>
                ) : (
                    <span className="material-symbols-outlined text-[18px]">search</span>
                )}
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Buscar por IA... ex: praia, sorriso, aniversário"
                className="w-full pl-9 pr-9 py-2.5 bg-surface border border-border rounded-xl text-sm text-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            {query && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 text-muted-foreground hover:text-text transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            )}
        </div>
    )
}
