import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Participant } from '@/types/participants'

interface Props {
    participant: Participant
    index: number
}

export default function RegroupDND({ participant, index }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: participant.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div ref={setNodeRef} style={style} className="bg-card rounded-lg shadow-sm hover:shadow-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Koht</TableHead>
                        <TableHead>Tiim</TableHead>
                        <TableHead className="w-[100px] text-right">Punktisumma</TableHead>
                        <TableHead className="w-[100px] text-right">Lohista SIIT</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{participant.name}</TableCell>
                        <TableCell className="text-center">{participant.extra_data.total_points}</TableCell>
                        <TableCell className="text-center">
                            <button
                                className="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                                {...attributes}
                                {...listeners}
                            >
                                <GripVertical className="h-4 w-4" />
                                <span className="sr-only">Drag to reorder</span>
                            </button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}
