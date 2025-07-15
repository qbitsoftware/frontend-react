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
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Laud</TableHead>
                        <TableHead>Mängija 1</TableHead>
                        <TableHead>Mängija 2</TableHead>
                        <TableHead>Grupp</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {venues.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">
                                {t('competitions.tables.no_tables', { defaultValue: 'No tables available' })}
                            </TableCell>
                        </TableRow>
                    ) : (
                        venues.map((venue) => {
                        const isFree = !venue.match_id || venue.match_id === ""
                        const group = getGroup(venue)

                        return (
                            <TableRow key={venue.id} className={cn(isFree && "bg-gray-50")}>
                                <TableCell className="font-medium">{venue.name}</TableCell>
                                <TableCell>
                                    {!isFree ? (
                                        <span>{venue?.match?.p1.name}</span>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {!isFree ? (
                                        <span>{venue?.match?.p2.name}</span>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {!isFree && group?.class ? (
                                        group.class
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
