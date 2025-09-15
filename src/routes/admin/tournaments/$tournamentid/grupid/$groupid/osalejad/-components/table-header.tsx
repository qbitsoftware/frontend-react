import { TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface Props {
    team?: boolean
}

export default function ParticipantHeader({ team }: Props) {
    const { t } = useTranslation()
    return (
        <TableHeader>
            <TableRow className="h-6">
                {!team && <TableHead className="py-1 px-2 text-xs">
                    {t(
                        "admin.tournaments.groups.participants.table.position"
                    )}
                </TableHead>
                }
                <TableHead className={cn("py-1 px-2 text-xs", team ? "flex items-center justify-center gap-1" : "")}>#</TableHead>
                <TableHead className="py-1 px-2 text-xs">
                    {t(
                        "admin.tournaments.groups.participants.table.name"
                    )}
                </TableHead>
                <TableHead className="py-1 px-2 text-xs">
                    {t(
                        "admin.tournaments.groups.participants.table.eltl_id"
                    )}
                </TableHead>
                <TableHead className="py-1 px-2 text-xs">
                    {t(
                        "admin.tournaments.groups.participants.table.rating"
                    )}
                </TableHead>
                <TableHead className="py-1 px-2 text-xs">
                    RP
                </TableHead>

                <TableHead className="py-1 px-2 text-xs">
                    {t(
                        "admin.tournaments.groups.participants.table.yob"
                    )}
                </TableHead>
                <TableHead className="py-1 px-2 text-xs">
                    {t(
                        "admin.tournaments.groups.participants.table.club"
                    )}
                </TableHead>
                <TableHead className="py-1 px-2 text-xs">
                    {t(
                        "admin.tournaments.groups.participants.table.sex"
                    )}
                </TableHead>
                <TableHead className="py-1 px-2 text-xs">
                    {t(
                        "admin.tournaments.groups.participants.table.foreign_player"
                    )}
                </TableHead>
                <TableHead className="py-1 px-2 text-xs">
                    {t(
                        "admin.tournaments.groups.participants.table.nationality"
                    )}
                </TableHead>
                <TableHead className="py-1 px-2 text-xs">
                    {t(
                        "admin.tournaments.groups.participants.table.reg_status"
                    )}
                </TableHead>
            </TableRow>
        </TableHeader>
    )
}
