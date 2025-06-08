import { createFileRoute, Link } from '@tanstack/react-router'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { TournamentTable } from './-components/tournaments'
import ErrorPage from '@/components/error'
import { UseGetTournamentsAdmin } from '@/queries/tournaments'


export interface TournamentSearchParams {
    tutorial?: boolean
}

export const Route = createFileRoute('/admin/tournaments/')({
    loader: async ({ context: { queryClient } }) => {
        try {
            const tournaments_data = await queryClient.ensureQueryData(UseGetTournamentsAdmin())
            return { tournaments_data, error: null }
        } catch (error) {
            return { tournaments_data: null, error }
        }
    },
    errorComponent: () => <ErrorPage />,
    component: RouteComponent,
})

function RouteComponent() {
    const { tournaments_data } = Route.useLoaderData()
    const { t } = useTranslation()

    return (
        <div className='py-8 px-2 md:p-8 '>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div className='flex items-center justify-center flex-col text-center mb-4 md:mb-0 md:justify-start md:items-start'>
                    <h3 className="font-bold text-gray-900">
                        {t('admin.tournaments.title')}
                    </h3>
                    <p className="text-gray-600 mt-1">
                        {t('admin.tournaments.description')}
                    </p>
                </div>
                <div className='flex items-center justify-center gap-4'>
                    {/* <HelpCircle className='cursor-pointer' onClick={() => startFlow('tournament-creation')} /> */}
                    <Link href='/admin/tournaments/new'>
                        <Button className=' px-4 z-60' id='tutorial-tournament-add'>
                            <PlusCircle className="w-4 h-4 mr-1" />

                            {t('admin.tournaments.add_new')}
                        </Button>
                    </Link>

                </div>
            </div>

            {tournaments_data?.data && (
                <TournamentTable tournaments={tournaments_data.data} />
            )
            }
        </div>
    )

}
