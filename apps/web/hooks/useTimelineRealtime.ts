import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type FeedPhoto } from '@/app/timeline/actions'

export function useTimelineRealtime(
    familyId: string,
    onNewPhoto: (photo: FeedPhoto) => void
) {
    useEffect(() => {
        const supabase = createClient()

        // Subscribe to INSERT events on the photos table
        const channel = supabase
            .channel(`timeline-${familyId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'photos',
                    filter: `family_id=eq.${familyId}`
                },
                (payload) => {
                    console.log('[REALTIME] New photo received:', payload.new)
                    onNewPhoto(payload.new as FeedPhoto)
                }
            )
            .subscribe((status) => {
                console.log(`[REALTIME] Subscription status for ${familyId}:`, status)
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [familyId, onNewPhoto])
}
