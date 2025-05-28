import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import Sidebar from './-components/sidebar'
import TournamentCanvas from './-components/tournament-canvas'
import ConfigurationModal from './-components/configuration-modal'
import ImportExportModal from './-components/import-export-modal'

export const Route = createFileRoute('/test2/')({
    component: RouteComponent,
})

interface TournamentBlock {
    id: string
    type: 'bracket' | 'group-stage' | 'settings' | 'participants' | 'qualification' | 'consolation'
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
        seedingMethod?: 'random' | 'manual' | 'ranking' | 'snake' | 'balanced'
        customName?: string
        playerList?: string[]
        canAcceptPlayers?: boolean
        isStartingBlock?: boolean
        // New advanced options
        qualificationThreshold?: number
        scheduleType?: 'immediate' | 'timed' | 'manual'
        startTime?: string
        matchDuration?: number
        breakBetweenMatches?: number
        venue?: string
        maxPlayersPerMatch?: number
        pointsToWin?: number
        bestOf?: number
        tiebreaker?: 'overtime' | 'penalty' | 'golden-goal'
        consolationEnabled?: boolean
        thirdPlacePlayoff?: boolean
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

interface TournamentData {
    version: string
    createdAt: string
    tournament: {
        name: string
        description?: string
        blocks: DroppedBlock[]
        connections: Connection[]
        metadata?: {
            totalPlayers?: number
            estimatedDuration?: number
            venue?: string
            organizer?: string
        }
    }
}

const TOURNAMENT_SCHEMA_VERSION = "1.0.0"

function RouteComponent() {
    const [droppedBlocks, setDroppedBlocks] = useState<DroppedBlock[]>([])
    const [draggedBlock, setDraggedBlock] = useState<TournamentBlock | null>(null)
    const [connections, setConnections] = useState<Connection[]>([])
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
    const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
    const [showConfig, setShowConfig] = useState(false)
    const [draggingCanvas, setDraggingCanvas] = useState<string | null>(null)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [showImportExport, setShowImportExport] = useState(false)
    const [tournamentName, setTournamentName] = useState('')
    const [tournamentDescription, setTournamentDescription] = useState('')
    const canvasRef = useRef<HTMLDivElement>(null)

    const buildingBlocks: TournamentBlock[] = [
        { id: 'participants', type: 'participants', title: 'Participant List' },
        { id: 'qualification', type: 'qualification', title: 'Qualification Round' },
        { id: 'single-elim', type: 'bracket', title: 'Single Elimination' },
        { id: 'double-elim', type: 'bracket', title: 'Double Elimination' },
        { id: 'round-robin', type: 'group-stage', title: 'Round Robin' },
        { id: 'swiss', type: 'group-stage', title: 'Swiss System' },
        { id: 'consolation', type: 'consolation', title: 'Consolation Bracket' },
        { id: 'settings', type: 'settings', title: 'Tournament Settings' },
    ]

    const tournamentTemplates: TournamentTemplate[] = [
        {
            name: '8-Team Single Elimination',
            icon: '🏆',
            blocks: [
                {
                    type: 'participants',
                    title: 'Participant List',
                    x: 50,
                    y: 50,
                    config: {
                        teams: 8,
                        playerList: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8'],
                        canAcceptPlayers: true,
                        isStartingBlock: true,
                        seedingMethod: 'random'
                    }
                },
                {
                    type: 'bracket',
                    title: 'Single Elimination',
                    x: 350,
                    y: 50,
                    config: {
                        teams: 8,
                        eliminationType: 'single',
                        thirdPlacePlayoff: true
                    }
                }
            ],
            connections: []
        },
        {
            name: 'Groups to Knockout',
            icon: '⚽',
            blocks: [
                {
                    type: 'participants',
                    title: 'Participant List',
                    x: 50,
                    y: 50,
                    config: {
                        teams: 16,
                        playerList: Array.from({ length: 16 }, (_, i) => `Player ${i + 1}`),
                        canAcceptPlayers: true,
                        isStartingBlock: true,
                        seedingMethod: 'balanced'
                    }
                },
                {
                    type: 'group-stage',
                    title: 'Group Stage',
                    x: 350,
                    y: 50,
                    config: {
                        groups: 4,
                        groupSize: 4,
                        advancingPlayers: 2
                    }
                },
                {
                    type: 'bracket',
                    title: 'Knockout Stage',
                    x: 650,
                    y: 50,
                    config: {
                        teams: 8,
                        eliminationType: 'single',
                        thirdPlacePlayoff: true
                    }
                }
            ],
            connections: []
        },
        {
            name: 'Qualification Tournament',
            icon: '🎯',
            blocks: [
                {
                    type: 'participants',
                    title: 'All Participants',
                    x: 50,
                    y: 50,
                    config: {
                        teams: 32,
                        playerList: Array.from({ length: 32 }, (_, i) => `Player ${i + 1}`),
                        canAcceptPlayers: true,
                        isStartingBlock: true,
                        seedingMethod: 'ranking'
                    }
                },
                {
                    type: 'qualification',
                    title: 'Qualification',
                    x: 350,
                    y: 50,
                    config: {
                        teams: 32,
                        qualificationThreshold: 16,
                        eliminationType: 'single'
                    }
                },
                {
                    type: 'bracket',
                    title: 'Main Tournament',
                    x: 650,
                    y: 50,
                    config: {
                        teams: 16,
                        eliminationType: 'double'
                    }
                },
                {
                    type: 'consolation',
                    title: 'Consolation',
                    x: 650,
                    y: 200,
                    config: {
                        teams: 16,
                        eliminationType: 'single'
                    }
                }
            ],
            connections: []
        }
    ]

    const loadTemplate = (template: TournamentTemplate) => {
        // Clear existing blocks and connections
        setDroppedBlocks([])
        setConnections([])
        setConnectingFrom(null)
        setSelectedBlock(null)
        setShowConfig(false)

        // Create new blocks with unique IDs
        const newBlocks: DroppedBlock[] = template.blocks.map((block, index) => ({
            ...block,
            id: `${block.type}-${Date.now()}-${index}`
        }))

        // Create connections based on the template
        const newConnections: Connection[] = []
        if (template.name === '8-Team Single Elimination') {
            newConnections.push({
                from: newBlocks[0].id,
                to: newBlocks[1].id
            })
        } else if (template.name === 'Groups to Knockout') {
            newConnections.push({
                from: newBlocks[0].id,
                to: newBlocks[1].id
            })
            newConnections.push({
                from: newBlocks[1].id,
                to: newBlocks[2].id
            })
        }

        setDroppedBlocks(newBlocks)
        setConnections(newConnections)
    }

    const clearAll = () => {
        setDroppedBlocks([])
        setConnections([])
        setConnectingFrom(null)
        setSelectedBlock(null)
        setShowConfig(false)
    }

    const handleDragStart = (block: TournamentBlock) => {
        setDraggedBlock(block)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (!draggedBlock) return

        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const newBlock: DroppedBlock = {
            ...draggedBlock,
            id: `${draggedBlock.id}-${Date.now()}`,
            x,
            y,
            config: {
                teams: draggedBlock.type === 'participants' ? 0 : 8,
                groups: draggedBlock.type === 'group-stage' ? 2 : undefined,
                advancingPlayers: draggedBlock.type === 'group-stage' ? 2 : undefined,
                eliminationType: draggedBlock.type === 'bracket' || draggedBlock.type === 'qualification' || draggedBlock.type === 'consolation' ? 'single' : undefined,
                groupSize: 4,
                playerList: draggedBlock.type === 'participants' ? [] : undefined,
                canAcceptPlayers: draggedBlock.type === 'participants',
                isStartingBlock: draggedBlock.type === 'participants',
                seedingMethod: draggedBlock.type === 'participants' ? 'random' : undefined,
                // New defaults
                qualificationThreshold: draggedBlock.type === 'qualification' ? 8 : undefined,
                scheduleType: 'immediate',
                matchDuration: 30,
                breakBetweenMatches: 5,
                bestOf: 1,
                tiebreaker: 'overtime',
                thirdPlacePlayoff: false
            }
        }

        setDroppedBlocks(prev => [...prev, newBlock])
        setDraggedBlock(null)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const removeBlock = (id: string) => {
        setDroppedBlocks(prev => prev.filter(block => block.id !== id))
        setConnections(prev => prev.filter(conn => conn.from !== id && conn.to !== id))
    }

    const handleConnect = (blockId: string) => {
        if (connectingFrom === null) {
            setConnectingFrom(blockId)
        } else if (connectingFrom !== blockId) {
            const fromBlock = droppedBlocks.find(b => b.id === connectingFrom)
            const toBlock = droppedBlocks.find(b => b.id === blockId)

            if (fromBlock && toBlock) {
                // Enhanced connection rules
                const canConnect =
                    fromBlock.type === 'participants' ||
                    (fromBlock.type === 'qualification' && (toBlock.type === 'bracket' || toBlock.type === 'consolation')) ||
                    (fromBlock.type === 'group-stage' && toBlock.type === 'bracket') ||
                    (fromBlock.type === 'bracket' && toBlock.type === 'consolation')

                if (canConnect) {
                    const newConnection = { from: connectingFrom, to: blockId }
                    if (!connections.some(conn => conn.from === newConnection.from && conn.to === newConnection.to)) {
                        setConnections(prev => [...prev, newConnection])
                    }
                }
            }
            setConnectingFrom(null)
        } else {
            setConnectingFrom(null)
        }
    }

    const configureBlock = (blockId: string) => {
        setSelectedBlock(blockId)
        setShowConfig(true)
    }

    const updateBlockConfig = (blockId: string, newConfig: any) => {
        setDroppedBlocks(prev => prev.map(block =>
            block.id === blockId
                ? { ...block, config: { ...block.config, ...newConfig } }
                : block
        ))
    }

    const exportTournament = () => {
        const tournamentData: TournamentData = {
            version: TOURNAMENT_SCHEMA_VERSION,
            createdAt: new Date().toISOString(),
            tournament: {
                name: tournamentName || 'Untitled Tournament',
                description: tournamentDescription,
                blocks: droppedBlocks,
                connections: connections,
                metadata: {
                    totalPlayers: droppedBlocks
                        .filter(b => b.type === 'participants')
                        .reduce((total, b) => total + (b.config.playerList?.length || 0), 0),
                    estimatedDuration: calculateEstimatedDuration(),
                    venue: droppedBlocks.find(b => b.config.venue)?.config.venue,
                    organizer: 'Tournament Builder'
                }
            }
        }

        const dataStr = JSON.stringify(tournamentData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)

        const link = document.createElement('a')
        link.href = url
        link.download = `${tournamentName || 'tournament'}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const importTournament = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string) as TournamentData

                // Validate schema
                if (!validateTournamentSchema(data)) {
                    alert('Invalid tournament file format')
                    return
                }

                // Load tournament data
                setDroppedBlocks(data.tournament.blocks)
                setConnections(data.tournament.connections)
                setTournamentName(data.tournament.name)
                setTournamentDescription(data.tournament.description || '')

                // Clear existing state
                setConnectingFrom(null)
                setSelectedBlock(null)
                setShowConfig(false)
                setShowImportExport(false)

                alert(`Tournament "${data.tournament.name}" loaded successfully!`)
            } catch (error) {
                alert('Error reading tournament file. Please check the file format.')
            }
        }
        reader.readAsText(file)
    }

    const validateTournamentSchema = (data: any): data is TournamentData => {
        return (
            data &&
            typeof data.version === 'string' &&
            data.tournament &&
            Array.isArray(data.tournament.blocks) &&
            Array.isArray(data.tournament.connections) &&
            typeof data.tournament.name === 'string'
        )
    }

    const calculateEstimatedDuration = (): number => {
        let totalMatches = 0
        let avgMatchDuration = 30

        droppedBlocks.forEach(block => {
            if (block.type === 'bracket') {
                const players = getIncomingPlayerCount(block.id)
                totalMatches += players - 1 // Standard elimination matches
                avgMatchDuration = block.config.matchDuration || 30
            } else if (block.type === 'group-stage') {
                const groups = block.config.groups || 2
                const groupSize = block.config.groupSize || 4
                const matchesPerGroup = (groupSize * (groupSize - 1)) / 2
                totalMatches += groups * matchesPerGroup
                avgMatchDuration = block.config.matchDuration || 30
            } else if (block.type === 'qualification') {
                const players = getIncomingPlayerCount(block.id)
                totalMatches += Math.floor(players / 2) // Rough estimate
                avgMatchDuration = block.config.matchDuration || 30
            }
        })

        const breakTime = droppedBlocks[0]?.config.breakBetweenMatches || 5
        return totalMatches * (avgMatchDuration + breakTime)
    }

    const generateTournamentSchema = () => {
        const schema = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "Tournament Configuration",
            "description": "Schema for tournament builder configuration files",
            "type": "object",
            "required": ["version", "createdAt", "tournament"],
            "properties": {
                "version": {
                    "type": "string",
                    "description": "Schema version"
                },
                "createdAt": {
                    "type": "string",
                    "format": "date-time",
                    "description": "Creation timestamp"
                },
                "tournament": {
                    "type": "object",
                    "required": ["name", "blocks", "connections"],
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "Tournament name"
                        },
                        "description": {
                            "type": "string",
                            "description": "Tournament description"
                        },
                        "blocks": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "required": ["id", "type", "title", "x", "y", "config"],
                                "properties": {
                                    "id": { "type": "string" },
                                    "type": {
                                        "enum": ["bracket", "group-stage", "settings", "participants", "qualification", "consolation"]
                                    },
                                    "title": { "type": "string" },
                                    "x": { "type": "number" },
                                    "y": { "type": "number" },
                                    "config": { "type": "object" }
                                }
                            }
                        },
                        "connections": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "required": ["from", "to"],
                                "properties": {
                                    "from": { "type": "string" },
                                    "to": { "type": "string" },
                                    "playerCount": { "type": "number" }
                                }
                            }
                        },
                        "metadata": {
                            "type": "object",
                            "properties": {
                                "totalPlayers": { "type": "number" },
                                "estimatedDuration": { "type": "number" },
                                "venue": { "type": "string" },
                                "organizer": { "type": "string" }
                            }
                        }
                    }
                }
            }
        }

        const schemaStr = JSON.stringify(schema, null, 2)
        const dataBlob = new Blob([schemaStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)

        const link = document.createElement('a')
        link.href = url
        link.download = 'tournament-schema.json'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const getBlockColor = (type: string) => {
        switch (type) {
            case 'bracket': return 'bg-blue-100 border-blue-300'
            case 'group-stage': return 'bg-green-100 border-green-300'
            case 'participants': return 'bg-purple-100 border-purple-300'
            case 'qualification': return 'bg-yellow-100 border-yellow-300'
            case 'consolation': return 'bg-orange-100 border-orange-300'
            case 'settings': return 'bg-gray-100 border-gray-300'
            default: return 'bg-gray-100 border-gray-300'
        }
    }

    const getConnectionPath = (from: DroppedBlock, to: DroppedBlock) => {
        const fromX = from.x + 96 // half width of block
        const fromY = from.y + 20
        const toX = to.x + 96
        const toY = to.y + 20

        return `M ${fromX} ${fromY} Q ${(fromX + toX) / 2} ${fromY - 50} ${toX} ${toY}`
    }

    const selectedBlockData = selectedBlock ? droppedBlocks.find(b => b.id === selectedBlock) : null

    const handleCanvasBlockMouseDown = (e: React.MouseEvent, blockId: string) => {
        if (e.button !== 0) return // Only left click
        e.preventDefault()
        e.stopPropagation()

        const rect = e.currentTarget.getBoundingClientRect()
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        })
        setDraggingCanvas(blockId)
    }

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (!draggingCanvas || !canvasRef.current) return

        const canvasRect = canvasRef.current.getBoundingClientRect()
        const newX = e.clientX - canvasRect.left - dragOffset.x
        const newY = e.clientY - canvasRect.top - dragOffset.y

        setDroppedBlocks(prev => prev.map(block =>
            block.id === draggingCanvas
                ? { ...block, x: Math.max(0, newX), y: Math.max(0, newY) }
                : block
        ))
    }

    const handleCanvasMouseUp = () => {
        setDraggingCanvas(null)
    }

    const removeConnection = (from: string, to: string) => {
        setConnections(prev => prev.filter(conn => !(conn.from === from && conn.to === to)))
    }

    const calculatePlayerFlow = (fromBlockId: string, toBlockId: string): number => {
        const fromBlock = droppedBlocks.find(b => b.id === fromBlockId)
        const toBlock = droppedBlocks.find(b => b.id === toBlockId)
        if (!fromBlock) return 0

        if (fromBlock.type === 'participants') {
            return fromBlock.config.playerList?.length || fromBlock.config.teams || 0
        } else if (fromBlock.type === 'qualification') {
            return fromBlock.config.qualificationThreshold || Math.floor((fromBlock.config.teams || 0) / 2)
        } else if (fromBlock.type === 'group-stage') {
            return (fromBlock.config.groups || 1) * (fromBlock.config.advancingPlayers || 1)
        } else if (fromBlock.type === 'bracket') {
            // If connecting to consolation, send eliminated players
            if (toBlock?.type === 'consolation') {
                const incomingPlayers = getIncomingPlayerCount(fromBlockId)
                return Math.max(0, incomingPlayers - 1) // All except winner
            }
            return 1 // Winner
        }
        return 0
    }

    const getIncomingPlayerCount = (blockId: string): number => {
        const incomingConnections = connections.filter(c => c.to === blockId)
        return incomingConnections.reduce((total, conn) => {
            return total + calculatePlayerFlow(conn.from, conn.to)
        }, 0)
    }

    const getOutgoingPlayerCount = (blockId: string): number => {
        const outgoingConnections = connections.filter(c => c.from === blockId)
        return outgoingConnections.reduce((total, conn) => {
            return total + calculatePlayerFlow(conn.from, conn.to)
        }, 0)
    }

    const getExpectedCapacity = (block: DroppedBlock): number => {
        if (block.type === 'bracket' || block.type === 'consolation') {
            return block.config.teams || 8
        } else if (block.type === 'group-stage') {
            return (block.config.groups || 2) * (block.config.groupSize || 4)
        } else if (block.type === 'qualification') {
            return block.config.teams || 16
        }
        return 0
    }

    const getCapacityStatus = (block: DroppedBlock): 'ok' | 'warning' | 'error' => {
        const incoming = getIncomingPlayerCount(block.id)
        const expected = getExpectedCapacity(block)

        if (incoming === 0) return 'warning' // No players connected
        if (incoming === expected) return 'ok'
        if (incoming > expected) return 'error' // Overcrowded
        return 'warning' // Under capacity
    }

    const isConnectedToParticipants = (blockId: string): boolean => {
        const incomingConnections = connections.filter(c => c.to === blockId)
        return incomingConnections.some(conn => {
            const fromBlock = droppedBlocks.find(b => b.id === conn.from)
            return fromBlock?.type === 'participants' ||
                (fromBlock && isConnectedToParticipants(fromBlock.id))
        })
    }

    const autoLayout = () => {
        if (droppedBlocks.length === 0) return

        const sorted = [...droppedBlocks].sort((a, b) => {
            // Participants first, then seeding, then group stages, then brackets, then settings
            const order = { participants: 0, seeding: 1, 'group-stage': 2, bracket: 3, settings: 4 }
            return order[a.type] - order[b.type]
        })

        const spacing = { x: 280, y: 150 }
        const startPos = { x: 50, y: 50 }

        setDroppedBlocks(prev => prev.map(block => {
            const index = sorted.findIndex(s => s.id === block.id)
            const row = Math.floor(index / 3)
            const col = index % 3

            return {
                ...block,
                x: startPos.x + col * spacing.x,
                y: startPos.y + row * spacing.y
            }
        }))
    }

    const duplicateBlock = (blockId: string) => {
        const block = droppedBlocks.find(b => b.id === blockId)
        if (!block) return

        const newBlock: DroppedBlock = {
            ...block,
            id: `${block.id}-copy-${Date.now()}`,
            x: block.x + 20,
            y: block.y + 20,
            config: { ...block.config, customName: `${block.config.customName || block.title} Copy` }
        }

        setDroppedBlocks(prev => [...prev, newBlock])
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar
                connectingFrom={connectingFrom}
                setConnectingFrom={setConnectingFrom}
                buildingBlocks={buildingBlocks}
                droppedBlocks={droppedBlocks}
                connections={connections}
                onDragStart={handleDragStart}
                onAutoLayout={autoLayout}
                getBlockColor={getBlockColor}
                calculatePlayerFlow={calculatePlayerFlow}
                getIncomingPlayerCount={getIncomingPlayerCount}
                getOutgoingPlayerCount={getOutgoingPlayerCount}
                tournamentTemplates={tournamentTemplates}
                onLoadTemplate={loadTemplate}
                onClearAll={clearAll}
                onImportExport={() => setShowImportExport(true)}
                tournamentName={tournamentName}
                estimatedDuration={calculateEstimatedDuration()}
            />

            <TournamentCanvas
                droppedBlocks={droppedBlocks}
                connections={connections}
                connectingFrom={connectingFrom}
                draggingCanvas={draggingCanvas}
                dragOffset={dragOffset}
                canvasRef={canvasRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onCanvasBlockMouseDown={handleCanvasBlockMouseDown}
                onConnect={handleConnect}
                onConfigure={configureBlock}
                onRemove={removeBlock}
                onDuplicate={duplicateBlock}
                onRemoveConnection={removeConnection}
                getBlockColor={getBlockColor}
                calculatePlayerFlow={calculatePlayerFlow}
                getConnectionPath={getConnectionPath}
                isConnectedToParticipants={isConnectedToParticipants}
                getIncomingPlayerCount={getIncomingPlayerCount}
                getCapacityStatus={getCapacityStatus}
            />

            {showConfig && selectedBlockData && (
                <ConfigurationModal
                    selectedBlockData={selectedBlockData}
                    onUpdateConfig={updateBlockConfig}
                    onClose={() => setShowConfig(false)}
                />
            )}

            {showImportExport && (
                <ImportExportModal
                    tournamentName={tournamentName}
                    tournamentDescription={tournamentDescription}
                    onNameChange={setTournamentName}
                    onDescriptionChange={setTournamentDescription}
                    onExport={exportTournament}
                    onImport={importTournament}
                    onGenerateSchema={generateTournamentSchema}
                    onClose={() => setShowImportExport(false)}
                    estimatedDuration={calculateEstimatedDuration()}
                    totalPlayers={droppedBlocks
                        .filter(b => b.type === 'participants')
                        .reduce((total, b) => total + (b.config.playerList?.length || 0), 0)}
                />
            )}
        </div>
    )
}
