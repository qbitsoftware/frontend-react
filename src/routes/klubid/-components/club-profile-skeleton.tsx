import { Skeleton } from "@/components/ui/skeleton";

export default function ClubProfileSkeleton() {
    return (
        <div className="flex flex-col items-center space-y-4 mb-6">
            {/* Club name skeleton */}
            <Skeleton className="h-9 w-64" />

            {/* Contact Information Section Skeleton */}
            <div className="w-full mb-6 border-b pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="flex items-center">
                            <Skeleton className="w-8 h-8 rounded-full mr-3" />
                            <div className="flex-1">
                                <Skeleton className="h-3 w-20 mb-1" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Players section skeleton */}
            <div className="w-full flex flex-col space-y-8">
                <div>
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="overflow-x-auto rounded-lg shadow">
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
                </div>
            </div>
        </div>
    );
}