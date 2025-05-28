import { RefObject } from 'react'
import TournamentBlockComponent from './tournament-block'
import ConnectionLines from './connection-lines'

interface DroppedBlock {
    id: string
    type: 'bracket' | 'group-stage' | 'settings' | 'participants' | 'seeding'
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

interface TournamentCanvasProps {
    droppedBlocks: DroppedBlock[]
    connections: Connection[]
    connectingFrom: string | null
    draggingCanvas: string | null
    dragOffset: { x: number; y: number }
    canvasRef: RefObject<HTMLDivElement>
    onDrop: (e: React.DragEvent) => void
    onDragOver: (e: React.DragEvent) => void
    onMouseMove: (e: React.MouseEvent) => void
    onMouseUp: () => void
    onCanvasBlockMouseDown: (e: React.MouseEvent, blockId: string) => void
    onConnect: (blockId: string) => void
    onConfigure: (blockId: string) => void
    onRemove: (blockId: string) => void
    onDuplicate: (blockId: string) => void
    onRemoveConnection: (from: string, to: string) => void
    getBlockColor: (type: string) => string
    calculatePlayerFlow: (fromBlockId: string, toBlockId: string) => number
    getConnectionPath: (from: DroppedBlock, to: DroppedBlock) => string
    isConnectedToParticipants: (blockId: string) => boolean
    getIncomingPlayerCount: (blockId: string) => number
    getCapacityStatus: (block: DroppedBlock) => 'ok' | 'warning' | 'error'
}

export default function TournamentCanvas({
    droppedBlocks,
    connections,
    connectingFrom,
    draggingCanvas,
    canvasRef,
    onDrop,
    onDragOver,
    onMouseMove,
    onMouseUp,
    onCanvasBlockMouseDown,
    onConnect,
    onConfigure,
    onRemove,
    onDuplicate,
    onRemoveConnection,
    getBlockColor,
    calculatePlayerFlow,
    getConnectionPath,
    isConnectedToParticipants,
    getIncomingPlayerCount,
    getCapacityStatus
}: TournamentCanvasProps) {

    return (
        <div className="flex-1 relative">
            <div className="p-4 border-b bg-white">
                <h1 className="text-xl font-semibold">Tournament Canvas</h1>
                <p className="text-sm text-gray-600">
                    Drag components • Connect participant lists to tournaments • Configure seeding and flow
                </p>
            </div>

            <div
                ref={canvasRef}
                className="relative w-full h-full bg-gray-50 overflow-hidden cursor-default"
                onDrop={onDrop}
                onDragOver={onDragOver}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                style={{ minHeight: 'calc(100vh - 80px)' }}
            >
                <ConnectionLines
                    connections={connections}
                    droppedBlocks={droppedBlocks}
                    onRemoveConnection={onRemoveConnection}
                    calculatePlayerFlow={calculatePlayerFlow}
                    getConnectionPath={getConnectionPath}
                />

                {droppedBlocks.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400" style={{ zIndex: 2 }}>
                        <div className="text-center">
                            <div className="text-4xl mb-2">🎯</div>
                            <div>Drop tournament components here to start building</div>
                            <div className="text-xs mt-2">Start with a Participant List, then connect to tournaments</div>
                        </div>
                    </div>
                )}

                {droppedBlocks.map((block) => (
                    <TournamentBlockComponent
                        key={block.id}
                        block={block}
                        isConnecting={connectingFrom !== null}
                        connectingFrom={connectingFrom}
                        onMouseDown={onCanvasBlockMouseDown}
                        onConnect={onConnect}
                        onConfigure={onConfigure}
                        onRemove={onRemove}
                        onDuplicate={onDuplicate}
                        getBlockColor={getBlockColor}
                        isConnectedToParticipants={isConnectedToParticipants(block.id)}
                        incomingPlayerCount={getIncomingPlayerCount(block.id)}
                        capacityStatus={getCapacityStatus(block)}
                    />
                ))}
            </div>
        </div>
    )
}
