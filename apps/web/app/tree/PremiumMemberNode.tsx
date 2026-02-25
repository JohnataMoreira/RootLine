'use client'

import { Handle, Position, NodeProps } from 'reactflow'

type MemberData = {
    label: string
    role: string
    joined_at: string
    avatar_url?: string
}

export function PremiumMemberNode({ data, selected }: NodeProps<MemberData>) {
    return (
        <div className="relative group p-0.5">
            {/* Reactive Background Glow */}
            <div className={`absolute -inset-2 bg-gradient-to-r from-primary/30 to-blue-600/30 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${selected ? 'opacity-100 scale-110' : ''}`} />

            {/* Hierarchical Handles (Zero Opacity for Clean Look) */}
            <Handle type="target" position={Position.Top} className="!bg-primary/20 !border-0 w-8 h-1" />

            <div
                className={`relative w-[180px] bg-surface/60 backdrop-blur-xl border rounded-[1.5rem] p-3 flex items-center gap-3 transition-all duration-300 ${selected
                        ? 'border-primary ring-2 ring-primary/20 shadow-2xl scale-105'
                        : 'border-white/10 hover:border-white/20 shadow-lg'
                    }`}
            >
                {/* Avatar with Ring Layering */}
                <div className="relative shrink-0">
                    <div className={`absolute -inset-1 rounded-full bg-gradient-to-tr from-primary to-blue-500 opacity-20 ${selected ? 'opacity-100 animate-pulse' : ''}`} />
                    <div className="relative size-12 rounded-full border-2 border-bg bg-surface-2 overflow-hidden flex items-center justify-center">
                        {data.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={data.avatar_url} alt={data.label} className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-border text-2xl">person</span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-bold truncate ${selected ? 'text-primary' : 'text-text'}`}>
                        {data.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter opacity-70">
                        {data.role === 'placeholder' ? 'Legacy' : 'Member'}
                    </span>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-primary/20 !border-0 w-8 h-1" />
        </div>
    )
}
