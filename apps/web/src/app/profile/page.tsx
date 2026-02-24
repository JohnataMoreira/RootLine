import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'
import { getActiveFamily } from '@/utils/active-family'

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Get user profile data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Get active family role if applicable
    const { familyId } = await getActiveFamily(supabase)
    let roleStr = 'Membro'

    if (familyId) {
        const { data: memberData } = await supabase
            .from('members')
            .select('role')
            .eq('family_id', familyId)
            .eq('profile_id', user.id)
            .single()

        if (memberData?.role === 'admin') {
            roleStr = 'Administrador(a)'
        }
    }

    const userName = profile?.full_name || user.email?.split('@')[0] || 'Usuário'
    const avatarUrl = profile?.avatar_url

    return (
        <div className="bg-bg text-text min-h-screen flex flex-col max-w-md mx-auto shadow-2xl relative">
            {/* Header Section */}
            <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur-md px-4 py-4 border-b border-border/50">
                <div className="flex items-center justify-between w-full">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-2 transition-colors">
                        <span className="material-symbols-outlined text-text">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold">Meu Perfil</h1>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-2 transition-colors">
                        <span className="material-symbols-outlined text-text">settings</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 w-full pb-32">
                {/* Profile Info */}
                <section className="flex flex-col items-center pt-8 pb-6 px-4">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-primary p-1 bg-surface-2 overflow-hidden mx-auto">
                            {avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-surface-2 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-muted-foreground">person</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-text">{userName}</h2>
                    <span className="text-primary font-semibold text-sm px-3 py-1 bg-primary/10 rounded-full mt-2">
                        {roleStr}
                    </span>
                    <span className="text-muted-foreground text-xs mt-1">{user.email}</span>
                </section>

                <section className="px-4 space-y-3 mt-6">

                    {/* Logout Button */}
                    <form action="/auth/signout" method="post">
                        <button type="submit" className="w-full mt-4 flex items-center justify-center gap-2 p-4 text-destructive font-bold border border-destructive/20 bg-destructive/5 rounded-xl hover:bg-destructive/10 transition-colors">
                            <span className="material-symbols-outlined">logout</span>
                            <span>Sair da Conta</span>
                        </button>
                    </form>
                </section>
            </main>

            <BottomNav />
        </div>
    )
}
