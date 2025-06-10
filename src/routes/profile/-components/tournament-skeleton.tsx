export default function TournamentSkeleton() {
    return (
        <div className="group bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border border-blue-200 animate-pulse">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-200 rounded-full w-24" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 bg-gray-200 rounded" />
                                <div className="h-4 bg-gray-200 rounded w-32" />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 bg-gray-200 rounded" />
                                <div className="h-4 bg-gray-200 rounded w-24" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 bg-gray-200 rounded" />
                                <div className="h-4 bg-gray-200 rounded w-20" />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 bg-gray-200 rounded" />
                                <div className="h-4 bg-gray-200 rounded w-16" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <div className="h-4 bg-gray-200 rounded w-48" />
                    </div>
                </div>

                <div className="text-right space-y-3">
                    <div>
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                        <div className="h-8 bg-gray-200 rounded w-16" />
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-32" />
                </div>
            </div>
        </div>

    )
}