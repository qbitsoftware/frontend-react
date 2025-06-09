import { useState } from "react"
import { UsersRound, ChevronDown } from "lucide-react"
import SoloTable from "./solo-table"
import TeamTable from "./team-table"
import { TournamentTable } from "@/types/groups"

interface GroupProps {
    group: TournamentTable
}

const Group: React.FC<GroupProps> = ({ group }) => {
    const [isOpen, setIsOpen] = useState(false)

    const toggleAccordion = () => {
        setIsOpen(!isOpen)
    }

    return (
        <div className={`w-full space-y-3 md:max-w-xl md:mx-2 border-b rounded-xl pb-3 shadow-scheduleCard border ${isOpen && "bg-indigo-100/20"}`}>
            {/* Accordion Header */}
            <div 
                className="flex items-center justify-between mb-1 p-3 px-4 border-b rounded-t-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={toggleAccordion}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleAccordion()
                    }
                }}
            >
                <div className="flex items-center gap-3">
                    <h5 className="font-medium">{group.class}</h5>
                    <div className='flex flex-row items-center gap-2 border border-stone-100 rounded-sm p-1'>
                        <UsersRound className='h-4 w-4 md:h-6 md:w-6' />
                        <span className='md:text-lg font-medium'>{group.participants.length}</span>
                    </div>
                </div>
                <div className="p-2 border rounded-md">
                <ChevronDown 
                    className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
                </div>
            </div>

            {/* Accordion Content */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <div className="px-3">
                    {group.solo ? 
                        <SoloTable participants={group.participants} table_data={group} /> : 
                        <TeamTable participants={group.participants} table_data={group} />
                    }
                </div>
            </div>
        </div>
    )
}

export default Group