import { TournamentTableWithStages } from '@/queries/tables'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'


interface Props {
    groups: TournamentTableWithStages[]
    tournament_id: number
}

export default function GroupDropdown({ groups, tournament_id }: Props) {
    const { t } = useTranslation()
    
    const truncateClassName = (className: string, maxLength: number = 15) => {
        if (className.length <= maxLength) return className
        return className.substring(0, maxLength) + '...'
    }
    
    return (
        <>
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="py-2">
                    {groups.map((group) => (
                        <Link
                            key={group.group.id}
                            to={`/admin/tournaments/${tournament_id}/grupid/${group.group.id}`}
                            className="group flex items-center justify-between px-5 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-l-4 border-transparent hover:border-blue-400"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors flex-shrink-0">
                                    {/* <span className="text-sm font-bold text-blue-700">{String.fromCharCode(65 + index)}</span> */}

                                    <span className="text-sm font-bold text-blue-700">{group.group.size}</span>
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span 
                                        className="text-sm font-medium text-gray-900 group-hover:text-blue-900"
                                        title={group.group.class}
                                    >
                                        {truncateClassName(group.group.class)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 group-hover:bg-blue-100 rounded-full transition-colors">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-gray-600 group-hover:text-blue-700">{group.participants.length}</span>
                                </div>
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-100 bg-gray-50 rounded-b-xl flex-shrink-0">
                <Link
                    to={`/admin/tournaments/${tournament_id}/grupid`}
                    className="group flex items-center justify-between px-5 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors flex-shrink-0">
                            <svg className="w-4 h-4 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-900">{t('admin.tournaments.groups.layout.view_all')}</span>
                            <span className="text-xs text-gray-500">{t('admin.tournaments.groups.layout.view_all_description')}</span>
                        </div>
                    </div>
                    <svg className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>
        </>
    )
}
