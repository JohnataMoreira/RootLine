'use client'

import { BaseEdge, EdgeProps, getSmoothStepPath } from 'reactflow'

export function CovenantEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data
}: EdgeProps) {
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 20
    })

    const isSpouse = data?.type === 'spouse'

    return (
        <>
            <path
                id={id}
                style={{
                    ...style,
                    strokeWidth: isSpouse ? 3 : 2,
                    stroke: isSpouse ? 'url(#spouse-gradient)' : 'url(#parent-gradient)',
                    strokeDasharray: isSpouse ? '8,8' : '0',
                    fill: 'none',
                    transition: 'all 0.5s ease',
                }}
                className={`react-flow__edge-path ${!isSpouse ? 'animate-pulse' : ''}`}
                d={edgePath}
                markerEnd={markerEnd}
            />
            {/* Glow path */}
            <path
                d={edgePath}
                fill="none"
                stroke={isSpouse ? '#ec4899' : '#3b82f6'}
                strokeWidth={isSpouse ? 6 : 4}
                strokeOpacity={0.1}
                className="blur-sm"
            />

            {/* SVG Gradients Definition should be in the main component, 
          but we use these IDs here */}
        </>
    )
}
