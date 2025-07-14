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
        <div className='py-4 px-3 sm:py-6 sm:px-4 md:p-8'>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                <div className='flex flex-col'>
                    <h3 className="font-bold text-gray-900 text-lg sm:text-xl">
                        {t('admin.tournaments.title')}
                    </h3>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                        {t('admin.tournaments.description')}
                    </p>
                </div>
                <div className='flex items-center justify-center w-full sm:w-auto'>
                    <Link href='/admin/tournaments/new' className="w-full sm:w-auto">
                        <Button className='w-full sm:w-auto px-4 z-60' id='tutorial-tournament-add'>
                            <PlusCircle className="w-4 h-4 mr-2" />
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
