import { createFileRoute } from '@tanstack/react-router'
import LauatenniseReeglid from './-components/rules'

export const Route = createFileRoute('/reeglid/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full mx-auto lg:px-4 max-w-[1440px]">
      <div className='py-6'>
        <div className="bg-white border border-gray-200/50 shadow-lg rounded-2xl px-6 sm:px-8 md:px-12 py-8 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200/50">
            <div className="w-1 h-8 bg-[#4C97F1] rounded-full"></div>
            <h1 className="text-2xl font-bold text-gray-900">Lauatennise Reeglid</h1>
          </div>
          <LauatenniseReeglid />
        </div>
      </div>
    </div>
  )
}
