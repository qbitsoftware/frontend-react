import { createFileRoute, useParams } from '@tanstack/react-router'
import { Timetable } from '@/components/timetable/timetable'

export const Route = createFileRoute('/voistlused/$tournamentid/ajakava/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { tournamentid } = useParams({ from: "/voistlused/$tournamentid/ajakava/" })

  return (
    <div className="w-full px-4">
      <Timetable 
        tournamentId={Number(tournamentid)} 
        isAdmin={false} 
        showDragAndDrop={false}
        showParticipantsDefault={true}
        height="h-[80vh]"
      />
    </div>
  )
}