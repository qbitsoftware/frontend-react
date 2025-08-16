export default function EventCardSkeleton() {
    return (
        <div className="group bg-white border border-gray-200 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 animate-pulse">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                    <div className="h-4 sm:h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="bg-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg w-12 h-12 sm:w-14 sm:h-14"></div>
                </div>
            </div>
        </div>
    );
}