import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { FamilyList } from './FamilyList'

export default async function FamiliesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch memberships with their family names and roles
    const { data: memberships, error: memError } = await supabase
        .from('members')
        .select(`
            family_id,
            role,
            joined_at,
            families (
                id,
                name
            )
        `)
        .eq('profile_id', user.id)
        .order('joined_at', { ascending: true })

    if (memError || !memberships) {
        console.error('Error fetching memberships:', memError)
        return <div className="p-8 text-red-600">Failed to load families.</div>
    }

    // Now, for each family, fetch the member count and a few members for preview
    const familiesWithDetails = await Promise.all(
        memberships.map(async (m) => {
            const familyId = m.family_id

            // Get member count
            const { count } = await supabase
                .from('members')
                .select('*', { count: 'exact', head: true })
                .eq('family_id', familyId)

            // Get a few members for a simple hierarchy preview
            // We'll just grab the first 5 joined members to keep it "mini"
            const { data: previewMembers } = await supabase
                .from('members')
                .select('id, profile_id, role, profiles(full_name)')
                .eq('family_id', familyId)
                .order('joined_at', { ascending: true })
                .limit(5)

            return {
                familyId: m.family_id,
                familyName: (m.families as unknown as { name: string })?.name ?? 'Unnamed Family',
                role: m.role,
                memberCount: count ?? 0,
                previewMembers: (previewMembers ?? []).map(pm => ({
                    id: pm.id,
                    name: (pm.profiles as unknown as { full_name: string })?.full_name ?? 'Unknown',
                    role: pm.role
                }))
            }
        })
    )

    // Get the current active family ID for highlighting
    const { data: profile } = await supabase
        .from('profiles')
        .select('active_family_id')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Minha Conta</h1>
                    <p className="text-gray-500 mt-1">Gerencie suas famílias e conexões no RootLine.</p>
                </header>

                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Minhas Famílias</h2>
                    <FamilyList
                        families={familiesWithDetails}
                        activeFamilyId={profile?.active_family_id ?? ''}
                    />
                </div>
            </div>
        </div>
    )
}
