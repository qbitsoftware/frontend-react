import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from '@tanstack/react-router'
import { UseGetTournament } from '@/queries/tournaments'
import { Link } from '@tanstack/react-router'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import ErrorPage from '@/components/error'
import { ErrorResponse } from '@/types/errors'
import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import TournamentTableModal from './-components/tournament-table-modal'

export const Route = createFileRoute('/admin/tournaments/$tournamentid')({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
  loader: async ({ context: { queryClient }, params }) => {
    let tournament_data = undefined
    try {
      tournament_data = await queryClient.ensureQueryData(
        UseGetTournament(Number(params.tournamentid)),
      )
    } catch (error) {
      const err = error as ErrorResponse
      if (err.response.status === 404) {
        throw redirect({
          to: '/admin/tournaments',
        })
      }
      throw error
    }

    return { tournament_data }
  },
})

function RouteComponent() {
  const location = useLocation()
  const { tournament_data } = Route.useLoaderData()
  const { tournamentid } = Route.useParams()
  const { t } = useTranslation()
  const [isTablesModalOpen, setIsTablesModalOpen] = useState(false)
  const [showGroupsDropdown, setShowGroupsDropdown] = useState(false)
  const groupsHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Mock groups data - replace with real data later
  const mockGroups = [
    { id: 1, name: 'Group A', teamsCount: 4 },
    { id: 2, name: 'Group B', teamsCount: 4 },
    { id: 3, name: 'Group C', teamsCount: 3 },
    { id: 4, name: 'Group D', teamsCount: 4 },
    { id: 5, name: 'Knockout Stage', teamsCount: 8 },
  ]

  const handleGroupsMouseEnter = () => {
    if (groupsHoverTimeoutRef.current) {
      clearTimeout(groupsHoverTimeoutRef.current)
    }
    setShowGroupsDropdown(true)
  }

  const handleGroupsMouseLeave = () => {
    groupsHoverTimeoutRef.current = setTimeout(() => {
      setShowGroupsDropdown(false)
    }, 150)
  }

  const currentTab = location.pathname.includes('/grupid')
    ? 'groups'
    : location.pathname.includes('/meedia')
      ? 'media'
      : location.pathname.includes('/pildid')
        ? 'images'
        : 'info'

  return (
    <div className="mx-auto min-h-[95vh] h-full">
      <div className="w-full relative">
        <div className="py-4 sm:py-auto md:px-8 flex flex-col lg:flex-row gap-4 justify-between items-center w-full bg-gradient-to-b from-white via-white/50 to-[#fafafa] border-b relative z-20">
          <h5 className="font-semibold text-[#03326B]">{tournament_data.data?.name}</h5>
          <div className="relative w-full lg:w-auto">
            <Tabs value={currentTab} className="w-full lg:w-auto">
              <TabsList className="p-2 md:p-0 flex flex-row justify-start items-center w-full gap-1 px-1">
                <Link to={`/admin/tournaments/${tournamentid}`}>
                  <TabsTrigger
                    value="info"
                    className="w-[7rem] py-[6px] flex-shrink-0"
                  >
                    {t('admin.layout.info')}
                  </TabsTrigger>
                </Link>

                {/* Groups tab with dropdown */}
                <div
                  className="relative flex-shrink-0"
                  onMouseEnter={handleGroupsMouseEnter}
                  onMouseLeave={handleGroupsMouseLeave}
                >
                  <Link to={`/admin/tournaments/${tournamentid}/grupid`}>
                    <TabsTrigger
                      value="groups"
                      className="w-[7rem] py-[6px] flex-shrink-0"
                    >
                      {t('admin.layout.groups')}
                    </TabsTrigger>
                  </Link>
                </div>

                <Dialog open={isTablesModalOpen} onOpenChange={setIsTablesModalOpen}>
                  <DialogTrigger asChild>
                    <TabsTrigger
                      value="tables"
                      className="w-[7rem] py-[6px] flex-shrink-0"
                      onClick={() => setIsTablesModalOpen(true)}
                    >
                      {t('admin.layout.tables')}
                    </TabsTrigger>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{t('admin.layout.tables')} - {tournament_data.data?.name}</DialogTitle>
                    </DialogHeader>
                    <TournamentTableModal />
                  </DialogContent>
                </Dialog>
              </TabsList>
            </Tabs>

            {/* Groups Dropdown - positioned absolutely relative to the tabs container */}
            {showGroupsDropdown && (
              <div
                className="absolute top-full left-[7.5rem] mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999]"
                onMouseEnter={handleGroupsMouseEnter}
                onMouseLeave={handleGroupsMouseLeave}
              >
                <div className="p-3 border-b border-gray-100">
                  <h6 className="font-medium text-gray-900 text-sm">Tournament Groups</h6>
                  <p className="text-xs text-gray-500 mt-1">Select a group to manage</p>
                </div>
                <div className="py-2 max-h-64 overflow-y-auto">
                  {mockGroups.map((group) => (
                    <Link
                      key={group.id}
                      to={`/admin/tournaments/${tournamentid}/grupid/${group.id}`}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">{group.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{group.teamsCount} teams</span>
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <Link
                      to={`/admin/tournaments/${tournamentid}/grupid`}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors text-blue-600"
                    >
                      <span className="text-sm font-medium">View all groups</span>
                      <span className="text-xs">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 md:px-9 pb-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
