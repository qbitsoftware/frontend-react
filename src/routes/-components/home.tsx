import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { useFadeIn } from '@/hooks/useFadeIn'
import { useTranslation } from 'react-i18next';
import { UpcomingTournaments } from './comingTournaments';
import { LatestNews } from './latestNews';
import { TopMonthPerformers } from './topPerformers';

export default function Home() {
    const { t } = useTranslation();

    const [heroControls, heroRef] = useFadeIn()
    const [tournamentsControls, tournamentsRef] = useFadeIn(0.2)

    return (
        <div className="bg-gradient-to-b from-white to-gray-200 ">
            <div className="relative h-[60vh] bg-cover bg-center" style={{ backgroundImage: "url('/test/table_tennis_background.png?height=1080&width=1920')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <motion.div
                        className="text-center text-white"
                        ref={heroRef}
                        initial={{ opacity: 0, y: 20 }}
                        animate={heroControls}
                    >
                        <h1 className="text-5xl font-bold mb-4">{t('homepage.title')}</h1>
                        <p className="text-xl mb-8">{t('homepage.description')}</p>
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">{t('homepage.title_button')}</Button>
                    </motion.div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.section
                    className="mb-16"
                    ref={tournamentsRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={tournamentsControls}
                >
                    <UpcomingTournaments />
                </motion.section>


                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mb-16"
                >
                    <LatestNews />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    className=""
                >
                    <TopMonthPerformers />
                </motion.div>
            </div>
        </div>
    )
}