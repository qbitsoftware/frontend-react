import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateString } from '@/lib/utils'

import {
    Calendar,
    MapPin,
    Table,
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Tournament } from '@/types/tournaments'

interface TournamentCardProps {
    tournament: Tournament
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const handleClick = (tournament_id: number) => {
        navigate({ to: `/admin/tournaments/${tournament_id}` })
    }

    return (
        <>
            <Card onClick={() => handleClick(tournament.id)} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 hover:bg-gray-100 hover:cursor-pointer">
                <CardHeader className="flex flex-row justify-center gap-8">
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-xl font-bold text-gray-900">
                                {tournament.name}
                            </CardTitle>
                            <Badge variant={tournament.state === 'started' ? 'outline' : 'destructive'}>
                                {tournament.state} hh
                            </Badge>
                        </div>
                        <CardDescription className="text-gray-500 mt-1">
                            {tournament.category}
                        </CardDescription>
                    </div>
                    <div>
                        <CardDescription className="text-gray-500 h-full">
                            {formatDateString(tournament.start_date) + ' - ' + formatDateString(tournament.end_date)}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6 ">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                            <InfoItem
                                icon={<MapPin className="w-4 h-4 text-red-500" />}
                                label={t('admin.tournaments.info.location')}
                                value={tournament.location}
                            />
                            <InfoItem
                                icon={<Calendar className="w-4 h-4 text-purple-500" />}
                                label={t('admin.tournaments.info.duration')}
                                value={`${getDurationDays(tournament.start_date, tournament.end_date) + 1} days`}
                            />
                            <InfoItem
                                icon={<Table className="w-4 h-4 text-purple-500" />}
                                label={"Laudade arv"}
                                value={`${tournament.total_tables}`}
                            />
                            <InfoItem
                                icon={<Calendar className="w-4 h-4 text-purple-500" />}
                                label={"Loodud"}
                                value={`${formatDateString(tournament.created_at)}`}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

interface InfoItemProps {
    icon: React.ReactNode
    label: string
    value: string
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
    <div className="flex items-start gap-2">
        {icon}
        <div className=''>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-sm font-medium text-gray-900">{value}</p>
        </div>
    </div>
)

// Helper function to calculate duration
const getDurationDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export default TournamentCard
