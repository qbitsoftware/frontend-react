import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react"
import {
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    useDraggable,
    useDroppable,
    PointerSensor,
    useSensor,
    useSensors,
    type DragOverEvent,
} from "@dnd-kit/core"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { cn } from "@/lib/utils"
import { nanoid } from "nanoid"
import { Button } from "@/components/ui/button"
import { Save, Upload, Zap } from "lucide-react"
import { BlockType, Connection, TournamentBlockData } from '@/types/test'
import BlockConfigPanel from './-components/block-panel'
import ConnectionLine from './-components/connection-line'
import TournamentBlock from './-components/tournament-block'

const BLOCK_TYPES: { type: BlockType; label: string; icon: string; description: string }[] = [
    { type: "group", label: "Group Stage", icon: "👥", description: "Round-robin groups" },
    { type: "single-elimination", label: "Single Elimination", icon: "🏆", description: "Knockout bracket" },
    { type: "double-elimination", label: "Double Elimination", icon: "🔄", description: "Winners & losers bracket" },
    { type: "swiss", label: "Swiss System", icon: "🇨🇭", description: "Swiss tournament" },
    { type: "round-robin", label: "Round Robin", icon: "🔄", description: "Everyone plays everyone" },
    { type: "ladder", label: "Ladder", icon: "🪜", description: "Ranking ladder" },
]

export const Route = createFileRoute('/test/')({
    component: RouteComponent,
})

function RouteComponent() {
    const [blocks, setBlocks] = useState<TournamentBlockData[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [connections, setConnections] = useState<Connection[]>([])
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
    const [tournamentName, setTournamentName] = useState("My Tournament")
    const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    )

    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id: "canvas",
        data: {
            accepts: ["tournament-block-template"],
        },
    })

    function handleDragStart(event: DragStartEvent) {
        console.log('Drag start:', event.active.id, event.active.data.current)
        setActiveId(event.active.id as string)
    }

    function handleDragOver(event: DragOverEvent) {
        console.log('Drag over:', {
            active: event.active.id,
            over: event.over?.id,
            overData: event.over?.data,
        })

        // Track mouse position during drag for better visual feedback
        if (event.delta) {
            setMousePosition({ x: event.activatorEvent?.clientX || 0, y: event.activatorEvent?.clientY || 0 })
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        console.log('Drag end full event:', event)
        setActiveId(null)

        const { active, over, delta } = event

        console.log('Drag end:', {
            activeId: active.id,
            activeData: active.data.current,
            overId: over?.id,
            overData: over?.data?.current,
            delta,
            collisions: event.collisions
        })

        if (!over) {
            console.log('No drop target detected - trying manual detection')
            // Try to manually detect if we're over the canvas
            const canvas = document.getElementById('tournament-canvas')
            if (canvas && event.activatorEvent) {
                const rect = canvas.getBoundingClientRect()
                const x = event.activatorEvent.clientX
                const y = event.activatorEvent.clientY

                if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                    console.log('Manual detection: over canvas')
                    // Manually trigger drop logic
                    if (typeof active.id === "string" && active.id.startsWith("sidebar-")) {
                        console.log('Manual drop triggered')
                        createBlockAtPosition(active.id, x, y, rect)
                    }
                }
            }
            return
        }

        // If dragging from sidebar, create a new block
        if (typeof active.id === "string" && active.id.startsWith("sidebar-")) {
            console.log('Dropping sidebar item:', active.id, 'onto:', over.id)

            if (over.id === "canvas") {
                const rect = document.getElementById('tournament-canvas')?.getBoundingClientRect()
                const clientX = event.activatorEvent?.clientX || 0
                const clientY = event.activatorEvent?.clientY || 0

                if (rect) {
                    createBlockAtPosition(active.id, clientX, clientY, rect)
                }
            }
        }
        // If dragging an existing block
        else if (delta) {
            console.log('Moving existing block:', active.id, delta)
            updateBlockPosition(active.id as string, delta)
        }
    }

    function createBlockAtPosition(activeId: string, clientX: number, clientY: number, rect: DOMRect) {
        const type = activeId.replace("sidebar-", "") as BlockType

        const x = Math.max(20, clientX - rect.left - 130)
        const y = Math.max(20, clientY - rect.top - 75)

        const newBlock: TournamentBlockData = {
            id: nanoid(),
            type,
            position: { x, y },
            title: BLOCK_TYPES.find((b) => b.type === type)?.label || type,
            participants: [],
            config: getDefaultConfig(type),
        }

        console.log('New block created:', newBlock)
        setBlocks(prevBlocks => {
            const updated = [...prevBlocks, newBlock]
            console.log('Updated blocks:', updated)
            return updated
        })
    }

    function getDefaultConfig(type: BlockType) {
        switch (type) {
            case "group":
                return { groupCount: 4, teamsPerGroup: 4, advanceCount: 2 }
            case "single-elimination":
                return { teamCount: 16, seeded: true }
            case "double-elimination":
                return { teamCount: 16, seeded: true }
            case "swiss":
                return { rounds: 5, teamCount: 16 }
            case "round-robin":
                return { teamCount: 8 }
            case "ladder":
                return { teamCount: 20, challengeWindow: 7 }
            default:
                return {}
        }
    }

    function updateBlockPosition(id: string, delta: { x: number; y: number }) {
        setBlocks(
            blocks.map((block) => {
                if (block.id === id) {
                    return {
                        ...block,
                        position: {
                            x: Math.max(0, block.position.x + delta.x),
                            y: Math.max(0, block.position.y + delta.y),
                        },
                    }
                }
                return block
            }),
        )
    }

    function updateBlockConfig(id: string, config: any) {
        setBlocks(
            blocks.map((block) => {
                if (block.id === id) {
                    return { ...block, config }
                }
                return block
            }),
        )
    }

    function updateBlockTitle(id: string, title: string) {
        setBlocks(
            blocks.map((block) => {
                if (block.id === id) {
                    return { ...block, title }
                }
                return block
            }),
        )
    }

    function handleMouseMove(e: React.MouseEvent) {
        if (isConnecting) {
            const rect = e.currentTarget.getBoundingClientRect()
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            })
        }
    }

    function startConnection(blockId: string) {
        setConnectingFrom(blockId)
        setIsConnecting(true)
    }

    function completeConnection(toBlockId: string) {
        if (connectingFrom && connectingFrom !== toBlockId) {
            const connectionExists = connections.some((conn) => conn.from === connectingFrom && conn.to === toBlockId)

            if (!connectionExists) {
                setConnections([...connections, { id: nanoid(), from: connectingFrom, to: toBlockId }])
            }
        }

        setConnectingFrom(null)
        setIsConnecting(false)
    }

    function cancelConnection() {
        setConnectingFrom(null)
        setIsConnecting(false)
    }

    function deleteBlock(id: string) {
        setBlocks(blocks.filter((block) => block.id !== id))
        setConnections(connections.filter((conn) => conn.from !== id && conn.to !== id))
        if (selectedBlock === id) {
            setSelectedBlock(null)
        }
    }

    function deleteConnection(id: string) {
        setConnections(connections.filter((conn) => conn.id !== id))
    }

    function saveTournament() {
        const tournament = {
            name: tournamentName,
            blocks,
            connections,
            createdAt: new Date().toISOString(),
        }

        const blob = new Blob([JSON.stringify(tournament, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${tournamentName.replace(/\s+/g, "-").toLowerCase()}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    function loadTournament(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const tournament = JSON.parse(e.target?.result as string)
                setTournamentName(tournament.name || "Loaded Tournament")
                setBlocks(tournament.blocks || [])
                setConnections(tournament.connections || [])
            } catch (error) {
                console.error("Failed to load tournament:", error)
            }
        }
        reader.readAsText(file)
    }

    const getBlockById = (id: string) => blocks.find((block) => block.id === id)
    const selectedBlockData = selectedBlock ? getBlockById(selectedBlock) : null
    const activeBlock = activeId ? getBlockById(activeId) : null
    const activeSidebarType = activeId?.startsWith("sidebar-") ? activeId.replace("sidebar-", "") : null

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToWindowEdges]}
            sensors={sensors}
        >
            <div className="flex h-screen bg-background">
                {/* Sidebar */}
                <div className="w-80 bg-muted/50 p-4 border-r flex flex-col overflow-y-auto">
                    <div className="mb-4">
                        <input
                            type="text"
                            value={tournamentName}
                            onChange={(e) => setTournamentName(e.target.value)}
                            className="w-full text-xl font-bold bg-transparent border-none outline-none focus:bg-background/50 px-2 py-1 rounded"
                            placeholder="Tournament Name"
                        />
                    </div>

                    <div className="flex gap-2 mb-6">
                        <Button onClick={saveTournament} size="sm" className="flex-1">
                            <Save className="w-4 h-4 mr-1" />
                            Save
                        </Button>
                        <label className="flex-1">
                            <Button size="sm" className="w-full" asChild>
                                <span>
                                    <Upload className="w-4 h-4 mr-1" />
                                    Load
                                </span>
                            </Button>
                            <input type="file" accept=".json" onChange={loadTournament} className="hidden" />
                        </label>
                    </div>

                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center mb-2">
                            <Zap className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="font-medium text-blue-900 dark:text-blue-100">Quick Start</span>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            Drag tournament blocks from below onto the canvas to start building your tournament structure.
                        </p>
                    </div>

                    <h2 className="text-lg font-semibold mb-3">Tournament Blocks</h2>

                    <div className="space-y-3 mb-6">
                        {BLOCK_TYPES.map((blockType) => (
                            <DraggableBlockTemplate
                                key={blockType.type}
                                id={`sidebar-${blockType.type}`}
                                type={blockType.type}
                                label={blockType.label}
                                icon={blockType.icon}
                                description={blockType.description}
                            />
                        ))}
                    </div>

                    <div className="mt-auto">
                        <h3 className="font-medium mb-2">Instructions:</h3>
                        <ol className="text-sm text-muted-foreground list-decimal pl-4 space-y-1">
                            <li>Drag blocks from sidebar to canvas</li>
                            <li>Click a block to configure it</li>
                            <li>Use connect button to link blocks</li>
                            <li>Save/load tournaments as JSON files</li>
                        </ol>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 flex">
                    <div
                        ref={setDroppableRef}
                        id="tournament-canvas"
                        className={cn(
                            "flex-1 bg-background relative overflow-auto transition-colors min-h-0",
                            isOver && "bg-primary/5"
                        )}
                        onMouseMove={handleMouseMove}
                        onClick={isConnecting ? cancelConnection : undefined}
                        style={{
                            position: 'relative',
                            minHeight: '100%',
                            minWidth: '100%'
                        }}
                    >
                        {/* Grid background */}
                        <div
                            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] pointer-events-none"
                            style={{
                                backgroundImage: `
                                    linear-gradient(to right, currentColor 1px, transparent 1px),
                                    linear-gradient(to bottom, currentColor 1px, transparent 1px)
                                `,
                                backgroundSize: "20px 20px",
                            }}
                        />

                        {/* Drop zone indicator */}
                        {isOver && activeId?.startsWith("sidebar-") && (
                            <div className="absolute inset-4 border-4 border-dashed border-primary/50 rounded-lg bg-primary/5 flex items-center justify-center pointer-events-none z-10">
                                <div className="text-center bg-background/90 p-6 rounded-lg shadow-lg">
                                    <div className="text-4xl mb-2">
                                        {BLOCK_TYPES.find((b) => activeId.includes(b.type))?.icon}
                                    </div>
                                    <div className="text-lg font-medium text-primary">
                                        Drop to create {BLOCK_TYPES.find((b) => activeId.includes(b.type))?.label}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Release to place the block here
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {blocks.length === 0 && !activeId && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center text-muted-foreground">
                                    <div className="text-6xl mb-4">🏆</div>
                                    <h3 className="text-xl font-medium mb-2">Start Building Your Tournament</h3>
                                    <p className="text-sm max-w-md">
                                        Drag tournament blocks from the sidebar to create your custom tournament structure.
                                        Connect blocks to show progression flow.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Content container - simplified structure */}
                        {/* Render blocks */}
                        {blocks.map((block) => (
                            <TournamentBlock
                                key={block.id}
                                block={block}
                                updatePosition={updateBlockPosition}
                                onConnect={startConnection}
                                onConnectTo={completeConnection}
                                isConnecting={isConnecting}
                                isConnectingSource={connectingFrom === block.id}
                                onDelete={deleteBlock}
                                onSelect={setSelectedBlock}
                                isSelected={selectedBlock === block.id}
                            />
                        ))}

                        {/* Render connections */}
                        {connections.map((connection) => {
                            const fromBlock = getBlockById(connection.from)
                            const toBlock = getBlockById(connection.to)

                            if (!fromBlock || !toBlock) return null

                            return (
                                <ConnectionLine
                                    key={connection.id}
                                    fromPosition={fromBlock.position}
                                    toPosition={toBlock.position}
                                    onDelete={() => deleteConnection(connection.id)}
                                />
                            )
                        })}

                        {/* Active connection line */}
                        {isConnecting && connectingFrom && (
                            <ConnectionLine
                                fromPosition={getBlockById(connectingFrom)?.position || { x: 0, y: 0 }}
                                toPosition={mousePosition}
                                isCreating
                            />
                        )}

                        {/* Invisible drop zone to ensure coverage */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ minHeight: '1000px', minWidth: '1200px' }}
                        />
                    </div>

                    {/* Configuration Panel */}
                    {selectedBlockData && (
                        <BlockConfigPanel
                            block={selectedBlockData}
                            onUpdateConfig={updateBlockConfig}
                            onUpdateTitle={updateBlockTitle}
                            onClose={() => setSelectedBlock(null)}
                        />
                    )}
                </div>
            </div>

            <DragOverlay dropAnimation={null}>
                {activeId && activeId.startsWith("sidebar-") && activeSidebarType && (
                    <div className="w-60 h-32 bg-card border-2 border-primary shadow-2xl rounded-lg flex items-center justify-center opacity-90 transform rotate-2">
                        <div className="text-center">
                            <div className="text-3xl mb-1">{BLOCK_TYPES.find((b) => b.type === activeSidebarType)?.icon}</div>
                            <div className="font-medium text-sm">{BLOCK_TYPES.find((b) => b.type === activeSidebarType)?.label}</div>
                        </div>
                    </div>
                )}
                {activeId && !activeId.startsWith("sidebar-") && activeBlock && (
                    <div className="opacity-75">
                        <TournamentBlock
                            block={activeBlock}
                            updatePosition={() => { }}
                            onConnect={() => { }}
                            onConnectTo={() => { }}
                            isConnecting={false}
                            isConnectingSource={false}
                            onDelete={() => { }}
                            onSelect={() => { }}
                            isSelected={false}
                        />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    )
}

function DraggableBlockTemplate({
    id,
    type,
    label,
    icon,
    description,
}: {
    id: string
    type: BlockType
    label: string
    icon: string
    description: string
}) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id,
        data: {
            type: "tournament-block-template",
            blockType: type,
        },
    })

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
                "w-full h-20 bg-card border-2 border-border rounded-lg flex items-center p-3 cursor-grab hover:bg-accent hover:border-accent-foreground/20 transition-all transform hover:scale-[1.02] active:scale-95",
                isDragging && "opacity-50 scale-105 rotate-2 shadow-lg",
            )}
        >
            <div className="text-2xl mr-3 select-none">{icon}</div>
            <div className="flex-1 select-none">
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
            </div>
        </div>
    )
}
