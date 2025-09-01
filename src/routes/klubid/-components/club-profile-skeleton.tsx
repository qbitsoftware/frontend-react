import { Skeleton } from "@/components/ui/skeleton";

export default function ClubProfileSkeleton() {
    return (
        <div className="flex flex-col items-center space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {/* Club name skeleton */}
            <Skeleton className="h-6 sm:h-9 w-40 sm:w-64" />

            {/* Contact Information Section Skeleton */}
            <div className="w-full mb-4 sm:mb-6 border-b border-gray-200 pb-4 sm:pb-6">
                <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="flex items-start sm:items-center p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                            <Skeleton className="w-10 h-10 sm:w-8 sm:h-8 rounded-full mr-3 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <Skeleton className="h-3 w-16 sm:w-20 mb-1" />
                                <Skeleton className="h-4 w-28 sm:w-32" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Players section skeleton */}
            <div className="w-full flex flex-col space-y-6 sm:space-y-8">
                <div>
                    <Skeleton className="h-5 sm:h-6 w-28 sm:w-32 mb-3 sm:mb-4" />
                    {/* Desktop Table Skeleton */}
                    <div className="hidden sm:block overflow-x-auto rounded-lg shadow">
                        <div className="w-full bg-white">
                            {/* Table header skeleton */}
                            <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-3">
                                <div className="flex gap-4">
                                    <Skeleton className="h-4 w-6" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-8" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-8" />
                                </div>
                            </div>
                            {/* Table rows skeleton */}
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="border-t border-gray-100 p-3">
                                    <div className="flex gap-4">
                                        <Skeleton className="h-4 w-6" />
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-8" />
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-4 w-8" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Mobile Cards Skeleton */}
                    <div className="sm:hidden space-y-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <Skeleton className="w-6 h-6 rounded-full" />
                                    <div className="bg-gray-50 px-3 py-1 rounded-full">
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                </div>
                                <div className="mb-3 pb-3 border-b border-gray-100">
                                    <Skeleton className="h-6 w-36" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center py-1">
                                        <Skeleton className="h-4 w-8" />
                                        <div className="bg-gray-100 px-2 py-1 rounded">
                                            <Skeleton className="h-4 w-8" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <Skeleton className="h-4 w-12" />
                                        <Skeleton className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}