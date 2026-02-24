import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { FamilyTree } from './FamilyTree'
import { getActiveFamily } from '@/utils/active-family'
import { BottomNav } from '@/components/BottomNav'
import { EmptyState } from '@/components/ui/EmptyState'
import { InviteModal } from '@/components/InviteModal'

export const dynamic = 'force-dynamic'

const MAX_MEMBERS = 25

export default async function TreePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { familyId } = await getActiveFamily(supabase)

    if (!familyId) redirect('/onboarding')

    // Fetch members
    const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, profile_id, role, joined_at, profiles(full_name, avatar_url)')
        .eq('family_id', familyId)
        .order('joined_at', { ascending: true })

    if (membersError) return <ErrorState message="Falha ao carregar familiares." />

    const memberCount = members?.length ?? 0

    // Fetch relationships
    const { data: relationships, error: relError } = await supabase
        .from('relationships')
        .select('id, member_a_id, member_b_id, type')
        .eq('family_id', familyId)

    if (relError) return <ErrorState message="Falha ao carregar conexões." />

    const hasRelationships = relationships && relationships.length > 0
    const isOverCap = memberCount > MAX_MEMBERS

    return (
        <div className="min-h-screen bg-bg text-text max-w-md mx-auto shadow-2xl relative flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">account_tree</span>
                    <h1 className="text-lg font-bold tracking-tight">Árvore Genealógica</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-muted-foreground">search</span>
                    <span className="material-symbols-outlined text-muted-foreground">settings</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-24">
                <div className="px-4 pt-6 pb-2 text-center">
                    <h2 className="text-2xl font-bold text-text">Nossa Árvore</h2>
                    <p className="text-sm text-muted-foreground mt-1">Explore as conexões da sua linhagem</p>
                </div>

                {/* Tree Canvas Area */}
                <div className="relative w-full py-6 flex justify-center border-y border-border/50 bg-surface-2 mt-4">
                    {/* Cap warning */}
                    {isOverCap && (
                        <div className="absolute top-2 left-2 right-2 z-10 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs text-center backdrop-blur-sm">
                            ⚠️ MVP limitado aos primeiros {MAX_MEMBERS} familiares (Total: {memberCount}).
                        </div>
                    )}

                    {members && members.length === 0 ? (
                        <EmptyState
                            icon="family_restroom"
                            title="A árvore está vazia"
                            description="Convide familiares para começar."
                        />
                    ) : !hasRelationships ? (
                        <EmptyState
                            icon="hub"
                            title="Sem relacionamentos"
                            description="Para visualizar os links, adicione os parentescos desta família."
                        />
                    ) : (
                        <div className="w-full h-[500px]">
                            <FamilyTree
                                members={(isOverCap ? members!.slice(0, MAX_MEMBERS) : members!) as unknown as Parameters<typeof FamilyTree>[0]['members']}
                                relationships={relationships!}
                            />
                        </div>
                    )}
                </div>

                {/* Legend */}
                {hasRelationships && (
                    <div className="px-4 py-3 flex gap-4 text-[10px] text-muted-foreground justify-center uppercase font-bold tracking-widest bg-surface-2 border-b border-border/50">
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-4 h-0.5 bg-primary" /> Pai/Filho
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-4 h-0.5 bg-pink-500 border-t border-dashed" /> Cônjuge
                        </span>
                    </div>
                )}

                {/* Next Steps Area */}
                <section className="px-4 mt-8">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">bolt</span>
                        Próximos Passos
                    </h3>
                    <div className="bg-surface rounded-xl p-5 border border-border shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary">group_add</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-text text-base">Trabalho em Equipe</h4>
                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                    Convide familiares para colaborar na construção da árvore e compartilhar memórias.
                                </p>
                                <InviteModal />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <BottomNav />
        </div>
    )
}

// Local error state remains
function ErrorState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-bg text-center p-6">
            <span className="material-symbols-outlined text-destructive text-4xl mb-2">error</span>
            <p className="text-destructive font-medium">{message}</p>
        </div>
    )
}
