'use client'

import { useCallback, useState, useMemo, useEffect } from 'react'
import ReactFlow, {
    Node,
    Edge,
    Background,
    Controls,
    MiniMap,
    NodeProps,
    Handle,
    Position,
    useNodesState,
    useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Modal } from '@/components/ui/Modal'
import { addPlaceholderRelative } from './actions'
import { PremiumMemberNode } from './PremiumMemberNode'
import { getLayoutedElements } from '@/utils/tree-layout'
import { useReactFlow } from 'reactflow'
import { CovenantEdge } from './CovenantEdge'
import { InviteModal } from '@/components/InviteModal'

type MemberData = {
    label: string
    role: string
    joined_at: string
    avatar_url?: string
}

const nodeTypes = { member: PremiumMemberNode }
const edgeTypes = { covenant: CovenantEdge }

type Props = {
    members: Array<{
        id: string
        profile_id: string | null
        role: string
        joined_at: string
        placeholder_name: string | null
        profiles: { full_name: string; avatar_url?: string } | null
    }>
    relationships: Array<{
        id: string
        family_id: string
        member_a_id: string
        member_b_id: string
        type: 'parent_child' | 'spouse'
    }>
}

export function FamilyTree({ members, relationships, familyId }: Props & { familyId: string }) {
    const { setViewport } = useReactFlow()
    const [selectedMember, setSelectedMember] = useState<MemberData & { id: string } | null>(null)

    const initialNodes: Node<MemberData>[] = members.map((m, i) => ({
        id: m.id,
        type: 'member',
        position: { x: (i % 5) * 150, y: Math.floor(i / 5) * 150 },
        data: {
            label: m.profiles?.full_name?.split(' ')[0] ?? m.placeholder_name?.split(' ')[0] ?? 'Desconhecido', // Simplify name for tree
            role: m.role,
            joined_at: m.joined_at,
            avatar_url: m.profiles?.avatar_url,
        },
    }))

    const initialEdges: Edge[] = relationships.map((r) => ({
        id: r.id,
        source: r.member_a_id,
        target: r.member_b_id,
        type: 'covenant',
        data: { type: r.type }
    }))

    // Integrated Dagre Layout with Memoization to prevent redundant heavy calculations
    const { layoutedNodes, layoutedEdges } = useMemo(() => {
        return getLayoutedElements(initialNodes, initialEdges)
    }, [members, relationships]) // Only re-calculate if data actually changes

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
    const [edges, , onEdgesChange] = useEdgesState(layoutedEdges)

    // Sync state when props change (crucial for adding new members)
    useEffect(() => {
        setNodes(layoutedNodes)
    }, [layoutedNodes, setNodes])

    const [modalOpen, setModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'parent' | 'spouse' | 'child' | null>(null)
    const [pendingName, setPendingName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: Node<MemberData>) => {
            setSelectedMember({ id: node.id, ...node.data })
            // Focus transition
            setViewport({ x: -node.position.x + 100, y: -node.position.y + 200, zoom: 1.2 }, { duration: 800 })
        },
        [setViewport]
    )

    const handleAddRelative = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedMember || !modalType || !pendingName.trim()) return

        setIsSubmitting(true)
        const formData = new FormData()
        formData.append('targetMemberId', selectedMember.id)
        formData.append('familyId', familyId) // Robust fix: Use the prop directly
        formData.append('relationshipType', modalType)
        formData.append('name', pendingName.trim())

        try {
            const res = await addPlaceholderRelative(formData)
            if (res.success) {
                setModalOpen(false)
                setPendingName('')
                setModalType(null)
            } else {
                alert(res.error || 'Falha ao adicionar parente.')
            }
        } catch (error) {
            console.error('Add relative failed:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="relative w-full h-[600px] md:h-[750px] overflow-hidden bg-transparent rounded-2xl border border-border/20 shadow-inner">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodeClick={onNodeClick}
                fitView
                fitViewOptions={{ padding: 0.5 }}
                proOptions={{ hideAttribution: true }}
                minZoom={0.2}
                maxZoom={2}
            >
                {/* SVG Definitions for Premium Gradients */}
                <svg style={{ position: 'absolute', top: 0, left: 0 }}>
                    <defs>
                        <linearGradient id="parent-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#60a5fa" />
                        </linearGradient>
                        <linearGradient id="spouse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#f472b6" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* 12/10 Atmosphere: Triple Layer Background for Depth */}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Background id="1" gap={100} color="#2563eb" size={1} variant={'dots' as any} className="opacity-[0.03]" />
                <Background id="2" gap={24} color="var(--border)" size={1} className="opacity-10" />
                <Controls className="opacity-50" showInteractive={false} />
            </ReactFlow>

            {/* Modal for adding relatives */}
            <Modal
                isOpen={modalOpen}
                onClose={() => !isSubmitting && setModalOpen(false)}
                title={`Adicionar ${modalType === 'parent' ? 'Pai/Mãe' : modalType === 'spouse' ? 'Cônjuge' : 'Filho(a)'}`}
            >
                <form onSubmit={handleAddRelative} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground p-1">Nome Completo</label>
                        <input
                            autoFocus
                            type="text"
                            value={pendingName}
                            onChange={(e) => setPendingName(e.target.value)}
                            placeholder="Ex: João Silva"
                            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || !pendingName.trim()}
                        className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <span className="material-symbols-outlined animate-spin">sync</span>
                        ) : (
                            <span className="material-symbols-outlined text-sm">add</span>
                        )}
                        Salvar Parente
                    </button>
                </form>
            </Modal>

            {/* Info card panel */}
            {selectedMember && (
                <div className="absolute top-4 right-4 bg-surface rounded-xl shadow-xl border border-border p-4 min-w-[250px] z-10 animate-in slide-in-from-right duration-300">
                    <div className="flex justify-between items-start mb-2 border-b border-border/50 pb-2">
                        <span className="font-bold text-text text-sm">{selectedMember.label}</span>
                        <button
                            onClick={() => setSelectedMember(null)}
                            className="text-muted-foreground hover:text-text ml-2 text-xs flex items-center justify-center size-6 rounded-full hover:bg-surface-2 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-2 mt-2">
                        <p className="flex justify-between"><span className="font-medium text-text">Papel:</span> <span className="capitalize">{selectedMember.role}</span></p>
                        <p className="flex justify-between"><span className="font-medium text-text">Entrou em:</span> <span>{new Date(selectedMember.joined_at).toLocaleDateString('pt-BR')}</span></p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50">
                        {/* Slot-based Invitation: If it's a placeholder, allow inviting to this specific slot */}
                        {members.find(m => m.id === selectedMember.id)?.profile_id === null && (
                            <div className="mb-4 bg-primary/5 rounded-xl border border-primary/20 p-3">
                                <p className="text-[10px] font-bold uppercase text-primary mb-2 tracking-wider flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">how_to_reg</span> Slot Reservado
                                </p>
                                <InviteModal
                                    targetMemberId={selectedMember.id}
                                    targetMemberName={selectedMember.label}
                                    trigger={
                                        <button className="w-full bg-primary text-white font-bold py-2 rounded-lg shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 text-xs">
                                            <span className="material-symbols-outlined text-[16px]">mail</span>
                                            Convidar para este lugar
                                        </button>
                                    }
                                />
                            </div>
                        )}

                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 tracking-wider">Adicionar Parente</p>
                        <div className="space-y-2">
                            <button
                                onClick={() => { setModalType('parent'); setModalOpen(true) }}
                                className="w-full py-1.5 px-3 bg-primary/10 hover:bg-primary/20 text-primary font-medium text-xs rounded transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[14px]">add</span> Pai ou Mãe
                            </button>

                            <button
                                onClick={() => { setModalType('spouse'); setModalOpen(true) }}
                                className="w-full py-1.5 px-3 bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 font-medium text-xs rounded transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[14px]">favorite</span> Cônjuge
                            </button>

                            <button
                                onClick={() => { setModalType('child'); setModalOpen(true) }}
                                className="w-full py-1.5 px-3 bg-surface-2 hover:bg-border text-text font-medium text-xs rounded border border-border transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[14px]">child_care</span> Filho ou Filha
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
