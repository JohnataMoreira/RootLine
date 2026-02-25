import dagre from 'dagre'
import { Node, Edge } from 'reactflow'

const nodeWidth = 200
const nodeHeight = 100

/**
 * Calculates a hierarchical layout for a set of nodes and edges using Dagre.
 */
export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    // FIX: Create a fresh graph per call to prevent memory leak/data mix-up between families
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))

    const isHorizontal = direction === 'LR'
    dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 180 }) // Increased ranksep for cleaner look

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
    })

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        node.targetPosition = isHorizontal ? 'left' : 'top' as any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        node.sourcePosition = isHorizontal ? 'right' : 'bottom' as any

        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        }

        return node
    })

    return { layoutedNodes, layoutedEdges: edges }
}
