import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'
import { getActiveFamily } from '@/utils/active-family'
import { PremiumHeader } from '@/components/PremiumHeader'

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
            <PremiumHeader title="Meu Perfil" icon="person" showSwitcher={false} hideActions={true} />

            <main className="flex-1 w-full pb-32">
                {/* Profile Info */}
                <section className="flex flex-col items-center pt-10 pb-8 px-4 bg-white border-b border-border/30">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full border-4 border-primary/20 p-1 bg-surface-2 overflow-hidden mx-auto shadow-inner">
                            {avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-surface-2 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-5xl text-muted-foreground/40">person</span>
                                </div>
                            )}
                        </div>
                        {/* Cam button hidden for Beta */}
                    </div>
                    <h2 className="mt-5 text-2xl font-black text-slate-900 tracking-tight">{userName}</h2>
                    <span className="text-primary font-bold text-xs uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full mt-2">
                        {roleStr}
                    </span>
                    <span className="text-slate-500 text-sm mt-1 font-medium">{user.email}</span>
                </section>

                {/* Actions Section */}
                <section className="px-4 py-6 space-y-4">
                    {/* Settings sections hidden for MVP Beta */}

                    {/* Logout Button */}
                    <form action="/auth/signout" method="post">
                        <button type="submit" className="w-full mt-4 flex items-center justify-center gap-2 p-4 text-red-600 font-bold border border-red-100 bg-red-50 rounded-3xl shadow-xl shadow-red-500/10 hover:bg-red-100 transition-colors active:scale-95 active:opacity-80">
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
