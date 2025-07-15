import * as React from 'react';
import { Check, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from '@tanstack/react-router';

interface TournamentCardProps {
    id: number;
    date: string;
    name: string;
    location: string;
    category: string;
    isCompleted: boolean;
    hasEnded: boolean;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
    date,
    name,
    location,
    id,
    category,
    isCompleted,
    hasEnded
}) => {
    const router = useRouter()
    return (
        <div 
            className={cn(
                `relative rounded-xl border-l-4 group flex flex-col bg-white cursor-pointer transition-all duration-300 p-4 shadow-lg hover:shadow-xl`,
                hasEnded 
                    ? "bg-gray-50 border-gray-300 shadow-sm hover:shadow-md" 
                    : "border-blue-400 hover:border-blue-500 hover:bg-blue-50/30 hover:scale-[1.02]"
            )}
            onClick={() => router.navigate({ to: "/voistlused/" + id })}
        >
            {/* Date Badge */}
            <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-semibold">
                    {date}
                </div>
                {isCompleted && (
                    <div className="bg-green-100 rounded-full p-1.5">
                        <Check size={16} className="text-green-600" />
                    </div>
                )}
            </div>

            {/* Tournament Name */}
            <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                {name}
            </h3>

            {/* Location */}
            <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-2">
                <MapPin size={14} className="mr-2 flex-shrink-0 text-gray-400" />
                <span className="capitalize truncate">{location}</span>
            </div>

            {/* Category */}
            {category && (
                <div className="mt-auto">
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        {category}
                    </span>
                </div>
            )}

            {/* Hover Effect Indicator */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-300 pointer-events-none" />
        </div>
    );
};

export default TournamentCard;
