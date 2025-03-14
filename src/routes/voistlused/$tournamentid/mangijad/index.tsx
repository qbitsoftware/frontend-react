import { createFileRoute } from '@tanstack/react-router'
import { UseGetTournamentTables } from '@/queries/tables'
import Group from './-components/group'
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ErrorResponse } from "@/types/types"
import ErrorPage from '@/components/error'
import {useState} from 'react'

export const Route = createFileRoute('/voistlused/$tournamentid/mangijad/')({
  component: RouteComponent,
    errorComponent: () => <ErrorPage />,
  loader: async ({ context: { queryClient }, params }) => {
    try {
      const tables_data = await queryClient.ensureQueryData(
        UseGetTournamentTables(Number(params.tournamentid)),
      )
      return { tables_data }
    } catch (error) {
      const err = error as ErrorResponse
      if (err.response?.status === 404) {
        return { tables_data: null }
      }
      throw error
    }
  },
})

function RouteComponent() {
  const { tables_data } = Route.useLoaderData()
  const [searchQuery, setSearchQuery] = useState<string>('')

  const handleSearch = (e:React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  } 

  const originalData = tables_data?.data || []
  
  let filteredData = originalData
  
  if (searchQuery && originalData.length > 0) {
    const searchBy = searchQuery.toLowerCase()
    
    filteredData = originalData.map(table => {
        const filteredParticipants = table.participants.filter(player =>
        player.name?.toLowerCase().includes(searchBy)
      )
      
      return {
        ...table,
        participants: filteredParticipants
      }
    })
  }

  return (
    <div className="px-4 md:px-12 py-4 md:py-8">
      <h5 className="font-bold mb-4 md:mb-8 text-center md:text-left">Mängijad</h5>
      <div className="pb-8">
        {tables_data && tables_data.data ? (
          <>
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 space-x-0 md:space-x-4">
              <div className="relative w-full md:w-auto">
                <Input
                  type="text"
                  placeholder="Otsi"
                  className="h-12 pl-4 pr-10 py-2 text-sm bg-[#F7F6F7] focus:outline-none focus:ring-1 focus:ring-gray-300"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              
            </div>
            <div className="flex flex-col gap-10">
            {filteredData.length > 0 ? (
                filteredData.map((table) => <Group key={table.id} group={table}  />)
              ) : (
                <div className="text-center py-8 text-gray-500">No players found matching "{searchQuery}"</div>
              )}
            </div>
          </>
        ) : (
          <div>No participants</div>
        )}
      </div>
    </div>
  )
}
