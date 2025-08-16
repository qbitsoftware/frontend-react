import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ClubGrid } from './-components/club-grid'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/klubid/')({
  component: RouteComponent,
})
function RouteComponent() {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="w-full mx-auto lg:px-4 max-w-[1440px]">
      <div className="py-4">
        <div className="lg:rounded-lg  px-4 sm:px-6 md:px-12 py-6 space-y-4">
          <h2 className="font-bold">
            {t('clubs.header')}
          </h2>
          <ClubGrid />
        </div>
      </div>
    </div>
  )
}
