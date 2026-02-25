import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { get, set, del } from 'idb-keyval'

/**
 * Custom async IDB storage for TanStack Query persistence
 */
const idbStorage = {
    getItem: (key: string) => get(key),
    setItem: (key: string, value: string) => set(key, value),
    removeItem: (key: string) => del(key),
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})

// Setup persistence
if (typeof window !== 'undefined') {
    const persister = createAsyncStoragePersister({
        storage: idbStorage,
    })

    persistQueryClient({
        queryClient,
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })
}
