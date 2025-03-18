import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ClubGrid } from './-components/club-grid'
import { motion } from 'framer-motion'
import { mockClubs } from '@/lib/mock_data/club_mocks'

export const Route = createFileRoute('/klubid/')({
  component: RouteComponent,
})
function RouteComponent() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  return (
    <div className="w-full mx-auto lg:px-4 max-w-[1440px]">
      <div className="py-4">
        <div className="lg:rounded-lg bg-white px-4 sm:px-6 md:px-12 py-6 space-y-4">
          <h2 className="font-bold">Kontakt</h2>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: 0 }}
          className=""
        >
          <ClubGrid clubs={mockClubs} />
        </motion.div>
      </div>
      </div>
    </div>
  )
}
