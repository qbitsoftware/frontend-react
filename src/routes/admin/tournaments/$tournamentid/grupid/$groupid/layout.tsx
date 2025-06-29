import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from '@tanstack/react-router'
import { UseGetTournamentTable } from '@/queries/tables'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import ErrorPage from '@/components/error'
import { ErrorResponse } from '@/types/errors'

export const Route = createFileRoute(
  '/admin/tournaments/$tournamentid/grupid/$groupid',
)({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
  loader: async ({ context: { queryClient }, params }) => {
    let table_data

    try {
      table_data = await queryClient.ensureQueryData(
        UseGetTournamentTable(
          Number(params.tournamentid),
          Number(params.groupid),
        ),
      )
    } catch (error) {
      const err = error as ErrorResponse
      if (err.response.status !== 404) {
        throw error
      }
    }
    return { table_data }
  },
})

function RouteComponent() {
  const { table_data } = Route.useLoaderData()
  const { tournamentid, groupid } = Route.useParams()
  const location = useLocation()
  const { t } = useTranslation()

  if (!table_data || !table_data.data) {
    return <></>
  }

  const pathSegments = location.pathname.split('/')
  const currentTab =
    pathSegments[pathSegments.length - 1] === groupid
      ? '/'
      : pathSegments.pop() || '/'

  const tabs = [
    { value: '/', label: t('admin.tournaments.groups.layout.info') },
    {
      value: 'osalejad',
      label: t('admin.tournaments.groups.layout.participants'),
    },
    { value: 'mangud', label: t('admin.tournaments.groups.layout.matches') },
    { value: 'tabelid', label: t('admin.tournaments.groups.layout.tables') },
  ]

  return (
    <div className="">
      <div className="flex flex-col py-6 lg:flex-row justify-between items-center gap-2 sticky top-0 transition-all duration-200  lg:h-[4rem] z-10">
        <div>
          <h4 className="font-semibold">{table_data.data.class}</h4>
        </div>
        <Tabs value={currentTab}>
          <TabsList className="grid grid-cols-4 w-full">
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                to={`/admin/tournaments/${tournamentid}/grupid/${groupid}${tab.value === '/' ? '' : `/${tab.value}`}`}
              >
                <TabsTrigger
                  value={tab.value}
                  className={cn(
                    'w-full sm:w-[7rem] py-[6px]',
                    currentTab === tab.value &&
                      'bg-secondary text-white hover:bg-secondary/90',
                    currentTab !== tab.value && 'hover:bg-secondary/10',
                  )}
                >
                  {tab.label}
                </TabsTrigger>
              </Link>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="pb-8">
        <Outlet />
      </div>
    </div>
  )
}
