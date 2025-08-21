import { createFileRoute, useParams } from '@tanstack/react-router'
import { Timetable } from '@/components/timetable/timetable'

export const Route = createFileRoute(
    '/admin/tournaments/$tournamentid/ajakava/',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const { tournamentid } = useParams({ from: "/admin/tournaments/$tournamentid/ajakava/" })

    return (
        <Timetable 
            tournamentId={Number(tournamentid)} 
            isAdmin={true} 
            showDragAndDrop={true}
            showParticipantsDefault={false}
        />
    )
}
