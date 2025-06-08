import { UsersRound } from "lucide-react"
import SoloTable from "./solo-table"
import TeamTable from "./team-table"
import { TournamentTable } from "@/types/groups"

interface GroupProps {
    group: TournamentTable
}

const Group: React.FC<GroupProps> = ({ group }) => {
    return (
        <div className=" w-full  space-y-3  md:max-w-xl  mx-2 border-b rounded-xl pb-3 shadow-scheduleCard border">
                <div className="flex items-center justify-between mb-1 p-3 px-4 border-b rounded-t-xl bg-gray-50">
                    <h5 className=" font-medium">{group.class}</h5>
                    <div className='flex flex-row items-center gap-2 border border-stone-100 rounded-sm p-1'>
                      <UsersRound className='h-4 w-4 md:h-6 md:w-6' />
                      <span className='md:text-lg font-medium'>{group.participants.length}</span>
                    </div>
                </div>
            <div className="flex px-3">
                {group.solo ? <SoloTable participants={group.participants} table_data={group} /> : <TeamTable participants={group.participants} table_data={group} />}
            </div>
        </div>
    )
}

export default Group