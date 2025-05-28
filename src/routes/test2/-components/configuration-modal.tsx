import { useState } from 'react'

interface DroppedBlock {
    id: string
    type: 'bracket' | 'group-stage' | 'settings' | 'participants' | 'qualification' | 'consolation'
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

interface ConfigurationModalProps {
    selectedBlockData: DroppedBlock
    onUpdateConfig: (blockId: string, newConfig: any) => void
    onClose: () => void
}

export default function ConfigurationModal({
    selectedBlockData,
    onUpdateConfig,
    onClose
}: ConfigurationModalProps) {
    const [newPlayerName, setNewPlayerName] = useState('')

    const addPlayer = () => {
        if (newPlayerName.trim()) {
            const currentPlayers = selectedBlockData.config.playerList || []
            onUpdateConfig(selectedBlockData.id, {
                playerList: [...currentPlayers, newPlayerName.trim()],
                teams: currentPlayers.length + 1
            })
            setNewPlayerName('')
        }
    }

    const removePlayer = (index: number) => {
        const currentPlayers = selectedBlockData.config.playerList || []
        const newPlayers = currentPlayers.filter((_, i) => i !== index)
        onUpdateConfig(selectedBlockData.id, {
            playerList: newPlayers,
            teams: newPlayers.length
        })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 50 }}>
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Configure {selectedBlockData.title}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Custom Name for all blocks */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Custom Name</label>
                        <input
                            type="text"
                            value={selectedBlockData.config.customName || ''}
                            onChange={(e) => onUpdateConfig(selectedBlockData.id, { customName: e.target.value })}
                            placeholder={selectedBlockData.title}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {/* Venue */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Venue</label>
                        <input
                            type="text"
                            value={selectedBlockData.config.venue || ''}
                            onChange={(e) => onUpdateConfig(selectedBlockData.id, { venue: e.target.value })}
                            placeholder="Tournament venue"
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {/* Schedule Type */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Schedule Type</label>
                        <select
                            value={selectedBlockData.config.scheduleType || 'immediate'}
                            onChange={(e) => onUpdateConfig(selectedBlockData.id, { scheduleType: e.target.value })}
                            className="w-full p-2 border rounded"
                        >
                            <option value="immediate">Start Immediately</option>
                            <option value="timed">Scheduled Start</option>
                            <option value="manual">Manual Control</option>
                        </select>
                    </div>

                    {/* Start Time (if timed) */}
                    {selectedBlockData.config.scheduleType === 'timed' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Time</label>
                            <input
                                type="datetime-local"
                                value={selectedBlockData.config.startTime || ''}
                                onChange={(e) => onUpdateConfig(selectedBlockData.id, { startTime: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    )}

                    {/* Match Duration */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Match Duration (minutes)</label>
                        <input
                            type="number"
                            value={selectedBlockData.config.matchDuration || 30}
                            onChange={(e) => onUpdateConfig(selectedBlockData.id, { matchDuration: parseInt(e.target.value) })}
                            className="w-full p-2 border rounded"
                            min="5"
                            max="180"
                        />
                    </div>

                    {/* Break Between Matches */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Break Between Matches (minutes)</label>
                        <input
                            type="number"
                            value={selectedBlockData.config.breakBetweenMatches || 5}
                            onChange={(e) => onUpdateConfig(selectedBlockData.id, { breakBetweenMatches: parseInt(e.target.value) })}
                            className="w-full p-2 border rounded"
                            min="0"
                            max="60"
                        />
                    </div>
                </div>

                {/* Participant List Management */}
                {selectedBlockData.type === 'participants' && (
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Seeding Method</label>
                            <select
                                value={selectedBlockData.config.seedingMethod || 'random'}
                                onChange={(e) => onUpdateConfig(selectedBlockData.id, { seedingMethod: e.target.value })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="random">Random</option>
                                <option value="manual">Manual</option>
                                <option value="ranking">By Ranking</option>
                                <option value="snake">Snake Draft</option>
                                <option value="balanced">Balanced Groups</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Add Player</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newPlayerName}
                                    onChange={(e) => setNewPlayerName(e.target.value)}
                                    placeholder="Player name"
                                    className="flex-1 p-2 border rounded"
                                    onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                                />
                                <button
                                    onClick={addPlayer}
                                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Players ({selectedBlockData.config.playerList?.length || 0})
                            </label>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {(selectedBlockData.config.playerList || []).map((player, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span className="text-sm">{player}</span>
                                        <button
                                            onClick={() => removePlayer(index)}
                                            className="text-red-500 hover:text-red-700 text-xs"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Qualification Configuration */}
                {selectedBlockData.type === 'qualification' && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Expected Participants</label>
                            <input
                                type="number"
                                value={selectedBlockData.config.teams || 16}
                                onChange={(e) => onUpdateConfig(selectedBlockData.id, { teams: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded"
                                min="4"
                                max="128"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Qualification Threshold</label>
                            <input
                                type="number"
                                value={selectedBlockData.config.qualificationThreshold || 8}
                                onChange={(e) => onUpdateConfig(selectedBlockData.id, { qualificationThreshold: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded"
                                min="2"
                                max={selectedBlockData.config.teams || 16}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Elimination Type</label>
                            <select
                                value={selectedBlockData.config.eliminationType || 'single'}
                                onChange={(e) => onUpdateConfig(selectedBlockData.id, { eliminationType: e.target.value })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="single">Single Elimination</option>
                                <option value="double">Double Elimination</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Best of</label>
                            <select
                                value={selectedBlockData.config.bestOf || 1}
                                onChange={(e) => onUpdateConfig(selectedBlockData.id, { bestOf: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded"
                            >
                                <option value={1}>Best of 1</option>
                                <option value={3}>Best of 3</option>
                                <option value={5}>Best of 5</option>
                                <option value={7}>Best of 7</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Group Stage Configuration */}
                {selectedBlockData.type === 'group-stage' && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Number of Groups</label>
                            <input
                                type="number"
                                value={selectedBlockData.config.groups || 2}
                                onChange={(e) => onUpdateConfig(selectedBlockData.id, { groups: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded"
                                min="1"
                                max="16"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Players per Group</label>
                            <input
                                type="number"
                                value={selectedBlockData.config.groupSize || 4}
                                onChange={(e) => onUpdateConfig(selectedBlockData.id, { groupSize: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded"
                                min="2"
                                max="8"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Advancing Players per Group</label>
                            <input
                                type="number"
                                value={selectedBlockData.config.advancingPlayers || 2}
                                onChange={(e) => onUpdateConfig(selectedBlockData.id, { advancingPlayers: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded"
                                min="1"
                                max={selectedBlockData.config.groupSize || 4}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Best of</label>
                            <select
                                value={selectedBlockData.config.bestOf || 1}
                                onChange={(e) => onUpdateConfig(selectedBlockData.id, { bestOf: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded"
                            >
                                <option value={1}>Best of 1</option>
                                <option value={3}>Best of 3</option>
                                <option value={5}>Best of 5</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Bracket Configuration */}
                {(selectedBlockData.type === 'bracket' || selectedBlockData.type === 'consolation') && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Expected Teams</label>
                            <input
                                type="number"
                                value={selectedBlockData.config.teams || 8}
                                onChange={(e) => onUpdateConfig(selectedBlockData.id, { teams: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded"
                                min="2"
                                max="64"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Elimination Type</label>
                            <select
                                value={selectedBlockData.config.eliminationType || 'single'}
                                onChange={(e) => onUpdateConfig(selectedBlockData.id, { eliminationType: e.target.value })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="single">Single Elimination</option>
                                <option value="double">Double Elimination</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Best of</label>
                            <select
                                value={selectedBlockData.config.bestOf || 1}
                                onChange={(e) => onUpdateConfig(selectedBlockData.id, { bestOf: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded"
                            >
                                <option value={1}>Best of 1</option>
                                <option value={3}>Best of 3</option>
                                <option value={5}>Best of 5</option>
                                <option value={7}>Best of 7</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tiebreaker</label>
                            <select
                                value={selectedBlockData.config.tiebreaker || 'overtime'}
                                onChange={(e) => onUpdateConfig(selectedBlockData.id, { tiebreaker: e.target.value })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="overtime">Overtime</option>
                                <option value="penalty">Penalty Shootout</option>
                                <option value="golden-goal">Golden Goal</option>
                            </select>
                        </div>
                        {selectedBlockData.type === 'bracket' && (
                            <div className="col-span-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedBlockData.config.thirdPlacePlayoff || false}
                                        onChange={(e) => onUpdateConfig(selectedBlockData.id, { thirdPlacePlayoff: e.target.checked })}
                                    />
                                    <span className="text-sm">3rd Place Playoff</span>
                                </label>
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Configuration */}
                {selectedBlockData.type === 'settings' && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Points to Win</label>
                            <input
                                type="number"
                                value={selectedBlockData.config.pointsToWin || 21}
                                onChange={(e) => onUpdateConfig(selectedBlockData.id, { pointsToWin: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded"
                                min="1"
                                max="100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Max Players per Match</label>
                            <input
                                type="number"
                                value={selectedBlockData.config.maxPlayersPerMatch || 2}
                                onChange={(e) => onUpdateConfig(selectedBlockData.id, { maxPlayersPerMatch: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded"
                                min="2"
                                max="8"
                            />
                        </div>
                    </div>
                )}

                <div className="flex gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    )
}
