export default function TableStatusSidebarSkeleton() {
    return (
        <div className="hidden min-w-[16rem] lg:flex flex-col border-l h-screen z-10">
            <div className="flex items-center justify-between h-[68px] px-2 border-b">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex flex-col overflow-y-auto w-full h-full">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="w-full flex items-center gap-2 justify-between h-10 px-2 overflow-hidden border-b relative"
                    >
                        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
                        <div className="flex-1 flex items-center justify-end gap-2 overflow-hidden">
                            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                            <span className="flex-shrink-0 text-[11px] text-gray-300">vs</span>
                            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}