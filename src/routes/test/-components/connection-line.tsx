"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface ConnectionLineProps {
    fromPosition: { x: number; y: number }
    toPosition: { x: number; y: number }
    onDelete?: () => void
    isCreating?: boolean
}

export default function ConnectionLine({
    fromPosition,
    toPosition,
    onDelete,
    isCreating = false,
}: ConnectionLineProps) {
    const [isHovered, setIsHovered] = useState(false)

    // Calculate the center points of the blocks (right edge of source, left edge of target)
    const fromX = fromPosition.x + 260 // Right edge of source block
    const fromY = fromPosition.y + 75 // Approximate middle of block height
    const toX = toPosition.x // Left edge of target block
    const toY = toPosition.y + 75 // Approximate middle of block height

    // Calculate control points for a smooth curve
    const distance = Math.abs(toX - fromX)
    const controlPointOffset = Math.min(distance / 3, 100)

    const controlPoint1X = fromX + controlPointOffset
    const controlPoint1Y = fromY
    const controlPoint2X = toX - controlPointOffset
    const controlPoint2Y = toY

    // Create a smooth bezier curve
    const path = `M ${fromX} ${fromY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${toX} ${toY}`

    // Calculate the midpoint for the delete button
    const midX = (fromX + toX) / 2
    const midY = (fromY + toY) / 2

    // Calculate arrow position (slightly before the end point)
    const arrowX = toX - 15
    const arrowY = toY

    const strokeColor = isCreating
        ? "rgb(59 130 246)" // blue-500
        : isHovered
            ? "rgb(34 197 94)" // green-500
            : "rgb(156 163 175)" // gray-400

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: isHovered ? 15 : 2 }}>
            <svg className="absolute top-0 left-0 w-full h-full">
                <defs>
                    <marker
                        id={`arrowhead-${isCreating ? 'creating' : isHovered ? 'hovered' : 'normal'}`}
                        markerWidth="12"
                        markerHeight="8"
                        refX="11"
                        refY="4"
                        orient="auto"
                        markerUnits="strokeWidth"
                    >
                        <path
                            d="M 0 0 L 12 4 L 0 8 Z"
                            fill={strokeColor}
                            className="transition-colors duration-200"
                        />
                    </marker>
                </defs>

                <path
                    d={path}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isCreating ? 3 : isHovered ? 4 : 2}
                    strokeDasharray={isCreating ? "8,4" : "none"}
                    markerEnd={`url(#arrowhead-${isCreating ? 'creating' : isHovered ? 'hovered' : 'normal'})`}
                    className="transition-all duration-200"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        pointerEvents: isCreating ? "none" : "stroke",
                        filter: isHovered ? "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" : "none"
                    }}
                />
            </svg>

            {!isCreating && onDelete && isHovered && (
                <div
                    className="absolute pointer-events-auto z-20"
                    style={{
                        left: midX - 16,
                        top: midY - 16,
                    }}
                >
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full shadow-lg hover:scale-110 transition-transform"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete()
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete connection</span>
                    </Button>
                </div>
            )}
        </div>
    )
}
