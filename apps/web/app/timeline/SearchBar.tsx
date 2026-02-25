'use client'

import { useState, useCallback, useTransition, useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { searchPhotos, FeedPhoto } from './actions'

interface SearchBarProps {
    onResults: (photos: FeedPhoto[] | null, query: string) => void
}

export function SearchBar({ onResults }: SearchBarProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Initial query from URL
    const initialQuery = searchParams.get('q') || ''

    const [query, setQuery] = useState(initialQuery)
    const [isPending, startTransition] = useTransition()
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isInitialMount = useRef(true)

    const performSearch = useCallback(async (value: string) => {
        if (!value.trim()) {
            onResults(null, '')
            return
        }

        startTransition(async () => {
            const result = await searchPhotos(value)
            if ('photos' in result) {
                onResults(result.photos, value)
            } else {
                onResults([], value)
            }
        })
    }, [onResults])

    // Trigger initial search if query exists in URL
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
            if (initialQuery) {
                performSearch(initialQuery)
            }
        }
    }, [initialQuery, performSearch])

    // Sync state if URL changes externally (e.g. clicking a tag)
    useEffect(() => {
        const q = searchParams.get('q') || ''
        if (q !== query) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setQuery(q)
            performSearch(q)
        }
    }, [searchParams, query, performSearch])

    const handleChange = useCallback((value: string) => {
        setQuery(value)

        if (debounceRef.current) clearTimeout(debounceRef.current)

        debounceRef.current = setTimeout(() => {
            // Update URL query param shallowly
            const params = new URLSearchParams(searchParams)
            if (value.trim()) {
                params.set('q', value.trim())
            } else {
                params.delete('q')
            }

            // push/replace URL without full reload
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })

            performSearch(value)
        }, 400)
    }, [pathname, router, searchParams, performSearch])

    const handleClear = () => {
        setQuery('')
        const params = new URLSearchParams(searchParams)
        params.delete('q')
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
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
