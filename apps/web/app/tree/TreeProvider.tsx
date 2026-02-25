'use client'

import { ReactFlowProvider } from 'reactflow'

export function TreeProvider({ children }: { children: React.ReactNode }) {
    return <ReactFlowProvider>{children}</ReactFlowProvider>
}
