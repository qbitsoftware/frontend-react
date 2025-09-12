import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export function UpcomingTournaments() {
    const upcomingTournaments = [
        { id: 1, name: 'Tallinna Lahtised', date: '2024-03-15', location: 'Tallinn' },
        { id: 2, name: 'Tartu Meistrivõistlused', date: '2024-04-02', location: 'Tartu' },
        { id: 3, name: 'Pärnu Suvekarikas', date: '2024-06-20', location: 'Pärnu' },
    ]

    const { t } = useTranslation();

    return (
        <div>

            <h2 className="text-3xl font-semibold text-gray-900 mb-6">{t('homepage.upcoming_tournaments')}</h2>
            <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-secondary text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">{t('homepage.tournaments.name')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">{t('homepage.tournaments.date')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('homepage.tournaments.location')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {upcomingTournaments.map((tournament) => (
                            <tr key={tournament.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tournament.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tournament.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tournament.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/voistlused/$tournamentid`} params={{ tournamentid: String(tournament.id) }} className="text-blue-600 hover:text-blue-900">{t('homepage.details')}</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}