import { createFileRoute } from '@tanstack/react-router'
import { UseGetTournamentMatchesQuery } from '@/queries/match'
import { Match, MatchState, MatchWrapper } from '@/types/matches'
import { useState, useMemo } from 'react'
import { Search, Edit, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AdminHeader from '../../-components/admin-header'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/rating/$tournamentid/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { tournamentid } = Route.useParams()
    const { data: matches } = UseGetTournamentMatchesQuery(Number(tournamentid))
    const navigate = useNavigate()

    const [searchTerm, setSearchTerm] = useState('')
    const [stateFilter, setStateFilter] = useState<MatchState | 'all'>('all')
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

    const filteredMatches = useMemo(() => {
        if (!matches) return []

        return matches?.data?.matches?.filter((match: MatchWrapper) => {
            const matchesState = stateFilter === 'all' || match.match.state === stateFilter
            const matchesSearch = searchTerm === '' ||
                match.match.readable_id.toString().includes(searchTerm) ||
                match.match.extra_data.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
                match.match.bracket.toLowerCase().includes(searchTerm.toLowerCase()) ||
                match.p1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                match.p2.name.toLowerCase().includes(searchTerm.toLowerCase())

            return matchesState && matchesSearch
        })
    }, [matches, searchTerm, stateFilter])

    const handleWinnerChange = (match: Match, newWinnerId: string) => {
        // TODO: Implement API call to update match winner
        console.log(`Changing winner for match ${match.id} to ${newWinnerId}`)
        setSelectedMatch(null)
    }

    const getStatusVariant = (state: string) => {
        switch (state) {
            case MatchState.ONGOING:
                return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
            case MatchState.FINISHED:
                return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
            case MatchState.CREATED:
                return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
            default:
                return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
        }
    }

    return (
        <div className="">
            <div className="p-2 py-8 md:p-8">
                <AdminHeader
                    title='Match Rating Administration'
                    description='Review and correct match winners'
                    href={"/"}
                    feedback
                />

                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate({ to: '/admin/rating' })}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Tournaments
                    </button>
                </div>

                {/* Search and Filter Controls */}
                <div className="mb-6 flex gap-4 items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by match ID, table, participants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value as MatchState | 'all')}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All States</option>
                        <option value={MatchState.CREATED}>Created</option>
                        <option value={MatchState.ONGOING}>Ongoing</option>
                        <option value={MatchState.FINISHED}>Finished</option>
                    </select>
                </div>

                {/* Results Count */}
                <div className="mb-4 text-sm text-gray-600">
                    Showing {filteredMatches?.length} of {matches?.data?.matches?.length || 0} matches
                </div>

                <Card className="border-gray-200 shadow-sm">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="border-gray-200 bg-gray-50/50">
                                        <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700">
                                            Match ID
                                        </TableHead>
                                        <TableHead className="text-xs sm:text-sm px-3 py-3 text-center font-semibold text-gray-700">
                                            Table
                                        </TableHead>
                                        <TableHead className="text-xs sm:text-sm px-3 py-3 text-center font-semibold text-gray-700 hidden lg:table-cell">
                                            Round
                                        </TableHead>
                                        <TableHead className="text-xs sm:text-sm px-3 py-3 text-center font-semibold text-gray-700 hidden lg:table-cell">
                                            Bracket
                                        </TableHead>
                                        <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700">
                                            Participants
                                        </TableHead>
                                        <TableHead className="text-xs sm:text-sm px-3 py-3 text-center font-semibold text-gray-700">
                                            Winner
                                        </TableHead>
                                        <TableHead className="text-xs sm:text-sm px-3 py-3 text-center font-semibold text-gray-700">
                                            State
                                        </TableHead>
                                        <TableHead className="text-xs sm:text-sm px-3 py-3 text-center font-semibold text-gray-700">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredMatches?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <Search className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">No matches found</p>
                                                        <p className="text-sm text-gray-500">No matches match your search criteria</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredMatches?.map((match: MatchWrapper) => (
                                            <TableRow
                                                key={match.match.id}
                                                className="cursor-pointer hover:bg-gray-50/75 border-gray-100 transition-colors duration-150"
                                            >
                                                <TableCell className="px-3 py-3 font-medium text-gray-900">
                                                    #{match.match.readable_id}
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-center">
                                                    <span className="text-sm text-gray-600">{match.match.extra_data.table}</span>
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-center text-gray-600 hidden lg:table-cell">
                                                    <span className="text-sm">{match.match.round}</span>
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-center text-gray-600 hidden lg:table-cell">
                                                    <span className="text-sm truncate max-w-[100px]" title={match.match.bracket}>
                                                        {match.match.bracket}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-3 py-3">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">{match.p1.name}</div>
                                                        <div className="text-gray-600">{match.p2.name}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-center">
                                                    {match.match.winner_id ? (
                                                        <Badge className={`text-xs px-2 py-1 font-medium ${match.match.winner_id === match.match.p1_id
                                                            ? 'bg-green-100 text-green-800 border-green-200'
                                                            : 'bg-blue-100 text-blue-800 border-blue-200'
                                                            }`}>
                                                            {match.match.winner_id === match.match.p1_id ? match.p1.name : match.p2.name}
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="text-xs px-2 py-1 font-medium bg-gray-100 text-gray-800 border-gray-200">
                                                            No winner
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-center">
                                                    <Badge className={`text-xs px-2 py-1 font-medium ${getStatusVariant(match.match.state)}`}>
                                                        {match.match.state.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-center">
                                                    <button
                                                        onClick={() => setSelectedMatch(match.match)}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                        Edit
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Winner Edit Modal */}
            {selectedMatch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-xl">
                        <h2 className="text-lg font-bold mb-4">
                            Change Winner - Match #{selectedMatch.readable_id}
                        </h2>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Current winner: {selectedMatch.winner_id || 'None'}
                            </p>
                            <p className="text-sm text-gray-600">Select new winner:</p>
                        </div>

                        <div className="space-y-2 mb-6">
                            <button
                                onClick={() => handleWinnerChange(selectedMatch, selectedMatch.p1_id)}
                                className={`w-full p-3 text-left border rounded transition-colors ${selectedMatch.winner_id === selectedMatch.p1_id
                                    ? 'bg-green-50 border-green-300'
                                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                                    }`}
                            >
                                <div className="font-medium">Participant 1</div>
                                <div className="text-sm text-gray-600">ID: {selectedMatch.p1_id}</div>
                            </button>

                            <button
                                onClick={() => handleWinnerChange(selectedMatch, selectedMatch.p2_id)}
                                className={`w-full p-3 text-left border rounded transition-colors ${selectedMatch.winner_id === selectedMatch.p2_id
                                    ? 'bg-green-50 border-green-300'
                                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                                    }`}
                            >
                                <div className="font-medium">Participant 2</div>
                                <div className="text-sm text-gray-600">ID: {selectedMatch.p2_id}</div>
                            </button>

                            <button
                                onClick={() => handleWinnerChange(selectedMatch, '')}
                                className="w-full p-3 text-left border rounded bg-red-50 border-red-300 hover:bg-red-100 transition-colors"
                            >
                                <div className="font-medium text-red-700">Remove Winner</div>
                                <div className="text-sm text-red-600">Set no winner</div>
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedMatch(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
