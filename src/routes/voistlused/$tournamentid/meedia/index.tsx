import ErrorPage from '@/components/error'
import { UseGetTournament } from '@/queries/tournaments'
import Editor from '@/routes/admin/-components/yooptaeditor'
import { createFileRoute } from '@tanstack/react-router'
import { YooptaContentValue } from '@yoopta/editor'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/voistlused/$tournamentid/meedia/')({
  component: RouteComponent,
  errorComponent: () => <ErrorPage />,
  loader: async ({ context: { queryClient }, params }) => {
    const tournamentId = Number(params.tournamentid)
    let tournament = queryClient.getQueryData(UseGetTournament(tournamentId).queryKey)

    if (!tournament) {
      tournament = await queryClient.fetchQuery(UseGetTournament(tournamentId))
    }

    return { tournament }
  },


})

function RouteComponent() {
  const { tournament } = Route.useLoaderData()
  const mediaContent = tournament.data && tournament.data.media || '{}'
  const [value, setValue] = useState<YooptaContentValue | undefined>(JSON.parse(mediaContent))
  const { t } = useTranslation()

  const hasMedia = mediaContent !== '{}' &&
    value


  return (
    <div className="">
      {hasMedia ? (
        <Editor value={value} setValue={setValue} readOnly />
      ) : (
        <div className="p-6 text-center rounded-sm">
          <p className="text-stone-500">{t('media.no_content')}</p>
        </div>
      )}
    </div>
  )
}
