import type React from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRightCircle, Link, Trash2, Users, Settings, LassoIcon as Ladder, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { TournamentBlockData } from "@/types/test"

interface TournamentBlockProps {
    block: TournamentBlockData
    updatePosition: (id: string, delta: { x: number; y: number }) => void
    onConnect: (id: string) => void
    onConnectTo: (id: string) => void
    isConnecting: boolean
    isConnectingSource: boolean
    onDelete: (id: string) => void
    onSelect: (id: string) => void
    isSelected: boolean
}

export default function TournamentBlock({
    block,
    updatePosition,
    onConnect,
    onConnectTo,
    isConnecting,
    isConnectingSource,
    onDelete,
    onSelect,
    isSelected,
}: TournamentBlockProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: block.id,
        data: {
            type: "tournament-block",
            block: block,
        },
    })

    const style = {
        position: "absolute" as const,
        top: block.position.y,
        left: block.position.x,
        transform: CSS.Translate.toString(transform),
        width: "260px",
        zIndex: isDragging ? 20 : isConnectingSource ? 10 : isSelected ? 5 : 1,
    }

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (isConnecting && !isConnectingSource) {
            onConnectTo(block.id)
        } else if (!isDragging) {
            onSelect(block.id)
        }
    }

    const getBlockIcon = () => {
        switch (block.type) {
            case "group":
                return <Users className="w-4 h-4" />
            case "single-elimination":
                return <ArrowRightCircle className="w-4 h-4" />
            case "double-elimination":
                return <RotateCcw className="w-4 h-4" />
            case "swiss":
                return <span className="text-xs font-bold">CH</span>
            case "round-robin":
                return <RotateCcw className="w-4 h-4" />
            case "ladder":
                return <Ladder className="w-4 h-4" />
            default:
                return <Users className="w-4 h-4" />
        }
    }

    const getBlockColor = () => {
        switch (block.type) {
            case "group":
                return "border-amber-500/30"
            case "single-elimination":
                return "border-emerald-500/30"
            case "double-elimination":
                return "border-blue-500/30"
            case "swiss":
                return "border-purple-500/30"
            case "round-robin":
                return "border-orange-500/30"
            case "ladder":
                return "border-pink-500/30"
            default:
                return "border-gray-500/30"
        }
    }

    const renderBlockContent = () => {
        switch (block.type) {
            case "group":
                return (
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                            {block.config?.groupCount || 4} groups, {block.config?.teamsPerGroup || 4} teams each
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            {Array.from({ length: Math.min(4, block.config?.groupCount || 4) }).map((_, i) => (
                                <div key={i} className="bg-muted h-6 rounded flex items-center justify-center text-xs">
                                    Group {String.fromCharCode(65 + i)}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            case "single-elimination":
            case "double-elimination":
                return (
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">{block.config?.teamCount || 16} teams</div>
                        <div className="space-y-1">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <div className="bg-muted px-2 py-1 rounded w-[40%] text-center text-xs">Team</div>
                                    <div className="text-muted-foreground">vs</div>
                                    <div className="bg-muted px-2 py-1 rounded w-[40%] text-center text-xs">Team</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            case "swiss":
                return (
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                            {block.config?.rounds || 5} rounds, {block.config?.teamCount || 16} teams
                        </div>
                        <div className="space-y-1">
                            {Array.from({ length: Math.min(3, block.config?.rounds || 5) }).map((_, i) => (
                                <div key={i} className="bg-muted h-4 rounded flex items-center justify-center text-xs">
                                    Round {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            case "round-robin":
                return (
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">{block.config?.teamCount || 8} teams</div>
                        <div className="text-xs text-center text-muted-foreground">Everyone plays everyone</div>
                    </div>
                )
            case "ladder":
                return (
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">{block.config?.teamCount || 20} teams</div>
                        <div className="space-y-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="bg-muted h-3 rounded flex items-center px-2 text-xs">
                                    #{i} Team {i}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            default:
                return <div className="text-xs text-muted-foreground">Configure this block</div>
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={handleClick}
            className={cn(
                "transition-all select-none",
                isConnecting && !isConnectingSource && "ring-2 ring-primary ring-offset-2 cursor-pointer",
                isDragging && "opacity-75 rotate-1 scale-105 shadow-2xl z-50",
                isConnectingSource && "ring-2 ring-blue-500 ring-offset-2 shadow-lg",
            )}
        >
            <Card
                className={cn(
                    "border-2 transition-all hover:shadow-md",
                    getBlockColor(),
                    isConnectingSource && "border-blue-500 shadow-lg",
                    isSelected && "ring-2 ring-primary ring-offset-2",
                    isDragging && "shadow-2xl border-primary",
                )}
            >
                <CardHeader
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing py-2 px-3 bg-muted/30 hover:bg-muted/50 transition-colors select-none"
                >
                    <CardTitle className="text-sm flex items-center">
                        {getBlockIcon()}
                        <span className="ml-2 flex-1 truncate">{block.title}</span>
                        <Settings className="w-3 h-3 opacity-50" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3">{renderBlockContent()}</CardContent>
                <CardFooter className="p-2 flex justify-between bg-muted/20">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900"
                        onClick={(e) => {
                            e.stopPropagation()
                            onConnect(block.id)
                        }}
                    >
                        <Link className="h-4 w-4" />
                        <span className="sr-only">Connect</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(block.id)
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
