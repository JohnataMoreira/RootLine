'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Family = {
    familyId: string
    familyName: string
    role: string
}

type Props = {
    activeFamilyId: string
    families: Family[]
}

export function FamilySwitcher({ activeFamilyId, families }: Props) {
    const router = useRouter()
    const [switching, setSwitching] = useState(false)

    if (families.length <= 1) {
        // No reason to show a switcher if user is only in one family
        return null
    }

    async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const newFamilyId = e.target.value
        if (newFamilyId === activeFamilyId) return

        setSwitching(true)
        try {
            const res = await fetch('/api/family/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ family_id: newFamilyId }),
            })
            if (!res.ok) {
                console.error('Switch failed:', await res.text())
            } else {
                router.refresh()
            }
        } catch (err) {
            console.error('Network error switching family:', err)
        } finally {
            setSwitching(false)
        }
    }

    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden sm:inline font-bold uppercase tracking-wider">Família:</span>
            <select
                value={activeFamilyId}
                onChange={handleChange}
                disabled={switching}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 max-w-[150px] truncate shadow-sm transition-all"
                aria-label="Trocar família ativa"
            >
                {families.map((f) => (
                    <option key={f.familyId} value={f.familyId}>
                        {f.familyName}
                    </option>
                ))}
            </select>
            {switching && (
                <span className="text-[10px] text-blue-500 font-bold animate-pulse uppercase tracking-widest">Trocando…</span>
            )}
        </div>
    )
}
