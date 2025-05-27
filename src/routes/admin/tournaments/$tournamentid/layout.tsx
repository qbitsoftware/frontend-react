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
import { useState } from 'react'
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

  const currentTab = location.pathname.includes('/grupid')
    ? 'groups'
    : location.pathname.includes('/meedia')
      ? 'media'
      : location.pathname.includes('/pildid')
        ? 'images'
        : 'info'

  return (
    <div className="mx-auto min-h-[95vh] h-full">
      <div className="w-full z-12">
        <div className="py-4 sm:py-auto md:px-8 flex flex-col lg:flex-row gap-4 justify-between items-center w-full bg-gradient-to-b from-white via-white/50 to-[#fafafa] border-b z-12">
          <h5 className="font-semibold text-[#03326B]">{tournament_data.data?.name}</h5>
          <Tabs value={currentTab} className="w-full lg:w-auto">
            <TabsList className="p-2 md:p-0 flex flex-row justify-start items-center w-full overflow-x-auto scrollbar-hide gap-1 px-1">
              <Link to={`/admin/tournaments/${tournamentid}`}>
                <TabsTrigger
                  value="info"
                  className="w-[7rem] py-[6px] flex-shrink-0"
                >
                  {t('admin.layout.info')}
                </TabsTrigger>
              </Link>
              <Link to={`/admin/tournaments/${tournamentid}/grupid`}>
                <TabsTrigger
                  value="groups"
                  className="w-[7rem] py-[6px] flex-shrink-0"
                >
                  {t('admin.layout.groups')}
                </TabsTrigger>
              </Link>
              {/* <Link to={`/admin/tournaments/${tournamentid}/meedia`}>
                <TabsTrigger
                  value="media"
                  className="w-[7rem] py-[6px] flex-shrink-0"
                >
                  {t('admin.layout.media')}
                </TabsTrigger>
              </Link>
              <Link to={`/admin/tournaments/${tournamentid}/pildid`}>
                <TabsTrigger
                  value="images"
                  className="w-[7rem] py-[6px] flex-shrink-0"
                >
                  {t('admin.layout.images')}
                </TabsTrigger>
              </Link> */}
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
        </div>

        <div className="px-4 md:px-9 pb-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
