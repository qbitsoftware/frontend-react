import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Monitor, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Venue } from '@/types/venues'
import { getRoundDisplayName } from '@/lib/match-utils'
import { TournamentTableWithStages } from '@/queries/tables'

interface FullscreenVenueDialogProps {
    venues: Venue[]
    groups: TournamentTableWithStages[] | null | undefined
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export const FullscreenVenueDialog = ({ venues, groups, isOpen, onOpenChange }: FullscreenVenueDialogProps) => {
    const { t } = useTranslation()

    const getGroup = (venue: Venue) => {
        return groups && venue.match?.match?.tournament_table_id
            ? groups.find((group) => group.group.id === venue.match?.match?.tournament_table_id)
            : undefined
    }

    const getDynamicRowHeight = () => {
        const venueCount = venues.length
        if (venueCount <= 8) return 'h-12'
        if (venueCount <= 15) return 'h-10'
        return 'h-9'
    }

    const rowHeightClass = getDynamicRowHeight()

    const getRing = (venue: Venue) => {
        const group = getGroup(venue)
        if (!group || !venue.match?.match) return "-"
        
        return getRoundDisplayName(
            venue.match.match.type,
            venue.match.match.round,
            venue.match.match.bracket,
            venue.match.match.next_loser_bracket,
            group.group.size || 0,
            t
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="hidden md:flex items-center gap-2"
                >
                    <Monitor className="h-4 w-4" />
                    {t("admin.tournaments.tables.fullscreen")}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-[95vw] h-[99vh] max-h-[99vh] p-6 bg-white overflow-y-auto">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    className="absolute top-0 right-0 h-8 w-8 p-0 hover:bg-gray-100"
                >
                    <X className="h-4 w-4" />
                </Button>
                <div className="h-full flex flex-col">
                    <div className="flex-1 rounded-md border">
                        <Table className="table-compact">
                            <TableHeader>
                                <TableRow className="h-6">
                                    <TableHead className="h-6 py-1 text-sm font-semibold">{t('admin.tournaments.tables.table')}</TableHead>
                                    <TableHead className="h-6 py-1 text-sm font-semibold">{t('admin.tournaments.tables.player_1')}</TableHead>
                                    <TableHead className="h-6 py-1 text-sm font-semibold">{t('admin.tournaments.tables.player_2')}</TableHead>
                                    <TableHead className="h-6 py-1 text-sm font-semibold">{t('admin.tournaments.tables.class')}</TableHead>
                                    <TableHead className="h-6 py-1 text-sm font-semibold">{t('admin.tournaments.tables.bracket')}</TableHead>
                                    <TableHead className="h-6 py-1 text-sm font-semibold">{t('admin.tournaments.tables.round')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {venues?.length === 0 ? (
                                    <TableRow className={rowHeightClass}>
                                        <TableCell colSpan={6} className="text-center py-2 text-sm text-muted-foreground">
                                            {t('competitions.tables.no_tables', 'No tables available')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    venues?.map((venue: Venue) => {
                                        const isFree = !venue.match_id || venue.match_id === ""
                                        const group = getGroup(venue)

                                        return (
                                            <TableRow 
                                                key={venue.id} 
                                                className={`${rowHeightClass} ${isFree ? 'bg-gray-50' : ''}`}
                                            >
                                                <TableCell className="font-medium py-1 text-sm">{venue.name}</TableCell>
                                                <TableCell className="py-1 text-sm">
                                                    {!isFree ? (
                                                        <span className="block max-w-[220px]" title={venue?.match?.p1.name}>
                                                            {venue?.match?.p1.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-1 text-sm">
                                                    {!isFree ? (
                                                        <span className="block max-w-[220px]" title={venue?.match?.p2.name}>
                                                            {venue?.match?.p2.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-1 text-sm">
                                                    {!isFree && group?.group.class ? (
                                                        <span className="block max-w-[100px]" title={group.group.class}>
                                                            {group.group.class}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-1 text-sm">
                                                    {!isFree && venue?.match?.match ? (
                                                        <span className="block max-w-[100px]">
                                                            {venue.match.match.type === "winner"
                                                                ? t("admin.tournaments.matches.table.winner_bracket")
                                                                : venue.match.match.type === "loser"
                                                                    ? t("admin.tournaments.matches.table.loser_bracket")
                                                                    : venue.match.match.type === "bracket"
                                                                        ? t("admin.tournaments.matches.table.bracket_bracket")
                                                                        : "-"}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-1 text-sm">
                                                    {!isFree ? (
                                                        <span className="block max-w-[80px] whitespace-nowrap">
                                                            {getRing(venue)}
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
                </div>
            </DialogContent>
        </Dialog>
    )
}
