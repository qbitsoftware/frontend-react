import { createFileRoute } from '@tanstack/react-router'
import BracketComponent from './-components/bracket'
import { UseGetBracketQuery } from '@/queries/brackets'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Loader from '@/components/loader'


export const Route = createFileRoute(
    '/admin/tournaments/$tournamentid/brackets/',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const params = Route.useParams()

    const { data: bracketsData, error, refetch, isLoading } = UseGetBracketQuery(Number(params.tournamentid))

    if (isLoading) {
        return (
            <div className='h-[50vh] flex items-center justify-center'>
                <Loader />
            </div>
        )
    } else if (!bracketsData || error) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Card className="w-full md:max-w-3xl shadow-lg p-0">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-center text-red-600">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                            No Brackets Found
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl text-center text-gray-700 mb-6">
                            We couldn't find any brackets for this tournament.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button size="lg" onClick={() => refetch()}>
                            Refresh Brackets
                        </Button>
                    </CardFooter>
                </Card>
            </div>

        )
    } else {
        return (
            <div className='h-[75vh]'>
                <BracketComponent bracket={bracketsData} />
            </div>
        )
    }
}
