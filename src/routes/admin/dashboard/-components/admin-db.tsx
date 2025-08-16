import { useUsersCount } from '@/queries/users';
import { PersonStanding, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatsCard } from './statistics-card';
import { UserLogin } from '@/types/users';
import AdminDashBoardQuickActions from './quick-actions';
import AdminDashBoardBlogs from './latest-blogs';
import AdminDashBoardFeedback from './feedback';
import AdminDashboardLatestTournaments from './latest-tournaments';
import AdminHeader from '../../-components/admin-header';

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

    const quickActions = [
        {
            title: t("admin.dashboard.quick_actions.new_tournament"),
            description: t("admin.dashboard.quick_actions.new_tournament_desc"),
            iconSrc: "/icons/tournament.png",
            href: "/admin/tournaments/new",
            color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
        },
        {
            title: t("admin.dashboard.quick_actions.new_blog"),
            description: t("admin.dashboard.quick_actions.new_blog_desc"),
            iconSrc: "/icons/news.png",
            href: "/admin/blog/new",
            color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
        },
        {
            title: t("admin.dashboard.quick_actions.manage_clubs"),
            description: t("admin.dashboard.quick_actions.manage_clubs_desc"),
            iconSrc: "/icons/clubs.png",
            href: "/admin/clubs",
            color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            <div className="p-2 py-8 md:p-8 flex flex-col gap-2">
                <AdminHeader
                    title={`${getTimeBasedGreeting()}, ${user?.username || 'Admin'}`}
                    description={t("admin.dashboard.welcome_subtitle")}
                    add_new={t("admin.dashboard.add_new")}
                    href={""}
                    feedback={true}
                />

                {/* Quick Actions */}
                <AdminDashBoardQuickActions quickActions={quickActions} />

                {/* Stats Cards - Moved Up for Better Hierarchy */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <StatsCard
                        Icon={Trophy}
                        iconColor="text-blue-600"
                        bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
                        title={4}
                        description={t("admin.dashboard.total_tournaments")}
                    />
                    <StatsCard
                        Icon={PersonStanding}
                        iconColor="text-emerald-600"
                        bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
                        title={count}
                        description={t("admin.dashboard.users_in_db")}
                    />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AdminDashboardLatestTournaments />
                    <AdminDashBoardBlogs />
                </div>

                <AdminDashBoardFeedback />
            </div>
        </div>
    );
}
