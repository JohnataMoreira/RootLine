import { createClient } from '@/utils/supabase/server'
import { getActiveFamily } from '@/utils/active-family'
import { FamilySwitcher } from './FamilySwitcher'

type Props = {
    title: string
    icon?: string
    showSwitcher?: boolean
}

export async function PremiumHeader({ title, icon, showSwitcher = false }: Props) {
    let activeFamilyId = ''
    let families: any[] = []

    if (showSwitcher) {
        const supabase = await createClient()
        const { familyId } = await getActiveFamily(supabase)
        activeFamilyId = familyId || ''

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: userProfiles } = await supabase
                .from('profiles')
                .select('family_id, families(name), role')
                .eq('id', user.id)

            if (userProfiles) {
                families = userProfiles
                    .filter(p => p.families)
                    .map(p => {
                        const fam: any = p.families;
                        return {
                            familyId: p.family_id,
                            familyName: Array.isArray(fam) ? fam[0]?.name : fam?.name,
                            role: p.role
                        }
                    })
            }
        }
    }

    return (
        <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/60 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {showSwitcher && families.length > 1 ? (
                    <FamilySwitcher activeFamilyId={activeFamilyId} families={families} />
                ) : (
                    <div className="flex items-center gap-2">
                        {icon && <span className="material-symbols-outlined text-blue-600 text-xl">{icon}</span>}
                        <h1 className="text-xl font-black tracking-tight text-slate-900 truncate">{title}</h1>
                    </div>
                )}
            </div>

            <div className="flex items-center shrink-0 ml-2 gap-1">
                <button type="button" className="size-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors active:scale-95 shadow-sm border border-slate-100">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                </button>
                <button type="button" className="size-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors active:scale-95 shadow-sm border border-slate-100">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                </button>
            </div>
        </header>
    )
}
