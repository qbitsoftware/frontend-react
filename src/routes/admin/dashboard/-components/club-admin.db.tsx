import { UserLogin } from '@/types/users';
import { useTranslation } from 'react-i18next';
import AdminDashBoardBlogs from './latest-blogs';
import AdminDashBoardQuickActions from './quick-actions';
import AdminDashBoardFeedback from './feedback';
import AdminHeader from '../../-components/admin-header';

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
            iconSrc: "/icons/news.png",
            href: "/admin/blog/new",
            color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
        },
        {
            title: t("admin.dashboard.quick_actions.view_blogs"),
            description: t("admin.dashboard.quick_actions.view_blogs_desc"),
            iconSrc: "/icons/all-news.png",
            href: "/admin/blog",
            color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
        }
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
