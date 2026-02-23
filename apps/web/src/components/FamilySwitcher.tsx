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
        <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 hidden sm:inline">Family:</span>
            <select
                value={activeFamilyId}
                onChange={handleChange}
                disabled={switching}
                className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 max-w-[180px] truncate"
                aria-label="Switch active family"
            >
                {families.map((f) => (
                    <option key={f.familyId} value={f.familyId}>
                        {f.familyName} ({f.role})
                    </option>
                ))}
            </select>
            {switching && (
                <span className="text-xs text-gray-400 animate-pulse">Switching…</span>
            )}
        </div>
    )
}
