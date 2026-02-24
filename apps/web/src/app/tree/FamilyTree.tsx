'use client'

import { useCallback, useState } from 'react'
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

type MemberData = {
    label: string
    role: string
    joined_at: string
    avatar_url?: string
}

function MemberNode({ data, selected }: NodeProps<MemberData>) {
    return (
        <>
            <Handle type="target" position={Position.Top} className="opacity-0 w-8" />
            <div className="flex flex-col items-center gap-2 group">
                <div
                    className={`size-16 rounded-full border-2 p-0.5 bg-bg overflow-hidden shadow-sm transition-all ${selected ? 'border-primary ring-4 ring-primary/20 scale-110' : 'border-primary/40 hover:border-primary/60'
                        }`}
                >
                    {data.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.avatar_url} alt={data.label} className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <div className="w-full h-full rounded-full bg-surface-2 flex items-center justify-center text-text shadow-inner">
                            <span className="material-symbols-outlined text-border">person</span>
                        </div>
                    )}
                </div>
                <div className={`px-2 py-1 rounded bg-surface/80 backdrop-blur-sm border ${selected ? 'border-primary text-primary font-bold' : 'border-transparent text-text font-medium text-xs'}`}>
                    {data.label}
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} className="opacity-0 w-8" />
        </>
    )
}

const nodeTypes = { member: MemberNode }

type Props = {
    members: Array<{
        id: string
        profile_id: string | null
        role: string
        joined_at: string
        profiles: { full_name: string; avatar_url?: string } | null
    }>
    relationships: Array<{
        id: string
        member_a_id: string
        member_b_id: string
        type: 'parent_child' | 'spouse'
    }>
}

export function FamilyTree({ members, relationships }: Props) {
    const [selectedMember, setSelectedMember] = useState<MemberData & { id: string } | null>(null)

    const initialNodes: Node<MemberData>[] = members.map((m, i) => ({
        id: m.id,
        type: 'member',
        position: { x: (i % 5) * 150, y: Math.floor(i / 5) * 150 },
        data: {
            label: m.profiles?.full_name?.split(' ')[0] ?? 'Desconhecido', // Simplify name for tree
            role: m.role,
            joined_at: m.joined_at,
            avatar_url: m.profiles?.avatar_url,
        },
    }))

    const initialEdges: Edge[] = relationships.map((r) => ({
        id: r.id,
        source: r.member_a_id,
        target: r.member_b_id,
        animated: r.type === 'spouse',
        type: 'smoothstep',
        style: { stroke: r.type === 'spouse' ? '#ec4899' : '#13ae20', strokeWidth: 2, strokeDasharray: r.type === 'spouse' ? '5,5' : '0' },
    }))

    const [nodes, , onNodesChange] = useNodesState(initialNodes)
    const [edges, , onEdgesChange] = useEdgesState(initialEdges)

    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: Node<MemberData>) => {
            setSelectedMember({ id: node.id, ...node.data })
        },
        []
    )

    return (
        <div className="relative w-full h-[500px] overflow-hidden bg-transparent">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                proOptions={{ hideAttribution: true }}
            >
                <Background gap={24} color="var(--border)" size={1} />
                <Controls className="opacity-50" showInteractive={false} />
            </ReactFlow>

            {/* Info card panel */}
            {selectedMember && (
                <div className="absolute top-4 right-4 bg-surface rounded-xl shadow-xl border border-border p-4 min-w-[200px] z-10">
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
                </div>
            )}
        </div>
    )
}
