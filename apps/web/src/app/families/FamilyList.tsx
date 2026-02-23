'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type PreviewMember = {
    id: string
    name: string
    role: string
}

type FamilyItem = {
    familyId: string
    familyName: string
    role: string
    memberCount: number
    previewMembers: PreviewMember[]
}

type Props = {
    families: FamilyItem[]
    activeFamilyId: string
}

export function FamilyList({ families, activeFamilyId }: Props) {
    const router = useRouter()
    const [loadingId, setLoadingId] = useState<string | null>(null)

    async function handleSwitch(familyId: string, redirectTo: string) {
        if (loadingId) return

        setLoadingId(familyId)
        try {
            const res = await fetch('/api/family/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ family_id: familyId }),
            })

            if (res.ok) {
                router.push(redirectTo)
                router.refresh()
            } else {
                const error = await res.text()
                console.error('Failed to switch family:', error)
                alert('Erro ao trocar de família. Verifique sua conexão.')
            }
        } catch (err) {
            console.error('Network error switching family:', err)
            alert('Erro de rede ao trocar de família.')
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {families.map((f) => (
                <div
                    key={f.familyId}
                    className={`relative p-6 bg-white rounded-xl border transition-all shadow-sm flex flex-col ${f.familyId === activeFamilyId
                            ? 'border-indigo-500 ring-1 ring-indigo-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    {f.familyId === activeFamilyId && (
                        <div className="absolute top-4 right-4 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                            Ativa
                        </div>
                    )}

                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{f.familyName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {f.role}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">
                                {f.memberCount} membro{f.memberCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    {/* Mini-preview: Lightweight hierarchical list */}
                    <div className="flex-grow mb-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Estrutura (Preview)</p>
                        <ul className="space-y-2">
                            {f.previewMembers.length > 0 ? (
                                f.previewMembers.map((m, idx) => (
                                    <li key={m.id} className="flex items-center gap-2 text-sm text-gray-700">
                                        <span className="text-gray-400" style={{ marginLeft: `${idx * 0.5}rem` }}>
                                            {idx === 0 ? '👤' : '└──'}
                                        </span>
                                        <span className="font-medium truncate">{m.name}</span>
                                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase">
                                            {m.role}
                                        </span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-xs text-gray-400 italic">Nenhum membro listado</li>
                            )}
                            {f.memberCount > 5 && (
                                <li className="text-[10px] text-gray-400 mt-1 italic pl-6">
                                    + {f.memberCount - 5} outros membros...
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSwitch(f.familyId, '/timeline')}
                            disabled={loadingId !== null}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${f.familyId === activeFamilyId
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                }`}
                        >
                            {loadingId === f.familyId ? 'Entrando...' : 'Entrar'}
                        </button>
                        <button
                            onClick={() => handleSwitch(f.familyId, '/tree')}
                            disabled={loadingId !== null}
                            className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors"
                        >
                            Ver Árvore
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
