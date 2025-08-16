import { UserLogin } from '@/types/users';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateString } from '@/lib/utils';
import AdminDashBoardBlogs from './latest-blogs';
import AdminDashBoardQuickActions from './quick-actions';
import AdminDashBoardFeedback from './feedback';

interface Props {
    user: UserLogin | null
}

export default function ClubAdminDashboard({ user }: Props) {
    const { t } = useTranslation();

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
            title: t("admin.dashboard.quick_actions.manage_clubs"),
            description: t("admin.dashboard.quick_actions.manage_clubs_desc"),
            iconSrc: "/icons/clubs.png",
            href: "/admin/clubs",
            color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
        },
        {
            title: t("admin.dashboard.quick_actions.new_blog"),
            description: t("admin.dashboard.quick_actions.new_blog_desc"),
            iconSrc: "/icons/write-news.png",
            href: "/admin/blog/new",
            color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
        },
        {
            title: t("admin.dashboard.quick_actions.view_blogs"),
            description: t("admin.dashboard.quick_actions.view_blogs_desc"),
            iconSrc: "/icons/news.png",
            href: "/admin/blog",
            color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
        }
    ];

    const lastRatingCalculation = getLastRatingCalculation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            <div className="mx-auto space-y-6 p-4 sm:p-6">
                {/* Header */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-2xl font-bold bg-[#4C97F1] bg-clip-text text-transparent">
                                {getTimeBasedGreeting()}, {user?.username || 'Club Admin'}!
                            </h1>
                            <p className="text-slate-600 mt-2 text-base sm:text-base font-medium">
                                {t("admin.dashboard.welcome_subtitle")}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 bg-white/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-white/30 shadow-sm">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-blue-500" />
                            <span className="truncate font-medium">
                                {t("admin.dashboard.last_rating_calculation")}: {formatDateString(lastRatingCalculation.toISOString())}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <AdminDashBoardQuickActions quickActions={quickActions} />

                {/* My Clubs & Latest Blogs Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* My Clubs Card */}
                    {/* <AdminDashBoardClubWrapper /> */}

                    {/* Latest Blogs */}
                    <AdminDashBoardBlogs />
                </div>

                {/* Feedback Welcome Card */}
                <AdminDashBoardFeedback />

            </div>
        </div>
    );
}
