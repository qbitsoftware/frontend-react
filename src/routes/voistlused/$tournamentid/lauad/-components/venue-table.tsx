import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { TournamentTable } from '@/types/groups'
import { Venue } from '@/types/venues'
import { useTranslation } from 'react-i18next'

interface VenueTableProps {
    venues: Venue[]
    groups: TournamentTable[] | null | undefined
}

export const VenueTable = ({ venues, groups }: VenueTableProps) => {
    const { t } = useTranslation()

    const getGroup = (venue: Venue) => {
        return groups && venue.match?.match?.tournament_table_id
            ? groups.find((group) => group.id === venue.match?.match?.tournament_table_id)
            : undefined
    }

    return (
        <div className="rounded-md border">
            <Table className="table-compact">
                <TableHeader>
                    <TableRow className="h-8">
                        <TableHead className="h-8 py-2 text-xs font-semibold">{t('admin.tournaments.tables.table')}</TableHead>
                        <TableHead className="h-8 py-2 text-xs font-semibold">{t('admin.tournaments.tables.player_1')}</TableHead>
                        <TableHead className="h-8 py-2 text-xs font-semibold">{t('admin.tournaments.tables.player_2')}</TableHead>
                        <TableHead className="h-8 py-2 text-xs font-semibold">{t('admin.tournaments.tables.class')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {venues.length === 0 ? (
                        <TableRow className="h-10">
                            <TableCell colSpan={4} className="text-center py-3 text-sm text-muted-foreground">
                                {t('competitions.tables.no_tables', { defaultValue: 'No tables available' })}
                            </TableCell>
                        </TableRow>
                    ) : (
                        venues.map((venue) => {
                        const isFree = !venue.match_id || venue.match_id === ""
                        const group = getGroup(venue)

                        return (
                            <TableRow key={venue.id} className={cn("h-10", isFree && "bg-gray-50")}>
                                <TableCell className="font-medium py-2 text-sm">{venue.name}</TableCell>
                                <TableCell className="py-2 text-sm">
                                    {!isFree ? (
                                        <span className="block max-w-[220px]" title={venue?.match?.p1.name}>
                                            {venue?.match?.p1.name}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="py-2 text-sm">
                                    {!isFree ? (
                                        <span className="block max-w-[220px]" title={venue?.match?.p2.name}>
                                            {venue?.match?.p2.name}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="py-2 text-sm">
                                    {!isFree && group?.class ? (
                                        <span className="block max-w-[100px]" title={group.class}>
                                            {group.class}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                            </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
