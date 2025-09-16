import { UsersRound, ChevronDown } from "lucide-react"
import SoloTable from "./solo-table"
import TeamTable from "./team-table"
import { GroupType } from "@/types/matches"
import { TournamentTableWithStages } from "@/queries/tables"

interface GroupProps {
    group: TournamentTableWithStages
    isOpen: boolean
    onToggle: () => void
}

const Group: React.FC<GroupProps> = ({ group, isOpen, onToggle }) => {
    return (
        <div className={`w-full h-fit rounded-xl shadow-sm border bg-white transition-all duration-200 ${isOpen ? "shadow-md" : "hover:shadow-md"}`}>
            {/* Accordion Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/80 transition-colors duration-200 rounded-t-xl"
                onClick={onToggle}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onToggle()
                    }
                }}
            >
                <div className="flex items-center gap-3">
                    <h5 className="font-semibold text-gray-800">{group.group.class}</h5>
                    <div className='flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-2 py-1'>
                        <UsersRound className='h-4 w-4 text-blue-600' />
                        <span className='text-sm font-medium text-blue-700'>{(group.group.type === GroupType.DYNAMIC || group.group.type === GroupType.ROUND_ROBIN || group.group.type === GroupType.ROUND_ROBIN_FULL_PLACEMENT) ? group.participants.filter((p) => p.group_id !== "").length : group.participants.length}</span>
                    </div>
                </div>
                <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </div>

            {/* Accordion Content */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                {isOpen && (
                    <div className="border-t border-gray-100 bg-gray-50/30">
                        <div className="p-4">
                            {group.group.solo ?
                                <SoloTable participants={group.participants} table_data={group} /> :
                                <TeamTable participants={group.participants} table_data={group} />
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Group