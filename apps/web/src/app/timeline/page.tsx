import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { InviteForm } from './InviteForm'
import { getActiveFamily } from '@/utils/active-family'
import { FamilySwitcher } from '@/components/FamilySwitcher'
import { MemoryFeed } from './MemoryFeed'
import { getFeedPhotos } from './actions'

export default async function TimelinePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Resolve active family via utility
    const { familyId, familyName, role, allFamilies } = await getActiveFamily(supabase)

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
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="mb-8 border-b pb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{familyName} Archive</h1>
                    <FamilySwitcher activeFamilyId={familyId} families={allFamilies} />
                    <p className="text-gray-500 mt-1">Preserving your family history, chronologically.</p>
                </div>
                <div className="flex items-center gap-3">
                    <a href="/families" className="text-sm font-medium text-gray-400 hover:text-indigo-600 transition-colors">
                        Minha Conta
                    </a>
                    <a href="/photos" className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors font-medium">
                        📷 Manage Photos
                    </a>
                    <a href="/tree" className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors font-medium">
                        🌳 View Tree
                    </a>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                <div className="md:col-span-2 lg:col-span-3">
                    <MemoryFeed
                        initialPhotos={initialPhotos}
                        initialHasMore={initialHasMore}
                        initialCursor={initialCursor}
                    />
                </div>

                <div className="md:col-span-1 space-y-6">
                    {role === 'admin' ? (
                        <InviteForm />
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-sm text-gray-500">
                            <p className="font-medium text-gray-700 mb-1">Contributor Mode</p>
                            Only admins can invite new members to this family.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
