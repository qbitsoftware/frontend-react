import { createFileRoute } from '@tanstack/react-router'
import { YooptaContentValue } from '@yoopta/editor'
import Editor from '@/routes/admin/-components/yooptaeditor'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { UseGetTournament, UsePatchTournamentMedia } from '@/queries/tournaments'
import ErrorPage from '@/components/error'

export const Route = createFileRoute(
    '/admin/tournaments/$tournamentid/meedia/',
)({
    component: RouteComponent,
    errorComponent: () => <ErrorPage />,
    loader: async ({ context: { queryClient }, params }) => {
        const tournamentId = Number(params.tournamentid)
        let tournament = queryClient.getQueryData(UseGetTournament(tournamentId).queryKey)

        if (!tournament) {
            tournament = await queryClient.fetchQuery(UseGetTournament(tournamentId))
        }

        return { tournament }
    },

})

function RouteComponent() {
    const { tournament } = Route.useLoaderData()
    const [value, setValue] = useState<YooptaContentValue | undefined>(JSON.parse(tournament && tournament.data && tournament.data.media || '{}'))
    const mediaMutation = UsePatchTournamentMedia(Number(Route.useParams().tournamentid))
    const { toast } = useToast()

    const handleSave = async () => {
        try {
            await mediaMutation.mutateAsync({ media: JSON.stringify(value) })
            toast({
                title: 'Media saved successfully',
                description: '',
            })
        } catch (error) {
            void error;
            toast({
                title: 'Failed to save media content',
                description: 'Refresh the page and try again',
                variant: 'destructive',
            })
        }
    }

    return (
        <div className='px-6 md:px-10 py-6 w-full'>
      <div className="flex justify-between items-center mb-6">
        <h5 className="font-bold">Meedia</h5>
                <Button
                    onClick={handleSave}
                    disabled={mediaMutation.isPending}
                    variant="default"
                    size="sm"
                >
                    {mediaMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
            <div className="">
                <Editor value={value} setValue={setValue} readOnly={false} />
            </div>
        </div>
    )
}
