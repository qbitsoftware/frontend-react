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
    <div className="w-full mx-auto lg:px-4 max-w-[98%]">
      <div className="py-2 sm:py-4">
        <div className="lg:rounded-lg px-2 sm:px-4 lg:px-12 py-4 sm:py-6">
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200/50">
              <div className="w-1 h-8 bg-[#4C97F1] rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('clubs.header')}
              </h2>
            </div>
            <ClubGrid />
          </div>
        </div>
      </div>
    </div>
  )
}
