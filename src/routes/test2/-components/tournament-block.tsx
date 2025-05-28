import { useState, useRef } from 'react'

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

interface TournamentBlockProps {
    block: DroppedBlock
    isConnecting: boolean
    connectingFrom: string | null
    onMouseDown: (e: React.MouseEvent, blockId: string) => void
    onConnect: (blockId: string) => void
    onConfigure: (blockId: string) => void
    onRemove: (blockId: string) => void
    onDuplicate: (blockId: string) => void
    getBlockColor: (type: string) => string
    isConnectedToParticipants: boolean
    incomingPlayerCount: number
    capacityStatus: 'ok' | 'warning' | 'error'
}

export default function TournamentBlockComponent({
    block,
    isConnecting,
    connectingFrom,
    onMouseDown,
    onConnect,
    onConfigure,
    onRemove,
    onDuplicate,
    getBlockColor,
    isConnectedToParticipants,
    incomingPlayerCount,
    capacityStatus
}: TournamentBlockProps) {

    const getBlockIcon = () => {
        switch (block.type) {
            case 'participants': return '👥'
            case 'qualification': return '🎯'
            case 'bracket': return '🏆'
            case 'consolation': return '🥉'
            case 'group-stage': return '⚽'
            case 'settings': return '⚙️'
            default: return '📦'
        }
    }

    const canAcceptConnection = () => {
        if (block.type === 'participants') return false // Participant blocks only output
        return true
    }

    const getCapacityIndicator = () => {
        if (capacityStatus === 'ok') return '✅'
        if (capacityStatus === 'warning') return '⚠️'
        if (capacityStatus === 'error') return '❌'
        return ''
    }

    const getExpectedCapacity = () => {
        if (block.type === 'bracket') {
            return block.config.teams || 8
        } else if (block.type === 'group-stage') {
            return (block.config.groups || 2) * (block.config.groupSize || 4)
        }
        return 0
    }

    return (
        <div
            className={`absolute p-4 rounded-lg border-2 shadow-lg min-w-48 transition-transform ${getBlockColor(block.type)} ${connectingFrom === block.id ? 'ring-2 ring-blue-400' : ''
                } ${isConnecting && canAcceptConnection() && connectingFrom !== block.id ? 'ring-2 ring-green-400' : ''} 
      ${capacityStatus === 'error' ? 'ring-2 ring-red-500' : ''} 
      cursor-grab hover:shadow-xl`}
            style={{ left: block.x, top: block.y, zIndex: 3 }}
            onMouseDown={(e) => onMouseDown(e, block.id)}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{getBlockIcon()}</span>
                    <div className="font-medium text-sm truncate pr-2">
                        {block.config.customName || block.title}
                    </div>
                    {block.type !== 'participants' && block.type !== 'settings' && (
                        <span className="text-sm">{getCapacityIndicator()}</span>
                    )}
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDuplicate(block.id)
                        }}
                        className="text-blue-500 hover:text-blue-700 text-xs"
                        title="Duplicate"
                    >
                        📋
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onRemove(block.id)
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Participants Block */}
            {block.type === 'participants' && (
                <div className="text-sm space-y-1">
                    <div className="text-xs text-gray-600">
                        Players: {block.config.playerList?.length || block.config.teams || 0}
                    </div>
                    <div className="text-xs text-blue-600">
                        ✅ Starting Block - Add players here
                    </div>
                    <div className="text-xs text-gray-600">
                        Seeding: {block.config.seedingMethod || 'Random'}
                    </div>
                    {block.config.scheduleType === 'timed' && block.config.startTime && (
                        <div className="text-xs text-purple-600">
                            ⏰ Starts: {block.config.startTime}
                        </div>
                    )}
                </div>
            )}

            {/* Qualification Block */}
            {block.type === 'qualification' && (
                <div className="text-sm space-y-1">
                    <div>🎯 Qualification Round</div>
                    <div className="text-xs text-gray-600">
                        Expected: {getExpectedCapacity()} players
                    </div>
                    <div className="text-xs text-gray-600">
                        Incoming: {incomingPlayerCount} players
                    </div>
                    <div className="text-xs text-blue-600">
                        Qualifying: {block.config.qualificationThreshold || Math.floor((block.config.teams || 0) / 2)} players
                    </div>
                    {block.config.bestOf && block.config.bestOf > 1 && (
                        <div className="text-xs text-purple-600">
                            Best of {block.config.bestOf}
                        </div>
                    )}
                    {!isConnectedToParticipants ? (
                        <div className="text-xs text-orange-600">
                            ⚡ Connect participant list to populate
                        </div>
                    ) : capacityStatus === 'ok' ? (
                        <div className="text-xs text-green-600">
                            ✅ Ready for qualification!
                        </div>
                    ) : null}
                </div>
            )}

            {/* Consolation Block */}
            {block.type === 'consolation' && (
                <div className="text-sm space-y-1">
                    <div>🥉 Consolation Bracket</div>
                    <div className="text-xs text-gray-600">
                        For eliminated players
                    </div>
                    <div className="text-xs text-gray-600">
                        Expected: {getExpectedCapacity()} players
                    </div>
                    <div className="text-xs text-gray-600">
                        Incoming: {incomingPlayerCount} players
                    </div>
                    {block.config.eliminationType === 'double' && (
                        <div className="text-xs text-purple-600">
                            Double Elimination
                        </div>
                    )}
                    {!isConnectedToParticipants ? (
                        <div className="text-xs text-orange-600">
                            ⚡ Connect from main tournament
                        </div>
                    ) : null}
                </div>
            )}

            {/* Bracket Block */}
            {block.type === 'bracket' && (
                <div className="text-sm space-y-1">
                    <div>📊 {block.config.eliminationType === 'double' ? 'Double' : 'Single'} Elimination</div>
                    <div className="text-xs text-gray-600">
                        Expected: {getExpectedCapacity()} players
                    </div>
                    <div className="text-xs text-gray-600">
                        Incoming: {incomingPlayerCount} players
                    </div>
                    {block.config.thirdPlacePlayoff && (
                        <div className="text-xs text-purple-600">
                            🥉 3rd Place Playoff
                        </div>
                    )}
                    {block.config.bestOf && block.config.bestOf > 1 && (
                        <div className="text-xs text-purple-600">
                            Best of {block.config.bestOf}
                        </div>
                    )}
                    {block.config.matchDuration && (
                        <div className="text-xs text-gray-500">
                            ⏱️ {block.config.matchDuration}min matches
                        </div>
                    )}
                    {!isConnectedToParticipants ? (
                        <div className="text-xs text-orange-600">
                            ⚡ Connect participant list to populate
                        </div>
                    ) : capacityStatus === 'error' ? (
                        <div className="text-xs text-red-600">
                            ❌ Too many players! ({incomingPlayerCount}/{getExpectedCapacity()})
                        </div>
                    ) : capacityStatus === 'warning' && incomingPlayerCount > 0 ? (
                        <div className="text-xs text-yellow-600">
                            ⚠️ Capacity mismatch ({incomingPlayerCount}/{getExpectedCapacity()})
                        </div>
                    ) : capacityStatus === 'ok' ? (
                        <div className="text-xs text-green-600">
                            ✅ Perfect capacity match!
                        </div>
                    ) : null}
                </div>
            )}

            {/* Group Stage Block */}
            {block.type === 'group-stage' && (
                <div className="text-sm space-y-1">
                    <div>👥 {block.config.groups} Groups</div>
                    <div className="text-xs text-gray-600">
                        {block.config.groupSize} per group | {block.config.advancingPlayers} advance
                    </div>
                    <div className="text-xs text-gray-600">
                        Expected: {getExpectedCapacity()} players
                    </div>
                    <div className="text-xs text-gray-600">
                        Incoming: {incomingPlayerCount} players
                    </div>
                    <div className="text-xs text-blue-600">
                        Advancing: {(block.config.groups || 1) * (block.config.advancingPlayers || 1)} players
                    </div>
                    {block.config.matchDuration && (
                        <div className="text-xs text-gray-500">
                            ⏱️ {block.config.matchDuration}min matches
                        </div>
                    )}
                    {!isConnectedToParticipants ? (
                        <div className="text-xs text-orange-600">
                            ⚡ Connect participant list to populate
                        </div>
                    ) : capacityStatus === 'ok' ? (
                        <div className="text-xs text-green-600">
                            ✅ Perfect capacity match!
                        </div>
                    ) : null}
                </div>
            )}

            {/* Settings Block */}
            {block.type === 'settings' && (
                <div className="text-sm space-y-1">
                    <div>⚙️ Tournament Settings</div>
                    <div className="text-xs text-gray-600">Format • Timing • Rules</div>
                    {block.config.venue && (
                        <div className="text-xs text-purple-600">
                            📍 {block.config.venue}
                        </div>
                    )}
                    {block.config.scheduleType === 'timed' && (
                        <div className="text-xs text-blue-600">
                            ⏰ Scheduled Tournament
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="mt-2 flex gap-1">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onConfigure(block.id)
                    }}
                    className="px-2 py-1 bg-white border rounded text-xs hover:bg-gray-50"
                >
                    Configure
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onConnect(block.id)
                    }}
                    className={`px-2 py-1 border rounded text-xs ${connectingFrom === block.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-white hover:bg-blue-50'
                        }`}
                >
                    {block.type === 'participants' ? 'Send To' : 'Connect'}
                </button>
            </div>
        </div>
    )
}
