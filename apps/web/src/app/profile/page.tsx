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
                        <div className="w-32 h-32 rounded-full border-4 border-primary p-1 bg-surface-2 overflow-hidden">
                            {avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-surface-2 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-muted-foreground">person</span>
                                </div>
                            )}
                        </div>
                        <button className="absolute bottom-1 right-1 bg-primary text-primary-foreground w-10 h-10 flex items-center justify-center rounded-full shadow-lg border-2 border-bg hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-sm">photo_camera</span>
                        </button>
                    </div>
                    <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-text">{userName}</h2>
                    <span className="text-primary font-semibold text-sm px-3 py-1 bg-primary/10 rounded-full mt-2">
                        {roleStr}
                    </span>
                    <span className="text-muted-foreground text-xs mt-1">{user.email}</span>
                </section>

                {/* Stats Grid (Minhas Contribuições) */}
                <section className="px-4 mb-8">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 ml-1">Minhas Contribuições</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-primary/5 p-5 rounded-xl border border-primary/10 flex flex-col items-center text-center backdrop-blur-sm">
                            <span className="material-symbols-outlined text-primary mb-2 text-3xl">image</span>
                            <span className="text-2xl font-bold text-text">0</span>
                            <span className="text-xs text-muted-foreground font-medium mt-1">Fotos enviadas</span>
                        </div>
                        <div className="bg-primary/5 p-5 rounded-xl border border-primary/10 flex flex-col items-center text-center backdrop-blur-sm">
                            <span className="material-symbols-outlined text-primary mb-2 text-3xl">menu_book</span>
                            <span className="text-2xl font-bold text-text">0</span>
                            <span className="text-xs text-muted-foreground font-medium mt-1">Memórias criadas</span>
                        </div>
                    </div>
                </section>

                {/* Action List Group */}
                <section className="px-4 space-y-3">
                    {/* Meus Dados */}
                    <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm hover:border-border/80 transition-colors">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-surface-2 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-sm text-text">Meus Dados</p>
                                    <p className="text-xs text-muted-foreground">Informações pessoais e contato</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-muted-foreground group-hover:text-text transition-colors">chevron_right</span>
                        </button>
                        <div className="h-[1px] bg-border/50 mx-4"></div>
                        {/* Privacidade */}
                        <button className="w-full flex items-center justify-between p-4 hover:bg-surface-2 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">shield</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-sm text-text">Privacidade</p>
                                    <p className="text-xs text-muted-foreground">Controle quem vê suas memórias</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-muted-foreground group-hover:text-text transition-colors">chevron_right</span>
                        </button>
                    </div>

                    {/* Subscription Plan */}
                    <div className="bg-primary/10 rounded-xl border border-primary/20 p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">workspace_premium</span>
                                    <p className="font-bold text-sm text-primary">Plano Família Base</p>
                                </div>
                                <span className="text-[10px] font-extrabold bg-primary text-primary-foreground px-2 py-1 rounded uppercase tracking-wider">Ativo</span>
                            </div>
                            <p className="text-xs text-text/80 mb-4 leading-relaxed max-w-[250px]">
                                Seu plano permite até 25 membros na árvore genealógica e 5GB de armazenamento.
                            </p>
                            <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                Gerenciar Assinatura
                            </button>
                        </div>
                    </div>

                    {/* Help & Support */}
                    <div className="bg-surface rounded-xl border border-border shadow-sm hover:border-border/80 transition-colors">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-surface-2 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-surface-2 text-muted-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">help</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-sm text-text">Central de Ajuda</p>
                                    <p className="text-xs text-muted-foreground">Dúvidas frequentes e suporte</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-muted-foreground group-hover:text-text transition-colors">chevron_right</span>
                        </button>
                    </div>

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
