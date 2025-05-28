interface TournamentBlock {
    id: string
    type: 'bracket' | 'group-stage' | 'settings' | 'participants'
    title: string
    config?: any
}

interface DroppedBlock extends TournamentBlock {
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
        playerList?: string[]
        canAcceptPlayers?: boolean
        isStartingBlock?: boolean
    }
}

interface Connection {
    from: string
    to: string
    playerCount?: number
}

interface TournamentTemplate {
    name: string
    icon: string
    blocks: Omit<DroppedBlock, 'id'>[]
    connections: Omit<Connection, 'from' | 'to'>[]
}

interface SidebarProps {
    connectingFrom: string | null
    setConnectingFrom: (id: string | null) => void
    buildingBlocks: TournamentBlock[]
    droppedBlocks: DroppedBlock[]
    connections: Connection[]
    onDragStart: (block: TournamentBlock) => void
    onAutoLayout: () => void
    getBlockColor: (type: string) => string
    calculatePlayerFlow: (fromBlockId: string, toBlockId: string) => number
    getIncomingPlayerCount: (blockId: string) => number
    getOutgoingPlayerCount: (blockId: string) => number
    tournamentTemplates: TournamentTemplate[]
    onLoadTemplate: (template: TournamentTemplate) => void
    onClearAll: () => void
    onImportExport: () => void
    tournamentName: string
    estimatedDuration: number
}

export default function Sidebar({
    connectingFrom,
    setConnectingFrom,
    buildingBlocks,
    droppedBlocks,
    connections,
    onDragStart,
    onAutoLayout,
    getBlockColor,
    calculatePlayerFlow,
    getIncomingPlayerCount,
    getOutgoingPlayerCount,
    tournamentTemplates,
    onLoadTemplate,
    onClearAll,
    onImportExport,
    tournamentName,
    estimatedDuration
}: SidebarProps) {

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    }

    return (
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Tournament Builder</h2>

            {/* Tournament Info */}
            {(tournamentName || droppedBlocks.length > 0) && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">
                        {tournamentName || 'Untitled Tournament'}
                    </div>
                    {estimatedDuration > 0 && (
                        <div className="text-xs text-blue-600">
                            ⏱️ Duration: {formatDuration(estimatedDuration)}
                        </div>
                    )}
                </div>
            )}

            {connectingFrom && (
                <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    🔗 Click another block to connect
                    <button
                        onClick={() => setConnectingFrom(null)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                        Cancel
                    </button>
                </div>
            )}

            <div className="mb-6">
                <h3 className="font-medium mb-2">Quick Templates</h3>
                <div className="space-y-2">
                    {tournamentTemplates.map((template, index) => (
                        <button
                            key={index}
                            onClick={() => onLoadTemplate(template)}
                            className="w-full p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded hover:from-blue-600 hover:to-purple-600 text-sm flex items-center gap-2"
                        >
                            <span>{template.icon}</span>
                            <span>{template.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2 mb-6">
                <h3 className="font-medium mb-2">Building Blocks</h3>
                {buildingBlocks.map((block) => (
                    <div
                        key={block.id}
                        draggable
                        onDragStart={() => onDragStart(block)}
                        className={`p-3 rounded-lg border-2 cursor-move hover:shadow-md transition-shadow ${getBlockColor(block.type)}`}
                    >
                        <div className="font-medium text-sm">{block.title}</div>
                        <div className="text-xs text-gray-500 capitalize">{block.type.replace('-', ' ')}</div>
                    </div>
                ))}
            </div>

            <div className="mb-6">
                <h3 className="font-medium mb-2">Quick Actions</h3>
                <div className="space-y-2">
                    <button
                        onClick={onAutoLayout}
                        className="w-full p-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                    >
                        🎯 Auto Layout
                    </button>
                    <button
                        onClick={onImportExport}
                        className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                        💾 Import/Export
                    </button>
                    <button
                        onClick={onClearAll}
                        className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                        🗑️ Clear All
                    </button>
                </div>
            </div>

            <div>
                <h3 className="font-medium mb-2">Tournament Flow</h3>
                <div className="text-xs space-y-1 max-h-48 overflow-y-auto">
                    {droppedBlocks.map(block => {
                        const incomingCount = getIncomingPlayerCount(block.id)
                        const outgoingCount = getOutgoingPlayerCount(block.id)

                        return (
                            <div key={block.id} className="p-2 bg-gray-50 rounded">
                                <div className="font-medium truncate">
                                    {block.config.customName || block.title}
                                </div>
                                {block.type === 'participants' && (
                                    <div className="text-gray-600">
                                        {block.config.playerList?.length || 0} players
                                    </div>
                                )}
                                {block.type === 'group-stage' && (
                                    <div className="text-gray-600">
                                        {block.config.groups} groups, {block.config.advancingPlayers} advance
                                    </div>
                                )}
                                {incomingCount > 0 && (
                                    <div className="text-green-600 text-xs">
                                        ← {incomingCount} players in
                                    </div>
                                )}
                                {outgoingCount > 0 && (
                                    <div className="text-blue-600 text-xs">
                                        → {outgoingCount} players out
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
