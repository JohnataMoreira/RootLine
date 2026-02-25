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
            <PremiumHeader title="Meu Perfil" icon="person" showSwitcher={false} />

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
                        <button className="absolute bottom-0 right-0 bg-primary text-white size-8 rounded-full border-2 border-white flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                            <span className="material-symbols-outlined text-sm">photo_camera</span>
                        </button>
                    </div>
                    <h2 className="mt-5 text-2xl font-black text-slate-900 tracking-tight">{userName}</h2>
                    <span className="text-primary font-bold text-xs uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full mt-2">
                        {roleStr}
                    </span>
                    <span className="text-slate-500 text-sm mt-1 font-medium">{user.email}</span>
                </section>

                {/* Actions Section */}
                <section className="px-4 py-6 space-y-4">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 overflow-hidden">
                        {/* Meus Dados */}
                        <button className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 active:scale-[0.98] transition-all text-left group">
                            <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-900 text-sm">Meus Dados</p>
                                <p className="text-xs text-slate-500">Informações pessoais e contato</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                        </button>

                        <div className="h-px bg-slate-100 mx-4" />

                        {/* Privacidade */}
                        <button className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 active:scale-[0.98] transition-all text-left group">
                            <div className="size-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                                <span className="material-symbols-outlined">lock</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-900 text-sm">Privacidade</p>
                                <p className="text-xs text-slate-500">Controle quem vê suas memórias</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                        </button>
                    </div>

                    {/* Plano */}
                    <div className="bg-indigo-600 rounded-3xl p-5 text-white shadow-xl shadow-indigo-600/30 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 size-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="flex items-start gap-4">
                            <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined">workspace_premium</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-base">Plano Família Base</p>
                                <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
                                    Seu plano permite até 15 membros na árvore genealógica e 5GB de armazenamento.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Central de Ajuda */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 overflow-hidden active:scale-[0.98] transition-transform">
                        <button className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left group">
                            <div className="size-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition-colors">
                                <span className="material-symbols-outlined">help_center</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-900 text-sm">Central de Ajuda</p>
                                <p className="text-xs text-slate-500">Dúvidas frequentes e suporte</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                        </button>
                    </div>

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
