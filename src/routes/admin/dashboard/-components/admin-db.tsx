import { useUsersCount } from '@/queries/users';
import { PersonStanding, Trophy, FileText, Users, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatsCard } from './statistics-card';
import { formatDateString } from '@/lib/utils';
import { UserLogin } from '@/types/users';
import AdminDashBoardQuickActions from './quick-actions';
import AdminDashBoardBlogs from './latest-blogs';
import AdminDashBoardFeedback from './feedback';
import AdminDashboardLatestTournaments from './latest-tournaments';

interface Props {
    user: UserLogin | null
}

export default function AdminDashboard({ user }: Props) {
    const { t } = useTranslation();
    const { count } = useUsersCount()

    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) {
            return t("admin.dashboard.greeting.good_morning");
        } else if (hour < 18) {
            return t("admin.dashboard.greeting.good_day");
        } else {
            return t("admin.dashboard.greeting.good_evening");
        }
    };

    const getLastRatingCalculation = () => {
        return new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    };

    const quickActions = [
        {
            title: t("admin.dashboard.quick_actions.new_blog"),
            description: t("admin.dashboard.quick_actions.new_blog_desc"),
            icon: FileText,
            href: "/admin/blog/new",
            color: "bg-green-50 hover:bg-green-100 border-green-200"
        },
        {
            title: t("admin.dashboard.quick_actions.new_tournament"),
            description: t("admin.dashboard.quick_actions.new_tournament_desc"),
            icon: Trophy,
            href: "/admin/tournaments/new",
            color: "bg-red-50 hover:bg-red-100 border-red-200"
        },
        {
            title: t("admin.dashboard.quick_actions.manage_clubs"),
            description: t("admin.dashboard.quick_actions.manage_clubs_desc"),
            icon: Users,
            href: "/admin/clubs",
            color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
        },
        {
            title: t("admin.dashboard.quick_actions.manage_tournaments"),
            description: t("admin.dashboard.quick_actions.manage_tournaments_desc"),
            icon: Users,
            href: "/admin/tournaments",
            color: "bg-orange-50 hover:bg-orange-100 border-orange-200"
        }
    ];

    // const stats = getStats(tournaments);
    const lastRatingCalculation = getLastRatingCalculation();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
                {/* Header */}
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                {getTimeBasedGreeting()}, {user?.username || 'Admin'}!
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                                {t("admin.dashboard.welcome_subtitle")}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-gray-50 p-2 sm:p-3 rounded-lg">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">
                                {t("admin.dashboard.last_rating_calculation")}: {formatDateString(lastRatingCalculation.toISOString())}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <AdminDashBoardQuickActions quickActions={quickActions} />

                {/* User Club Management & Feedback Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <AdminDashboardLatestTournaments />

                    <AdminDashBoardBlogs />

                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6">

                    {/* <AdminDashBoardClubWrapper /> */}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                        <StatsCard
                            Icon={Trophy}
                            iconColor="text-blue-600"
                            bgColor="bg-blue-100"
                            title={4}
                            description={t("admin.dashboard.total_tournaments")}
                        />
                        <StatsCard
                            Icon={PersonStanding}
                            iconColor="text-green-600"
                            bgColor="bg-green-100"
                            title={count}
                            description={t("admin.dashboard.users_in_db")}
                        />
                    </div>
                </div>

                <AdminDashBoardFeedback />
            </div>
        </div>
    );
}