interface DroppedBlock {
    id: string
    type: 'bracket' | 'group-stage' | 'settings' | 'participants'
    title: string
    x: number
    y: number
    connections?: string[]
    config: {
        teams?: number
        groups?: number
        advancingPlayers?: number
        eliminationType?: 'single' | 'double'
        groupSize?: number
        seedingMethod?: 'random' | 'manual' | 'ranking'
        customName?: string
    }
}

interface Connection {
    from: string
    to: string
    playerCount?: number
}

interface ConnectionLinesProps {
    connections: Connection[]
    droppedBlocks: DroppedBlock[]
    onRemoveConnection: (from: string, to: string) => void
    calculatePlayerFlow: (fromBlockId: string, toBlockId: string) => number
    getConnectionPath: (from: DroppedBlock, to: DroppedBlock) => string
}

export default function ConnectionLines({
    connections,
    droppedBlocks,
    onRemoveConnection,
    calculatePlayerFlow,
    getConnectionPath
}: ConnectionLinesProps) {
    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {connections.map((conn, index) => {
                const fromBlock = droppedBlocks.find(b => b.id === conn.from)
                const toBlock = droppedBlocks.find(b => b.id === conn.to)
                if (!fromBlock || !toBlock) return null

                const playerCount = calculatePlayerFlow(conn.from, conn.to)
                const midX = (fromBlock.x + toBlock.x) / 2 + 96
                const midY = (fromBlock.y + toBlock.y) / 2 + 20

                return (
                    <g key={index}>
                        <path
                            d={getConnectionPath(fromBlock, toBlock)}
                            stroke="#3b82f6"
                            strokeWidth="3"
                            fill="none"
                            markerEnd="url(#arrowhead)"
                            style={{
                                pointerEvents: 'stroke',
                                cursor: 'pointer',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                            }}
                            onClick={(e) => {
                                e.preventDefault()
                                onRemoveConnection(conn.from, conn.to)
                            }}
                            className="hover:stroke-red-500 transition-colors"
                            title="Click to disconnect"
                        />

                        {/* Invisible thicker line for easier clicking */}
                        <path
                            d={getConnectionPath(fromBlock, toBlock)}
                            stroke="transparent"
                            strokeWidth="12"
                            fill="none"
                            style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                            onClick={(e) => {
                                e.preventDefault()
                                onRemoveConnection(conn.from, conn.to)
                            }}
                        />

                        {playerCount > 0 && (
                            <g>
                                <circle
                                    cx={midX}
                                    cy={midY}
                                    r="14"
                                    fill="white"
                                    stroke="#3b82f6"
                                    strokeWidth="2"
                                    style={{ pointerEvents: 'none' }}
                                    className="drop-shadow-sm"
                                />
                                <text
                                    x={midX}
                                    y={midY + 3}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="#3b82f6"
                                    fontWeight="bold"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    {playerCount}
                                </text>

                                {/* Disconnect button */}
                                <circle
                                    cx={midX + 18}
                                    cy={midY - 18}
                                    r="8"
                                    fill="#ef4444"
                                    style={{ pointerEvents: 'all', cursor: 'pointer' }}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        onRemoveConnection(conn.from, conn.to)
                                    }}
                                    className="hover:fill-red-600 transition-colors"
                                />
                                <text
                                    x={midX + 18}
                                    y={midY - 15}
                                    textAnchor="middle"
                                    fontSize="8"
                                    fill="white"
                                    fontWeight="bold"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    ✕
                                </text>
                            </g>
                        )}
                    </g>
                )
            })}
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7"
                    refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
            </defs>
        </svg>
    )
}
