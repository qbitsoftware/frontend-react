import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { TournamentForm } from '../-components/tournament-form'
import { UseGetTournament } from '@/queries/tournaments'
import ErrorPage from '@/components/error'
import MediaComponent from '../-components/media-comp'

export const Route = createFileRoute('/admin/tournaments/$tournamentid/')({
    loader: async ({ context: { queryClient }, params }) => {
        const tournamentId = Number(params.tournamentid)
        let tournament = queryClient.getQueryData(UseGetTournament(tournamentId).queryKey)

        if (!tournament) {
            tournament = await queryClient.fetchQuery(UseGetTournament(tournamentId))
        }

        return { tournament }
    },

    errorComponent: () => <ErrorPage />,
    component: RouteComponent,
})

function RouteComponent() {
    const { tournament } = Route.useLoaderData()
    const [activeTab, setActiveTab] = useState<'info' | 'media' | 'images'>('info')

    const tabs = [
        { id: 'info' as const, label: 'Info', icon: '📝' },
        { id: 'media' as const, label: 'Media', icon: '🎥' },
        { id: 'images' as const, label: 'Images', icon: '🖼️' }
    ]

    return (
        <div className="">
            {/* Navigation Tabs */}
            <div className="bg-white shadow-sm border-b mb-6">
                <nav className="flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white">
                {activeTab === 'info' && (
                    <div>
                        <TournamentForm initial_data={tournament.data} />
                    </div>
                )}

                {activeTab === 'media' && tournament.data && (
                    <MediaComponent tournament={tournament.data} />
                )}

                {activeTab === 'images' && (
                    <div className="p-8 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="text-6xl mb-4">🖼️</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Image Gallery</h3>
                            <p className="text-gray-600 mb-6">
                                Upload tournament banners, logos, and create a photo gallery for participants and fans.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-6">
                                <p className="text-sm text-gray-500">Coming soon...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}