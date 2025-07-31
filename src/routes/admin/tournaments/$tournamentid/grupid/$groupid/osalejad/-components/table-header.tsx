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
            <TableRow>
                {!team && <TableHead className="">
                    {t(
                        "admin.tournaments.groups.participants.table.position"
                    )}
                </TableHead>
                }
                <TableHead className={cn(team ? "flex items-center justify-center gap-1" : "")}>#</TableHead>
                <TableHead className="">
                    {t(
                        "admin.tournaments.groups.participants.table.name"
                    )}
                </TableHead>
                <TableHead className="">
                    {t(
                        "admin.tournaments.groups.participants.table.eltl_id"
                    )}
                </TableHead>
                <TableHead className="">
                    {t(
                        "admin.tournaments.groups.participants.table.rating"
                    )}
                </TableHead>
                <TableHead className="">
                RP
                </TableHead>

                <TableHead className="">
                    {t(
                        "admin.tournaments.groups.participants.table.yob"
                    )}
                </TableHead>
                <TableHead className="">
                    {t(
                        "admin.tournaments.groups.participants.table.club"
                    )}
                </TableHead>
                <TableHead className="">
                    {t(
                        "admin.tournaments.groups.participants.table.sex"
                    )}
                </TableHead>
                <TableHead className="">
                    {t(
                        "admin.tournaments.groups.participants.table.foreign_player"
                    )}
                </TableHead>
                <TableHead className="">
                    {t(
                        "admin.tournaments.groups.participants.table.nationality"
                    )}
                </TableHead>
                <TableHead className="">
                    {t(
                        "admin.tournaments.groups.participants.table.image"
                    )}
                </TableHead>
            </TableRow>
        </TableHeader>
    )
}
