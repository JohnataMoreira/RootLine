import { createFamily } from './actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { SubmitButton } from '@/components/SubmitButton'

export default async function OnboardingPage(props: {
    searchParams: Promise<{ message: string }>
}) {
    const searchParams = await props.searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if they already have an active family
    const { data: members } = await supabase
        .from('members')
        .select('family_id')
        .eq('profile_id', user.id)
        .limit(1)

    if (members && members.length > 0) {
        redirect('/timeline')
    }

    // Stitch Layout Implementation
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-bg text-text group/design-root overflow-x-hidden max-w-md mx-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center bg-bg p-4 pb-2 justify-between">
                <div className="w-10 flex justify-start">
                    <span className="material-symbols-outlined text-text">
                        family_history
                    </span>
                </div>
                <h2 className="text-text text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
                    Rootline
                </h2>
                <div className="w-10 flex justify-end">
                    {/* Theme toggle disabled for Beta */}
                </div>
            </div>

            {/* Hero Section */}
            <div className="p-4">
                <div
                    className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-surface-2 rounded-xl min-h-[400px] relative shadow-lg"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA4Vej_j4FhPEPpdPv_USkiKG3sUL8RKaZil3lBQMM_ZfHwf-XR0yBsNBWG-ZTz9WLURmlbaA1beU4X9mJPW5TmL-0v3qCIWXyEt6YHi9leptzeoYRIKBMf7OwIkIQ5Ec61XDTsAiWAWvos6y5Sa2F14LK_0DAq3tWP5W_rYxx4YmVqGOoEqTC38YQ3xaRgo1Y2xCDAOVB3g3MK2C3_2iCf_ph4R51eUH4PgqbCRJXyDpGe8U-wgoal9d5Gzs6SqBwbO7NigWPNaio")' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-grow px-6 pt-6 pb-12">
                <h1 data-testid="onboarding-heading" className="text-text tracking-tight text-[32px] font-extrabold leading-tight text-center pb-3">
                    Preserve o legado da sua família
                </h1>
                <p className="text-muted-foreground text-base font-medium leading-relaxed pb-6 text-center">
                    Organize memórias de gerações com IA e crie um arquivo vivo para o futuro.
                </p>

                <form action={createFamily} className="flex flex-col w-full gap-4 mt-auto">
                    <div>
                        <input
                            className="w-full bg-surface border border-border text-text rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground shadow-sm transition-all"
                            name="familyName"
                            placeholder="Nome da Família (Ex: Família Silva)"
                            required
                        />
                    </div>

                    <SubmitButton
                        type="submit"
                        pendingText="Criando..."
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-2 active:scale-95 active:opacity-80"
                    >
                        Começar agora
                        <span className="material-symbols-outlined text-[20px]">
                            arrow_forward
                        </span>
                    </SubmitButton>

                    {searchParams?.message && (
                        <p className="mt-2 p-3 bg-destructive/10 text-destructive border border-destructive/20 text-center text-sm rounded-xl font-medium">
                            {searchParams.message}
                        </p>
                    )}
                </form>

                <div className="h-2 bg-primary w-1/3 mx-auto rounded-full mt-10 opacity-20"></div>
            </div>
        </div>
    )
}
