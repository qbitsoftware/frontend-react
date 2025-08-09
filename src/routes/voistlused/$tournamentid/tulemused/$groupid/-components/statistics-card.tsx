import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Protocol } from '@/queries/match'
import Notes from '@/routes/voistlused/-components/notes'
import { useTranslation } from 'react-i18next'

interface StatisticsProps {
    protocol: Protocol | undefined
    index: number
}

export const StatisticsCard = ({ protocol, index }: StatisticsProps) => {
    const { t } = useTranslation()

    if (protocol) {
        const match = protocol.match
        const parent_matches = protocol.parent_matches
        return (
            <Card key={index} className="w-full max-w-6xl mx-auto mb-[55px]">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-2 gap-2 ">
                        <Badge variant="outline" className="text-sm">
                            {t("protocol.date")}: {match.match.start_date ? new Date(match.match.start_date).toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Invalid date'}
                        </Badge>
                        <div className="text-xl flex font-semibold text-center items-center">
                            <span className='flex items-center mr-[10px]'><div className='w-[12px] h-[12px] bg-gray-600 rounded-full' /></span>{match.p1.name} vs {match.p2.name} <span className=' ml-[10px] flex items-center'><div className='w-[13px] h-[13px] rounded-full bg-blue-600' /> </span>
                        </div>
                        <Badge variant="outline" className="text-sm">
                            {t("protocol.time")}: {match.match.start_date ? new Date(match.match.start_date).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' }) : 'Invalid time'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]" >{t("protocol.table.game")}</TableHead>
                                    <TableHead>{match.p1.name}</TableHead>
                                    <TableHead>{match.p2.name}</TableHead>
                                    <TableHead className="text-center">{t("protocol.table.sets")}</TableHead>
                                    <TableHead className="text-center">{t("protocol.table.score")}</TableHead>
                                    <TableHead className="text-center">{t("protocol.table.total")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parent_matches.map((parent_match, index) => (
                                    <TableRow key={index}>
                                        <TableCell className=''>{index + 1}</TableCell>
                                        <TableCell>
                                            {index <= 2
                                                ? `${String.fromCharCode(65 + index)}: `
                                                : index === 3
                                                    ? `${t("protocol.table.doubles")}: `
                                                    : index == 4 ? `${String.fromCharCode(65)}: `
                                                        : index === 5 ? `${String.fromCharCode(67)}: `
                                                            : `${String.fromCharCode(66)}: `
                                            }

                                            {parent_match.p1.name}
                                        </TableCell>
                                        <TableCell>
                                            {index === 0
                                                ? `Y: `
                                                : index === 1
                                                    ? `X: `
                                                    : index === 2
                                                        ? `Z: `
                                                        : index === 3
                                                            ? `${t("protocol.table.doubles")}: `
                                                            : `${String.fromCharCode(84 + index)}: `
                                            }


                                            {parent_match.p2.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1 min-w-[60px]">
                                                {parent_match.match.extra_data.score && parent_match.match.extra_data.score.map((set, gameIndex) => {
                                                    if (set.p1_score !== 0 || set.p2_score !== 0) {
                                                        if (!match.match.forfeit) {
                                                            return (

                                                                <Badge
                                                                    key={gameIndex}
                                                                    variant={set.p1_score > set.p2_score ? "default" : "secondary"}
                                                                    className={cn(set.p1_score > set.p2_score ? "bg-gray-600" : "bg-blue-600 text-white hover:bg-blue-700")}
                                                                >
                                                                    {`${set.p1_score} - ${set.p2_score}`}
                                                                </Badge>
                                                            )

                                                        }
                                                    }
                                                    return null
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {parent_match.match.forfeit && parent_match.match.forfeit_type == "WO" ?
                                                (parent_match.match.winner_id === parent_match.match.p1_id ? "w" : "o") + " - " +
                                                (parent_match.match.winner_id === parent_match.match.p2_id ? "w" : "o")
                                                : parent_match.match.forfeit && parent_match.match.forfeit_type == "RET" ?
                                                    (parent_match.match.winner_id === parent_match.match.p1_id ? "w" : "RET") + " - " +
                                                    (parent_match.match.winner_id === parent_match.match.p2_id ? "w" : "RET")
                                                    : parent_match.match.forfeit && parent_match.match.forfeit_type == "DSQ" ?
                                                        (parent_match.match.winner_id === parent_match.match.p1_id ? "w" : "DQ") + " - " +
                                                        (parent_match.match.winner_id === parent_match.match.p2_id ? "w" : "DQ") :
                                                        (() => {
                                                            if (!parent_match.match.extra_data?.score || !Array.isArray(parent_match.match.extra_data.score)) {
                                                                return "0 - 0";
                                                            }

                                                            const p1Sets = parent_match.match.extra_data.score.reduce((count, set) =>
                                                                count + (set.p1_score > set.p2_score ? 1 : 0), 0);

                                                            const p2Sets = parent_match.match.extra_data.score.reduce((count, set) =>
                                                                count + (set.p2_score > set.p1_score ? 1 : 0), 0);

                                                            return `${p1Sets} - ${p2Sets}`;
                                                        })()
                                            }
                                        </TableCell>

                                        <TableCell className="text-center">
                                            {(() => {
                                                const matchesPlayed = parent_matches.slice(0, index + 1);

                                                const team1Wins = matchesPlayed.reduce((count, currMatch) => {
                                                    if (currMatch.match.winner_id === currMatch.match.p1_id) {
                                                        return count + 1;
                                                    }
                                                    return count;
                                                }, 0);

                                                const team2Wins = matchesPlayed.reduce((count, currMatch) => {
                                                    if (currMatch.match.winner_id === currMatch.match.p2_id) {
                                                        return count + 1;
                                                    }
                                                    return count;
                                                }, 0);

                                                return `${team1Wins} - ${team2Wins}`;
                                            })()}

                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <Separator className='w-full mb-4 h-[1px] bg-black/10' />
                    <Notes content={match.match.extra_data.notes} />
                    <div className='flex flex-col sm:flex-row justify-between text-black/70 py-4'>
                        <p><span>{t("protocol.table_referee")}: </span>{match.match.extra_data.table_referee}</p>
                        <p><span>{t("protocol.head_referee")}: </span>{match.match.extra_data.head_referee}</p>
                    </div>
                    <div className="mt-6 text-xl font-semibold text-center">
                        <span>{t("protocol.final_score")}: </span>
                        <span className="text-gray-800">{match.p1.name}</span>
                        <span className="font-bold mx-2">
                            {match.match.extra_data && match.match.extra_data.score && match.match.extra_data.score.length >= 1 && match.match.extra_data.score[0].p1_score}
                            -
                            {match.match.extra_data && match.match.extra_data.score && match.match.extra_data.score.length >= 1 && match.match.extra_data.score[0].p2_score}
                        </span>
                        <span className="text-gray-800">{match.p2.name}</span>
                    </div>
                </CardContent>
            </Card>
        )
    }
}