
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { FamilyTree } from './FamilyTree'
import { getActiveFamily } from '@/utils/active-family'
import { FamilySwitcher } from '@/components/FamilySwitcher'



const MAX_MEMBERS = 25

export default async function TreePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Use centralized active family resolver
    const { familyId, familyName, allFamilies } = await getActiveFamily(supabase)

    if (!familyId) redirect('/onboarding') // Changed from !membership to !familyId

    // familyName already resolved by getActiveFamily, familyId is also resolved.
    // The following lines are now redundant:
    // const familyId = membership.family_id
    // const familyName = (membership.families as any)?.name ?? 'Your Family'

    // Fetch all members + their profiles
    const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, profile_id, role, joined_at, profiles(full_name)')
        .eq('family_id', familyId)
        .order('joined_at', { ascending: true })

    if (membersError) {
        return (
            <ErrorState message="Failed to load family members. Please try again." />
        )
    }

    const memberCount = members?.length ?? 0

    // Fetch relationships
    const { data: relationships, error: relError } = await supabase
        .from('relationships')
        .select('id, member_a_id, member_b_id, type')
        .eq('family_id', familyId)

    if (relError) {
        return <ErrorState message="Failed to load relationships." />
    }

    const hasRelationships = relationships && relationships.length > 0
    const isOverCap = memberCount > MAX_MEMBERS

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{familyName} — Family Tree</h1>
                        <FamilySwitcher activeFamilyId={familyId} families={allFamilies} />
                        <p className="text-sm text-gray-500 mt-0.5">
                            {memberCount} member{memberCount !== 1 ? 's' : ''} in this archive
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="/families" className="text-sm font-medium text-gray-400 hover:text-indigo-600 transition-colors">
                            Minha Conta
                        </a>
                        <a
                            href="/timeline"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            ← Back to Timeline
                        </a>
                    </div>
                </div>

                {/* Cap warning */}
                {isOverCap && (
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                        ⚠️ This family has {memberCount} members. The MVP tree visualization
                        is capped at {MAX_MEMBERS}. Only the first {MAX_MEMBERS} members are shown.
                        Full display is available in P0-B.
                    </div>
                )}

                {/* Empty state */}
                {members && members.length === 0 ? (
                    <EmptyState />
                ) : !hasRelationships ? (
                    <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-xl border border-gray-200 border-dashed">
                        <p className="text-4xl mb-3">🌱</p>
                        <p className="text-gray-700 font-medium">No relationships defined yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Members are loaded — add relationships to build the tree.
                        </p>
                    </div>
                ) : (
                    <FamilyTree
                        members={(isOverCap ? members!.slice(0, MAX_MEMBERS) : members!) as unknown as Parameters<typeof FamilyTree>[0]['members']}
                        relationships={relationships!}
                    />
                )}

                {/* Legend */}
                {hasRelationships && (
                    <div className="mt-4 flex gap-6 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-4 h-0.5 bg-indigo-500" /> Parent → Child
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-4 h-0.5 bg-pink-500" style={{ borderTop: '2px dashed' }} /> Spouse
                        </span>
                        <span className="text-gray-400">Click a node for details</span>
                    </div>
                )}
            </div>
        </div>
    )
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-xl border border-gray-200 border-dashed">
            <p className="text-4xl mb-3">👨‍👩‍👧‍👦</p>
            <p className="text-gray-700 font-medium">No members yet</p>
            <p className="text-sm text-gray-400 mt-1">Invite family members to get started.</p>
            <a href="/timeline" className="mt-4 text-sm text-blue-600 hover:underline">Go to Timeline →</a>
        </div>
    )
}

function ErrorState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-[400px] bg-red-50 rounded-xl border border-red-200">
            <p className="text-gray-700 font-medium">⚠️ {message}</p>
        </div>
    )
}
