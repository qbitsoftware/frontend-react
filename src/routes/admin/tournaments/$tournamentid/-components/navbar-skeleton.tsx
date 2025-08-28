import { cn } from "@/lib/utils";

export function NavbarButtonSkeleton() {
    return (
        <div
            className={cn(
                "py-[6px] flex-shrink-0 text-xs sm:text-sm bg-gray-200 rounded-none border-b-2 border-transparent w-[80px] h-[32px] animate-pulse"
            )}
            style={{ minWidth: 80 }}
        />
    );
}