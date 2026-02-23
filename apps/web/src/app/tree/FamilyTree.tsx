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
}

function MemberNode({ data, selected }: NodeProps<MemberData>) {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div
                className={`px-4 py-3 rounded-lg shadow-md border-2 bg-white text-gray-900 min-w-[120px] text-center transition-all ${selected ? 'border-blue-500 shadow-blue-200' : 'border-gray-200'
                    }`}
            >
                <div className="text-2xl mb-1">👤</div>
                <div className="font-semibold text-sm">{data.label}</div>
                <div className="text-xs text-gray-400 mt-0.5 capitalize">{data.role}</div>
            </div>
            <Handle type="source" position={Position.Bottom} />
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
        profiles: { full_name: string } | null
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
        position: { x: (i % 5) * 200, y: Math.floor(i / 5) * 160 },
        data: {
            label: m.profiles?.full_name ?? 'Unknown Member',
            role: m.role,
            joined_at: m.joined_at,
        },
    }))

    const initialEdges: Edge[] = relationships.map((r) => ({
        id: r.id,
        source: r.member_a_id,
        target: r.member_b_id,
        label: r.type === 'parent_child' ? '👶 child' : '💍 spouse',
        animated: r.type === 'spouse',
        style: { stroke: r.type === 'spouse' ? '#ec4899' : '#6366f1' },
        labelStyle: { fontSize: 11, fill: '#6b7280' },
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
        <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                fitView
                fitViewOptions={{ padding: 0.3 }}
            >
                <Background gap={24} color="#e5e7eb" />
                <Controls />
                <MiniMap nodeColor="#6366f1" maskColor="rgba(0,0,0,0.05)" />
            </ReactFlow>

            {/* Info card panel */}
            {selectedMember && (
                <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[200px] z-10">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-900 text-sm">{selectedMember.label}</span>
                        <button
                            onClick={() => setSelectedMember(null)}
                            className="text-gray-400 hover:text-gray-600 ml-2 text-xs"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                        <p><span className="font-medium">Role:</span> <span className="capitalize">{selectedMember.role}</span></p>
                        <p><span className="font-medium">Joined:</span> {new Date(selectedMember.joined_at).toLocaleDateString()}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
