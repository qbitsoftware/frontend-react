import { createFileRoute, Link } from '@tanstack/react-router'
import { UseGetTournaments } from '@/queries/tournaments'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, HelpCircle, PlusCircle } from 'lucide-react'
import { ErrorResponse } from '@/types/errors'
import { Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { TournamentTable } from './-components/tournaments'
import ErrorPage from '@/components/error'
import { useOnboarding } from '@/providers/tutorialProvider'


export interface TournamentSearchParams {
    tutorial?: boolean
}

export const Route = createFileRoute('/admin/tournaments/')({
    loader: async ({ context: { queryClient } }) => {
        try {
            const tournaments_data = await queryClient.ensureQueryData(UseGetTournaments())
            return { tournaments_data, error: null }
        } catch (error) {
            return { tournaments_data: null, error }
        }
    },
    errorComponent: () => <ErrorPage />,
    component: RouteComponent,
})

function RouteComponent() {
    const { tournaments_data, error } = Route.useLoaderData()
    const { t } = useTranslation()

    const { startFlow } = useOnboarding()


    if (tournaments_data && tournaments_data.data) {
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
                        {/* <Button  >
                            Tutorial
                        </Button> */}
                        <HelpCircle className='cursor-pointer' onClick={() => startFlow('tournament-creation')} />
                        <Link href='/admin/tournaments/new'>
                            <Button className=' px-4 z-60' id='tutorial-tournament-add'>
                                <PlusCircle className="w-4 h-4 mr-1" />

                                {t('admin.tournaments.add_new')}
                            </Button>
                        </Link>

                    </div>
                </div>
                <TournamentTable tournaments={tournaments_data.data} />
            </div>
        )

    } else {
        const err = error as ErrorResponse
        if (err.response.status == 404) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] m-8 space-y-2  rounded-lg border-2 border-dashed border-gray-200 ">
                    <Trophy className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('admin.tournaments.errors.not_found.title')}</h3>
                    <p className="text-gray-500 text-center max-w-md">
                        {t('admin.tournaments.errors.not_found.description')}
                    </p>
                    <Link href='/admin/tournaments/new'>
                        <Button className='mt-2 px-6'>
                            {t('admin.tournaments.add_new')}
                        </Button>
                    </Link>
                </div>
            );
        } else {
            return (
                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center space-x-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <CardTitle>
                                {t('admin.tournaments.errors.network.title')}
                            </CardTitle>
                            <p className="text-gray-600 mt-1">
                                {t('admin.tournaments.errors.network.description')}
                            </p>
                        </div>
                    </CardHeader>
                </Card>
            )

        }
    }
}
